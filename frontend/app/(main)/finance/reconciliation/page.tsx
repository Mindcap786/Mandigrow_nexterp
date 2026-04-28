"use client";
import { NativePageWrapper } from "@/components/mobile/NativePageWrapper";
import { useState, useEffect, useCallback } from "react";
import { callApi } from "@/lib/frappeClient";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
import {
    Loader2, CheckCircle2, RefreshCw,
    Search, X, CreditCard,
    Landmark, Calendar, ArrowUpRight, ArrowDownLeft, Zap, User, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cacheGet, cacheSet, cacheIsStale } from "@/lib/data-cache";

type ChequeRecord = {
    id: string;
    voucher_no: string;
    posting_date: string;
    cheque_no: string;
    cheque_date: string;
    clearance_date?: string;
    cheque_status: "Pending" | "Cleared" | "Cancelled";
    narration: string;
    amount: number;
    party_id: string;
    party_name: string;
    voucher_type: "payment" | "receipt"; // payment = supplier, receipt = buyer
    against_voucher_type: string;
    against_voucher: string;
};

type SummaryData = {
    total: number;
    total_pending: number;
    total_cleared: number;
    total_cancelled: number;
    pending_amount: number;
    cleared_amount: number;
};

export default function ChequeManagementPage() {
    const { profile } = useAuth();
    const { toast } = useToast();

    const [cheques, setCheques] = useState<ChequeRecord[]>([]);
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(false);
    const [chequeFilter, setChequeFilter] = useState<"Pending" | "Cleared" | "Cancelled" | "All">("All");
    const [startDate, setStartDate] = useState<string>(format(addDays(new Date(), -30), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState<string>(format(addDays(new Date(), 90), 'yyyy-MM-dd'));
    const [searchQuery, setSearchQuery] = useState("");
    const [clearingId, setClearingId] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [chequeToCancel, setChequeToCancel] = useState<ChequeRecord | null>(null);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
    const [chequeToClear, setChequeToClear] = useState<ChequeRecord | null>(null);
    const [clearanceDate, setClearanceDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

    const orgId = profile?.organization_id;
    const cacheKey = `cheques_${chequeFilter}_${startDate}_${endDate}`;

    const fetchCheques = useCallback(async (silent = false) => {
        if (!orgId) return;
        // Show spinner only if no cached data visible
        if (!silent) setLoading(true);
        try {
            const result = await callApi("mandigrow.api.get_reconciliation_data", {
                date_from: startDate,
                date_to: endDate,
                status_filter: chequeFilter,
            });
            const data = result?.cheques || [];
            const summaryData = result?.summary || null;
            setCheques(data);
            setSummary(summaryData);
            if (orgId) cacheSet(cacheKey, orgId, { cheques: data, summary: summaryData });
        } catch (err: any) {
            toast({ title: "Failed to load cheques", description: err?.message || "Unknown error", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [orgId, chequeFilter, startDate, endDate, cacheKey]);

    // Instant load from cache, then revalidate
    useEffect(() => {
        if (!orgId) return;
        const cached = cacheGet<{ cheques: ChequeRecord[]; summary: SummaryData }>(cacheKey, orgId);
        if (cached) {
            setCheques(cached.cheques);
            setSummary(cached.summary);
            // Revalidate silently in background if stale
            if (cacheIsStale(cacheKey, orgId)) fetchCheques(true);
        } else {
            fetchCheques(false);
        }
    }, [orgId, chequeFilter, startDate, endDate]);

    const openClearDialog = (cheque: ChequeRecord) => {
        setChequeToClear(cheque);
        setClearanceDate(format(new Date(), 'yyyy-MM-dd'));
        setIsClearDialogOpen(true);
    };

    const handleClearCheque = async () => {
        if (!chequeToClear) return;
        setClearingId(chequeToClear.id);
        try {
            await callApi("mandigrow.api.mark_cheque_cleared", {
                voucher_no: chequeToClear.voucher_no,
                clearance_date: clearanceDate,
            });
            toast({ title: "Cheque Cleared!", description: `Cheque #${chequeToClear.cheque_no} marked as cleared on ${format(new Date(clearanceDate), "dd MMM yyyy")}.` });
            await fetchCheques(true);
            setIsClearDialogOpen(false);
        } catch (err: any) {
            toast({ title: "Clearing Failed", description: err?.message || "Unknown error", variant: "destructive" });
        } finally {
            setClearingId(null);
            setTimeout(() => setChequeToClear(null), 300);
        }
    };

    const openCancelDialog = (cheque: ChequeRecord) => {
        setChequeToCancel(cheque);
        setIsCancelDialogOpen(true);
    };

    const handleCancelCheque = async () => {
        if (!chequeToCancel) return;
        setCancellingId(chequeToCancel.id);
        try {
            const result = await callApi("mandigrow.api.cancel_cheque_voucher", {
                voucher_no: chequeToCancel.voucher_no,
            });
            toast({ title: "Cheque Cancelled", description: result?.message || `Cheque #${chequeToCancel.cheque_no} has been voided.` });
            await fetchCheques(true);
        } catch (err: any) {
            toast({ title: "Cancellation Failed", description: err?.message || "Unknown error", variant: "destructive" });
            throw err; // Prevent dialog auto-close
        } finally {
            setCancellingId(null);
            setTimeout(() => setChequeToCancel(null), 300);
        }
    };

    const filtered = cheques.filter(c => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (c.party_name || "").toLowerCase().includes(q) ||
            (c.narration || "").toLowerCase().includes(q) ||
            (c.cheque_no || "").toLowerCase().includes(q) ||
            (c.voucher_no || "").toLowerCase().includes(q)
        );
    });

    const pendingCount   = summary?.total_pending  ?? cheques.filter(c => c.cheque_status === "Pending").length;
    const clearedCount   = summary?.total_cleared  ?? cheques.filter(c => c.cheque_status === "Cleared").length;
    const cancelledCount = summary?.total_cancelled ?? cheques.filter(c => c.cheque_status === "Cancelled").length;
    const pendingAmount  = summary?.pending_amount  ?? cheques.filter(c => c.cheque_status === "Pending").reduce((s, c) => s + c.amount, 0);

    return (
        <div className="min-h-screen bg-[#F0F2F5] pb-20 font-sans">
            {/* ── Header ── */}
            <div className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-[1000] text-slate-800 tracking-tighter uppercase leading-none">Cheque Clearing</h1>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">All Sources — Arrivals · Sales · POS · Quick Purchase</p>
                        </div>
                    </div>
                    <button
                        onClick={() => fetchCheques(false)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-black text-[10px] uppercase tracking-widest border border-indigo-200 hover:bg-indigo-100 transition-all"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* ── Summary Cards ── */}
                {summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: "Pending", count: pendingCount, amount: summary.pending_amount, color: "amber" },
                            { label: "Cleared", count: clearedCount, amount: summary.cleared_amount, color: "emerald" },
                            { label: "Cancelled", count: cancelledCount, amount: 0, color: "rose" },
                            { label: "Total", count: summary.total, amount: summary.pending_amount + summary.cleared_amount, color: "indigo" },
                        ].map(card => (
                            <div key={card.label} className={cn(
                                "bg-white rounded-2xl p-4 border shadow-sm",
                                card.color === "amber" && "border-amber-100",
                                card.color === "emerald" && "border-emerald-100",
                                card.color === "rose" && "border-rose-100",
                                card.color === "indigo" && "border-indigo-100",
                            )}>
                                <p className={cn("text-[9px] font-black uppercase tracking-widest mb-1",
                                    card.color === "amber" && "text-amber-500",
                                    card.color === "emerald" && "text-emerald-500",
                                    card.color === "rose" && "text-rose-500",
                                    card.color === "indigo" && "text-indigo-500",
                                )}>{card.label}</p>
                                <p className="text-2xl font-[1000] text-slate-800 tracking-tighter">{card.count}</p>
                                {card.amount > 0 && (
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">₹{card.amount.toLocaleString()}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Controls ── */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white/50 p-2 rounded-3xl border border-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3 flex-wrap flex-1">
                        {/* Status filter tabs */}
                        <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
                            {(["Pending", "Cleared", "Cancelled", "All"] as const).map(status => (
                                <button
                                    key={status}
                                    onClick={() => setChequeFilter(status)}
                                    className={cn(
                                        "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                        chequeFilter === status
                                            ? "bg-slate-900 text-white shadow-lg scale-105"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-white"
                                    )}
                                >
                                    {status}
                                    {status === "Pending" && pendingCount > 0 && (
                                        <span className="ml-1.5 bg-amber-500 text-white text-[8px] rounded-full px-1.5 py-0.5">{pendingCount}</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex-1 min-w-[180px] max-w-sm focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                            <Search className="w-4 h-4 text-slate-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search name, cheque no, voucher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 p-0 w-full placeholder:text-slate-300"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="text-slate-300 hover:text-slate-600 transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Period</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-xs font-bold text-slate-700 bg-transparent border-none focus:ring-0 p-0 w-24"
                        />
                        <span className="text-slate-300">—</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-xs font-bold text-slate-700 bg-transparent border-none focus:ring-0 p-0 w-24"
                        />
                    </div>
                </div>

                {/* ── Cheque List ── */}
                {loading ? (
                    <div className="py-32 flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                        <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] animate-pulse">Loading Cheques...</p>
                    </div>
                ) : cheques.length === 0 ? (
                    <div className="p-24 text-center bg-white rounded-[40px] border border-slate-200 shadow-sm">
                        <div className="w-20 h-20 rounded-[28px] bg-emerald-50 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100/50">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <p className="font-black text-slate-800 text-2xl tracking-tighter mb-2 uppercase">All Clear!</p>
                        <p className="text-slate-400 font-bold text-sm">
                            No {chequeFilter === "All" ? "" : chequeFilter.toLowerCase()} cheques found in this period.
                        </p>
                        <p className="text-slate-300 font-bold text-xs mt-2">Try expanding the date range or changing the status filter.</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center">
                        <Search className="w-8 h-8 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">No cheques match your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map((cheque) => (
                            <div
                                key={cheque.id}
                                className={cn(
                                    "relative group bg-white p-5 rounded-[28px] border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden flex flex-col",
                                    cheque.voucher_type === "payment"
                                        ? "ring-1 ring-inset ring-rose-100/50 hover:border-rose-200"
                                        : "ring-1 ring-inset ring-emerald-100/50 hover:border-emerald-200"
                                )}
                            >
                                {/* Accent blob */}
                                <div className={cn(
                                    "absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-[0.03] transition-transform duration-700 group-hover:scale-150",
                                    cheque.voucher_type === "payment" ? "bg-rose-600" : "bg-emerald-600"
                                )} />

                                {/* Status + Direction row */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className={cn(
                                        "px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-[0.1em] flex items-center gap-1.5",
                                        cheque.cheque_status === "Pending"
                                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                                            : cheque.cheque_status === "Cancelled"
                                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                                            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    )}>
                                        <div className={cn("w-1.5 h-1.5 rounded-full",
                                            cheque.cheque_status === "Pending" ? "bg-amber-600 animate-pulse" :
                                            cheque.cheque_status === "Cancelled" ? "bg-rose-600" : "bg-emerald-600"
                                        )} />
                                        {cheque.cheque_status}
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider",
                                        cheque.voucher_type === "payment" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                                    )}>
                                        {cheque.voucher_type === "payment"
                                            ? <ArrowUpRight className="w-2.5 h-2.5" />
                                            : <ArrowDownLeft className="w-2.5 h-2.5" />
                                        }
                                        {cheque.voucher_type === "payment" ? "Issued" : "Received"}
                                    </div>
                                </div>

                                {/* Amount + Voucher */}
                                <div className="flex items-end justify-between mb-5">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Amount</p>
                                        <p className="font-[1000] text-slate-900 text-2xl tracking-tighter">
                                            ₹{(cheque.amount || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Voucher</p>
                                        <p className="font-bold text-slate-800 text-xs">{cheque.voucher_no}</p>
                                    </div>
                                </div>

                                {/* Details card */}
                                <div className="bg-slate-50/80 rounded-2xl border border-slate-100 p-3 mb-5 space-y-3 group-hover:bg-white transition-colors flex-grow">
                                    {/* Party */}
                                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                        <div>
                                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Party</span>
                                            <span className={cn("font-black text-xs truncate max-w-[140px] block",
                                                cheque.voucher_type === "payment" ? "text-rose-600" : "text-emerald-600"
                                            )}>
                                                {cheque.party_name || "General"}
                                            </span>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                            <User className="w-3 h-3 text-slate-400" />
                                        </div>
                                    </div>

                                    {/* Cheque No + Date */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Cheque No</span>
                                            <span className="font-mono font-black text-slate-800 text-xs">{cheque.cheque_no || "N/A"}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Cheque Date</span>
                                            <span className="font-black text-slate-800 text-xs">
                                                {cheque.cheque_date
                                                    ? format(new Date(cheque.cheque_date), "dd MMM yy")
                                                    : "N/A"
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {/* Cleared date (if cleared) */}
                                    {cheque.clearance_date && (
                                        <div>
                                            <span className="block text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Cleared On</span>
                                            <span className="font-black text-emerald-700 text-xs">
                                                {format(new Date(cheque.clearance_date), "dd MMM yyyy")}
                                            </span>
                                        </div>
                                    )}

                                    {/* Source */}
                                    {cheque.against_voucher_type && (
                                        <div className="pt-1">
                                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Source</span>
                                            <span className="font-bold text-slate-500 text-[10px] uppercase italic truncate block">
                                                {cheque.against_voucher_type.replace("Mandi ", "")}
                                                {cheque.against_voucher ? ` · ${cheque.against_voucher}` : ""}
                                            </span>
                                        </div>
                                    )}

                                    {/* Narration */}
                                    {cheque.narration && (
                                        <div className="pt-1 border-t border-slate-200/60">
                                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Note</span>
                                            <span className="font-bold text-slate-500 text-[9px] line-clamp-2">{cheque.narration}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="mt-auto">
                                    {cheque.cheque_status === "Pending" ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openClearDialog(cheque)}
                                                disabled={!!clearingId || !!cancellingId}
                                                className={cn(
                                                    "flex-1 h-10 font-[900] text-[10px] uppercase tracking-[0.1em] rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-1.5",
                                                    cheque.voucher_type === "payment"
                                                        ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200"
                                                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200",
                                                    (clearingId || cancellingId) && "opacity-60 cursor-not-allowed"
                                                )}
                                            >
                                                {clearingId === cheque.id
                                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                                    : <><Zap className="w-3.5 h-3.5" /><span>Mark Cleared</span></>
                                                }
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => openCancelDialog(cheque)}
                                                disabled={!!clearingId || !!cancellingId}
                                                className={cn(
                                                    "px-4 h-10 border-2 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 flex items-center justify-center",
                                                    cancellingId === cheque.id && "animate-pulse"
                                                )}
                                            >
                                                {cancellingId === cheque.id
                                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                                    : "Cancel"
                                                }
                                            </button>
                                        </div>
                                    ) : cheque.cheque_status === "Cancelled" ? (
                                        <div className="w-full h-10 bg-rose-50 text-rose-600 font-[900] text-[10px] uppercase tracking-[0.1em] rounded-xl flex items-center justify-center gap-1.5 border border-rose-100/50 italic pointer-events-none">
                                            <X className="w-3.5 h-3.5" />
                                            Cheque Voided
                                        </div>
                                    ) : (
                                        <div className="w-full h-10 bg-emerald-50 text-emerald-600 font-[900] text-[10px] uppercase tracking-[0.1em] rounded-xl flex items-center justify-center gap-1.5 border border-emerald-100/50 italic pointer-events-none">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Settled · {cheque.clearance_date ? format(new Date(cheque.clearance_date), "dd MMM") : "Cleared"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cancel Confirmation Dialog */}
            <ConfirmationDialog
                open={isCancelDialogOpen}
                onOpenChange={setIsCancelDialogOpen}
                title={`Cancel Cheque #${chequeToCancel?.cheque_no || "N/A"}?`}
                description={`This will cancel the Journal Entry (${chequeToCancel?.voucher_no}), reversing all GL entries. The linked invoice or arrival will revert to PENDING. This action cannot be undone.`}
                onConfirm={handleCancelCheque}
                confirmText="Yes, Cancel Payment"
                cancelText="Keep It"
                variant="destructive"
            />

            {/* Clearance Date Selection Dialog */}
            <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white border-slate-200 text-slate-900 shadow-2xl rounded-2xl overflow-hidden p-0">
                    <div className="p-6">
                        <DialogHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <DialogTitle className="text-xl font-black tracking-tight">Set Clearance Date</DialogTitle>
                            </div>
                            <DialogDescription className="text-slate-500 font-medium leading-relaxed">
                                Enter the date when Cheque #{chequeToClear?.cheque_no || "N/A"} was cleared in the bank.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-6">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Clearance Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    value={clearanceDate}
                                    onChange={(e) => setClearanceDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="bg-slate-50 p-6 pt-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            onClick={() => setIsClearDialogOpen(false)}
                            disabled={!!clearingId}
                            className="font-bold text-slate-500 hover:bg-white flex-1 sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleClearCheque}
                            disabled={!!clearingId || !clearanceDate}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl h-11 px-8 flex-1 sm:flex-none shadow-lg transition-all active:scale-95"
                        >
                            {clearingId === chequeToClear?.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Mark Cleared
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
