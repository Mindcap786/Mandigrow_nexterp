"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { callApi } from "@/lib/frappeClient";
import { Loader2, TrendingDown, CheckCircle2, Clock, Filter, Receipt, Search, Info, Calendar as CalendarIcon, X, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PurchaseBillDetailsSheet } from "@/components/purchase/purchase-bill-details";
import { NewPaymentDialog } from "@/components/finance/new-payment-dialog";
import { SupplierInwardsDialog } from "@/components/purchase/supplier-inwards-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { cacheGet, cacheSet, cacheClearPrefix } from "@/lib/data-cache";
import { useLanguage } from "@/components/i18n/language-provider";

const AMOUNT_EPSILON = 0.01;
const DATE_FORMAT = 'yyyy-MM-dd';

export default function PurchaseBillsPage() {
    const { profile } = useAuth();
    const { t } = useLanguage();

    // Pre-populate from cache for instant render on re-navigation
    const _orgId = profile?.organization_id;
    const initialCacheKey = `purchase_bills_${subDays(new Date(), 30).toISOString().split('T')[0].replace(/-/g, '')}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}`;
    const _cached = _orgId ? cacheGet<any>(initialCacheKey, _orgId) : null;

    const [bills, setBills] = useState<any[]>(_cached?.bills || []);
    const [groupedSuppliers, setGroupedSuppliers] = useState<any[]>(_cached?.groupedSuppliers || []);
    const [loading, setLoading] = useState(!_cached && !profile);
    const [filter, setFilter] = useState<'all'|'pending'|'partial'|'paid'>('all');
    const [search, setSearch] = useState('');
    const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
    const [selectedBillLocked, setSelectedBillLocked] = useState<boolean>(false);
    const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);
    const [paymentInitialValues, setPaymentInitialValues] = useState<{ party_id: string, partyName?: string, amount: number, remarks: string, invoice_id?: string, lot_id?: string, arrival_id?: string } | null>(null);
    const [allContacts, setAllContacts] = useState<any[]>(_orgId ? (cacheGet<any[]>('contacts_master', _orgId) || []) : []);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });
    const [error, setError] = useState<string | null>(null);
    // Incrementing this triggers SupplierInwardsDialog to re-fetch its live GL balance
    const [dialogRefreshTrigger, setDialogRefreshTrigger] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [search, filter, dateRange]);

    // Master contacts (Mandi Contact, org-scoped) — needed by NewPaymentDialog
    // so the settlement dialog renders the supplier name (not "Unknown
    // Contact") and so the popover never falls back to the global Frappe
    // Contact doctype (which leaked the logged-in User across tenants).
    useEffect(() => {
        const orgId = profile?.organization_id;
        if (!orgId || allContacts.length > 0) return;
        (async () => {
            try {
                const data: any = await callApi('mandigrow.api.get_contacts', { org_id: orgId });
                const list = Array.isArray(data) ? data : (data?.records || data?.contacts || []);
                setAllContacts(list);
                cacheSet('contacts_master', orgId, list);
            } catch (e) { console.error('master contacts fetch failed', e); }
        })();
    }, [profile?.organization_id]);

    const datePresets = [
        { label: t('purchase_bills.today'), from: startOfDay(new Date()), to: endOfDay(new Date()) },
        { label: t('purchase_bills.last_7_days'), from: startOfDay(subDays(new Date(), 7)), to: endOfDay(new Date()) },
        { label: t('purchase_bills.last_30_days'), from: startOfDay(subDays(new Date(), 30)), to: endOfDay(new Date()) },
    ];

    const activePreset = dateRange?.from && dateRange?.to
        ? datePresets.find(p => isSameDay(p.from, dateRange.from!) && isSameDay(p.to, dateRange.to!))?.label
        : !dateRange ? (t('purchase_bills.all_time')) : null;

    useEffect(() => {
        if (profile?.organization_id) {
            fetchBills();
        }
    }, [profile?.organization_id, filter, dateRange]);

    const fetchBills = async (isManualRefresh = false) => {
        const orgId = profile?.organization_id;
        if (!orgId) return;

        const cacheKey = `purchase_bills_${dateRange?.from ? format(dateRange.from, 'yyyyMMdd') : 'all'}_${dateRange?.to ? format(dateRange.to, 'yyyyMMdd') : 'all'}`;
        const cached = cacheGet<any>(cacheKey, orgId);

        if (cached && !isManualRefresh) {
            setBills(cached.bills || []);
            setGroupedSuppliers(cached.groupedSuppliers || []);
            setLoading(false);
        } else if (!isManualRefresh) {
            setLoading(true);
        }
        setError(null);

        try {
            const result: any = await callApi('mandigrow.api.get_purchase_bills', {
                org_id: orgId,
                date_from: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
                date_to: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null,
            });

            const fetchedBills = result?.bills || [];
            const fetchedGroups = result?.groupedSuppliers || [];

            setBills(fetchedBills);
            setGroupedSuppliers(fetchedGroups);

            cacheSet(cacheKey, orgId, {
                bills: fetchedBills,
                groupedSuppliers: fetchedGroups,
            });
        } catch (err: any) {
            console.error("Purchase bills fetch error:", err);
            setError(err.message || "Failed to fetch records. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const totalPayable = groupedSuppliers.reduce((sum, supplier) => {
        const bal = Number(supplier.balance || 0);
        return sum + (bal > AMOUNT_EPSILON ? bal : 0);
    }, 0);

    const filteredSuppliers = groupedSuppliers
        .filter(supplier => {
            if (filter === 'pending')  return supplier.calculatedStatus === 'pending';
            if (filter === 'partial')  return supplier.calculatedStatus === 'partial';
            if (filter === 'paid')     return supplier.calculatedStatus === 'paid';
            return true;
        })
        .filter(supplier => {
            if (!search) return true;
            const q = search.toLowerCase();
            return supplier.name.toLowerCase().includes(q) || 
                   (supplier.city || '').toLowerCase().includes(q) ||
                   (supplier.lots || []).some((l: any) => 
                       (l.lot_code || '').toLowerCase().includes(q) ||
                       (l.arrival?.reference_no || '').toLowerCase().includes(q)
                   );
        });

    const totalPages = Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE);
    const paginatedSuppliers = filteredSuppliers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-black p-4 md:p-8 pb-40 space-y-6 md:space-y-8 animate-in fade-in relative overflow-hidden">
            {/* Super Premium Background Ornaments */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[5%] right-[-10%] w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-blue-100/20 rounded-full blur-[100px]"></div>
                <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-slate-200/20 rounded-full blur-[150px]"></div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">
                {/* Header - Premium Layout */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end bg-gradient-to-br from-white via-slate-50/50 to-white p-6 md:p-8 rounded-[24px] md:rounded-[40px] border border-slate-200/60 shadow-md relative overflow-hidden">
                    {/* Decorative Blur */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/20 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

                    <div className="relative z-10">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
                                <Info className="w-5 h-5 flex-shrink-0" />
                                <div className="text-sm font-bold">{error}</div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => fetchBills(true)}
                                    className="ml-auto h-8 px-3 text-xs font-black uppercase tracking-widest hover:bg-red-100"
                                >
                                    {t('purchase_bills.retry')}
                                </Button>
                            </div>
                        )}
                        <h1 className="text-3xl md:text-5xl font-[1000] italic tracking-tighter mb-2 uppercase text-slate-900 leading-none">
                            {t('purchase_bills.title')}
                        </h1>
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-8 md:w-12 bg-blue-600 rounded-full"></div>
                            <p className="text-slate-500 font-bold tracking-tight text-sm md:text-lg italic">{t('purchase_bills.financial_ledger_desc')}</p>
                        </div>
                    </div>

                    <div className="text-left md:text-right relative z-10 mt-6 md:mt-0 bg-white/40 backdrop-blur-sm p-4 rounded-3xl border border-white/50 shadow-sm w-full md:w-auto">
                        <div className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black mb-1">{t('purchase_bills.total_outstanding_liability')}</div>
                        <div className="text-3xl md:text-5xl font-mono font-black text-slate-900 tracking-tighter flex items-baseline justify-start md:justify-end gap-1">
                            <span className="text-2xl text-blue-500/50 font-sans">₹</span>
                            {totalPayable.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="sticky top-4 z-30 bg-white/80 backdrop-blur-2xl border border-slate-200/80 p-2 md:p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col xl:flex-row gap-3 items-center transition-all">
                    {/* Search Bar - Flex 1 */}
                    <div className="relative w-full xl:flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                        <Input
                            placeholder={t('purchase_bills.search_supplier_ref')}
                            className="pl-12 bg-slate-50/50 hover:bg-white border-slate-200 text-black h-12 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm md:text-base font-bold transition-all shadow-inner focus:shadow-md placeholder:text-slate-400 w-full"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Filters - Natural width */}
                    <div className="flex flex-wrap lg:flex-nowrap gap-2 items-center w-full xl:w-auto flex-shrink-0">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "h-12 flex-1 lg:w-[240px] lg:flex-none justify-start text-left font-black bg-white border-slate-200 text-black hover:bg-slate-50 hover:border-slate-300 px-4 rounded-xl shadow-sm transition-all",
                                        !dateRange && "text-slate-400"
                                    )}
                                >
                                    <CalendarIcon className="mr-3 h-5 w-5 shrink-0 text-blue-500" />
                                    {activePreset ? (
                                        <span className="text-sm font-black tracking-widest uppercase text-black truncate">{activePreset}</span>
                                    ) : dateRange?.from ? (
                                        <div className="flex items-center gap-1 md:gap-2 overflow-hidden">
                                            <div className="px-1 md:px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9px] md:text-[10px] font-mono font-bold text-slate-700 uppercase truncate">
                                                {format(dateRange.from, "dd MMM yyyy")}
                                            </div>
                                            {dateRange.to && (
                                                <>
                                                    <ArrowRight className="w-3 h-3 shrink-0 text-slate-400" />
                                                    <div className="px-1 md:px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9px] md:text-[10px] font-mono font-bold text-slate-700 uppercase truncate">
                                                        {format(dateRange.to, "dd MMM yyyy")}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-sm font-bold tracking-tight text-slate-400">{t('purchase_bills.all_time')}</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[90vw] max-w-[400px] md:w-auto p-0 bg-white border-slate-200 text-black shadow-2xl rounded-2xl overflow-hidden mr-4 md:mr-0" align="end">
                                <div className="flex border-b border-slate-100 bg-slate-50 overflow-x-auto no-scrollbar">
                                    <button
                                        onClick={() => setDateRange(undefined)}
                                        className={cn(
                                            "flex-1 px-3 md:px-4 py-3 md:py-4 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-2",
                                            !dateRange
                                                ? "text-blue-600 border-blue-600 bg-blue-50"
                                                : "text-slate-400 border-transparent hover:text-black hover:bg-slate-100"
                                        )}
                                    >
                                        {t('purchase_bills.all_time')}
                                    </button>
                                    {datePresets.map((preset) => (
                                        <button
                                            key={preset.label}
                                            onClick={() => setDateRange({
                                                from: preset.from,
                                                to: preset.to
                                            })}
                                            className={cn(
                                                "flex-1 px-3 md:px-4 py-3 md:py-4 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-2",
                                                activePreset === preset.label
                                                    ? "text-blue-600 border-blue-600 bg-blue-50"
                                                    : "text-slate-400 border-transparent hover:text-black hover:bg-slate-100"
                                            )}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-center p-2 md:p-4">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={2}
                                        className="bg-white text-black"
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>

                        {dateRange && (
                            <Button
                                variant="ghost"
                                onClick={() => setDateRange(undefined)}
                                className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        )}

                        <div className="h-8 w-px bg-slate-200 mx-1 hidden lg:block" />

                        <div className="flex flex-1 lg:flex-none gap-1 overflow-x-auto hide-scrollbar snap-x w-full">
                            {(['all', 'pending', 'partial', 'paid'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        'h-12 flex-1 lg:flex-none snap-center px-4 md:px-5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-300',
                                        filter === f 
                                            ? f === 'partial' ? 'bg-amber-500 text-white border-amber-500 shadow-[0_4px_14px_rgba(245,158,11,0.3)]'
                                              : f === 'paid'    ? 'bg-emerald-600 text-white border-emerald-600 shadow-[0_4px_14px_rgba(5,150,105,0.3)]'
                                              : f === 'pending' ? 'bg-rose-600 text-white border-rose-600 shadow-[0_4px_14px_rgba(225,29,72,0.3)]'
                                              : 'bg-slate-900 text-white border-slate-900 shadow-[0_4px_14px_rgba(15,23,42,0.3)]'
                                            : 'bg-white border-slate-200 text-slate-500 hover:text-black hover:border-slate-300 hover:bg-slate-50'
                                    )}
                                >
                                    {t(`purchase_bills.${f}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredSuppliers.length === 0 && (
                            <div className="text-center py-20 text-slate-400 font-bold bg-white rounded-2xl border border-dashed border-slate-200 uppercase tracking-widest text-xs">{t('purchase_bills.no_records_found')}</div>
                        )}
                        {paginatedSuppliers
                            .map((supplier) => {
                                const ledgerBal = supplier.balance;
                                const inwardCount = new Set(supplier.lots.map((l: any) => l.arrival_id).filter(Boolean)).size;
                                const arrivalTypes = Array.from(new Set(supplier.lots.map((l: any) => l.arrival?.arrival_type || l.arrival_type || 'direct')));

                                return (
                                    <div key={supplier.id} className="bg-white/70 backdrop-blur-sm border border-slate-200 p-4 md:p-6 rounded-[20px] md:rounded-[28px] hover:border-blue-400/40 hover:shadow-2xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden">
                                        {/* Hover Glow */}
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full blur-3xl -mr-24 -mt-24 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                        {/* Top row: Icon + Info */}
                                        <div className="flex items-start gap-4 relative z-10">
                                            <div className={`w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full flex items-center justify-center border ${
                                                supplier.calculatedStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                supplier.calculatedStatus === 'partial' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                                'bg-red-50 text-red-600 border-red-100'
                                            }`}>
                                                {supplier.calculatedStatus === 'paid' ? <CheckCircle2 className="w-5 h-5" /> : 
                                                 supplier.calculatedStatus === 'partial' ? <Clock className="w-5 h-5 text-amber-500" /> : 
                                                 <Clock className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {/* Name */}
                                                <div className="flex items-center gap-2">
                                                    <div className="text-base md:text-xl font-black text-black truncate">{supplier.name}</div>
                                                    {supplier.internal_id && (
                                                        <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100 uppercase tracking-widest flex-shrink-0">
                                                            {supplier.internal_id}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* City */}
                                                <div className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                                                    <Receipt className="w-3 h-3 flex-shrink-0" />
                                                    <span className="truncate">{t('purchase_bills.origin')}: {supplier.city || (t('purchase_bills.no_city_set'))}</span>
                                                </div>
                                                {/* Badges - wrap on mobile */}
                                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-widest whitespace-nowrap">
                                                        {inwardCount} {inwardCount === 1 ? (t('purchase_bills.inward')) : (t('purchase_bills.inwards'))}
                                                    </span>
                                                    {arrivalTypes.map((type: any) => (
                                                        <span key={type} className={cn(
                                                            "text-[9px] px-2 py-0.5 rounded-full font-bold tracking-[0.1em] uppercase border shadow-sm whitespace-nowrap",
                                                            type === 'direct' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                (type === 'commission' || type === 'farmer') ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                                    (type === 'commission_supplier' || type === 'supplier') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                        'bg-slate-50 text-slate-700 border-slate-200'
                                                        )}>
                                                            {type === 'direct' ? 'Direct' : 
                                                             (type === 'commission' || type === 'farmer' || type === 'farmer_owned') ? 'Farmer Comm' : 
                                                             (type === 'commission_supplier' || type === 'supplier' || type === 'supplier_owned') ? 'Supplier Comm' : 
                                                             String(type).replace('_', ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                                {/* Balance + Progress Bar */}
                                                <div className={`text-sm font-mono font-black mt-2 ${ledgerBal > AMOUNT_EPSILON ? 'text-rose-600' : ledgerBal < -AMOUNT_EPSILON ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                    {t('purchase_bills.balance')}: ₹ {Math.abs(ledgerBal).toLocaleString()} {ledgerBal > AMOUNT_EPSILON ? (t('purchase_bills.to_pay')) : ledgerBal < -AMOUNT_EPSILON ? (t('purchase_bills.advance')) : (t('purchase_bills.settled'))}
                                                </div>
                                                {supplier.totalNetPayable > AMOUNT_EPSILON && (
                                                    <div className="mt-2">

                                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className={cn(
                                                                    'h-full rounded-full transition-all duration-700',
                                                                    supplier.calculatedStatus === 'paid'    ? 'bg-emerald-500' :
                                                                    supplier.calculatedStatus === 'partial' ? 'bg-amber-400' : 'bg-rose-300'
                                                                )}
                                                                style={{ width: `${Math.min(100, Math.round(((supplier.totalPaid || 0) / supplier.totalNetPayable) * 100))}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons - full width on mobile, row on desktop */}
                                        <div className="flex items-center gap-2 mt-4 relative z-10">
                                            <Button
                                                variant="outline"
                                                onClick={() => setSelectedSupplier(supplier)}
                                                className="flex-1 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-black font-bold h-10 px-4 shadow-sm rounded-xl text-sm"
                                            >
                                                {t('purchase_bills.manage_inwards')}
                                            </Button>

                                            {ledgerBal > 0 && (
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPaymentInitialValues({
                                                            party_id: supplier.id,
                                                            partyName: supplier.name,
                                                            amount: Math.abs(ledgerBal),
                                                            // NOTE: no currentBalance — dialog fetches live GL via get_ledger_statement
                                                            remarks: `Settlement for inwards`
                                                        });
                                                    }}
                                                    className="flex-1 bg-black text-white font-black hover:bg-slate-800 h-10 px-4 shadow-lg rounded-xl transition-all active:scale-95 text-sm"
                                                >
                                                    {t('purchase_bills.pay_balance')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4 bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-slate-200">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="h-10 px-4 text-xs font-black uppercase tracking-widest border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    {t('purchase_bills.prev')}
                                </Button>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    {t('purchase_bills.page')} {currentPage} {t('purchase_bills.of')} {totalPages}
                                </span>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="h-10 px-4 text-xs font-black uppercase tracking-widest border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl"
                                >
                                    {t('purchase_bills.next')}
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <PurchaseBillDetailsSheet
                lotId={selectedBillId}
                isOpen={!!selectedBillId}
                isLocked={selectedBillLocked}
                onClose={() => {
                    setSelectedBillId(null);
                    setSelectedBillLocked(false);
                }}
                onUpdate={fetchBills}
            />

            <SupplierInwardsDialog
                supplier={selectedSupplier ? groupedSuppliers.find(s => s.id === selectedSupplier.id) || selectedSupplier : null}
                unappliedPayment={(() => {
                    const s = selectedSupplier ? (groupedSuppliers.find(gs => gs.id === selectedSupplier.id) || selectedSupplier) : null;
                    if (!s || !Array.isArray(s.lots)) return 0;
                    const totalPaid = s.totalPaid || 0;
                    const lotAdvances = s.lots.reduce((sum: number, l: any) => sum + Number(l.advance || 0), 0);
                    // Unique arrival advances
                    const arrivalAdvancesMap: Record<string, number> = {};
                    s.lots.forEach((l: any) => {
                        if (l.arrival_id && l.arrival?.advance_amount) {
                            arrivalAdvancesMap[l.arrival_id] = Number(l.arrival.advance_amount);
                        }
                    });
                    const arrivalAdvances = Object.values(arrivalAdvancesMap).reduce((sum, val) => sum + val, 0);
                    return Math.max(0, totalPaid - lotAdvances - arrivalAdvances);
                })()}
                isOpen={!!selectedSupplier}
                onClose={() => setSelectedSupplier(null)}
                onEditLot={(lotId, isLocked) => {
                    setSelectedBillId(lotId);
                    setSelectedBillLocked(!!isLocked);
                }}
                onPay={(partyId, amount, lotCode, arrivalId) => {
                    setPaymentInitialValues({
                        party_id: partyId,
                        partyName: groupedSuppliers.find(g => g.id === partyId)?.name,
                        amount: amount,
                        // NOTE: no currentBalance — dialog fetches live GL via get_ledger_statement
                        remarks: `Payment Purchase #Inward ${lotCode}`,
                        arrival_id: arrivalId
                    });
                }}
                refreshTrigger={dialogRefreshTrigger}
            />

            <NewPaymentDialog
                defaultOpen={!!paymentInitialValues}
                onOpenChange={(open) => {
                    if (!open) setPaymentInitialValues(null);
                }}
                initialValues={paymentInitialValues || undefined}
                preLoadedContacts={allContacts}
                onSuccess={() => {
                    // Clear ALL purchase_bills cache entries so the supplier card
                    // shows fresh GL-based balances immediately (not stale cache).
                    if (profile?.organization_id) {
                        cacheClearPrefix('purchase_bills_', profile.organization_id);
                    }
                    // Trigger live balance re-fetch in the SupplierInwardsDialog header
                    setDialogRefreshTrigger(t => t + 1);
                    setPaymentInitialValues(null);
                    fetchBills(true);
                }}
            />
        </div>
    );
}
