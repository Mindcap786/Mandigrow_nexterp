"use client";
import { NativePageWrapper } from "@/components/mobile/NativePageWrapper";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { callApi } from "@/lib/frappeClient";
import { Loader2, TrendingUp, TrendingDown, RefreshCcw, Calendar as CalendarIcon, ArrowUpRight, DollarSign, Package, Truck, Wallet, FileText } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { isNativePlatform, isMobileAppView } from "@/lib/capacitor-utils";
import { BottomSheet } from "@/components/mobile/BottomSheet";
import { cn } from "@/lib/utils";
import { format, subDays, startOfDay, endOfDay, isSameDay, startOfMonth, endOfMonth, isValid } from "date-fns";

export default function ExpenseRecoveryReport() {
    const { profile, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });
    const [dateSheetOpen, setDateSheetOpen] = useState(false);

    const safeFormat = (date: any, formatStr: string) => {
        if (!date) return "—";
        const d = new Date(date);
        return isValid(d) ? format(d, formatStr) : "—";
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await callApi("mandigrow.mandigrow.api.get_expense_recovery_report", {
                date_from: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
                date_to: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null,
            });
            if (res) {
                setStats(res);
            }
        } catch (error) {
            console.error("Failed to load expense report", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchReport();
        }
    }, [authLoading, dateRange]);

    const handlePresetSelect = (preset: 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth') => {
        const today = new Date();
        switch (preset) {
            case 'today':
                setDateRange({ from: startOfDay(today), to: endOfDay(today) });
                break;
            case 'yesterday':
                const yest = subDays(today, 1);
                setDateRange({ from: startOfDay(yest), to: endOfDay(yest) });
                break;
            case '7days':
                setDateRange({ from: subDays(today, 7), to: today });
                break;
            case '30days':
                setDateRange({ from: subDays(today, 30), to: today });
                break;
            case 'thisMonth':
                setDateRange({ from: startOfMonth(today), to: endOfMonth(today) });
                break;
        }
        setDateSheetOpen(false);
    };

    const CustomDatePicker = () => {
        const isMobile = isMobileAppView();
        const displayDate = dateRange.from && dateRange.to
            ? (isSameDay(dateRange.from, dateRange.to)
                ? safeFormat(dateRange.from, 'dd MMM yyyy')
                : `${safeFormat(dateRange.from, 'dd MMM')} - ${safeFormat(dateRange.to, 'dd MMM yyyy')}`)
            : 'Select Date Range';

        const DatePickerContent = () => (
            <div className="p-4 md:p-0 space-y-4 md:space-y-0 md:flex md:gap-4 pb-12 md:pb-0">
                <div className="flex flex-col gap-2 w-full md:w-auto md:border-r md:pr-4 md:py-2">
                    <Button variant="ghost" className="justify-start w-full md:w-32 h-12 md:h-9" onClick={() => handlePresetSelect('today')}>Today</Button>
                    <Button variant="ghost" className="justify-start w-full md:w-32 h-12 md:h-9" onClick={() => handlePresetSelect('yesterday')}>Yesterday</Button>
                    <Button variant="ghost" className="justify-start w-full md:w-32 h-12 md:h-9" onClick={() => handlePresetSelect('7days')}>Last 7 Days</Button>
                    <Button variant="ghost" className="justify-start w-full md:w-32 h-12 md:h-9" onClick={() => handlePresetSelect('30days')}>Last 30 Days</Button>
                    <Button variant="ghost" className="justify-start w-full md:w-32 h-12 md:h-9" onClick={() => handlePresetSelect('thisMonth')}>This Month</Button>
                </div>
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(rng) => {
                        if (rng?.from && rng?.to) {
                            setDateRange({ from: rng.from, to: rng.to });
                            if (!isMobile) document.dispatchEvent(new MouseEvent('click'));
                        }
                    }}
                    numberOfMonths={isMobile ? 1 : 2}
                    className="md:p-2 mx-auto md:mx-0 bg-white"
                />
            </div>
        );

        if (isMobile) {
            return (
                <>
                    <Button variant="outline" className="h-12 w-full justify-between px-4 border-slate-200 bg-white shadow-sm font-bold text-slate-700" onClick={() => setDateSheetOpen(true)}>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-indigo-500" />
                            {displayDate}
                        </div>
                    </Button>
                    <BottomSheet open={dateSheetOpen} onClose={() => setDateSheetOpen(false)} title="Select Date Range" snap="auto">
                        <DatePickerContent />
                    </BottomSheet>
                </>
            );
        }

        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="h-10 px-4 border-slate-200 bg-white hover:bg-slate-50 shadow-sm font-bold text-slate-700 transition-all min-w-[240px] justify-between">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-indigo-500" />
                            {displayDate}
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl border-slate-200 shadow-xl overflow-hidden" align="end">
                    <DatePickerContent />
                </PopoverContent>
            </Popover>
        );
    };

    if (authLoading) {
        return (
            <NativePageWrapper title="Expense Recovery">
                <div className="h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            </NativePageWrapper>
        );
    }

    return (
        <NativePageWrapper title="Expense Recovery">
            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-[1000] text-slate-900 tracking-tight flex items-center gap-3">
                                    <FileText className="w-7 h-7 text-indigo-600" />
                                    3rd-Party Expenses
                                </h1>
                                <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">Tracking expenses paid on behalf of others</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <CustomDatePicker />
                                <Button
                                    variant="outline"
                                    onClick={fetchReport}
                                    disabled={loading}
                                    className="h-10 md:h-10 px-4 bg-white border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[100px]"
                                >
                                    <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
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
                        <>
                            {/* Grand Total */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 lg:gap-10">
                                <div className="md:col-span-12 lg:col-span-12 bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 md:p-10 rounded-2xl md:rounded-[40px] text-white shadow-xl shadow-indigo-500/20 flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-80">
                                            <Wallet className="w-4 h-4" /> Total 3rd-Party Payouts
                                        </div>
                                        <div className="font-[1000] text-4xl md:text-6xl tracking-tighter mb-2 md:mb-4">
                                            ₹{(stats?.grandTotal || 0).toLocaleString()}
                                        </div>
                                        <div className="text-xs font-black uppercase tracking-widest opacity-80 bg-black/10 w-fit px-3 py-1 rounded-full">
                                            Expenses recovered via deductions & additions
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                                {/* Supplier Side */}
                                <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[40px] border border-slate-200 shadow-sm flex flex-col gap-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                                            <Truck className="w-5 h-5 text-emerald-600" /> Supplier/Farmer Side
                                        </h3>
                                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Commission Only</span>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-500 leading-relaxed -mt-2">
                                        Deducted from farmer payout & paid to transporters/laborers.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Freight / Hire Charges</p>
                                            <div className="font-black text-slate-700 text-xl">₹{(stats?.supplier?.freight || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Hamali (Unloading)</p>
                                            <div className="font-black text-slate-700 text-xl">₹{(stats?.supplier?.hamali || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Packing Cost</p>
                                            <div className="font-black text-slate-700 text-xl">₹{(stats?.supplier?.packing || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Farmer Charges</p>
                                            <div className="font-black text-slate-700 text-xl">₹{(stats?.supplier?.farmerCharges || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Other Trip Expenses</p>
                                            <div className="font-black text-slate-700 text-xl">₹{(stats?.supplier?.other || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="h-px w-full bg-slate-100 my-4" />
                                        <div className="flex justify-between items-baseline pt-1">
                                            <p className="text-[12px] font-black text-emerald-600 uppercase tracking-widest">Supplier Total</p>
                                            <div className="font-[1000] text-2xl tracking-tighter text-emerald-700">
                                                ₹{(stats?.supplier?.total || 0).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Buyer Side */}
                                <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[40px] border border-slate-200 shadow-sm flex flex-col gap-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                                            <Package className="w-5 h-5 text-amber-600" /> Buyer Side
                                        </h3>
                                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">All Sales</span>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-500 leading-relaxed -mt-2">
                                        Added to buyer invoice & paid out to laborers/handlers.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Loading Charges</p>
                                            <div className="font-black text-slate-700 text-xl">₹{(stats?.buyer?.loading || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Unloading Charges</p>
                                            <div className="font-black text-slate-700 text-xl">₹{(stats?.buyer?.unloading || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Other Expenses</p>
                                            <div className="font-black text-slate-700 text-xl">₹{(stats?.buyer?.other || 0).toLocaleString()}</div>
                                        </div>
                                        
                                        {/* Spacer to align visually with supplier side which has more items */}
                                        <div className="hidden lg:block h-[68px]"></div>

                                        <div className="h-px w-full bg-slate-100 my-4" />
                                        <div className="flex justify-between items-baseline pt-1">
                                            <p className="text-[12px] font-black text-amber-600 uppercase tracking-widest">Buyer Total</p>
                                            <div className="font-[1000] text-2xl tracking-tighter text-amber-700">
                                                ₹{(stats?.buyer?.total || 0).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </NativePageWrapper>
    );
}
