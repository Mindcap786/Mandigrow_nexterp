"use client";

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Loader2, Share2 } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '@/components/i18n/language-provider';

export default function SmartShareButton({ sale, organization }: { sale: any, organization?: any }) {
    const auth = useAuth?.();
    const profile = auth?.profile;
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);

    const org = organization || profile?.organization || {
        name: "Mandi Organization",
        city: "Main Market Yard"
    };

    const billNo = sale.contact_bill_no || sale.bill_no;
    const filename = `Invoice-${billNo}.pdf`;
    const amount = Number(sale.total_amount_inc_tax || sale.total_amount || 0).toLocaleString();
    const shareTitle = `Invoice #${billNo}`;
    const shareText = `Invoice #${billNo} - Rs.${amount} from ${org.name}`;

    const generatePDF = async () => {
        const { generateInvoicePDF } = await import('@/lib/generate-invoice-pdf');
        return generateInvoicePDF(sale, org);
    };

    const handleShare = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const blob = await generatePDF();
            const { shareBlob } = await import('@/lib/capacitor-share');
            await shareBlob(blob, filename, { title: shareTitle, text: shareText });
        } catch (err: any) {
            if (err?.name === 'AbortError') return;
            console.error('[SmartShare] share failed:', err);
            alert(`Failed: ${err?.message || err}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleShare}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold h-10 shadow-sm"
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            {isLoading ? t('common.loading') : t('common.share')}
        </Button>
    );
}
