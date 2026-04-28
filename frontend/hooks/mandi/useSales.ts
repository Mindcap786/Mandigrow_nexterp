/**
 * hooks/mandi/useSales.ts
 *
 * Sales hooks backed by the Frappe RPC layer.
 */
"use client"

import { useCallback, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { callApi } from "@/lib/frappeClient"

export interface SaleListItem {
  id: string
  sale_date: string
  invoice_no: string
  status: string
  payment_status: string
  payment_mode: string
  subtotal: number
  discount_amount: number
  gst_amount: number
  total_amount: number
  paid_amount: number
  balance_due: number
  narration: string | null
  created_at: string
  buyer: { id: string; name: string; contact_type: string; phone: string | null } | null
}

export interface SalesListFilters {
  page?: number
  limit?: number
  status?: string
  buyer_id?: string
  date_from?: string
  date_to?: string
}

export interface CreateSaleItemInput {
  lot_id?: string | null
  item_id?: string | null
  qty: number
  rate?: number
  amount?: number
}

export interface CreateSalePayload {
  buyer_id?: string | null
  sale_date?: string
  payment_mode?: string
  total_amount?: number
  amount_received?: number
  bank_account_id?: string | null
  market_fee?: number
  nirashrit?: number
  misc_fee?: number
  loading_charges?: number
  unloading_charges?: number
  other_expenses?: number
  vehicle_number?: string | null
  items: CreateSaleItemInput[]
}

export function useSalesList(filters: SalesListFilters = {}) {
  const [sales, setSales] = useState<SaleListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSales = useCallback(async () => {
    setLoading(true)
    try {
      const result: any = await callApi("mandigrow.api.get_sales_list", {
        page: filters.page || 1,
        page_size: filters.limit || 50,
        status_filter: filters.status || "all",
        date_from: filters.date_from,
        date_to: filters.date_to,
      })

      const rawSales = Array.isArray(result?.sales) ? result.sales : []
      const scopedSales = filters.buyer_id
        ? rawSales.filter((sale: any) => sale?.buyer_id === filters.buyer_id || sale?.contact?.id === filters.buyer_id)
        : rawSales

      const mapped = scopedSales.map((sale: any) => ({
        id: sale.id,
        sale_date: sale.sale_date || "",
        invoice_no: sale.id,
        status: sale.status || sale.payment_status || "Pending",
        payment_status: sale.payment_status || "pending",
        payment_mode: sale.payment_mode || "credit",
        subtotal: Number(sale.total_amount || 0),
        discount_amount: Number(sale.discount_amount || 0),
        gst_amount: Number(sale.gst_total || 0),
        total_amount: Number(sale.total_amount || 0),
        paid_amount: Number(sale.amount_received || 0),
        balance_due: Number(sale.balance_due || 0),
        narration: sale.narration || null,
        created_at: sale.creation || "",
        buyer: sale.contact
          ? {
              id: sale.contact.id,
              name: sale.contact.name,
              contact_type: "buyer",
              phone: null,
            }
          : null,
      }))

      setSales(mapped)
      setTotal(filters.buyer_id ? mapped.length : Number(result?.total_count || mapped.length))
      setError(null)
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[useSalesList]", err)
      }
      setError("Failed to load sales")
    } finally {
      setLoading(false)
    }
  }, [filters.buyer_id, filters.date_from, filters.date_to, filters.limit, filters.page, filters.status])

  useEffect(() => {
    void fetchSales()
  }, [fetchSales])

  return { sales, total, loading, error, refetch: fetchSales }
}

export function useCreateSale(onSuccess?: (result: Record<string, unknown>) => void) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const createSale = useCallback(
    async (payload: CreateSalePayload): Promise<Record<string, unknown> | null> => {
      setLoading(true)
      setError(null)
      try {
        const result: any = await callApi("mandigrow.api.confirm_sale_transaction", payload)

        if (!result?.success) {
          throw new Error(result?.error || "Failed to create sale in Frappe")
        }

        toast({ title: "Sale Confirmed", description: `Invoice #${result.id} created.` })
        onSuccess?.(result)
        return result
      } catch (err: any) {
        const message = err?.message || "Network error — sale not saved"
        setError(message)
        toast({ title: "Sale Failed", description: message, variant: "destructive" })
        return null
      } finally {
        setLoading(false)
      }
    },
    [onSuccess, toast],
  )

  return { createSale, loading, error }
}

export interface AvailableLot {
  id: string
  lot_code: string
  current_qty: number
  unit: string
  grade: string | null
  created_at: string
  commodity: { id: string; name: string; default_unit: string } | null
  arrival: { id: string; arrival_date: string; party: { id: string; name: string } | null } | null
}

export function useAvailableLots(commodityId?: string) {
  const [lots, setLots] = useState<AvailableLot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLots = useCallback(async () => {
    setLoading(true)
    try {
      const result: any = await callApi("mandigrow.api.get_available_stock", {
        commodity_id: commodityId,
      })

      const nextLots = Array.isArray(result?.lots)
        ? result.lots.map((lot: any) => ({
            id: lot.id,
            lot_code: lot.lot_code || "",
            current_qty: Number(lot.current_qty || 0),
            unit: lot.unit || "Kg",
            grade: lot.grade || null,
            created_at: lot.created_at || "",
            commodity: lot.item_id
              ? { id: lot.item_id, name: lot.item_id, default_unit: lot.unit || "Kg" }
              : null,
            arrival: null,
          }))
        : []

      setLots(nextLots)
      setError(null)
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[useAvailableLots]", err)
      }
      setError("Failed to load available lots")
    } finally {
      setLoading(false)
    }
  }, [commodityId])

  useEffect(() => {
    void fetchLots()
  }, [fetchLots])

  return { lots, loading, error, refetch: fetchLots }
}
