"use client";

import { Share2, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { useState } from 'react';
import { useLanguage } from '@/components/i18n/language-provider';

export default function ShareInvoiceWhatsApp({ sale, organization }: { sale: any, organization?: any }) {
    const auth = useAuth?.();
    const profile = auth?.profile;
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);

    const org = organization || profile?.organization || { name: "Mandi Organization", city: "Main Market Yard" };
    const displayBillNo = sale.contact_bill_no || sale.bill_no;
    const filename = `Invoice-${displayBillNo}.pdf`;
    const amount = Number(sale.total_amount_inc_tax || sale.total_amount || 0).toLocaleString();
    const shareTitle = `Invoice #${displayBillNo}`;
    const shareText = `Invoice #${displayBillNo} - Rs.${amount} from ${org.name}`;

    const generatePDF = async () => {
        const { generateInvoicePDF } = await import('@/lib/generate-invoice-pdf');
        
        let fullSale = sale;
        if (!sale.sale_items && !sale.items && sale.id) {
            const { callApi } = await import('@/lib/frappeClient');
            const saleData: any = await callApi('mandigrow.api.get_sales_invoice_detail', { sale_id: sale.id });
            if (saleData) {
                fullSale = {
                    ...saleData,
                    contact: {
                        name: saleData.buyer_name,
                        city: saleData.buyer_city,
                        gstin: saleData.buyer_gstin
                    },
                    sale_items: saleData.items,
                    payment_summary: {
                        amount_paid: saleData.amount_received,
                        amount_received: saleData.amount_received,
                        balance_due: saleData.balance_due,
                        status: saleData.payment_status
                    }
                };
            }
        }
        
        return generateInvoicePDF(fullSale, org);
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (isLoading) return;
        setIsLoading(true);
        try {
            const blob = await generatePDF();
            const { shareBlob } = await import('@/lib/capacitor-share');
            await shareBlob(blob, filename, { title: shareTitle, text: shareText });
        } catch (err: any) {
            if (err?.name === 'AbortError') return;
            alert(`Failed: ${err?.message || err}`);
        } finally { setIsLoading(false); }
    };

    return (
        <div onClick={handleShare} className="flex items-center w-full cursor-pointer hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors group">
            {isLoading
                ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-emerald-600" />
                : <Share2 className="w-4 h-4 mr-2 text-emerald-600 group-hover:scale-110 transition-transform" />}
            <span className="text-sm font-bold text-slate-700">
                {isLoading ? 'Generating...' : t('common.share')}
            </span>
        </div>
    );
}
