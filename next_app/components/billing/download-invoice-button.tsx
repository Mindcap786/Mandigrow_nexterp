"use client";

import { useState } from 'react';
import { Loader2, Download } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '@/components/i18n/language-provider';

export default function DownloadInvoiceButton({ sale, organization }: { sale: any, organization?: any }) {
    const auth = useAuth?.();
    const profile = auth?.profile;
    const { t } = useLanguage();
    const [isGenerating, setIsGenerating] = useState(false);

    const org = organization || profile?.organization || {
        name: "Mandi Organization",
        city: "Main Market Yard"
    };

    const displayBillNo = sale.contact_bill_no || sale.bill_no;
    const filename = `Invoice-${displayBillNo}.pdf`;

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isGenerating) return;

        try {
            setIsGenerating(true);
            const { generateInvoicePDF } = await import('@/lib/generate-invoice-pdf');
            const { downloadBlob } = await import('@/lib/capacitor-share');

            let fullSale = sale;
            // If items are missing (e.g. when called from Dashboard summary row), fetch the full detail
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

            const blob = await generateInvoicePDF(fullSale, org);
            await downloadBlob(blob, filename);
        } catch (err: any) {
            console.error('[Download] PDF failed:', err);
            alert(`Failed to generate PDF: ${err?.message || err}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div onClick={handleDownload} className="flex items-center w-full cursor-pointer hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors group">
            {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-600" />
            ) : (
                <Download className="w-4 h-4 mr-2 text-blue-600 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-sm font-bold text-slate-700">
                {isGenerating ? t('common.loading') : t('common.download')}
            </span>
        </div>
    );
}
