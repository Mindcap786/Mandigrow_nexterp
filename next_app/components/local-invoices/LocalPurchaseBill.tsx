"use client"
/**
 * LocalPurchaseBill.tsx
 * Local language A4 purchase bill — mirrors PurchaseBillInvoice layout.
 * Supplier/party name and item names appear in local language.
 * Financial labels (commission, market fee, total payable) → local language.
 * Structural identifiers (bill no, dates, HSN) → English.
 */

import { format } from "date-fns"
import { usePlatformBranding } from "@/hooks/use-platform-branding"
import { DocumentWatermark } from "@/components/common/document-branding"
import type { LangCode } from "./utils/fonts"
import { FONT_FAMILIES, FONT_URLS, TEXT_DIRECTION } from "./utils/fonts"
import { getTranslation } from "./translations"
import { amountInWords } from "./utils/amount-in-words"
import { getPartyName, getItemName } from "./translations"

interface LocalPurchaseBillProps {
  lot: any
  arrival: any
  organization: any
  arrivalLots?: any[]
  lang: LangCode
  itemTranslations?: Record<string, string>
  partyTranslation?: string | null
  contactLocalName?: string | null
}

export default function LocalPurchaseBill({
  lot, arrival, organization, arrivalLots = [],
  lang, itemTranslations = {}, partyTranslation = null, contactLocalName = null
}: LocalPurchaseBillProps) {
  const { branding } = usePlatformBranding()
  const T = getTranslation(lang)
  const fontFamily = FONT_FAMILIES[lang]
  const fontUrl = FONT_URLS[lang]
  const dir = TEXT_DIRECTION[lang]

  if (!lot || !arrival) return null

  // ── Data extraction (mirrors PurchaseBillInvoice) ─────────────────────────
  const farmerName = arrival?.farmer?.name || arrival?.farmer_name || lot?.farmer?.name || 'Supplier'
  const resolvedFarmerName = getPartyName(farmerName, contactLocalName, partyTranslation)

  const lotCode = lot?.lot_code || 'N/A'
  const vehicleNo = arrival?.vehicle_number || lot?.vehicle_number || ''
  const arrivalDate = arrival?.arrival_date || lot?.arrival_date || ''

  const displayBillNo = (() => {
    const raw = arrival?.contact_bill_no || arrival?.bill_no || lot?.lot_code || 'N/A'
    if (/^\d+$/.test(String(raw))) return raw
    const match = String(raw).match(/-0*(\d+)$/)
    return match ? match[1] : raw
  })()

  // All lots for this arrival (same as PurchaseBillInvoice)
  const lotsToShow = arrivalLots.length > 0 ? arrivalLots : [lot]

  // Financial calculations from arrival
  const grossValue = Number(arrival?.gross_value || 0)
  const cutting = Number(arrival?.cutting || arrival?.deductions || 0)
  const netGoodsValue = grossValue - cutting
  const commission = Number(arrival?.commission || 0)
  const marketFee = Number(arrival?.market_fee || 0)
  const loadingCharges = Number(arrival?.loading_charges || 0)
  const miscFee = Number(arrival?.misc_fee || 0)
  const otherExpenses = Number(arrival?.other_expenses || 0)
  const transportCharges = Number(arrival?.transport_charges || arrival?.transport || 0)
  const totalDeductions = commission + marketFee + loadingCharges + miscFee + otherExpenses + transportCharges
  const totalPayable = netGoodsValue - totalDeductions

  const fullAddress = [
    organization?.address_line1, organization?.address_line2,
    organization?.city, organization?.state, organization?.pincode
  ].filter(Boolean).join(", ")

  // Item name resolver
  const resolveItemName = (l: any) => {
    const rawName = l?.item?.name || l?.item_name || 'Item'
    const translated = itemTranslations[rawName]
    return getItemName(rawName, translated)
  }

  return (
    <div
      id="purchase-invoice-print"
      dir={dir}
      style={{ fontFamily }}
      className="bg-white text-black p-6 max-w-[800px] mx-auto shadow-2xl border border-gray-100 print:shadow-none print:border-none print:p-[10mm] relative overflow-hidden print:overflow-visible"
    >
      <link rel="stylesheet" href={fontUrl} />
      <DocumentWatermark text={branding?.watermark_text} enabled={branding?.is_watermark_enabled} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between print:flex-row print:justify-between gap-6 items-start border-b-4 border-black pb-3 mb-3 relative z-10">
        <div className="flex items-start gap-4 w-full md:w-[45%] print:w-[45%]">
          {organization?.logo_url ? (
            <img src={organization.logo_url} alt="Logo" className="h-20 w-auto object-contain" style={{ borderRadius: 12 }} />
          ) : (
            <div className="h-16 w-16 bg-black flex items-center justify-center shrink-0" style={{ borderRadius: 12, width: 64, height: 64, minWidth: 64 }}>
              <span className="text-white text-3xl font-black" style={{ color: '#fff', fontSize: 28, fontWeight: 900 }}>
                {(organization?.name || 'M').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="space-y-1 w-full">
            <p className="text-black text-[29px] font-black tracking-tight uppercase leading-[1.12]">
              {organization?.name || 'Mandi HQ Enterprise'}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-900 max-w-[250px] leading-relaxed">
              {fullAddress || 'Market Yard'}
            </p>
          </div>
        </div>
        <div className="self-center flex flex-col items-center text-center">
          <h2 className="text-3xl font-black uppercase tracking-[0.28em] leading-[1.08] text-black">Purchase Bill</h2>
          <div className="h-1 w-12 bg-black mx-auto mt-2 rounded-full" />
        </div>
        <div className="text-right space-y-0.5 md:min-w-[180px] md:flex-1 print:min-w-[180px] print:flex-1 md:flex md:flex-col md:items-end print:flex print:flex-col print:items-end">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contact Details</p>
          <div className="space-y-0 text-xs font-black md:text-right print:text-right">
            <p>Ph: {organization?.phone || ''}</p>
            {organization?.gstin && <p className="italic">GST: {organization.gstin}</p>}
          </div>
        </div>
      </div>

      {/* Supplier + Bill Details */}
      <div className="py-2 flex flex-col md:flex-row print:flex-row gap-8 border-b border-gray-100 mb-2 relative z-10 print:gap-4">
        <div className="space-y-1 md:w-1/2 print:w-1/2">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Supplier / Farmer</p>
          <h3 className="text-2xl font-black tracking-tight" style={{ fontFamily }}>{resolvedFarmerName}</h3>
          {arrival?.farmer?.phone && <p className="text-gray-600 font-bold text-xs tracking-wider">Ph: {arrival.farmer.phone}</p>}
          {arrival?.farmer?.village && <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">{arrival.farmer.village}</p>}
        </div>
        <div className="text-left md:text-right space-y-0.5 text-xs self-end md:w-1/2 print:w-1/2 md:flex md:flex-col md:items-end print:flex print:flex-col print:items-end">
          <div className="flex justify-end gap-2">
            <span className="text-gray-400 font-bold uppercase">Bill No:</span>
            <span className="font-black">#{displayBillNo}</span>
          </div>
          <div className="flex justify-end gap-2">
            <span className="text-gray-400 font-bold uppercase">Lot No:</span>
            <span className="font-black tracking-widest">{lotCode}</span>
          </div>
          {vehicleNo && (
            <div className="flex justify-end gap-2 items-center mt-1">
              <span className="text-gray-400 font-bold uppercase">Vehicle No:</span>
              <span className="font-black text-white bg-slate-900 px-2 py-0.5 rounded text-[13px] tracking-widest uppercase">{vehicleNo}</span>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-1">
            <span className="text-gray-400 font-bold uppercase">Date:</span>
            <span className="font-black">
              {(() => { try { return arrivalDate ? format(new Date(arrivalDate), 'dd MMM yyyy') : '-' } catch { return '-' } })()}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="relative z-10 overflow-x-auto print:overflow-visible mb-4">
        <table className="w-full text-left">
          <thead className="print:table-header-group">
            <tr className="border-b-2 border-black">
              <th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-left">Item</th>
              <th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-center">Qty</th>
              <th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-right">Rate</th>
              <th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lotsToShow.map((l: any, idx: number) => (
              <tr key={l.id || idx} className="break-inside-avoid print:break-inside-avoid">
                <td className="py-1">
                  <p className="font-black text-xs tracking-tight uppercase leading-none" style={{ fontFamily }}>
                    {resolveItemName(l)}
                  </p>
                  {l.lot_code && <p className="text-[10px] font-bold text-slate-500 mt-0.5">Lot: {l.lot_code}</p>}
                </td>
                <td className="py-1 text-center font-bold text-sm">
                  {Number(l.qty || l.quantity || 0).toLocaleString()}
                  <span className="text-[10px] text-gray-400 font-black uppercase ml-0.5">{l.uom || l.unit || ''}</span>
                </td>
                <td className="py-1 text-right font-bold text-sm">₹{Number(l.rate || 0).toLocaleString()}</td>
                <td className="py-1 text-right font-black text-sm">₹{Math.round(Number(l.amount || l.gross_value || 0)).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Summary — labels in local language */}
      <div className="mt-4 flex justify-end relative z-10">
        <div className="w-full md:w-1/2 print:w-1/2 space-y-1.5 border-t-2 border-black pt-4" style={{ fontFamily }}>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-500 uppercase">{T.GROSS_VALUE}</span>
            <span className="font-bold">₹{grossValue.toLocaleString()}</span>
          </div>
          {cutting > 0 && (
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-500 uppercase">{T.LESS_CUTTING}</span>
              <span className="font-bold text-red-600">- ₹{cutting.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-1">
            <span className="font-bold text-gray-500 uppercase">{T.NET_GOODS_VALUE}</span>
            <span className="font-bold">₹{netGoodsValue.toLocaleString()}</span>
          </div>
          {commission > 0 && (
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-500 uppercase">{T.COMMISSION}</span>
              <span className="font-bold text-slate-700">- ₹{commission.toLocaleString()}</span>
            </div>
          )}
          {marketFee > 0 && (
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-500 uppercase">{T.MARKET_FEE}</span>
              <span className="font-bold text-slate-700">- ₹{marketFee.toLocaleString()}</span>
            </div>
          )}
          {(loadingCharges + miscFee + otherExpenses + transportCharges) > 0 && (
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-500 uppercase">{T.EXPENSES_TRANSPORT}</span>
              <span className="font-bold text-slate-700">- ₹{(loadingCharges + miscFee + otherExpenses + transportCharges).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-black mt-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{T.TOTAL_PAYABLE}</span>
            <span className="text-2xl font-black tracking-tighter tabular-nums text-black">₹{totalPayable.toLocaleString()}</span>
          </div>
          <div className="text-right mt-3">
            <p className="text-[9px] font-bold text-gray-400 italic uppercase leading-none" style={{ fontFamily }}>
              {amountInWords(totalPayable, lang)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 print:mt-4 print:pt-4 border-t border-black grid grid-cols-2 relative z-10 print:break-inside-avoid">
        <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
          <p>Signature &amp; Stamp</p>
          <div className="mt-6 print:mt-4 h-px w-32 bg-gray-200" />
        </div>
        <div className="text-right text-[10px] font-black text-gray-400 flex flex-col items-end gap-1 uppercase tracking-widest">
          <div className="mt-6 print:mt-4 h-px w-32 bg-gray-200 ml-auto" />
          <span className="text-[9px]">Authorized Signatory</span>
        </div>
      </div>

      {/* Platform branding */}
      {(branding?.document_footer_presented_by_text || branding?.document_footer_powered_by_text || branding?.document_footer_developed_by_text) && (
        <div className="invoice-footer-bar mt-4 pt-3 border-t border-gray-200 flex flex-col relative z-10 print:fixed print:bottom-0 print:left-0 print:w-full print:bg-white print:px-8 print:py-4 print:break-inside-avoid">
          <div className="flex justify-between items-center mb-1 w-full">
            <span className="text-[9px] font-bold text-gray-500 tracking-widest">{branding?.document_footer_presented_by_text}</span>
            <span className="text-[9px] font-black text-gray-800 tracking-widest">{branding?.document_footer_powered_by_text}</span>
            <span className="text-[9px] font-bold text-gray-500 tracking-widest text-right">{branding?.document_footer_developed_by_text}</span>
          </div>
          <span className="text-[8px] font-semibold text-gray-400 tracking-widest w-full">www.mandigrow.com</span>
        </div>
      )}

      <style jsx>{`
        @media print {
          html, body { background: white; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          #purchase-invoice-print { width: 100%; max-width: none; border: none; box-shadow: none; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}
