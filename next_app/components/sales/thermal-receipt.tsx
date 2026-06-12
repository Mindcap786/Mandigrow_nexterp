"use client"

import { format } from "date-fns"
import { QRCodeSVG } from "qrcode.react"
import { usePlatformBranding } from "@/hooks/use-platform-branding"

interface ThermalReceiptProps {
    sale: any
    organization: any
}

export default function ThermalReceipt({ sale, organization }: ThermalReceiptProps) {
    const { branding } = usePlatformBranding();

    if (!sale) return null;

    const orgName = organization?.name || 'Store';
    const items = sale.sale_items || [];
    
    // Calculate totals
    const subtotal = sale.total_amount || items.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
    const totalGst = (Number(sale.cgst_amount || sale.cgst || 0) + Number(sale.sgst_amount || sale.sgst || 0) + Number(sale.igst_amount || sale.igst || 0)) || Number(sale.gst_total || 0);
    const gstEnabled = totalGst > 0 || organization?.settings?.gst_enabled === true;
    
    const isInclusive = items.some((i: any) => i.sale_gst_type?.toLowerCase() === 'inclusive' || i.gst_inclusive);
    const gstToAdd = sale.exclusive_gst_total !== undefined 
        ? Number(sale.exclusive_gst_total) 
        : (isInclusive ? 0 : totalGst);

    const grandTotal = Number(
        sale.total_amount_inc_tax || sale.grand_total ||
        (
            subtotal +
            Number(sale.market_fee || 0) +
            Number(sale.misc_fee || 0) +
            gstToAdd -
            Number(sale.discount_amount || 0)
        )
    );

    const amountReceived = Math.max(
        Number(sale.amount_received || 0),
        Number(sale.paid_amount || 0),
        Number(sale.payment_summary?.amount_received || 0)
    );

    const balanceDue = grandTotal - amountReceived;
    const paymentMode = sale.payment_mode || (amountReceived > 0 ? 'Cash/Digital' : 'Credit');
    const billNo = sale.contact_bill_no || sale.bill_no || sale.id || 'N/A';

    return (
        <div className="bg-white text-black font-mono text-[12px] leading-tight w-full mx-auto" style={{ maxWidth: '400px' }}>
            <div className="text-center mb-4">
                <h1 className="font-bold text-lg leading-tight uppercase">{orgName}</h1>
                <p className="text-[10px] uppercase mt-1 tracking-widest">Tax Invoice / Bill</p>
            </div>
            
            <div className="mb-4 border-b border-dashed border-black pb-2 text-[11px]">
                <div className="flex justify-between"><span>Bill No:</span> <span className="font-bold">{billNo}</span></div>
                <div className="flex justify-between mt-1"><span>Date:</span> <span>{sale.transaction_date ? format(new Date(sale.transaction_date), 'dd MMM yyyy') : format(new Date(), 'dd MMM yyyy')}</span></div>
                {sale.buyer?.name && <div className="flex justify-between mt-1 pt-1 border-t border-dotted border-black"><span>Buyer:</span> <span className="font-bold uppercase text-right leading-tight max-w-[150px]">{sale.buyer.name}</span></div>}
                <div className="flex justify-between mt-1"><span>Mode:</span> <span className="uppercase font-bold">{paymentMode}</span></div>
            </div>
            
            <table className="w-full text-left mb-4 text-[11px]">
                <thead>
                    <tr className="border-b border-dashed border-black">
                        <th className="pb-1 font-semibold w-1/2">Item</th>
                        <th className="pb-1 font-semibold text-right w-[15%]">Qty</th>
                        <th className="pb-1 font-semibold text-right w-[15%]">Rate</th>
                        <th className="pb-1 font-semibold text-right w-[20%]">Amt</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((c: any, i: number) => {
                        const itemName = c.item_name || c.lot?.item?.name || 'Item';
                        const qty = Number(c.qty || 0);
                        const rate = Number(c.rate || 0);
                        const amt = Number(c.amount || (qty * rate));
                        return (
                            <tr key={i}>
                                <td className="py-2 pr-1 font-semibold">
                                    <div className="uppercase font-bold">{itemName} {c.lot?.item?.grade && c.lot?.item?.grade !== 'A' && <span className="ml-1">[{c.lot.item.grade}]</span>}</div>
                                </td>
                                <td className="py-2 text-right align-top">{qty}</td>
                                <td className="py-2 text-right align-top">{rate}</td>
                                <td className="py-2 text-right align-top font-bold">{amt}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            
            <div className="border-t border-dashed border-black pt-2 mb-4 space-y-1 text-[12px]">
                <div className="flex justify-between"><span>Subtotal</span> <span>{subtotal.toFixed(2)}</span></div>
                {totalGst > 0 && <div className="flex justify-between"><span>Tax</span> <span>{totalGst.toFixed(2)}</span></div>}
                {Number(sale.market_fee || 0) > 0 && <div className="flex justify-between"><span>Market Fee</span> <span>{(Number(sale.market_fee)).toFixed(2)}</span></div>}
                {Number(sale.discount_amount || 0) > 0 && <div className="flex justify-between text-gray-600"><span>Discount</span> <span>-{(Number(sale.discount_amount)).toFixed(2)}</span></div>}
                
                <div className="flex justify-between font-black text-[14px] border-y border-dashed border-black py-2 mt-2">
                    <span>TOTAL:</span> <span>Rs. {grandTotal.toFixed(2)}</span>
                </div>
                {amountReceived > 0 && amountReceived !== grandTotal && (
                    <div className="flex justify-between font-semibold mt-1">
                        <span>Amt Received:</span> <span>Rs. {amountReceived.toFixed(2)}</span>
                    </div>
                )}
                {amountReceived < grandTotal && paymentMode !== 'credit' && (
                    <div className="flex justify-between font-bold mt-1">
                        <span>Balance (Udhaar):</span> <span>Rs. {balanceDue.toFixed(2)}</span>
                    </div>
                )}
                {amountReceived > grandTotal && (
                    <div className="flex justify-between font-bold mt-1">
                        <span>Change Return:</span> <span>Rs. {(amountReceived - grandTotal).toFixed(2)}</span>
                    </div>
                )}
            </div>

            {/* Signature Area */}
            <div className="mt-8 pt-4 border-t border-black text-center text-[10px] uppercase font-bold tracking-widest">
                Thank you for your business
            </div>
            {organization?.phone && (
                <div className="text-center text-[8px] font-bold mt-2 italic text-gray-800">
                    {organization.phone}
                </div>
            )}
        </div>
    )
}
