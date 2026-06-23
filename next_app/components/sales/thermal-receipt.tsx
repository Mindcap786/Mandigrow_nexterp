"use client"

import { format } from "date-fns"
import { QRCodeSVG } from "qrcode.react"
import { usePlatformBranding } from "@/hooks/use-platform-branding"
import { t } from "@/components/local-invoices/translations"
import type { LangCode } from "@/components/local-invoices/utils/fonts"
import { getItemName } from "@/components/local-invoices/translations"

interface ThermalReceiptProps {
    sale: any
    organization: any
    lang?: string | null
    itemTranslations?: Record<string, string>
    partyTranslation?: string | null
}

export default function ThermalReceipt({ sale, organization, lang, itemTranslations, partyTranslation }: ThermalReceiptProps) {
    const { branding } = usePlatformBranding();

    if (!sale) return null;

    const orgName = organization?.name || 'Store';
    const items = sale.sale_items || [];
    const activeLang = (lang as LangCode) || 'en';
    
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
            Number(sale.nirashrit_amount || 0) +
            Number(sale.loading_charges || 0) +
            Number(sale.unloading_charges || 0) +
            Number(sale.misc_fee || 0) +
            Number(sale.other_expenses || 0) +
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
        <div className="bg-white text-black font-mono text-[30px] leading-snug w-full font-bold pb-8" style={{ filter: 'grayscale(100%) contrast(1000%)', maxWidth: '100%', padding: '0 8px' }}>
            <div className="text-center mb-2 mt-2">
                <h1 className="font-black text-[45px] leading-tight uppercase">{orgName}</h1>
                <p className="text-[26px] uppercase mt-1 tracking-widest">{t('TAX_INVOICE_BILL' as any, activeLang)}</p>
            </div>
            
            <div className="mb-2 border-y-2 border-dashed border-black py-2 text-[29px]">
                <div className="flex justify-between items-start">
                    <div>{t('BILL_NO' as any, activeLang)}: <span className="font-black">{billNo}</span></div>
                    <div>{t('DATE' as any, activeLang)}: <span className="font-black">{sale.transaction_date ? format(new Date(sale.transaction_date), 'dd MMM yyyy') : format(new Date(), 'dd MMM yyyy')}</span></div>
                </div>
                {(sale.contact?.full_name || sale.contact?.name || sale.buyer_name) && (
                    <div className="flex mt-1">
                        <span className="mr-2 whitespace-nowrap">{t('BUYER' as any, activeLang)}:</span> 
                        <span className="font-black uppercase leading-tight">
                            {t((partyTranslation || sale.contact?.full_name || sale.contact?.name || sale.buyer_name).toUpperCase() as any, activeLang)}
                        </span>
                    </div>
                )}
                <div className="flex mt-1">
                    <span className="mr-2">{t('MODE' as any, activeLang)}:</span> 
                    <span className="uppercase font-black">{t(paymentMode.toUpperCase() as any, activeLang)}</span>
                </div>
            </div>
            
            <table className="w-full text-left mb-2 text-[29px]" style={{ tableLayout: 'fixed' }}>
                <thead>
                    <tr className="border-b-2 border-dashed border-black">
                        <th className="pb-1 font-black w-[45%] overflow-hidden">{t('ITEM' as any, activeLang)}</th>
                        <th className="pb-1 font-black text-right w-[15%] overflow-hidden">{t('QTY' as any, activeLang)}</th>
                        <th className="pb-1 font-black text-right w-[18%] overflow-hidden">{t('RATE' as any, activeLang)}</th>
                        <th className="pb-1 font-black text-right w-[22%] overflow-hidden">{t('AMT' as any, activeLang)}</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((c: any, i: number) => {
                        const rawName = c.lot?.item?.name || c.item_name || 'Item';
                        const itemName = getItemName(rawName, itemTranslations?.[rawName], itemTranslations);
                        const qty = Number(c.qty || 0);
                        const rate = Number(c.rate || 0);
                        const amt = Number(c.amount || (qty * rate));
                        return (
                            <tr key={i}>
                                <td className="py-2 pr-1 font-black break-words align-top">
                                    <div className="uppercase">
                                        {itemName} 
                                        {c.lot?.item?.grade && c.lot?.item?.grade !== 'A' && <span className="ml-1">[{c.lot.item.grade}]</span>}
                                    </div>
                                </td>
                                <td className="py-2 text-right align-top font-bold">{qty}</td>
                                <td className="py-2 text-right align-top font-bold">{rate}</td>
                                <td className="py-2 text-right align-top font-black">{amt}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            
            <div className="border-t-2 border-dashed border-black pt-2 mb-4 space-y-1 text-[30px]">
                <div className="flex justify-between"><span>{t('SUB_TOTAL' as any, activeLang)}</span> <span className="font-black">{subtotal.toFixed(2)}</span></div>
                {totalGst > 0 && <div className="flex justify-between"><span>{t('TAX' as any, activeLang)}</span> <span className="font-black">{totalGst.toFixed(2)}</span></div>}
                
                {Number(sale.market_fee || 0) > 0 && <div className="flex justify-between"><span>{t('MARKET_FEE' as any, activeLang)}</span> <span className="font-black">{(Number(sale.market_fee)).toFixed(2)}</span></div>}
                {Number(sale.nirashrit_amount || sale.nirashrit || 0) > 0 && <div className="flex justify-between"><span>{t('NIRASHRIT' as any, activeLang)}</span> <span className="font-black">{(Number(sale.nirashrit_amount || sale.nirashrit)).toFixed(2)}</span></div>}
                {Number(sale.loading_charges || 0) > 0 && <div className="flex justify-between"><span>{t('LOADING_CHARGES' as any, activeLang)}</span> <span className="font-black">{(Number(sale.loading_charges)).toFixed(2)}</span></div>}
                {Number(sale.unloading_charges || 0) > 0 && <div className="flex justify-between"><span>{t('UNLOADING_CHARGES' as any, activeLang)}</span> <span className="font-black">{(Number(sale.unloading_charges)).toFixed(2)}</span></div>}
                {Number(sale.misc_fee || 0) > 0 && <div className="flex justify-between"><span>{t('MISC_FEE' as any, activeLang)}</span> <span className="font-black">{(Number(sale.misc_fee)).toFixed(2)}</span></div>}
                {Number(sale.other_expenses || 0) > 0 && <div className="flex justify-between"><span>{t('OTHER_EXPENSES' as any, activeLang)}</span> <span className="font-black">{(Number(sale.other_expenses)).toFixed(2)}</span></div>}
                
                {Number(sale.discount_amount || 0) > 0 && <div className="flex justify-between text-gray-800"><span>{t('DISCOUNT' as any, activeLang)}</span> <span className="font-black">-{(Number(sale.discount_amount)).toFixed(2)}</span></div>}
                
                <div className="flex justify-between font-black text-[35px] border-y-2 border-dashed border-black py-2 mt-2">
                    <span>{t('INVOICE_TOTAL' as any, activeLang)}:</span> <span>Rs. {grandTotal.toFixed(2)}</span>
                </div>
                {amountReceived > 0 && (
                    <div className="flex justify-between font-bold mt-1">
                        <span>{t('AMOUNT_RECEIVED' as any, activeLang)}:</span> <span>Rs. {amountReceived.toFixed(2)}</span>
                    </div>
                )}
                {amountReceived < grandTotal && paymentMode !== 'credit' && (
                    <div className="flex justify-between font-black mt-1">
                        <span>{t('PENDING_PAYMENT' as any, activeLang)}:</span> <span>Rs. {balanceDue.toFixed(2)}</span>
                    </div>
                )}
                {amountReceived > grandTotal && (
                    <div className="flex justify-between font-black mt-1">
                        <span>{t('CHANGE_RETURN' as any, activeLang)}:</span> <span>Rs. {(amountReceived - grandTotal).toFixed(2)}</span>
                    </div>
                )}
            </div>

            {/* Signature Area */}
            <div className="mt-6 text-center text-[29px] uppercase font-black tracking-widest pt-2">
                {t('THANK_YOU' as any, activeLang)}
            </div>
            {organization?.phone && (
                <div className="text-center text-[25px] font-bold mt-1 italic">
                    {organization.phone}
                </div>
            )}
        </div>
    )
}

