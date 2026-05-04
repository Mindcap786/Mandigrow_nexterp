"use client"

import { format } from "date-fns"
import { toWords } from "@/lib/number-to-words"
import { usePlatformBranding } from "@/hooks/use-platform-branding"
import { DocumentWatermark } from "@/components/common/document-branding"
import { formatCommodityName } from "@/lib/utils/commodity-utils"
import { cn } from "@/lib/utils"
import {
    calculateLotSettlementAmount,
    calculateLotGrossValue,
    calculateArrivalLevelExpenses,
    getArrivalType,
} from "@/lib/purchase-payables"
import { Check } from "lucide-react"

interface PurchaseInvoiceTemplateProps {
    lot: any
    arrival: any
    organization: any
    arrivalLots?: any[]  // All lots in same arrival — for expense share calc
}

const toNumber = (v: any) => Number(v) || 0;

export default function PurchaseBillInvoice({
    lot,
    arrival,
    organization,
    arrivalLots = [],
}: PurchaseInvoiceTemplateProps) {
    const { branding } = usePlatformBranding();

    if (!lot) return null

    // ── Data extraction ──────────────────────────────────────────
    const farmerName = lot.farmer?.name || lot.contact?.name || 'Unknown Supplier'
    const farmerCity = lot.farmer?.city || lot.contact?.city || ''
    const itemName = formatCommodityName(lot.item?.name, lot.custom_attributes || lot.item?.custom_attributes)
    const lotCode = lot.lot_code || arrival?.lot_prefix || 'N/A'
    const unit = lot.unit || 'Unit'

    const rawBillNo = arrival?.contact_bill_no || arrival?.bill_no || lot.lot_code || 'N/A'
    // Display bill numbers correctly:
    //   YYYY-N format (e.g. '2026-17') → show as-is (annual sequential)
    //   Plain numeric (legacy, e.g. '17') → show as-is
    //   Frappe docname (e.g. 'INV-ARR-ORG00001-2026-00003') → strip to last digits
    //   ARC-prefixed (archived/reset) → show 'RESET' as placeholder
    const billNo = (() => {
        if (!rawBillNo || rawBillNo === 'N/A') return lot.lot_code || 'N/A';
        const s = String(rawBillNo);
        if (s.startsWith('ARC')) return 'RESET';                  // archived sequence
        if (/^\d{4}-\d+$/.test(s)) return s;                      // YYYY-N annual format
        if (/^\d+$/.test(s)) return s;                             // legacy plain numeric
        const match = s.match(/-0*(\d+)$/);
        if (match) return match[1];                                 // Frappe docname → strip
        return s;
    })()
    const referenceNo = arrival?.reference_no || arrival?.contact_bill_no || ''
    const vehicleNo = arrival?.vehicle_number || ''
    const vehicleType = arrival?.vehicle_type || ''
    const arrivalDate = arrival?.arrival_date || lot.created_at
    const arrivalType = arrival?.arrival_type || getArrivalType(lot)
    const arrivalTypeLabel = arrivalType === 'direct' ? 'Mandi Owned (Direct)' :
        arrivalType === 'commission' || arrivalType === 'farmer' ? 'Farmer Arrival (Commission)' :
            'Supplier Arrival (Commission)'

    const paymentMode = arrival?.advance_payment_mode || lot.advance_payment_mode || 'udhaar'

    // ── Financial calculations (Aggregated across all lots) ──────
    const lotsToProcess = arrivalLots.length > 0 ? arrivalLots : [lot];
    
    let totalGrossQty = 0;
    let totalGrossGoodsValue = 0;
    let totalLessAmount = 0;
    let totalCommission = 0;
    let totalLotExpenses = 0;
    let totalAdvance = 0;
    let totalPaidAmount = 0;
    let totalOtherCharges = 0;
    let totalArrivalExpenseShare = 0;

    lotsToProcess.forEach(l => {
        const isSettled = !!l.settlement_at;
        const gQty = toNumber(l.gross_quantity) || toNumber(l.initial_qty);
        let lLessQty = 0;
        const lLessUnits = toNumber(l.less_units);
        const lLessPercent = toNumber(l.less_percent);
        if (lLessUnits > 0) {
            lLessQty = lLessUnits;
        } else if (lLessPercent > 0) {
            lLessQty = gQty * (lLessPercent / 100);
        }
        
        const rate = toNumber(l.supplier_rate);
        const gGoodsVal = gQty * rate;
        const lLessAmount = lLessQty * rate;
        const nGoodsVal = gGoodsVal - lLessAmount;
        
        totalGrossQty += gQty;
        totalGrossGoodsValue += gGoodsVal;
        totalLessAmount += lLessAmount;
        
        totalCommission += isSettled ? toNumber(l.settlement_commission) : (nGoodsVal * toNumber(l.commission_percent)) / 100;
        totalLotExpenses += isSettled ? toNumber(l.settlement_expenses) : (toNumber(l.packing_cost) + toNumber(l.loading_cost));
        totalAdvance += toNumber(l.advance);
        totalPaidAmount += toNumber(l.paid_amount);
        totalOtherCharges += toNumber(l.other_charges || 0);
        totalArrivalExpenseShare += toNumber(l.farmer_charges || 0);
    });

    // If advance is not per-lot, use header level advance
    if (totalAdvance === 0 && arrival?.advance) {
        totalAdvance = toNumber(arrival.advance);
    }
    if (totalPaidAmount === 0 && arrival?.paid_amount) {
        totalPaidAmount = toNumber(arrival.paid_amount);
    }

    // Add trip-level expenses from the arrival document (only added once)
    const tripExpenses = toNumber(arrival?.hire_charges) + toNumber(arrival?.hamali_expenses) + toNumber(arrival?.other_expenses);
    const combinedExpenses = totalLotExpenses + totalArrivalExpenseShare + tripExpenses;

    const isSettled = lotsToProcess.some(l => !!l.settlement_at);
    const totalNetGoodsValue = totalGrossGoodsValue - totalLessAmount;

    // Use backend-provided flag: 'is_cheque_cleared' is false when user chose 'Clear Later'
    // This is set by the API based on whether the payment JE is submitted or just a draft.
    // Case-insensitive check for 'cheque'
    const isChequeMode = (arrival?.advance_payment_mode || '').toLowerCase() === 'cheque';
    const isChequeCleared = !isChequeMode
        ? true  // non-cheque modes (cash, UPI) are always cleared
        : (arrival?.is_cheque_cleared === true);  // cheque: only cleared if backend says so

    // Only consider advance paid if it's cleared (not post-dated cheque)
    const effectiveAdvance = isChequeCleared ? totalAdvance : 0;
    const effectivePaidAmount = isChequeCleared ? totalPaidAmount : 0;

    const combinedPaid = effectiveAdvance === effectivePaidAmount ? effectiveAdvance : effectiveAdvance + effectivePaidAmount;
    
    const finalPayable = arrivalType === 'direct' 
        ? Math.max(0, totalNetGoodsValue + totalLotExpenses - totalArrivalExpenseShare - tripExpenses - combinedPaid - totalOtherCharges)
        : Math.max(0, totalNetGoodsValue - totalCommission - combinedExpenses - combinedPaid - totalOtherCharges)

    // Organization address
    const fullAddress = [
        organization?.address_line1,
        organization?.address_line2,
        organization?.city,
        organization?.state,
        organization?.pincode
    ].filter(Boolean).join(", ")

    const formattedDate = (() => {
        try { return arrivalDate ? format(new Date(arrivalDate), 'dd MMM yyyy') : '-'; }
        catch { return '-'; }
    })()

    return (
        <div id="purchase-invoice-print" className="bg-white text-black p-6 max-w-[800px] mx-auto shadow-2xl border border-gray-100 print:shadow-none print:border-none print:p-0 relative overflow-hidden">

            {/* Global Watermark */}
            <DocumentWatermark
                text={branding?.watermark_text}
                enabled={branding?.is_watermark_enabled}
            />

            {/* ───── Header ───── */}
            <div className="grid grid-cols-[minmax(0,1.35fr)_auto_minmax(180px,1fr)] gap-6 items-start border-b-4 border-black pb-3 mb-3 relative z-10 print:flex print:w-full print:justify-between">
                {/* Left: Identity */}
                <div className="flex items-start gap-4 min-w-0 print:w-1/3">
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
                    <div className="space-y-1 min-w-0">
                        <p
                            data-invoice-org-name
                            className="text-black text-[29px] font-black tracking-tight uppercase leading-[1.12] break-words"
                        >
                            {organization?.name || 'Mandi HQ Enterprise'}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-900 max-w-[250px] leading-relaxed">
                            {fullAddress || 'Market Yard, Sector 4, Fruit Market'}
                        </p>
                        {organization?.settings?.mandi_license && (
                            <p className="text-[9px] font-black uppercase text-slate-500 mt-1">
                                License: {organization.settings.mandi_license}
                            </p>
                        )}
                    </div>
                </div>

                {/* Center: Title */}
                <div className="self-center flex flex-col items-center text-center print:w-1/3 print:shrink-0">
                    <h2
                        data-invoice-title
                        className="text-2xl font-black uppercase tracking-[0.2em] leading-[1.08] text-black"
                    >
                        Purchase
                    </h2>
                    <h2 className="text-2xl font-black uppercase tracking-[0.2em] leading-[1.08] text-black -mt-1">
                        Bill
                    </h2>
                    <div className="h-1 w-12 bg-black mx-auto mt-2 rounded-full" />
                </div>

                {/* Right: Contact Details */}
                <div className="text-right space-y-0.5 print:w-1/3 print:flex print:flex-col print:items-end">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contact Details</p>
                    <div className="space-y-0 text-xs font-black">
                        <p>Ph: {organization?.phone || '+91 98765 43210'}</p>
                        {organization?.gstin && <p className="italic">GST: {organization.gstin}</p>}
                        {organization?.email && (
                            <p className="text-[10px] lowercase border-t border-gray-100 pt-0.5 mt-0.5">{organization.email}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ───── Parties & Bill Details ───── */}
            <div className="py-2 grid grid-cols-2 gap-8 border-b border-gray-100 mb-2 relative z-10 print:flex print:w-full print:justify-between">
                {/* Left: Purchased From */}
                <div className="space-y-1 print:w-1/2">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Purchased From</p>
                    <h3 className="text-2xl font-black tracking-tight">{farmerName}</h3>
                    <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">{farmerCity || 'Local'}</p>
                    <p className="text-[9px] font-black uppercase text-purple-600 tracking-widest mt-1 bg-purple-50 inline-block px-2 py-0.5 rounded">
                        {arrivalTypeLabel}
                    </p>
                </div>

                {/* Right: Bill Details */}
                <div className="text-right space-y-0.5 text-xs self-end print:w-1/2 print:flex print:flex-col print:items-end">
                    <div className="flex justify-end gap-2 items-center">
                        <span className="text-gray-400 font-bold uppercase">Invoice No:</span>
                        <span className="font-black">#{billNo}</span>
                        {isSettled && (
                            <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-[8px] font-black rounded uppercase flex items-center gap-0.5">
                                <Check className="w-2 h-2" />
                                Settled
                            </span>
                        )}
                    </div>
                    {lotCode && lotCode !== 'N/A' && (
                        <div className="flex justify-end gap-2 items-center">
                            <span className="text-gray-400 font-bold uppercase">Lot No:</span>
                            <span className="font-black text-white bg-slate-900 px-2 py-0.5 rounded text-[13px] tracking-widest">{lotCode}</span>
                        </div>
                    )}
                    {vehicleNo && (
                        <div className="flex justify-end gap-2 items-center">
                            <span className="text-gray-400 font-bold uppercase">Vehicle:</span>
                            <span className="font-black tracking-widest">{vehicleNo}</span>
                        </div>
                    )}
                    <div className="flex justify-end gap-2 mt-1">
                        <span className="text-gray-400 font-bold uppercase">Date:</span>
                        <span className="font-black">{formattedDate}</span>
                    </div>
                </div>
            </div>

            {/* ───── Items Table ───── */}
            <div className="relative z-10">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-left">Item Details</th>
                            <th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-center">Quantity</th>
                            <th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-right">Rate</th>
                            <th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {lotsToProcess.map((l: any) => {
                            const lGrossQty = toNumber(l.gross_quantity) || toNumber(l.initial_qty);
                            let itemLessQty = 0;
                            const itemLessUnits = toNumber(l.less_units);
                            const itemLessPercent = toNumber(l.less_percent);
                            if (itemLessUnits > 0) {
                                itemLessQty = itemLessUnits;
                            } else if (itemLessPercent > 0) {
                                itemLessQty = lGrossQty * (itemLessPercent / 100);
                            }
                            const lNetQty = Math.max(lGrossQty - itemLessQty, 0);
                            const lIsSettled = !!l.settlement_at;
                            const lGoodsVal = lIsSettled 
                                ? toNumber(l.settlement_goods_value) 
                                : lGrossQty * toNumber(l.supplier_rate);

                            return (
                                <tr key={l.id}>
                                    <td className="py-2">
                                        <p className="font-black text-xs tracking-tight uppercase leading-none">
                                            {formatCommodityName(l.item?.name || lot.item?.name, l.custom_attributes || l.item?.custom_attributes || lot.custom_attributes)}
                                        </p>
                                        {l.lot_code && (
                                            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                                                Lot: {l.lot_code}
                                            </p>
                                        )}
                                    </td>
                                    <td className="py-2 text-center font-bold text-sm tracking-tighter">
                                        {Math.round(lGrossQty * 100) / 100} <span className="text-[11px] text-gray-500 font-bold ml-0.5 uppercase tracking-tight">{l.unit || unit}</span>
                                    </td>
                                    <td className="py-2 text-right font-bold text-sm tracking-tighter">
                                        ₹{toNumber(l.supplier_rate).toLocaleString()}
                                    </td>
                                    <td className="py-2 text-right font-black text-sm tracking-tighter">
                                        ₹{Math.round(lGoodsVal).toLocaleString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ───── Settlement Breakdown ───── */}
            <div className="mt-6 grid grid-cols-2 gap-8 items-start relative z-10">

                {/* Left Side: Transport & Payment Info */}
                <div className="space-y-4">
                    {/* Payment Details Card */}
                    <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block border-b border-slate-200 pb-1">
                            Payment & Settlement
                        </span>
                        <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1.5 text-[10px]">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mode of Pay</span>
                            <span className="font-black text-blue-700 uppercase">
                                {combinedPaid <= 0 && (paymentMode.toLowerCase() === 'credit' || paymentMode.toLowerCase() === 'udhaar') 
                                    ? 'UDHAAR (CREDIT)' 
                                    : (paymentMode.toLowerCase() === 'credit' || paymentMode.toLowerCase() === 'udhaar' ? 'CREDIT (UDHAAR)' : 
                                        (!isChequeCleared ? 'CHEQUE (PENDING)' : paymentMode))}
                            </span>
                            
                            {totalAdvance > 0 && (
                                <>
                                    <span className="text-gray-400 font-bold uppercase">Paid Amount</span>
                                    <span className="font-black text-emerald-700">₹{combinedPaid.toLocaleString()}</span>
                                </>
                            )}

                            {arrival?.advance_bank_name && (
                                <>
                                    <span className="text-gray-400 font-bold uppercase">Bank Info</span>
                                    <span className="font-black text-gray-800 uppercase">{arrival.advance_bank_name}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Transport Details Card */}
                    {(vehicleNo || arrival?.driver_name || arrival?.guarantor) && (
                        <div className="space-y-2 px-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block border-b border-gray-100 pb-1">
                                Transport Details
                            </span>
                            <div className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-0.5 text-[10px]">
                                {vehicleNo && (
                                    <>
                                        <span className="text-gray-400 font-bold uppercase">Vehicle</span>
                                        <span className="font-black text-gray-800 tracking-wider">{vehicleNo}</span>
                                    </>
                                )}
                                {arrival?.driver_name && (
                                    <>
                                        <span className="text-gray-400 font-bold uppercase">Driver</span>
                                        <span className="font-black text-gray-800">{arrival.driver_name}</span>
                                    </>
                                )}
                                {arrival?.guarantor && (
                                    <>
                                        <span className="text-gray-400 font-bold uppercase">Guarantor</span>
                                        <span className="font-black text-gray-800">{arrival.guarantor}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Totals & Settlement */}
                <div className="space-y-6">
                    <div className="space-y-1.5 border-t-2 border-black pt-4">
                        {/* Gross Value */}
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-500 uppercase">Gross Value</span>
                            <span className="font-bold text-slate-900">₹{Math.round(totalGrossGoodsValue).toLocaleString()}</span>
                        </div>

                        {/* Less / Cutting */}
                        {totalLessAmount > 0.01 && (
                            <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-1">
                                <span className="font-bold text-orange-600 uppercase">Less / Cutting</span>
                                <span className="font-bold text-orange-600">− ₹{Math.round(totalLessAmount).toLocaleString()}</span>
                            </div>
                        )}

                        {/* Net Goods Value */}
                        <div className="flex justify-between items-center text-xs border-t border-black pt-1.5 mb-2">
                            <span className="font-black text-slate-800 uppercase tracking-tight">Net Goods Value</span>
                            <span className="font-black text-slate-800">₹{Math.round(totalNetGoodsValue).toLocaleString()}</span>
                        </div>

                        {/* Commission — only for commission types */}
                        {totalCommission > 0.01 && (
                            <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-1">
                                <span className="font-bold text-purple-600 uppercase">
                                    Commission
                                </span>
                                <span className="font-bold text-purple-600">
                                    − ₹{Math.round(totalCommission).toLocaleString()}
                                </span>
                            </div>
                        )}

                        {/* Other Charges */}
                        {totalOtherCharges > 0 && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-bold uppercase tracking-widest">Other Charges</span>
                                <span className="font-bold text-red-500">− ₹{Math.round(totalOtherCharges).toLocaleString()}</span>
                            </div>
                        )}

                        {/* Loading/Packing Cost + Arrival Expenses */}
                        {combinedExpenses > 0.01 ? (
                            <>
                                <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-1">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest">
                                        {arrivalType === 'direct' ? 'Expenses (Reimbursed)' : 'Expenses / Transport'}
                                    </span>
                                    <span className={cn("font-bold", arrivalType === 'direct' ? "text-emerald-600" : "text-red-500")}>
                                        {arrivalType === 'direct' ? '+' : '−'} ₹{Math.round(combinedExpenses).toLocaleString()}
                                    </span>
                                </div>
                                {/* Detailed Breakdown */}
                                <div className="pl-2 space-y-0.5 mt-0.5">
                                    {totalLotExpenses > 0.01 && (
                                        <div className="flex justify-between items-center text-[9px] text-gray-500">
                                            <span className="uppercase tracking-widest text-gray-400">↳ Packing & Loading</span>
                                            <span>₹{Math.round(totalLotExpenses).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {totalArrivalExpenseShare > 0.01 && (
                                        <div className="flex justify-between items-center text-[9px] text-gray-500">
                                            <span className="uppercase tracking-widest text-gray-400">↳ Other Cut</span>
                                            <span>₹{Math.round(totalArrivalExpenseShare).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {tripExpenses > 0.01 && (
                                        <div className="flex justify-between items-center text-[9px] text-gray-500">
                                            <span className="uppercase tracking-widest text-gray-400">↳ Transport/Mandi Exp</span>
                                            <span>₹{Math.round(tripExpenses).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : null}

                        {/* Paid Amount (Combined) */}
                        {combinedPaid > 0 && (
                            <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-1">
                                <span className="text-emerald-600 font-bold uppercase tracking-widest">Amount Paid</span>
                                <span className="font-bold text-emerald-600">
                                    − ₹{Math.round(combinedPaid).toLocaleString()}
                                </span>
                            </div>
                        )}

                        {/* ── FINAL PAYABLE ── */}
                        <div className="flex justify-between items-center pt-3 border-t-[3px] border-black mt-4 bg-slate-50 px-2 py-2 rounded-lg">
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">
                                Total Payable
                            </span>
                            <span className="text-3xl font-black tracking-tighter tabular-nums text-black">
                                ₹{Math.round(finalPayable).toLocaleString()}
                            </span>
                        </div>

                        {/* Amount in Words */}
                        <div className="text-right mt-3">
                            <p className="text-xs font-black text-slate-900 italic uppercase leading-tight">
                                Rupees {toWords(Math.round(finalPayable))} Only
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ───── Footer ───── */}
            <div className="mt-12 pt-6 border-t border-black grid grid-cols-2 relative z-10">
                <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                    <p>Farmer / Supplier Signature</p>
                    <div className="mt-6 h-px w-32 bg-gray-200" />
                </div>
                <div className="text-right text-[10px] font-black text-gray-400 flex flex-col items-end gap-1 uppercase tracking-widest">
                    <span>{branding?.document_footer_presented_by_text || 'Presented by MandiGrow'}</span>
                    <span className="text-gray-900 border-t border-gray-100 mt-1 pt-1">
                        {branding?.document_footer_powered_by_text || 'Powered by MindT Corporation'}
                    </span>
                    <span className="text-[8px] font-bold text-gray-300 italic">
                        {branding?.document_footer_developed_by_text || 'Developed by MindT Solutions'}
                    </span>
                </div>
            </div>

            <style jsx>{`
                @media print {
                    @page { margin: 0; }
                    body { background: white; }
                    #purchase-invoice-print { width: 100%; max-width: none; border: none; shadow: none; }
                    .no-print { display: none !important; }
                }
            `}</style>
        </div>
    )
}
