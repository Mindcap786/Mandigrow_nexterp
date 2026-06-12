"use client"

import { format } from "date-fns"
import { IndianRupee, History } from "lucide-react"
import { AdjustmentDialog } from "./adjustment-dialog"
import { toWords } from "@/lib/number-to-words"
import { QRCodeSVG } from "qrcode.react"
import { usePlatformBranding } from "@/hooks/use-platform-branding"
import { DocumentWatermark } from "@/components/common/document-branding"
import { formatCommodityName } from "@/lib/utils/commodity-utils"
import { cn } from "@/lib/utils"

interface InvoiceTemplateProps {
    sale: any
    organization: any
    onRefresh?: () => void
}

export default function BuyerInvoice({ sale, organization, onRefresh }: InvoiceTemplateProps) {
    const { branding } = usePlatformBranding();

    if (!sale) return null

    const totalGst = (Number(sale.cgst_amount || sale.cgst || 0) + Number(sale.sgst_amount || sale.sgst || 0) + Number(sale.igst_amount || sale.igst || 0)) || Number(sale.gst_total || 0);
    const gstEnabled = organization?.gst_enabled === true || organization?.gst_enabled === 'true' || organization?.gst_enabled === 1 || organization?.gst_enabled === '1' || organization?.settings?.gst_enabled === true || organization?.settings?.gst_enabled === 'true' || organization?.settings?.gst_enabled === 1 || organization?.settings?.gst_enabled === '1' || totalGst > 0;

    const rawBillNo = sale.contact_bill_no || sale.bill_no || sale.id || 'N/A';
    // Clean invoice number: if it's a Frappe docname like INV-SALE-ORG00001-2026-00017,
    // strip org/year prefixes and show only the sequence number (e.g., "17")
    const displayBillNo = (() => {
        if (!rawBillNo || rawBillNo === 'N/A') return 'N/A';
        // If it's already a clean short number (e.g., "3", "17"), use as-is
        if (/^\d+$/.test(String(rawBillNo))) return rawBillNo;
        // Strip Frappe docname patterns: INV-SALE-ORG00001-2026-00017 → 17
        const match = String(rawBillNo).match(/-0*(\d+)$/);
        if (match) return match[1];
        return rawBillNo;
    })();
    const items = sale.sale_items || [];
    // Sale-level lot number: read from lotno DB column (aliased as lot_no in API),
    // then book_no, then fall back to first item's lot code
    const saleLotNo = sale.lot_no || sale.lotno || sale.book_no || sale.bookno || 
        (items.length > 0 ? (items[0].lot?.lot_code || items[0].lot_code || items[0].lot_no) : '') || '';
    const saleVehicleNo = sale.vehiclenumber || sale.vehicle_number || 
        (items.length > 0 ? (items[0].lot?.vehicle_number || items[0].lot?.arrival?.vehicle_number || items[0].vehicle_number) : '') || '';

    const subtotal = sale.total_amount || items.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
    // totalGst defined earlier
    const isInclusive = items.some((i: any) => i.sale_gst_type?.toLowerCase() === 'inclusive' || i.gst_inclusive);
    const gstToAdd = sale.exclusive_gst_total !== undefined 
        ? Number(sale.exclusive_gst_total) 
        : (isInclusive ? 0 : totalGst);
        
    const totalInvoiceAmount = Number(
        sale.total_amount_inc_tax || sale.grand_total ||
        (
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
    );
 
    const totalQty = items.reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0)
    const avgRate = totalQty > 0 ? (subtotal / totalQty) : 0
    const isCreditSale = sale.payment_mode === 'credit' || !sale.payment_mode;

    const crateAmount = items
        .filter((i: any) => String(i.item_name || i.lot?.item?.name || '').toUpperCase().startsWith('CRATE-'))
        .reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
    const cropSubtotal = subtotal - crateAmount;

    // ── Single source of truth for received amount ────────────────────────────
    // IMPORTANT: We use Math.max to ensure we pick up the most up-to-date 
    //            payment info from either the direct DB column OR the 
    //            ledger-synced get_invoice_balance RPC summary.
    const amountReceived = Math.max(
        Number(sale.amount_received || 0),
        Number(sale.paid_amount || 0),
        Number(sale.payment_summary?.amount_received || 0),
        Number(sale.payment_summary?.amount_paid || 0) // field name used by RPC
    );

    // Add a small epsilon (0.5) to balance calculation to treat minor 
    // rounding/decimal differences as "Paid Full" (Mandi transactions round to ₹1).
    const rawBalance = totalInvoiceAmount - amountReceived;
    const balanceDue = rawBalance < 0.5 ? 0 : rawBalance;
    // ─────────────────────────────────────────────────────────────────────────

    const fullAddress = [
        organization?.address_line1,
        organization?.address_line2,
        organization?.city,
        organization?.state,
        organization?.pincode
    ].filter(Boolean).join(", ");

    // We use native CSS table pagination instead of artificial chunking
    // to prevent unwanted blank pages and broken layouts.

    return (
        <div id="invoice-print" className="bg-white text-black p-6 max-w-[800px] mx-auto shadow-2xl border border-gray-100 print:shadow-none print:border-none print:p-[10mm] relative overflow-hidden print:overflow-visible">
            
            {/* Global Watermark */}
            <DocumentWatermark 
                text={branding?.watermark_text} 
                enabled={branding?.is_watermark_enabled} 
            />

            <div className="invoice-page-chunk relative flex flex-col">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between print:flex-row print:justify-between gap-6 items-start border-b-4 border-black pb-3 mb-3 relative z-10">
                {/* Left: Identity */}
                <div className="flex items-start gap-4 w-full md:w-[45%] print:w-[45%]">
                    {organization?.logo_url ? (
                        <img src={organization.logo_url} alt="Logo" className="h-20 w-auto object-contain" style={{ borderRadius: 12 }} />
                    ) : (
                        <div
                            className="h-16 w-16 bg-black flex items-center justify-center shrink-0"
                            style={{ borderRadius: 12, width: 64, height: 64, minWidth: 64, background: '#000' }}
                        >
                            <span className="text-white text-3xl font-black" style={{ color: '#fff', fontSize: 28, fontWeight: 900 }}>
                                {(organization?.name || 'M').charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div className="space-y-1 w-full">
                        <p
                            data-invoice-org-name
                            className="text-black text-[29px] font-black tracking-tight uppercase leading-[1.12]"
                        >
                            {organization?.name || 'Mandi HQ Enterprise'}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-900 max-w-[250px] leading-relaxed">{fullAddress || 'Market Yard, Sector 4, Fruit Market'}</p>
                        {organization?.settings?.mandi_license && <p className="text-[9px] font-black uppercase text-slate-500 mt-1">License: {organization.settings.mandi_license}</p>}
                    </div>
                </div>

                {/* Center: Title */}
                <div className="self-center flex flex-col items-center text-center md:flex-none print:flex-none">
                    <h2
                        data-invoice-title
                        className="text-3xl font-black uppercase tracking-[0.28em] leading-[1.08] text-black"
                    >
                        Invoice
                    </h2>
                    <div className="h-1 w-12 bg-black mx-auto mt-2 rounded-full" />
                </div>

                {/* Right: Contact Details */}
                <div className="text-right space-y-0.5 md:min-w-[180px] md:flex-1 print:min-w-[180px] print:flex-1 md:flex md:flex-col md:items-end print:flex print:flex-col print:items-end">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contact Details</p>
                    <div className="space-y-0 text-xs font-black md:text-right print:text-right">
                        <p>Ph: {organization?.phone || '+91 98765 43210'}</p>
                        {organization?.gstin && <p className="italic">GST: {organization.gstin}</p>}
                        {organization?.email && <p className="text-[10px] lowercase border-t border-gray-100 pt-0.5 mt-0.5">{organization.email}</p>}
                    </div>
                </div>
            </div>

            {/* Parties & Invoice Details Consolidated */}
            <div className="py-2 flex flex-col md:flex-row print:flex-row gap-8 border-b border-gray-100 mb-2 relative z-10 print:gap-4">
                {/* Left: Billed To */}
                <div className="space-y-1 md:w-1/2 print:w-1/2">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Billed To</p>
                    <h3 className="text-2xl font-black tracking-tight">{sale.contact?.name || sale.buyer_name || 'Walk-in Buyer'}</h3>
                    {sale.buyer_phone && <p className="text-gray-600 font-bold text-xs tracking-wider">Ph: {sale.buyer_phone}</p>}
                    {(sale.contact?.billing_address_line1 || sale.buyer_address) && <p className="text-gray-700 font-bold text-xs mt-0.5">{sale.contact?.billing_address_line1 || sale.buyer_address}</p>}
                    {sale.contact?.billing_address_line2 && <p className="text-gray-700 font-bold text-xs">{sale.contact.billing_address_line2}</p>}
                    {(sale.contact?.city || sale.buyer_city) && (
                        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
                            {sale.contact?.city || sale.buyer_city || 'Local'}
                            {sale.contact?.state && `, ${sale.contact.state}`}
                            {sale.contact?.pincode && ` - ${sale.contact.pincode}`}
                        </p>
                    )}
                    {(sale.contact?.gstin || sale.buyer_gstin) && <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">GSTIN: <span className="text-gray-800">{sale.contact?.gstin || sale.buyer_gstin}</span></p>}
                    {sale.contact?.pan_number && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PAN: {sale.contact.pan_number}</p>}
                </div>

                    {/* Right: Invoice Details */}
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
                    {sale.transport_name && (
                        <div className="flex justify-end gap-2 items-center mt-1">
                            <span className="text-gray-400 font-bold uppercase">Transport:</span>
                            <span className="font-black text-[13px] tracking-widest uppercase">{sale.transport_name}</span>
                        </div>
                    )}
                    <div className="flex justify-end gap-2 mt-1">
                        <span className="text-gray-400 font-bold uppercase">Date:</span>
                        <span className="font-black">
                            {(() => {
                                try {
                                    return sale.sale_date ? format(new Date(sale.sale_date), 'dd MMM yyyy') : '-';
                                } catch (e) {
                                    return '-';
                                }
                            })()}
                        </span>
                    </div>
                    <div className="flex justify-end gap-2">
                        <span className="text-gray-400 font-bold uppercase">Payment Mode:</span>
                        <span className="font-black uppercase">{sale.payment_mode || 'Credit'}</span>
                    </div>
                    {(sale.payment_mode === 'credit' || !sale.payment_mode) && sale.due_date && (
                        <div className="flex justify-end gap-2">
                            <span className="text-red-400 font-bold uppercase">Due Date:</span>
                            <span className="font-black text-red-600">
                                {(() => {
                                    try {
                                        return format(new Date(sale.due_date), 'dd MMM yyyy');
                                    } catch (e) {
                                        return '-';
                                    }
                                })()}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            {/* Table */}
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
                            <th className="py-2 w-10 no-print"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.map((item: any) => (
                            <tr key={item.id} className="group break-inside-avoid print:break-inside-avoid">
                                <td className="py-0.5">
                                    <p className="font-black text-xs tracking-tight uppercase leading-none">
                                        {formatCommodityName(item.lot?.item?.name || item.item_name || 'Item', item.lot?.item?.custom_attributes)}
                                    </p>
                                    {(item.lot?.lot_code || item.lot_no) && (
                                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                                            Lot: {item.lot?.lot_code || item.lot_no}
                                        </p>
                                    )}
                                </td>
                                <td className="py-0.5 text-left font-mono text-xs font-bold text-gray-600">
                                    {item.hsn_code || '-'}
                                </td>
                                <td className="py-0.5 text-center font-bold text-sm tracking-tighter relative group/adj">
                                    {item.qty || 0} <span className="text-[10px] text-gray-400 font-black uppercase ml-0.5">{item.unit || 'Unit'}</span>
                                    {(() => {
                                        const adj = sale.sale_adjustments?.find((a: any) => String(a.item_id) === String(item.id) || String(a.item_name) === String(item.name));
                                        if (adj && adj.old_qty !== adj.new_qty) {
                                            return (
                                                <div className="text-[9px] text-orange-500 font-bold leading-tight mt-0.5">
                                                    Adj: {adj.old_qty} → {adj.new_qty}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </td>
                                <td className="py-0.5 text-right font-bold text-sm tracking-tighter relative group/adj">
                                    ₹{Number(item.rate || 0).toLocaleString()}
                                    {(() => {
                                        const adj = sale.sale_adjustments?.find((a: any) => String(a.item_id) === String(item.id) || String(a.item_name) === String(item.name));
                                        if (adj && adj.old_value !== adj.new_value) {
                                            return (
                                                <div className="text-[9px] text-orange-500 font-bold leading-tight mt-0.5">
                                                    Adj: ₹{adj.old_value} → ₹{adj.new_value}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </td>
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
                                <td className="py-1 pl-4 no-print text-right opacity-50 hover:opacity-100 transition-opacity">
                                    <AdjustmentDialog saleItem={item} onRefresh={onRefresh!} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bottom Section: Payment (Left) and Totals (Right) */}
            <div className="mt-6 flex flex-col md:flex-row print:flex-row gap-8 print:gap-4 items-start relative z-10 w-full break-inside-avoid print:break-inside-avoid">
                
                {/* Left Side: Payment Details */}
                <div className="space-y-4 w-full md:w-1/2 print:w-1/2">
                    {/* Bank Details & QR from Settings → Bank Details page */}
                    {(organization?.settings?.payment?.print_upi_qr || organization?.settings?.payment?.print_bank_details) && (() => {
                        const defaultPayment = organization?.settings?.payment || {};
                        const selectedBank = sale.selected_bank_details || {};
                        
                        // Use global organization payment settings for printed invoices
                        const upiId = defaultPayment.upi_id;
                        const accountHolder = defaultPayment.account_holder || organization?.name;
                        const accountNumber = defaultPayment.account_number;
                        const ifscCode = defaultPayment.ifsc_code;
                        const bankName = defaultPayment.bank_name;
                        const upiName = defaultPayment.upi_name || organization?.name;

                        return (
                            <div className="py-4 border-t border-gray-100 flex flex-col gap-4">
                                {/* UPI QR Code for Pending Balance */}
                                {(defaultPayment.print_upi_qr && upiId) && (() => {
                                    if (balanceDue <= 0) return null;
                                    return (
                                        <div className="flex flex-col items-center gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-100 w-fit">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-orange-500 italic">Scan to Pay</span>
                                            <QRCodeSVG
                                                value={`upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${balanceDue}&cu=INR`}
                                                size={90}
                                                level="H"
                                                includeMargin={true}
                                            />
                                            <div className="flex flex-col items-center -mt-1">
                                                <span className="text-[8px] font-black text-gray-900 uppercase">Pending Amount</span>
                                                <span className="text-[10px] font-black text-black">₹{balanceDue.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Bank Account Details */}
                                {defaultPayment.print_bank_details && accountNumber && (
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block border-b border-gray-100 pb-1">Bank Account Details</span>
                                        <div className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-0.5 text-[10px]">
                                            {bankName && (
                                                <><span className="text-gray-400 font-bold uppercase">Bank</span>
                                                <span className="font-black text-gray-800">{bankName}</span></>
                                            )}
                                            <span className="text-gray-400 font-bold uppercase">A/C No</span>
                                            <span className="font-black text-gray-800 font-mono">{accountNumber}</span>
                                            {ifscCode && (
                                                <><span className="text-gray-400 font-bold uppercase">IFSC</span>
                                                <span className="font-black text-gray-800 font-mono">{ifscCode}</span></>
                                            )}
                                            {accountHolder && (
                                                <><span className="text-gray-400 font-bold uppercase">Name</span>
                                                <span className="font-black text-gray-800 uppercase">{accountHolder}</span></>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
                {/* Right Side: Indices & Totals */}
                <div className="space-y-6 w-full md:w-1/2 print:w-1/2">
                    {/* Totals Section */}
                    <div className="space-y-1.5 border-t-2 border-black pt-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-500 uppercase">Sub Total</span>
                            <span className="font-bold">₹{cropSubtotal.toLocaleString()}</span>
                        </div>
                        {crateAmount > 0 && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-500 uppercase">Crate Amount</span>
                                <span className="font-bold text-slate-700">+ ₹{crateAmount.toLocaleString()}</span>
                            </div>
                        )}
                        {/* GST Breakdown - individual lines for compliance */}
                        {gstEnabled && Number(sale.cgst_amount || 0) > 0 && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-bold uppercase tracking-widest">CGST ({sale.cgst_rate || (items.find((i: any) => Number(i.gst_rate) > 0)?.gst_rate / 2) || ''}%)</span>
                                <span className="font-bold">₹{Number(sale.cgst_amount).toLocaleString()}</span>
                            </div>
                        )}
                        {gstEnabled && Number(sale.sgst_amount || 0) > 0 && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-bold uppercase tracking-widest">SGST ({sale.sgst_rate || (items.find((i: any) => Number(i.gst_rate) > 0)?.gst_rate / 2) || ''}%)</span>
                                <span className="font-bold">₹{Number(sale.sgst_amount).toLocaleString()}</span>
                            </div>
                        )}
                        {gstEnabled && Number(sale.igst_amount || 0) > 0 && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-bold uppercase tracking-widest">IGST ({sale.igst_rate || items.find((i: any) => Number(i.gst_rate) > 0)?.gst_rate || ''}%)</span>
                                <span className="font-bold">₹{Number(sale.igst_amount).toLocaleString()}</span>
                            </div>
                        )}
                        {/* Legacy fallback: if only gst_total stored without breakdown */}
                        {gstEnabled && Number(sale.cgst_amount || 0) === 0 && Number(sale.sgst_amount || 0) === 0 && Number(sale.igst_amount || 0) === 0 && Number(sale.gst_total || 0) > 0 && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-500 uppercase">GST</span>
                                <span className="font-bold text-slate-700">+ ₹{Number(sale.gst_total).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-2">
                            <span className="text-gray-400 font-bold uppercase tracking-widest">Total Qty</span>
                            <span className="font-bold">{totalQty} Units</span>
                        </div>
                        {/* Audit Trail */}
                        {(() => {
                            const netAdjustments = sale.sale_adjustments?.reduce((sum: number, adj: any) => {
                                const oldAmt = (Number(adj.old_qty) || 0) * (Number(adj.old_value) || 0);
                                const newAmt = (Number(adj.new_qty) || 0) * (Number(adj.new_value) || 0);
                                return sum + (newAmt - oldAmt);
                            }, 0) || 0;

                            if (netAdjustments !== 0) {
                                return (
                                    <div className="py-1 border-y border-dashed border-gray-100 space-y-0.5">
                                        <div className="flex justify-between items-center text-[10px] text-gray-400 tracking-tight">
                                            <span>Original Amount</span>
                                            <span className="line-through">₹{(subtotal - netAdjustments).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold text-orange-500 tracking-tight">
                                            <span>Adjustments Application</span>
                                            <span>{netAdjustments > 0 ? '+' : ''}₹{netAdjustments.toLocaleString()}</span>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {(Number(sale.market_fee) > 0) && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-500 uppercase">Market Fee</span>
                                <span className="font-bold">+ ₹{Number(sale.market_fee).toLocaleString()}</span>
                            </div>
                        )}

                        {(Number(sale.nirashrit) > 0) && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-500 uppercase">Nirashrit</span>
                                <span className="font-bold">+ ₹{Number(sale.nirashrit).toLocaleString()}</span>
                            </div>
                        )}

                        {(Number(sale.loading_charges || 0) > 0) && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-500 uppercase">Loading Charges</span>
                                <span className="font-bold text-slate-700">+ ₹{Number(sale.loading_charges).toLocaleString()}</span>
                            </div>
                        )}

                        {(Number(sale.discount_amount || 0) > 0) && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-emerald-500 uppercase">Discount</span>
                                <span className="font-bold text-emerald-600">- ₹{Number(sale.discount_amount).toLocaleString()}</span>
                            </div>
                        )}

                        {(Number(sale.unloading_charges || 0) > 0) && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-500 uppercase">Unloading Charges</span>
                                <span className="font-bold text-slate-700">+ ₹{Number(sale.unloading_charges).toLocaleString()}</span>
                            </div>
                        )}

                        {(Number(sale.misc_fee || 0) > 0) && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-500 uppercase">Misc Fee</span>
                                <span className="font-bold text-slate-700">+ ₹{Number(sale.misc_fee).toLocaleString()}</span>
                            </div>
                        )}

                        {(Number(sale.other_expenses || 0) > 0) && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-500 uppercase">Other Expenses</span>
                                <span className="font-bold text-slate-700">+ ₹{Number(sale.other_expenses).toLocaleString()}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t border-black mt-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Invoice Total</span>
                            <span className="text-2xl font-black tracking-tighter tabular-nums text-black">₹{totalInvoiceAmount.toLocaleString()}</span>
                        </div>

                        {/* Amount Received / Balance Details */}
                        <div className="pt-1.5 space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-bold uppercase tracking-widest">Amount Received</span>
                                <span className="font-black text-emerald-600">₹{amountReceived.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="text-right mt-4">
                            <p className="text-[9px] font-bold text-gray-400 italic uppercase leading-none">Rupees {toWords(totalInvoiceAmount)} Only</p>
                        </div>

                        {/* Status Badge */}
                        {/* Payment Status Badge — uses top-level amountReceived / balanceDue (RCA fix) */}
                        <div className={`mt-2 p-1.5 rounded flex justify-between items-center ${balanceDue > 0 ? "bg-red-50" : "bg-emerald-50"}`}>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${balanceDue > 0 ? "text-red-400" : "text-emerald-400"}`}>
                                {balanceDue > 0 ? "Pending Payment" : "Paid Full"}
                            </span>
                            <span className={`text-xl font-black tracking-tighter ${balanceDue > 0 ? "text-red-600" : "text-emerald-600"}`}>
                                ₹{balanceDue > 0 ? balanceDue.toLocaleString() : "0"}
                            </span>
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-gray-100 flex justify-end">
                            <div className="inline-block bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl text-right">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-0.5">Avg Price / Qty</span>
                                <span className="text-base font-black tracking-tighter">₹{avgRate.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Adjustments History */}
            {sale.sale_adjustments && sale.sale_adjustments.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-100 no-print relative z-10">
                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-400 mb-4">
                        <History className="w-4 h-4" /> Adjustment History
                    </h4>
                    <div className="space-y-2">
                        {sale.sale_adjustments.map((adj: any) => {
                            const oldAmt = (Number(adj.old_qty) || 0) * (Number(adj.old_value) || 0);
                            const newAmt = (Number(adj.new_qty) || 0) * (Number(adj.new_value) || 0);
                            const delta = newAmt - oldAmt;

                            return (
                                <div key={adj.id} className="flex justify-between text-xs bg-orange-50 p-2 rounded border border-orange-100">
                                    <div>
                                        <span className="font-bold text-gray-700">Audit {adj.old_qty !== adj.new_qty ? 'Qty' : 'Rate'}</span>
                                        <span className="mx-2 text-gray-400">|</span>
                                        <span className="text-gray-500">
                                            {adj.old_qty !== adj.new_qty && `Qty: ${adj.old_qty} → ${adj.new_qty}`}
                                            {adj.old_qty !== adj.new_qty && adj.old_value !== adj.new_value && ' • '}
                                            {adj.old_value !== adj.new_value && `Rate: ${adj.old_value} → ${adj.new_value}`}
                                        </span>
                                        <span className="mx-2 text-gray-400">|</span>
                                            <span className="italic text-gray-500">"{adj.reason || 'No reason provided'}"</span>
                                    </div>
                                    <div className="font-mono font-bold text-orange-600">
                                        {delta > 0 ? '+' : ''}₹{delta.toLocaleString()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 print:mt-4 print:pt-4 border-t border-black grid grid-cols-2 relative z-10 print:break-inside-avoid">
                <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                    <p>Signature & Stamp</p>
                    <div className="mt-6 print:mt-4 h-px w-32 bg-gray-200" />
                </div>
                <div className="text-right text-[10px] font-black text-gray-400 flex flex-col items-end gap-1 uppercase tracking-widest">
                    {/* Authorized Signatory placeholder */}
                    <div className="mt-6 print:mt-4 h-px w-32 bg-gray-200 ml-auto" />
                    <span className="text-[9px]">Authorized Signatory</span>
                </div>
            </div>

            {/* Platform Branding Footer Bar — all 3 fields set from Super Admin */}
            {(branding?.document_footer_presented_by_text || branding?.document_footer_powered_by_text || branding?.document_footer_developed_by_text) && (
                <div className="invoice-footer-bar mt-4 pt-3 border-t border-gray-200 flex justify-between items-center relative z-10 print:fixed print:bottom-0 print:left-0 print:w-full print:bg-white print:px-8 print:py-4 print:break-inside-avoid">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                        {branding?.document_footer_presented_by_text}
                    </span>
                    <span className="text-[9px] font-black text-gray-800 uppercase tracking-widest">
                        {branding?.document_footer_powered_by_text}
                    </span>
                    <span className="text-[9px] font-bold text-gray-500 tracking-widest">
                        www.mandigrow.com
                    </span>
                </div>
            )}
            </div>

            <style jsx>{`
                @media print {
                    html, body { 
                        background: white; 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important; 
                        color-adjust: exact !important;
                    }
                    #invoice-print { 
                        width: 100%; 
                        max-width: none; 
                        border: none; 
                        box-shadow: none; 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important; 
                        color-adjust: exact !important;
                    }
                    .no-print { display: none !important; }
                    .break-after-page { page-break-after: always; break-after: page; }
                }
            `}</style>
        </div>
    )
}
