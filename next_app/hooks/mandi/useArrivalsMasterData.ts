/**
 * hooks/mandi/useArrivalsMasterData.ts
 *
 * Phase 4: Arrivals master data hook.
 * Replaces the fragile fetchMasterData() inside arrivals-form.tsx.
 * Uses SWR-like stale-while-revalidate via the existing data-cache + Supabase direct
 * (until full API route migration in Phase 4b).
 *
 * UI stays 100% identical — same contacts/items/banks/settings state shape.
 */
"use client"

import { useState, useEffect, useCallback } from "react"
import { callApi } from "@/lib/frappeClient"
import { cacheGet, cacheSet, cacheIsStale } from "@/lib/data-cache"
import { COMMODITY_UNITS } from "@/lib/utils/commodity-utils"

const CACHE_KEY = 'arrivals_form_master_v4'
const STANDARD_UNITS = COMMODITY_UNITS;

export interface ArrivalContact {
  id: string
  name: string
  type: string
  city?: string | null
}

export interface ArrivalCommodity {
  id: string
  name: string
  local_name?: string | null
  sku_code?: string | null
  default_unit: string
  custom_attributes?: Record<string, unknown> | null
}

export interface StorageLocation {
  id: string
  name: string
  is_active: boolean
}

export interface BankAccount {
  id: string
  name: string
  description?: string | null
  is_default?: boolean
}

export interface ArrivalMasterData {
  contacts: ArrivalContact[]
  commodities: ArrivalCommodity[]
  storageLocations: StorageLocation[]
  bankAccounts: BankAccount[]
  defaultCommissionRate: number
  marketFeePercent: number
  nirashritPercent: number
  miscFeePercent: number
  units: string[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useArrivalsMasterData(organizationId: string | undefined): ArrivalMasterData {
  const [contacts, setContacts] = useState<ArrivalContact[]>([])
  const [commodities, setCommodities] = useState<ArrivalCommodity[]>([])
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [defaultCommissionRate, setDefaultCommissionRate] = useState(0)
  const [marketFeePercent, setMarketFeePercent] = useState(0)
  const [nirashritPercent, setNirashritPercent] = useState(0)
  const [miscFeePercent, setMiscFeePercent] = useState(0)
  const [units, setUnits] = useState<string[]>(STANDARD_UNITS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (force: boolean = false) => {
    const currentOrgId = String(organizationId || "");
    if (!currentOrgId || currentOrgId === '[object Object]' || currentOrgId === 'undefined') { 
      setLoading(false); 
      return; 
    }

    // 1. Serve from cache immediately if available
    const cached = cacheGet<{
      contacts: ArrivalContact[]
      commodities: ArrivalCommodity[]
      storage: StorageLocation[]
      banks: BankAccount[]
      settings: { commission_rate_default?: number; market_fee_percent?: number; nirashrit_percent?: number; misc_fee_percent?: number }
      units: string[]
    }>(CACHE_KEY, currentOrgId)

    if (cached && !force) {
      setContacts(cached.contacts || [])
      setCommodities(cached.commodities || [])
      setStorageLocations(sortLocations(cached.storage || []))
      setBankAccounts(filterBanks(cached.banks || []))
      setDefaultCommissionRate(Number(cached.settings?.commission_rate_default || 0))
      setMarketFeePercent(Number(cached.settings?.market_fee_percent || 0))
      setNirashritPercent(Number(cached.settings?.nirashrit_percent || 0))
      setMiscFeePercent(Number(cached.settings?.misc_fee_percent || 0))
      setUnits(STANDARD_UNITS);
      setLoading(false)
      if (!cacheIsStale(CACHE_KEY, currentOrgId)) return
    }

    // 2. Fetch from Frappe API endpoints
    try {
      const res: any = await callApi('mandigrow.api.get_master_data', { contact_type: 'farmer,supplier' });
      
      if (res) {
        const data = res;
        setContacts(data.contacts || [])
        setCommodities(data.commodities || [])
        // Always use STANDARD_UNITS (Box, Crate, Kgs, Tons etc.) — never the full ERPNext UOM table
        // which contains 200+ scientific units (Abampere, Acre, Ampere...) irrelevant to a mandi.
        setUnits(STANDARD_UNITS);
        
        const settings = data.settings || {}
        setDefaultCommissionRate(Number(settings.commission_rate_default || 0))
        setMarketFeePercent(Number(settings.market_fee_percent || 0))
        setNirashritPercent(Number(settings.nirashrit_percent || 0))
        setMiscFeePercent(Number(settings.misc_fee_percent || 0))

        setStorageLocations(sortLocations(data.storage_locations || []))
        const banks = data.banks || []
        setBankAccounts(filterBanks(banks))

        cacheSet(CACHE_KEY, currentOrgId, {
          contacts: data.contacts,
          commodities: data.commodities,
          storage: data.storage_locations || [],
          banks: banks,
          settings: settings,
          units: data.units
        })
        setError(null)
      }
    } catch (err) {
      console.error("[useArrivalsMasterData]", err)
      setError("Failed to load form data")
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  useEffect(() => { 
    fetch() 
    
    // Auto-refresh every 10 minutes if the tab stays open
    const interval = setInterval(fetch, 1000 * 60 * 10)
    return () => clearInterval(interval)
  }, [fetch])

  return {
    contacts, commodities, storageLocations, bankAccounts,
    defaultCommissionRate, marketFeePercent, nirashritPercent, miscFeePercent,
    units,
    loading, error, refetch: () => fetch(true),
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sortLocations(locs: StorageLocation[]): StorageLocation[] {
  const unique = Array.from(new Map(locs.map(l => [l.name, l])).values())
  return unique.sort((a, b) => {
    if (a.name === 'Mandi') return -1
    if (b.name === 'Mandi') return 1
    if (a.name === 'Cold Storage') return -1
    if (b.name === 'Cold Storage') return 1
    return a.name.localeCompare(b.name)
  })
}

function filterBanks(banks: BankAccount[]): BankAccount[] {
  // Backend (get_bank_accounts) now returns ONLY user-created accounts.
  // Just sort the default bank to the top so it shows first in all dropdowns.
  return [...banks].sort((a, b) => {
    if (a.is_default && !b.is_default) return -1;
    if (b.is_default && !a.is_default) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });
}
