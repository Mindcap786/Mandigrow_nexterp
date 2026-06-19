"use client"
/**
 * LocalSaleInvoice.tsx
 * A4 local language sale invoice — mirrors BuyerInvoice layout exactly.
 * Isolated: zero imports from or modifications to BuyerInvoice.
 * Financial labels, amount-in-words, item names, party names → local language.
 * All other labels (Invoice No, Date, HSN, GST%, etc.) stay in English.
 */

import { format } from "date-fns"
import { usePlatformBranding } from "@/hooks/use-platform-branding"
import { DocumentWatermark } from "@/components/common/document-branding"
import { formatCommodityName } from "@/lib/utils/commodity-utils"
import { QRCodeSVG } from "qrcode.react"
import type { LangCode } from "./utils/fonts"
import { FONT_FAMILIES, FONT_URLS, TEXT_DIRECTION } from "./utils/fonts"
import { getTranslation } from "./translations"
import { amountInWords } from "./utils/amount-in-words"
import { getPartyName, getItemName } from "./translations"

interface LocalSaleInvoiceProps {
  sale: any
  organization: any
  lang: LangCode
  /** Translated item names from useLocalInvoice hook { "Apple US": "ఆపిల్ US" } */
  itemTranslations?: Record<string, string>
  /** Translated party name from useLocalInvoice hook */
  partyTranslation?: string | null
  /** Optional manual local_name from contact record */
  contactLocalName?: string | null
}

export default function LocalSaleInvoice({
  sale, organization, lang,
  itemTranslations = {}, partyTranslation = null, contactLocalName = null
}: LocalSaleInvoiceProps) {
  const { branding } = usePlatformBranding()
  const T = getTranslation(lang)
  const fontFamily = FONT_FAMILIES[lang]
  const fontUrl = FONT_URLS[lang]
  const dir = TEXT_DIRECTION[lang]

  if (!sale) return null

  // ── Calculations (identical to BuyerInvoice) ─────────────────────────────
  const totalGst = (
    Number(sale.cgst_amount || sale.cgst || 0) +
    Number(sale.sgst_amount || sale.sgst || 0) +
    Number(sale.igst_amount || sale.igst || 0)
  ) || Number(sale.gst_total || 0)

  const gstEnabled = organization?.gst_enabled === true || organization?.gst_enabled === 'true' ||
    organization?.gst_enabled === 1 || organization?.gst_enabled === '1' ||
    organization?.settings?.gst_enabled === true || totalGst > 0

  const rawBillNo = sale.contact_bill_no || sale.bill_no || sale.id || 'N/A'
  const displayBillNo = (() => {
    if (!rawBillNo || rawBillNo === 'N/A') return 'N/A'
    if (/^\d+$/.test(String(rawBillNo))) return rawBillNo
    const match = String(rawBillNo).match(/-0*(\d+)$/)
    if (match) return match[1]
    return rawBillNo
  })()

  const items = sale.sale_items || []
  const saleLotNo = sale.lot_no || sale.lotno || sale.book_no ||
    (items.length > 0 ? (items[0].lot?.lot_code || items[0].lot_code || items[0].lot_no) : '') || ''
  const saleVehicleNo = sale.vehiclenumber || sale.vehicle_number ||
    (items.length > 0 ? (items[0].lot?.vehicle_number || items[0].vehicle_number) : '') || ''

  const subtotal = sale.total_amount || items.reduce((s: number, i: any) => s + Number(i.amount || 0), 0)
  const isInclusive = items.some((i: any) => i.sale_gst_type?.toLowerCase() === 'inclusive' || i.gst_inclusive)
  const gstToAdd = sale.exclusive_gst_total !== undefined
    ? Number(sale.exclusive_gst_total)
    : (isInclusive ? 0 : totalGst)

  const totalInvoiceAmount = Number(
    sale.total_amount_inc_tax || sale.grand_total || (
      subtotal +
      Number(sale.market_fee || 0) +
      Number(sale.nirashrit || 0) +
      Number(sale.misc_fee || 0) +
      Number(sale.loading_charges || 0) +
      Number(sale.unloading_charges || 0) +
      Number(sale.other_expenses || 0) +
      gstToAdd -
      Number(sale.discount_amount || 0)
    )
  )
  const totalQty = items.reduce((s: number, i: any) => s + Number(i.qty || 0), 0)
  const avgRate = totalQty > 0 ? (subtotal / totalQty) : 0

  const crateAmount = items
    .filter((i: any) => String(i.item_name || i.lot?.item?.name || '').toUpperCase().startsWith('CRATE-'))
    .reduce((s: number, i: any) => s + Number(i.amount || 0), 0)
  const cropSubtotal = subtotal - crateAmount

  const amountReceived = Math.max(
    Number(sale.amount_received || 0),
    Number(sale.paid_amount || 0),
    Number(sale.payment_summary?.amount_received || 0),
    Number(sale.payment_summary?.amount_paid || 0)
  )
  const rawBalance = totalInvoiceAmount - amountReceived
  const balanceDue = rawBalance < 0.5 ? 0 : rawBalance

  const fullAddress = [
    organization?.address_line1, organization?.address_line2,
    organization?.city, organization?.state, organization?.pincode
  ].filter(Boolean).join(", ")

  // ── Party name resolution ─────────────────────────────────────────────────
  const englishPartyName = sale.contact?.name || sale.buyer_name || 'Walk-in Buyer'
  const resolvedPartyName = getPartyName(englishPartyName, contactLocalName, partyTranslation)

  // ── Item name resolver ────────────────────────────────────────────────────
  const resolveItemName = (item: any) => {
    const rawName = formatCommodityName(item.lot?.item?.name || item.item_name || 'Item', item.lot?.item?.custom_attributes)
    const translated = itemTranslations[item.lot?.item?.name || item.item_name || ''] ||
                       itemTranslations[rawName]
    return getItemName(rawName, translated)
  }

  return (
    <div
      id="invoice-print-local"
      dir={dir}
      style={{ fontFamily }}
      className="bg-white text-black p-6 max-w-[800px] mx-auto shadow-2xl border border-gray-100 print:shadow-none print:border-none print:p-[10mm] relative overflow-hidden print:overflow-visible"
    >
      {/* Load font */}
      <link rel="stylesheet" href={fontUrl} />

      {/* Watermark */}
      <DocumentWatermark text={branding?.watermark_text} enabled={branding?.is_watermark_enabled} />

      <div className="invoice-page-chunk relative flex flex-col">
        <table className="w-full border-collapse border-spacing-0">
          <thead className="print:table-header-group">
            <tr><td className="p-0 border-none"></td></tr>
          </thead>
          <tbody>
            <tr><td className="p-0 border-none align-top">

              {/* Header — same layout as BuyerInvoice */}
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
                    {organization?.settings?.mandi_license && (
                      <p className="text-[9px] font-black uppercase text-slate-500 mt-1">License: {organization.settings.mandi_license}</p>
                    )}
                  </div>
                </div>

                <div className="self-center flex flex-col items-center text-center">
                  <h2 className="text-3xl font-black uppercase tracking-[0.28em] leading-[1.08] text-black">Invoice</h2>
                  <div className="h-1 w-12 bg-black mx-auto mt-2 rounded-full" />
                </div>

                <div className="text-right space-y-0.5 md:min-w-[180px] md:flex-1 print:min-w-[180px] print:flex-1 md:flex md:flex-col md:items-end print:flex print:flex-col print:items-end">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contact Details</p>
                  <div className="space-y-0 text-xs font-black md:text-right print:text-right">
                    <p>Ph: {organization?.phone || '+91 98765 43210'}</p>
                    {organization?.gstin && <p className="italic">GST: {organization.gstin}</p>}
                    {organization?.email && <p className="text-[10px] lowercase border-t border-gray-100 pt-0.5 mt-0.5">{organization.email}</p>}
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div className="py-2 flex flex-col md:flex-row print:flex-row gap-8 border-b border-gray-100 mb-2 relative z-10 print:gap-4">
                <div className="space-y-1 md:w-1/2 print:w-1/2">
                  {/* BILLED_TO stays — user knows what this means */}
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Billed To</p>
                  <h3 className="text-2xl font-black tracking-tight" style={{ fontFamily }}>{resolvedPartyName}</h3>
                  {sale.buyer_phone && <p className="text-gray-600 font-bold text-xs tracking-wider">Ph: {sale.buyer_phone}</p>}
                  {(sale.contact?.billing_address_line1 || sale.buyer_address) && (
                    <p className="text-gray-700 font-bold text-xs mt-0.5">{sale.contact?.billing_address_line1 || sale.buyer_address}</p>
                  )}
                  {(sale.contact?.city || sale.buyer_city) && (
                    <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
                      {sale.contact?.city || sale.buyer_city}
                      {sale.contact?.state && `, ${sale.contact.state}`}
                      {sale.contact?.pincode && ` - ${sale.contact.pincode}`}
                    </p>
                  )}
                  {(sale.contact?.gstin || sale.buyer_gstin) && (
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                      GSTIN: <span className="text-gray-800">{sale.contact?.gstin || sale.buyer_gstin}</span>
                    </p>
                  )}
                </div>

                <div className="text-left md:text-right space-y-0.5 text-xs self-end md:w-1/2 print:w-1/2 md:flex md:flex-col md:items-end print:flex print:flex-col print:items-end">
                  <div className="flex justify-end gap-2">
                    <span className="text-gray-400 font-bold uppercase">Invoice No:</span>
                    <span className="font-black">#{displayBillNo}</span>
                  </div>
                  {saleLotNo && (
                    <div className="flex justify-end gap-2 items-center">
                      <span className="text-gray-400 font-bold uppercase">Lot No:</span>
                      <span className="font-black text-[13px] tracking-widest">{saleLotNo}</span>
                    </div>
                  )}
                  {saleVehicleNo && (
                    <div className="flex justify-end gap-2 items-center mt-1">
                      <span className="text-gray-400 font-bold uppercase">Vehicle No:</span>
                      <span className="font-black text-white bg-slate-900 px-2 py-0.5 rounded text-[13px] tracking-widest uppercase">{saleVehicleNo}</span>
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-1">
                    <span className="text-gray-400 font-bold uppercase">Date:</span>
                    <span className="font-black">
                      {(() => {
                        try { return sale.sale_date ? format(new Date(sale.sale_date), 'dd MMM yyyy') : '-' }
                        catch { return '-' }
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <span className="text-gray-400 font-bold uppercase">Payment Mode:</span>
                    <span className="font-black uppercase">{sale.payment_mode || 'Credit'}</span>
                  </div>
                </div>
              </div>

              {/* Items Table — column headers stay English (HSN, Qty, Rate, GST, Amount are universal) */}
              <div className="relative z-10 overflow-x-auto print:overflow-visible">
                <table className="w-full text-left">
                  <thead className="print:table-header-group">
                    <tr className="border-b-2 border-black break-inside-avoid print:break-inside-avoid">
                      <th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-left">Item / Lot</th>
                      <th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-left">HSN</th>
                      <th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-center">Qty</th>
                      <th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-right">Rate</th>
                      {gstEnabled && <th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-right">GST</th>}
                      <th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item: any) => (
                      <tr key={item.id} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }} className="break-inside-avoid print:break-inside-avoid">
                        <td className="py-0.5">
                          <p className="font-black text-xs tracking-tight uppercase leading-none" style={{ fontFamily }}>
                            {resolveItemName(item)}
                          </p>
                          {(item.lot?.lot_code || item.lot_no) && (
                            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                              Lot: {item.lot?.lot_code || item.lot_no}
                            </p>
                          )}
                        </td>
                        <td className="py-0.5 text-left font-mono text-xs font-bold text-gray-600">{item.hsn_code || '-'}</td>
                        <td className="py-0.5 text-center font-bold text-sm tracking-tighter">
                          {item.qty || 0} <span className="text-[10px] text-gray-400 font-black uppercase ml-0.5">{item.uom || item.unit || 'Unit'}</span>
                        </td>
                        <td className="py-0.5 text-right font-bold text-sm tracking-tighter">₹{Number(item.rate || 0).toLocaleString()}</td>
                        {gstEnabled && (
                          <td className="py-0.5 text-right font-bold text-sm tracking-tighter">
                            {Number(item.gst_rate) > 0 ? (
                              <div className="flex flex-col items-end leading-tight mt-0.5">
                                <span className="text-xs text-gray-700">{item.gst_rate}%</span>
                                <span className="text-[10px] text-gray-400">₹{Number(item.gst_amount || 0).toLocaleString()}</span>
                              </div>
                            ) : <span className="text-gray-300">-</span>}
                          </td>
                        )}
                        <td className="py-0.5 text-right font-black text-sm tracking-tighter">₹{Math.round(Number(item.amount || 0)).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-6 flex flex-col md:flex-row print:flex-row gap-8 print:gap-4 items-start relative z-10 w-full break-inside-avoid print:break-inside-avoid">
                {/* Left: Bank/QR (same as BuyerInvoice) */}
                <div className="space-y-4 w-full md:w-1/2 print:w-1/2">
                  {(organization?.settings?.payment?.print_upi_qr || organization?.settings?.payment?.print_bank_details) && (() => {
                    const pay = organization?.settings?.payment || {}
                    return (
                      <div className="py-4 border-t border-gray-100 flex flex-col gap-4">
                        {pay.print_upi_qr && pay.upi_id && balanceDue > 0 && (
                          <div className="flex flex-col items-center gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-100 w-fit">
                            <span className="text-[8px] font-black uppercase tracking-widest text-orange-500 italic">Scan to Pay</span>
                            <QRCodeSVG
                              value={`upi://pay?pa=${pay.upi_id}&pn=${encodeURIComponent(pay.upi_name || organization?.name)}&am=${balanceDue}&cu=INR`}
                              size={90} level="H" includeMargin={true}
                            />
                          </div>
                        )}
                        {pay.print_bank_details && pay.account_number && (
                          <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block border-b border-gray-100 pb-1">Bank Account Details</span>
                            <div className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-0.5 text-[10px]">
                              {pay.bank_name && <><span className="text-gray-400 font-bold uppercase">Bank</span><span className="font-black text-gray-800">{pay.bank_name}</span></>}
                              <span className="text-gray-400 font-bold uppercase">A/C No</span>
                              <span className="font-black text-gray-800 font-mono">{pay.account_number}</span>
                              {pay.ifsc_code && <><span className="text-gray-400 font-bold uppercase">IFSC</span><span className="font-black text-gray-800 font-mono">{pay.ifsc_code}</span></>}
                              {pay.account_holder && <><span className="text-gray-400 font-bold uppercase">Name</span><span className="font-black text-gray-800 uppercase">{pay.account_holder}</span></>}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>

                {/* Right: Financial totals — labels in local language */}
                <div className="space-y-6 w-full md:w-1/2 print:w-1/2">
                  <div className="space-y-1.5 border-t-2 border-black pt-4" style={{ fontFamily }}>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-500 uppercase">{T.SUB_TOTAL}</span>
                      <span className="font-bold">₹{cropSubtotal.toLocaleString()}</span>
                    </div>
                    {Number(sale.market_fee) > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-500 uppercase">{T.MARKET_FEE}</span>
                        <span className="font-bold">+ ₹{Number(sale.market_fee).toLocaleString()}</span>
                      </div>
                    )}
                    {Number(sale.loading_charges || 0) > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500 uppercase">{T.LOADING_CHARGES}</span>
                        <span className="font-bold text-slate-700">+ ₹{Number(sale.loading_charges).toLocaleString()}</span>
                      </div>
                    )}
                    {Number(sale.discount_amount || 0) > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-emerald-500 uppercase">{T.DISCOUNT}</span>
                        <span className="font-bold text-emerald-600">- ₹{Number(sale.discount_amount).toLocaleString()}</span>
                      </div>
                    )}
                    {Number(sale.unloading_charges || 0) > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500 uppercase">{T.UNLOADING_CHARGES}</span>
                        <span className="font-bold text-slate-700">+ ₹{Number(sale.unloading_charges).toLocaleString()}</span>
                      </div>
                    )}
                    {Number(sale.misc_fee || 0) > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500 uppercase">{T.MISC_FEE}</span>
                        <span className="font-bold text-slate-700">+ ₹{Number(sale.misc_fee).toLocaleString()}</span>
                      </div>
                    )}
                    {Number(sale.other_expenses || 0) > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500 uppercase">{T.OTHER_EXPENSES}</span>
                        <span className="font-bold text-slate-700">+ ₹{Number(sale.other_expenses).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-2">
                      <span className="text-gray-400 font-bold uppercase tracking-widest">{T.TOTAL_QTY}</span>
                      <span className="font-bold">{totalQty} {items[0]?.uom || items[0]?.unit || 'Units'}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-black mt-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{T.INVOICE_TOTAL}</span>
                      <span className="text-2xl font-black tracking-tighter tabular-nums text-black">₹{totalInvoiceAmount.toLocaleString()}</span>
                    </div>

                    <div className="pt-1.5 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-bold uppercase tracking-widest">{T.AMOUNT_RECEIVED}</span>
                        <span className="font-black text-emerald-600">₹{amountReceived.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="text-right mt-4">
                      <p className="text-[9px] font-bold text-gray-400 italic uppercase leading-none" style={{ fontFamily }}>
                        {amountInWords(totalInvoiceAmount, lang)}
                      </p>
                    </div>

                    {/* Balance badge */}
                    <div className={`mt-2 p-1.5 rounded flex justify-between items-center ${balanceDue > 0 ? "bg-red-50" : "bg-emerald-50"}`}>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${balanceDue > 0 ? "text-red-400" : "text-emerald-400"}`} style={{ fontFamily }}>
                        {balanceDue > 0 ? T.PENDING_PAYMENT : T.PAID_FULL}
                      </span>
                      <span className={`text-xl font-black tracking-tighter ${balanceDue > 0 ? "text-red-600" : "text-emerald-600"}`}>
                        ₹{balanceDue > 0 ? balanceDue.toLocaleString() : "0"}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100 flex justify-end">
                      <div className="inline-block bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl text-right">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-0.5">{T.AVG_PRICE_QTY}</span>
                        <span className="text-base font-black tracking-tighter">₹{avgRate.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
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

            </td></tr>
          </tbody>
          <tfoot className="print:table-footer-group">
            <tr><td className="p-0 border-none">
              <div className="h-0 print:h-[60px] w-full"></div>
            </td></tr>
          </tfoot>
        </table>

        {/* Platform branding footer */}
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
      </div>

      <style jsx>{`
        @media print {
          html, body { background: white; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          #invoice-print-local { width: 100%; max-width: none; border: none; box-shadow: none; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}
