"use client";

import { supabase } from '@/lib/supabaseClient'; // No-op stub — all calls return null
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Loader2, Share2 } from 'lucide-react';

interface SmartShareFinanceButtonProps {
    orgId: string;
    filterType: string;
    subFilter: string;
    organizationName: string;
    branding?: any;
    searchQuery?: string;
}

export default function SmartShareFinanceButton({
    orgId,
    filterType,
    subFilter,
    organizationName,
    branding,
    searchQuery
}: SmartShareFinanceButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const label = filterType === 'all' ? 'All_Parties' :
        filterType.charAt(0).toUpperCase() + filterType.slice(1) + 's';
    const filename = `${label}_Balances_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.pdf`;
    const shareTitle = `Financial Summary - ${organizationName}`;
    const shareText = `*Financial Summary from ${organizationName}*\nType: ${filterType.toUpperCase()}\nDate: ${new Date().toLocaleDateString('en-IN')}`;

    const fetchAndGenerate = async () => {
        let query = supabase
            .schema('mandi')
            .from('view_party_balances')
            .select('*')
            .eq('organization_id', orgId);

        if (filterType !== 'all') query = query.eq('contact_type', filterType);
        if (subFilter === 'receivable') query = query.gt('net_balance', 0);
        else if (subFilter === 'payable') query = query.lt('net_balance', 0);
        if (searchQuery) query = query.or(`contact_name.ilike.%${searchQuery}%,contact_city.ilike.%${searchQuery}%`);

        const { data, error } = await query;
        if (error) throw error;
        if (!data || data.length === 0) throw new Error("No data available for this report.");

        const { generateFinancePDF } = await import('@/lib/generate-finance-pdf');
        return generateFinancePDF(data, filterType, subFilter, organizationName, branding);
    };

    const handleShare = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const blob = await fetchAndGenerate();
            const { shareBlob } = await import('@/lib/capacitor-share');
            await shareBlob(blob, filename, { title: shareTitle, text: shareText });
        } catch (err: any) {
            if (err?.name === 'AbortError') return;
            console.error('[SmartShareFinance] share failed:', err);
            alert(`Failed: ${err?.message || err}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleShare}
            disabled={isLoading || !orgId}
            className="bg-white border border-emerald-100 hover:bg-emerald-50 text-[#0C831F] font-bold gap-2 min-w-[140px] shadow-sm rounded-xl transition-all active:scale-95"
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            {isLoading ? 'Generating...' : 'Share Report'}
        </Button>
    );
}
