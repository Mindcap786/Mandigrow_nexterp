"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Share2 } from "lucide-react";
import { callApi } from "@/lib/frappeClient";
import { useAuth } from "@/components/auth/auth-provider";
import { usePlatformBranding } from "@/hooks/use-platform-branding";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/accounting-logic";

interface QuickShareLedgerButtonProps {
    contactId: string;
    contactName: string;
    contactType?: string;
}

export function QuickShareLedgerButton({ contactId, contactName, contactType }: QuickShareLedgerButtonProps) {
    const [isSharing, setIsSharing] = useState(false);
    const { profile } = useAuth();
    const { branding } = usePlatformBranding();

    const formatLedgerDesc = (tx: any) => {
        const vNo = tx.voucher_no || tx.reference_no || '-';
        const vType = (tx.voucher_type || '').toUpperCase();
        
        if (tx.products && Array.isArray(tx.products) && tx.products.length > 0) {
            const validProducts = tx.products.filter((p: any) => p.name);
            if (validProducts.length > 0) {
                const totalQty = validProducts.reduce((sum: number, p: any) => sum + Number(p.qty || 0), 0);
                const mainUnit = validProducts[0]?.unit || 'Kg';
                const detailStr = validProducts.map((p: any) => {
                    const lotStr = p.lot_no ? ` [Lot: ${p.lot_no}]` : '';
                    return `${p.name}${lotStr}: ${p.qty} ${p.unit || ''} @ ₹${p.rate}`;
                }).join(', ');
                const prefix = vType === 'SALE' ? 'Invoice' : (vType === 'PURCHASE' ? 'Purchase Bill' : vType);
                return `${prefix} #${vNo} (${detailStr}) | Total Qty: ${totalQty} ${mainUnit}`;
            }
        }
        const rawDesc = (tx.narration || tx.description || tx.particulars || '').trim();
        let desc = rawDesc.replace(/(\d+)\.0+(?=\s|[A-Za-z]|$)/g, '$1');
        if (desc && !desc.match(/^[0-9a-fA-F-]{36}$/)) {
            return desc;
        }
        return vType ? `${vType} #${vNo}` : 'Transaction';
    };

    const buildPDFEntries = (transactions: any[], openingBalance: number) => {
        let runningBal = openingBalance;
        return (transactions || []).map(tx => {
            const debit = Number(tx.debit || 0);
            const credit = Number(tx.credit || 0);
            runningBal = Number(tx.running_balance ?? (runningBal + (debit - credit)));
            
            let resolvedProducts: any[] = [];
            if (Array.isArray(tx.products)) {
                resolvedProducts = tx.products.map((p: any) => ({
                    name: p.name || '',
                    qty: Number(p.qty || 0),
                    unit: p.unit || '',
                    rate: Number(p.rate || 0),
                    amount: Number(p.amount || 0)
                }));
            }
            
            return {
                entry_date: tx.date || tx.created_at || tx.entry_date,
                description: formatLedgerDesc(tx),
                debit,
                credit,
                running_balance: runningBal,
                line_items: tx.line_items || '',
                products: resolvedProducts,
                charges: tx.charges || []
            };
        });
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSharing) return;
        setIsSharing(true);
        try {
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            const dateRange = {
                from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of month
                to: endOfDay
            };

            const rpcData = await callApi('mandigrow.api.get_ledger_statement', {
                contact_id: contactId,
                from_date: format(dateRange.from, 'yyyy-MM-dd'),
                to_date: format(dateRange.to, 'yyyy-MM-dd')
            });

            if (!rpcData || !rpcData.transactions) {
                throw new Error("No transactions found for this party.");
            }

            const { pdf } = await import('@react-pdf/renderer');
            const { LedgerPDFReport } = await import('./ledger-pdf-report');
            const React = await import('react');
            
            const openingBalance = rpcData.opening_balance || 0;
            const entries = buildPDFEntries(rpcData.transactions, openingBalance);
            
            const doc = React.createElement(LedgerPDFReport, {
                organization: profile?.organization,
                contactName: contactName || 'Statement',
                startDate: dateRange.from,
                endDate: dateRange.to,
                openingBalance: openingBalance,
                entries,
                summary: {
                    totalDebit: (rpcData.transactions || []).reduce((s: number, tx: any) => s + Number(tx.debit || 0), 0),
                    totalCredit: (rpcData.transactions || []).reduce((s: number, tx: any) => s + Number(tx.credit || 0), 0),
                    finalBalance: rpcData.closing_balance || 0,
                },
                branding,
            });

            const blob = await pdf(doc as any).toBlob();
            const filename = `Statement-${contactName}-${format(dateRange.from, 'ddMMMyy')}.pdf`;
            const shareTitle = `Statement for ${contactName}`;
            const shareText = `*Statement of Account*\nContact: ${contactName}\nPeriod: ${format(dateRange.from, 'dd-MM-yyyy')} to ${format(dateRange.to, 'dd-MM-yyyy')}\nBalance: ${formatCurrency(rpcData.closing_balance || 0)}\n\nPlease find the attached statement PDF.`;
            
            const { shareBlob } = await import('@/lib/capacitor-share');
            await shareBlob(blob, filename, { title: shareTitle, text: shareText });

        } catch (error: any) {
            if (error?.name !== 'AbortError') {
                console.error('[QuickShareLedger]', error);
                alert(`Failed to share: ${error?.message || error}`);
            }
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <Button
            onClick={handleShare}
            size="sm" variant="ghost" 
            className="w-9 h-9 p-0 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100"
        >
            {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
        </Button>
    );
}
