/**
 * hooks/mandi/useArrivals.ts
 *
 * Phase 10: Arrivals management hooks.
 * Centralizes arrival creation and interaction with the BFF (/api/mandi/arrivals).
 */
"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { callApi } from "@/lib/frappeClient"

export interface CreateArrivalItemInput {
  item_id?: string | null
  qty: number
  unit?: string | null
  supplier_rate?: number
  rate?: number
  sale_price?: number
  commission_percent?: number
  less_percent?: number
  less_units?: number
  packing_cost?: number
  loading_cost?: number
  farmer_charges?: number
  lot_code?: string | null
}

export interface CreateArrivalPayload {
  party_id: string
  arrival_date?: string
  arrival_type?: string
  lot_prefix?: string
  storage_location?: string | null
  vehicle_number?: string | null
  driver_name?: string | null
  advance?: number
  advance_payment_mode?: string
  advance_bank_account_id?: string | null
  items: CreateArrivalItemInput[]
}

export function useArrivals() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)

  const createArrival = async (payload: CreateArrivalPayload) => {
    if (!profile?.organization_id) {
      toast({ title: "Session Expired", description: "Please log in again.", variant: "destructive" })
      return null
    }

    setIsCreating(true)
    try {
      const result: any = await callApi('mandigrow.api.confirm_arrival_transaction', payload);

      if (!result || !result.success) {
        throw new Error(result?.error || "Failed to create arrival in Frappe")
      }

      toast({
        title: "Arrival Created",
        description: `Successfully recorded ${payload.items.length} lots for arrival ${result.id}.`,
      })

      return {
          name: result.id,
          lot_codes: result.lot_codes
      }
    } catch (err: any) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[useArrivals:create]", err)
      }
      toast({
        title: "Creation Failed",
        description: err.message,
        variant: "destructive",
      })
      return null
    } finally {
      setIsCreating(false)
    }
  }

  return {
    createArrival,
    isCreating,
  }
}
