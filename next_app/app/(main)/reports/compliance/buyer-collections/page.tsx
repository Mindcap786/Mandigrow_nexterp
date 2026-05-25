"use client";
import { NativePageWrapper } from "@/components/mobile/NativePageWrapper";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { callApi } from "@/lib/frappeClient";
import { Loader2, TrendingUp, RefreshCcw, Wallet, FileText } from "lucide-react";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";

export default function BuyerCollectionsReport() {
    const { profile, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange] = useState({
        from: subDays(new Date(), 30),
        to: new Date(),
    });

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await callApi("mandigrow.api.get_trading_pl", {
                date_from: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
                date_to: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null,
            });
            if (res) {
                setStats(res);
            }
        } catch (error) {
            console.error("Failed to load buyer collections", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchReport();
        }
    }, [authLoading]);

    if (authLoading) {
        return (
            <NativePageWrapper title="Buyer Collections">
                <div className="h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            </NativePageWrapper>
        );
    }

    return (
        <NativePageWrapper title="Buyer Collections">
            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-[1000] text-slate-900 tracking-tight flex items-center gap-3">
                                    <FileText className="w-7 h-7 text-indigo-600" />
                                    Buyer Collections
                                </h1>
                                <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">Pass-through Fees & Collections</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={fetchReport}
                                    disabled={loading}
                                    className="h-10 md:h-10 px-4 bg-white border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[100px]"
                                >
                                    <RefreshCcw className="w-4 h-4" />
                                    <span className="font-bold">Refresh</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 md:space-y-10">
                    {loading && !stats ? (
                        <div className="h-64 flex items-center justify-center bg-white rounded-3xl border border-slate-200">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 lg:gap-10">
                            <div className="md:col-span-12 lg:col-span-12 group bg-white p-6 md:p-10 rounded-2xl md:rounded-[40px] border border-slate-200 shadow-sm flex flex-col justify-between gap-4 md:gap-6 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mt-16 -mr-16 pointer-events-none opacity-50"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-80 text-slate-500">
                                        <TrendingUp className="w-4 h-4 text-indigo-500" /> Buyer Collections (Pass-through)
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Fee Collected</p>
                                            <div className="font-black text-slate-700 text-2xl md:text-3xl">₹{(stats?.totalMarketFee || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nirashrit (Charity) Collected</p>
                                            <div className="font-black text-slate-700 text-2xl md:text-3xl">₹{(stats?.totalNirashrit || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Misc Fee Collected</p>
                                            <div className="font-black text-slate-700 text-2xl md:text-3xl">₹{(stats?.totalMiscFee || 0).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="h-px w-full bg-slate-100 my-6" />
                                    <div className="flex justify-between items-baseline">
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Total Collected from Buyers</p>
                                        <div className="font-[1000] text-xl md:text-2xl tracking-tighter text-indigo-700">
                                            ₹{((stats?.totalMarketFee || 0) + (stats?.totalNirashrit || 0) + (stats?.totalMiscFee || 0)).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </NativePageWrapper>
    );
}
