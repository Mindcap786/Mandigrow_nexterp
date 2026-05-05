'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { ShieldAlert, TrendingUp, Users, Package, Activity, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/components/i18n/language-provider'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { cacheGet, cacheSet, cacheIsStale } from '@/lib/data-cache'
import { callApi } from '@/lib/frappeClient'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { isNativePlatform, isMobileAppView } from '@/lib/capacitor-utils'
import { StockAlertSummaryCard } from '@/components/alerts/StockAlertSummaryCard'
import { ROUTES } from '@/lib/routes'
import { calculateDaybookStats } from '@/components/finance/day-book'

// Native Mobile components
import { NativeSummaryCard, StatChip } from '@/components/mobile/NativeSummaryCard'
import { QuickActionRow } from '@/components/mobile/QuickActionRow'
import { NativeCard } from '@/components/mobile/NativeCard'
import { SkeletonDashboard } from '@/components/mobile/ShimmerSkeleton'

// ──────────────────────────────────────────────────────────────────────────────
// ALL BUSINESS LOGIC IS COMPLETELY UNCHANGED BELOW. Only JSX return changes.
// ──────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const { t } = useLanguage()
    const { profile, loading: authLoading } = useAuth()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {
        setMounted(true)
    }, [])

    // Super admins should never see the tenant dashboard — redirect to /admin
    // UNLESS this is an impersonation session (super_admin logged in as a tenant owner)
    useEffect(() => {
        if (typeof window === 'undefined') return
        const isImpersonating = localStorage.getItem('mandi_impersonation_mode') === 'true'
        if (!authLoading && profile?.role === 'super_admin' && !isImpersonating) {
            router.replace(ROUTES.ADMIN)
        }
    }, [profile?.role, authLoading, router])

    // 2. Pre-load from cache immediately — no spinner on re-navigation
    const [stats, setStats] = useState<any>({ 
        revenue: 0, inventory: 0, collections: 0, network: 0, purchases: 0, payables: 0,
        cash_purchase: 0, udhaar_purchase: 0, inflow: 0, outflow: 0, daily_expenses: 0
    });
    const [salesTrend, setSalesTrend] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Get org ID safely
    const orgId = useMemo(() => {
        if (!profile?.organization_id) return null
        return profile.organization_id
    }, [profile?.organization_id])

    // Cache preload
    useEffect(() => {
        if (!orgId) return

        try {
            const cached = cacheGet<any>('dashboard', orgId)
            if (cached) {
                setStats(cached.stats || { 
                    revenue: 0, inventory: 0, collections: 0, network: 0, purchases: 0, payables: 0,
                    cash_purchase: 0, udhaar_purchase: 0, inflow: 0, outflow: 0, daily_expenses: 0
                })
                setSalesTrend(cached.salesTrend || [])
                setRecentActivity(cached.recentActivity || [])
                setLoading(false)
            }
        } catch (err) {
            console.error("Cache load error:", err)
        }
    }, [orgId])

    useEffect(() => {
        // Wait for auth to load
        if (authLoading) return;

        const orgId = profile?.organization_id || (typeof window !== 'undefined' ? localStorage.getItem('mandi_profile_cache_org_id') : null)
        if (!orgId) return

        const fetchData = async () => {
            // If cache is fresh, we still trigger background fetch to ensure sync across pages.
            if (!cacheIsStale('dashboard', orgId)) {
                setLoading(false);
            }

            try {
                const data: any = await callApi('mandigrow.api.get_dashboard_data');

                if (!data) return;

                let newStats = data.stats || { 
                    revenue: 0, inventory: 0, collections: 0, payables: 0, network: 0, purchases: 0,
                    cash_purchase: 0, udhaar_purchase: 0, inflow: 0, outflow: 0, daily_expenses: 0
                };
                const newActivity = data.recentActivity || [];
                const newTrend = data.salesTrend || [];

                // Save to cache
                cacheSet('dashboard', orgId, { stats: newStats, salesTrend: newTrend, recentActivity: newActivity });

                if (data.daybook_data) {
                    try {
                        const { summary } = calculateDaybookStats(data.daybook_data, 'all', (s: string) => s);
                        newStats = {
                            ...newStats,
                            revenue: summary.sales.total,
                            collections: summary.sales.cash,
                            payables: summary.sales.credit,
                            cash_purchase: summary.purchases.cash,
                            udhaar_purchase: summary.purchases.credit,
                            inflow: summary.cash.inflow + summary.digital.inflow,
                            outflow: summary.cash.outflow + summary.digital.outflow,
                            daily_expenses: summary.expenses
                        };
                    } catch (e) {
                        console.error("Failed to parse daybook parity stats:", e);
                    }
                }

                setStats(newStats);
                setRecentActivity(newActivity);
                setSalesTrend(newTrend);

            } catch (err: any) {
                console.error("Dashboard Error:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchData();

        // Real-time Subscriptions neutralized for Frappe
        return () => {};

    }, [profile?.organization_id, authLoading])

    // ── NATIVE MOBILE RENDER ─────────────────────────────────────────────────
    if (isMobileAppView()) {
        if (!mounted) return null;

        if (loading) {
            return <SkeletonDashboard />;
        }

        return (
            <div className="px-4 py-3 space-y-4">
                {/* Hero Summary Card */}
                <NativeSummaryCard
                    businessName={profile?.organization?.name || 'MandiGrow'}
                    dateLabel="Today's Performance"
                    totalLabel="Today's Purchases"
                    totalAmount={`₹${(stats.cash_purchase + stats.udhaar_purchase).toLocaleString()}`}
                    metrics={[
                        {
                            label: 'Cash Paid',
                            value: `₹${stats.cash_purchase.toLocaleString()}`,
                            trend: stats.cash_purchase > 0 ? "up" : "flat"
                        },
                        {
                            label: 'Receivable',
                            value: `₹${stats.collections.toLocaleString()}`,
                            trend: stats.collections > 0 ? "down" : "flat"
                        },
                        {
                            label: 'Expenses',
                            value: `₹${stats.daily_expenses.toLocaleString()}`,
                            trend: stats.daily_expenses > 0 ? "up" : "flat"
                        },
                    ]}
                />

                {/* Stock Alerts Summary */}
                <StockAlertSummaryCard />

                {/* Quick Actions */}
                <QuickActionRow />

                {/* Recent Activity */}
                <div className="pt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] px-4 mb-2">
                        {t('common.live_feed') || 'Recent Activity'}
                    </p>

                    <div className="bg-white border-y border-gray-100 divide-y divide-gray-50">
                        {recentActivity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-[#9CA3AF]">
                                <Activity className="w-8 h-8 mb-2 opacity-40" />
                                <p className="text-sm font-medium">{t('dashboard.no_activity') || 'No activity yet'}</p>
                            </div>
                        ) : (
                            recentActivity.slice(0, 10).map((txn) => (
                                <div key={txn.id} className="flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors">
                                    {/* Avatar */}
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm",
                                        txn.type === 'sale' ? "bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]" : "bg-[#EDE9FE] text-[#7C3AED] border border-[#DDD6FE]"
                                    )}>
                                        {txn.buyer?.name?.charAt(0) || (txn.type === 'sale' ? 'S' : 'I')}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#1A1A2E] truncate leading-tight">
                                            {txn.type === 'sale'
                                                ? (txn.buyer?.name || 'Buyer Transaction')
                                                : (txn.lot?.item?.name || txn.lot?.item_type || 'Inventory Update')}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md",
                                                txn.type === 'sale' ? "bg-green-50 text-green-700" : "bg-purple-50 text-purple-700"
                                            )}>
                                                {txn.type === 'sale' ? 'Sale' : txn.type === 'arrival' ? 'Inward' : 'Adjustment'}
                                            </span>
                                            {txn.lot?.lot_code && (
                                                <span className="text-[10px] text-[#9CA3AF] font-medium">
                                                     • Lot #{txn.lot.lot_code}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Amount + time */}
                                    <div className="text-right flex-shrink-0">
                                        <p className={cn(
                                            "text-sm font-black tabular-nums",
                                            txn.type === 'sale' ? "text-[#16A34A]" : "text-[#1A1A2E]"
                                        )}>
                                            {txn.type === 'sale' ? '₹' : ''}{Number(txn.amount || 0).toLocaleString()}
                                            {txn.type !== 'sale' ? ' u' : ''}
                                        </p>
                                        <p className="text-[10px] text-[#9CA3AF] font-bold mt-0.5">
                                            {new Date(txn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sales Chart */}
                {salesTrend.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] px-0.5">
                            {t('dashboard.revenue_velocity') || 'Revenue Trend'}
                        </p>
                        <NativeCard className="p-4">
                            <SalesChart data={salesTrend} />
                        </NativeCard>
                    </div>
                )}
            </div>
        );
    }

    // ── WEB / DESKTOP RENDER (ORIGINAL — UNCHANGED) ──────────────────────────
    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#F0F2F5] text-emerald-600">
                <div className="w-10 h-10 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-1000">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-5xl font-[1000] tracking-tighter text-black mb-2 uppercase">
                        {t('dashboard.command_center')}
                    </h1>
                    <p className="text-slate-600 font-black flex items-center gap-2 text-lg">
                        <Activity className="w-5 h-5 text-emerald-600" />
                        {t('dashboard.live_auction')}
                    </p>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm px-6 py-3 rounded-2xl flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{t('dashboard.market_status')}</span>
                        <span className="text-sm font-bold text-indigo-600 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            {t('dashboard.live_trading')}
                        </span>
                    </div>
                </div>
            </header>

            {/* Stock Alerts Area */}
            <div className="animate-in slide-in-from-top duration-500">
                <StockAlertSummaryCard />
            </div>

            {/* Quick Actions Row - mobile: stacked, desktop: 3-col */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 animate-in slide-in-from-bottom duration-700 delay-150">
                <button 
                    onClick={() => router.push(ROUTES.FINANCE_PAYMENTS_RECEIPT)}
                    className="group bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-[32px] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between border-b-4 border-indigo-900/40"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            <ArrowUpRight className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Customer Payment</p>
                            <h3 className="text-xl font-[1000] tracking-tighter">RECEIVE MONEY</h3>
                        </div>
                    </div>
                    <Activity className="w-6 h-6 opacity-20 group-hover:opacity-100 transition-opacity" />
                </button>

                <button 
                    onClick={() => router.push(ROUTES.FINANCE_PAYMENTS_PAYMENT)}
                    className="group bg-rose-600 hover:bg-rose-700 text-white p-6 rounded-[32px] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between border-b-4 border-rose-900/40"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 rotate-180" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Supplier Payment</p>
                            <h3 className="text-xl font-[1000] tracking-tighter">MAKE PAYMENT</h3>
                        </div>
                    </div>
                    <Activity className="w-6 h-6 opacity-20 group-hover:opacity-100 transition-opacity" />
                </button>

                <button 
                    onClick={() => router.push(ROUTES.FINANCE_PAYMENTS_EXPENSE)}
                    className="group bg-amber-500 hover:bg-amber-600 text-white p-6 rounded-[32px] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between border-b-4 border-amber-700/40"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            <Package className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Operational Costs</p>
                            <h3 className="text-xl font-[1000] tracking-tighter">MANDI EXPENSES</h3>
                        </div>
                    </div>
                    <Activity className="w-6 h-6 opacity-20 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>

            {/* Key Metrics Grid - mobile: 1-col, tablet: 2-col, desktop: 4-col */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatsCard
                    title="📈 SALES SUMMARY"
                    value={`₹${stats.revenue.toLocaleString()}`}
                    icon={<TrendingUp className="h-6 w-6 text-indigo-700" />}
                    bgColor="bg-white"
                    borderColor="border-slate-100"
                    href={ROUTES.SALES}
                    subValues={[
                        { label: 'Cash Sales (Collected)', value: stats.collections, color: 'bg-emerald-500' },
                        { label: 'Udhaar Sales (Receivable)', value: stats.payables, color: 'bg-rose-500' }
                    ]}
                />
                <StatsCard
                    title="📦 PURCHASE INSIGHTS"
                    value={`₹${(stats.cash_purchase + stats.udhaar_purchase).toLocaleString()}`}
                    icon={<Package className="h-6 w-6 text-amber-700" />}
                    bgColor="bg-white"
                    borderColor="border-slate-100"
                    href={ROUTES.PURCHASE_BILLS}
                    subValues={[
                        { label: 'Cash Purchase (Paid)', value: stats.cash_purchase, color: 'bg-emerald-500' },
                        { label: 'Udhaar Purchase (Outstanding)', value: stats.udhaar_purchase, color: 'bg-rose-500' }
                    ]}
                />
                <StatsCard
                    title="💰 LIQUID ASSETS"
                    value={`₹${(stats.inflow - stats.outflow).toLocaleString()}`}
                    icon={<ArrowUpRight className="h-6 w-6 text-emerald-700" />}
                    bgColor="bg-white"
                    borderColor="border-slate-100"
                    href={ROUTES.REPORT_DAYBOOK}
                    subValues={[
                        { label: 'Inflow', value: stats.inflow, color: 'bg-emerald-500' },
                        { label: 'Outflow', value: stats.outflow, color: 'bg-rose-500' }
                    ]}
                />
                <StatsCard
                    title="🛠️ DAILY EXPENSES"
                    value={`₹${stats.daily_expenses.toLocaleString()}`}
                    icon={<Activity className="h-6 w-6 text-rose-700" />}
                    bgColor="bg-white"
                    borderColor="border-slate-100"
                    href={ROUTES.FINANCE_PAYMENTS_EXPENSE}
                    subtext="Total volume of operational expenses paid out today (Labor, Transport, Petty Cash)"
                    subtextBg="bg-rose-50"
                />
            </div>

            {/* Charts + Activity Feed — mobile: stacked, desktop: 7-col split */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-7">
                {/* Sales Chart Area */}
                <div className="md:col-span-4 bg-white border border-slate-200 shadow-sm rounded-3xl p-5 sm:p-8 relative overflow-hidden group hover:shadow-md transition-all duration-500">
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900">{t('dashboard.revenue_velocity')}</h3>
                            <p className="text-xs text-slate-500 mt-1 font-black">{t('dashboard.transaction_volume')}</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                            {t('dashboard.real_time')}
                        </span>
                    </div>
                    <SalesChart data={salesTrend} />
                </div>

                {/* Recent Activity Feed */}
                <div className="md:col-span-3 bg-white border border-slate-200 shadow-sm rounded-3xl p-5 sm:p-8 relative overflow-hidden flex flex-col h-full">
                    <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-600" /> {t('common.live_feed')}
                    </h3>

                    <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {recentActivity.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                <Activity className="w-12 h-12 mb-2" />
                                <p className="text-sm font-bold">{t('dashboard.no_activity')}</p>
                            </div>
                        ) : (
                            recentActivity.map((txn, i) => (
                                <div key={txn.id} className="group relative bg-slate-50 hover:bg-emerald-50 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all duration-300">
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold shadow-sm transition-colors",
                                                txn.type === 'sale' ? "text-emerald-600 border-emerald-100" : "text-purple-600 border-purple-100"
                                            )}>
                                                {txn.buyer?.name?.charAt(0) || (txn.type === 'sale' ? 'B' : 'S')}
                                            </div>
                                            <div>
                                                <p className={cn(
                                                    "text-sm font-black transition-colors",
                                                    txn.type === 'sale' ? "text-emerald-700" : "text-slate-900 group-hover:text-purple-700"
                                                )}>
                                                    {t(
                                                        txn.type === 'sale' ? 'dashboard.activity.msg_sold' :
                                                        txn.type === 'arrival' ? 'dashboard.activity.msg_received' :
                                                        'dashboard.activity.msg_adjusted',
                                                        { item: txn.lot?.item_type || t('dashboard.activity.item') }
                                                    )}
                                                </p>
                                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">
                                                    {t('dashboard.activity.lot', { code: txn.lot?.lot_code })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={cn(
                                                "font-mono font-bold text-lg",
                                                txn.type === 'sale' ? "text-emerald-600" : "text-slate-800"
                                            )}>
                                                {txn.type === 'sale' ? t('common.currency_symbol') : ''}{txn.amount?.toLocaleString()}{txn.type !== 'sale' ? ' ' + t('dashboard.activity.units') : ''}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-bold">
                                                {new Date(txn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatsCard({ title, value, icon, bgColor, borderColor, trend, subtext, trendBg, subtextBg, trendColor, href, subValues }: any) {
    const Content = (
        <div className={cn(
            "p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border shadow-sm",
            bgColor,
            borderColor,
            href ? 'cursor-pointer' : ''
        )}>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{title}</span>
                    <div className="p-2 rounded-lg bg-white/50 border border-white/50 group-hover:bg-white transition-colors">
                        {icon}
                    </div>
                </div>

                <div className="flex items-end justify-between">
                    <div className={cn(
                        "font-black text-slate-900 tracking-tight transition-all duration-300",
                        value.length > 12 ? "text-xl" :
                            value.length > 10 ? "text-2xl" :
                                "text-3xl"
                    )}>
                        {value}
                    </div>
                    {(trend || subtext) && (
                        <div className={cn(
                            "text-[10px] font-black px-2 py-1 rounded-md border",
                            trendBg || subtextBg,
                            trendColor || 'text-slate-600',
                            "border-white/40 shadow-sm"
                        )}>
                            {trend || subtext}
                        </div>
                    )}
                </div>

                {/* Sub-values Breakdown (New Pro Feature) */}
                {subValues && subValues.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
                        {subValues.map((sv: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-1.5 h-1.5 rounded-full", sv.color)} />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{sv.label}</span>
                                </div>
                                <span className={cn("text-[11px] font-black tracking-tight", sv.color.replace('bg-', 'text-'))}>
                                    ₹{sv.value.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )

    if (href) {
        return <Link href={href}>{Content}</Link>
    }

    return Content
}
