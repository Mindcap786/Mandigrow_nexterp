"use client";

import { useState, useEffect } from "react";
import { callApi } from "@/lib/frappeClient";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, Star, Building2, RefreshCw, TrendingUp, Users, Package, Activity, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/protected-route";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const PLAN_COLORS: Record<string, string> = {
    basic: "bg-slate-100 text-slate-700 border-slate-200",
    standard: "bg-blue-50 text-blue-700 border-blue-100",
    enterprise: "bg-purple-50 text-purple-700 border-purple-100",
};

const PLAN_ICONS: Record<string, any> = {
    basic: Zap,
    standard: TrendingUp,
    enterprise: Building2,
};

// ── TYPED BILLING INTERFACES ─────────────────────────────────────────────────
interface Plan {
    id: string;
    name: string;
    display_name: string;
    price_monthly: number;
    price_yearly: number;
    description: string | null;
    features: Record<string, unknown>;
    max_total_users: number | null;
    max_web_users: number | null;
    max_users: number | null;
    is_active: boolean;
}

interface Subscription {
    id?: string;
    plan_id?: string;
    plan?: Plan;
    status: 'trial' | 'trialing' | 'active' | 'grace_period' | 'suspended' | 'expired' | 'cancelled';
    trial_ends_at: string | null;
    current_period_end: string | null;
    next_invoice_date: string | null;
    admin_assigned_by?: string;
}

interface SaasInvoice {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    period_start: string | null;
    period_end: string | null;
}

interface UsageStats {
    lots: number;
    sales: number;
    payments: number;
    storageGb: number;
}
// ─────────────────────────────────────────────────────────────────────────────

export default function SaasBillingPage() {
    const { profile } = useAuth();
    // ✅ TYPED: was `any` — now properly typed
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [invoices, setInvoices] = useState<SaasInvoice[]>([]);
    const [usage, setUsage] = useState<UsageStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [plansError, setPlansError] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    useEffect(() => {
        if (profile?.organization_id) fetchAll();
    }, [profile]);

    const fetchAll = async () => {
        setLoading(true);
        setPlansError(null);

        try {
            // ── Plans: fetched from Frappe App Plan DocType (public endpoint) ──
            const plansData: any[] = await callApi('mandigrow.api.get_plans') || [];
            const plansList: Plan[] = plansData as Plan[];
            if (plansList.length === 0) {
                setPlansError("Could not load plan information. Please retry.");
            }
            setPlans(plansList);

            // ── Subscription: derived from profile (already loaded by auth-provider) ──
            // Frappe App Plan DocType uses 'plan_name' as primary key, not 'name'
            const orgTier = profile?.organization?.subscription_tier?.toLowerCase() || 'starter';
            const matchedPlan = plansList.find(p =>
                (p.plan_name || p.name || '').toLowerCase() === orgTier
            ) || plansList.find(p =>
                (p.plan_name || p.name || '').toLowerCase() === 'starter'
            ) || plansList[0] || null;

            const subData: Subscription = {
                plan: matchedPlan || undefined,
                status: (profile?.organization?.status || 'trial') as Subscription['status'],
                trial_ends_at: profile?.organization?.trial_ends_at ?? null,
                current_period_end: null,
                next_invoice_date: null,
            };
            setSubscription(subData);

            // ── Usage: derive from profile org data (Frappe) ──
            setUsage({ lots: 0, sales: 0, payments: 0, storageGb: 0 });
            setInvoices([]);

        } catch (err) {
            console.error("Billing fetchAll error:", err);
            setPlansError("Failed to load billing information.");
        } finally {
            setLoading(false);
        }
    };


    const currentPlan = subscription?.plan;
    const status = subscription?.status || "trial";
    const isAdminAssigned = !!(subscription?.admin_assigned_by);
    const isCustomPlan = isAdminAssigned || (currentPlan?.name?.toLowerCase() === 'vip_plan');

    // Correct expiry based on subscription status
    const expiryDate = (status === 'trial' || status === 'trialing')
        ? subscription?.trial_ends_at
        : subscription?.current_period_end;
    const daysLeft = expiryDate
        ? Math.max(0, Math.round((new Date(expiryDate).getTime() - Date.now()) / 86400000))
        : null;
    const expiryDateFormatted = expiryDate ? new Date(expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

    const nextBillingDate = subscription?.next_invoice_date || subscription?.current_period_end;

    // Clean display name for admin-assigned/custom plans
    const currentPlanDisplayName = (() => {
        if (!currentPlan) return (status === 'trial' || status === 'trialing') ? 'Free Trial' : 'No Plan';
        if (isCustomPlan) return currentPlan.display_name?.replace(/^CUSTOM:\s*/i, '').replace(/_/g, ' ');
        return currentPlan.display_name;
    })();

    // User count — admin uses max_total_users as global pool
    const getUserCount = (plan: any) => {
        if (!plan) return 0;
        const total = plan.max_total_users ?? plan.max_users ?? plan.max_web_users;
        return total === -1 ? '∞' : (total || 0);
    };

    // Plan tier ordering for upgrade/downgrade comparison
    const PLAN_ORDER = ['starter', 'basic', 'standard', 'enterprise'];
    const currentTierIndex = PLAN_ORDER.indexOf(
        (currentPlan?.plan_name || currentPlan?.name || '').toLowerCase()
    );
    const getPlanAction = (plan: Plan): 'current' | 'upgrade' | 'downgrade' => {
        const planIdx = PLAN_ORDER.indexOf((plan.plan_name || plan.name || '').toLowerCase());
        if (planIdx === currentTierIndex) return 'current';
        return planIdx > currentTierIndex ? 'upgrade' : 'downgrade';
    };

    if (loading) return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        </div>
    );

    return (
        <ProtectedRoute requiredPermission="manage_settings">
            <div className="min-h-screen bg-[#F0F2F5] pb-20">
                <div className="bg-white border-b border-slate-200 px-8 py-5 shadow-sm">
                    <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-xl md:text-3xl font-[1000] tracking-tighter text-slate-800 uppercase leading-tight">Subscription & Billing</h1>
                            <p className="text-slate-400 font-bold text-xs md:text-sm mt-0.5">Manage your MandiGrow plan</p>
                        </div>
                        <Button onClick={fetchAll} variant="outline" size="icon" className="rounded-xl">
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
                    {/* Current Plan Banner */}
                    <div className={cn(
                        "rounded-[20px] md:rounded-[32px] border p-5 md:p-8 relative overflow-hidden",
                        currentPlan ? PLAN_COLORS[currentPlan.name] : "bg-slate-50 border-slate-200"
                    )}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-current rounded-full opacity-5 -mr-20 -mt-20" />
                        <div className="flex flex-col md:flex-row items-start justify-between relative z-10 gap-6 md:gap-0">
                            <div className="w-full">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    {currentPlan && (() => {
                                        const Icon = PLAN_ICONS[currentPlan.name] || Zap;
                                        return <Icon className="w-6 h-6 md:w-8 md:h-8" />;
                                    })()}
                                    <h2 className="text-2xl md:text-3xl font-[1000] tracking-tighter uppercase">
                                        {isCustomPlan && <span className="text-sm font-bold opacity-50 mr-2 normal-case">Custom:</span>}
                                        {currentPlanDisplayName}
                                    </h2>
                                    <span className={cn(
                                        "text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border",
                                        status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                                            status === "trial" ? "bg-amber-100 text-amber-700 border-amber-200" :
                                                "bg-red-100 text-red-700 border-red-200"
                                    )}>
                                        {status === "trial" ? `Trial · ${daysLeft ?? 0}d left` : status}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold opacity-70 text-sm">
                                        Up to {getUserCount(currentPlan)} {getUserCount(currentPlan) === '∞' ? 'unlimited' : ''} users
                                    </p>
                                    {status === 'active' && nextBillingDate && (
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">
                                            Next Payment: {format(new Date(nextBillingDate), "dd MMM yyyy")} ({daysLeft} days)
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="text-left md:text-right w-full md:w-auto">
                                <div className="text-3xl md:text-4xl font-[1000] tracking-tighter">
                                    ₹{(currentPlan?.price_monthly || 0).toLocaleString()}
                                    <span className="text-sm md:text-base font-bold opacity-40">/mo</span>
                                </div>
                                <p className="text-[10px] md:text-xs font-black opacity-50 mt-1 uppercase tracking-widest break-words">
                                    Annual savings available via Enterprise
                                </p>
                            </div>
                        </div>

                        {/* Feature pills */}
                        <div className="flex flex-wrap gap-2 mt-6 relative z-10">
                            {Object.entries(currentPlan?.features || {})
                                .filter(([_, v]) => v !== false && v !== null && v !== 0)
                                .map(([k, v]) => (
                                <span key={k} className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-current/10 border border-current/20">
                                    {k.replace(/_/g, " ")}{typeof v !== 'boolean' ? `: ${v}` : ''}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Usage Stats */}
                    {usage && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: "Tenant Usage", icon: Database, val: `${usage.storageGb} GB`, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
                            ].map(({ label, icon: Icon, val, color, bg }) => (
                                <div key={label} className={`${bg} rounded-[28px] border p-7 shadow-sm`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <Icon className={`w-5 h-5 ${color}`} />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                                    </div>
                                    <div className={`text-4xl font-black tracking-tighter ${color}`}>{val}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Plan Comparison */}
                    <div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 mb-6">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Available Plans</h3>
                            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 self-start md:self-auto w-full md:w-auto overflow-x-auto">
                                <button 
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-white shadow text-slate-900 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Monthly
                                </button>
                                <button 
                                    onClick={() => setBillingCycle('yearly')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'yearly' ? 'bg-white shadow text-slate-900 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Yearly (Save 20%)
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                            {plans.filter(plan => {
                                // Frappe returns plan_name as the key identifier
                                const name = (plan.plan_name || plan.name || '').toLowerCase();
                                const isCustom = name === 'vip_plan' || name === 'vip' || name.startsWith('custom_');
                                return !isCustom || plan.features?.show_on_homepage === true;
                            }).map(plan => {
                                const planKey = (plan.plan_name || plan.name || '').toLowerCase();
                                const Icon = (() => {
                                    const iconName = plan.features?.icon;
                                    if (iconName === 'Star') return Star;
                                    if (iconName === 'Building2') return Building2;
                                    if (planKey === 'enterprise') return Building2;
                                    if (planKey === 'standard') return TrendingUp;
                                    return Zap;
                                })();
                                // isCurrent: compare plan_name/name to org's subscription_tier
                                const orgTierKey = (profile?.organization?.subscription_tier || '').toLowerCase();
                                const isCurrent = planKey === orgTierKey;
                                const planAction = getPlanAction(plan);
                                const accentColor = plan.features?.accent_color;
                                const tag = plan.features?.tag as string | undefined;
                                const totalUsers = getUserCount(plan);

                                // Button logic
                                const getButtonConfig = () => {
                                    if (isCurrent && !isCustomPlan) {
                                        if (status === 'trial' || status === 'trialing') return { text: 'Activate Now', variant: 'purple' };
                                        if (status === 'grace_period' || status === 'suspended') return { text: 'Renew Now', variant: 'dark' };
                                        if (daysLeft !== null && daysLeft <= 7) return { text: 'Renew Now', variant: 'dark' };
                                        return { text: '✓ Current Plan', variant: 'muted' };
                                    }
                                    if (isCustomPlan) {
                                        return {
                                            text: expiryDateFormatted ? `Choose (from ${expiryDateFormatted})` : 'Choose Plan',
                                            variant: 'choose'
                                        };
                                    }
                                    if (planAction === 'downgrade') return { text: '↓ Downgrade', variant: 'muted' };
                                    return { text: '↑ Upgrade', variant: 'dark' };
                                };
                                const btnConfig = getButtonConfig();

                                return (
                                    <div key={plan.id} className={cn(
                                        "rounded-[28px] border shadow-sm p-6 space-y-4 relative transition-all",
                                        isCurrent && !isCustomPlan ? "ring-2 ring-purple-500 border-purple-200 bg-purple-50" : "bg-white border-slate-200 hover:border-slate-300"
                                    )}>
                                        {isCurrent && !isCustomPlan && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                                Current
                                            </div>
                                        )}
                                        {tag && (
                                            <div className="absolute -top-3 right-4 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                                {tag}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Icon className={`w-5 h-5 ${isCurrent && !isCustomPlan ? "text-purple-600" : "text-slate-400"}`} />
                                            <h4 className="font-black text-slate-800 uppercase tracking-tight">{plan.display_name}</h4>
                                        </div>
                                        <div className="text-3xl font-[1000] text-slate-900 tracking-tighter">
                                            ₹{(billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly).toLocaleString()}
                                            <span className="text-sm font-bold text-slate-400">/{billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-slate-500">
                                                {totalUsers === '∞' ? 'Unlimited users' : `${totalUsers} user${totalUsers === 1 ? '' : 's'}`}
                                            </p>
                                            {plan.description && (
                                                <p className="text-[10px] text-slate-400 leading-tight">{plan.description}</p>
                                            )}
                                        </div>
                                        <Button
                                            className={cn("w-full rounded-xl font-black text-xs uppercase tracking-widest h-10",
                                                btnConfig.variant === 'purple' ? "bg-purple-600/10 text-purple-600 hover:bg-purple-600/20" :
                                                btnConfig.variant === 'choose' ? "bg-emerald-600 text-white hover:bg-emerald-700" :
                                                btnConfig.variant === 'muted' ? "bg-slate-100 text-slate-500 hover:bg-slate-200" :
                                                "bg-slate-900 text-white hover:bg-slate-800"
                                            )}
                                            onClick={() => router.push(`/checkout?plan_id=${plan.id}&cycle=${billingCycle}${isCustomPlan && expiryDate ? `&starts_after=${encodeURIComponent(expiryDate)}` : ''}`)}
                                        >
                                            {btnConfig.text}
                                        </Button>
                                    </div>
                                );
                            })}
                            {plans.filter(p => !['vip_plan', 'vip'].includes(p.name?.toLowerCase() || '')).length === 0 && (
                                <div className="col-span-3 py-16 text-center bg-white rounded-[28px] border border-dashed border-slate-200">
                                    <div className="text-4xl mb-3">📦</div>
                                    <p className="font-black text-slate-500 uppercase tracking-widest text-xs">Plans are loading...</p>
                                    <p className="text-slate-400 text-xs mt-2">If plans don't appear, please contact your administrator to seed the plan catalogue.</p>
                                    <Button onClick={fetchAll} variant="outline" className="mt-4 rounded-xl font-black text-xs uppercase tracking-widest">
                                        <RefreshCw className="w-3 h-3 mr-2" /> Retry
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Billing History */}
                    {invoices.length > 0 && (
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6">Billing History</h3>
                            <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                        <tr>
                                            <th className="p-5">Date</th>
                                            <th className="p-5">Amount</th>
                                            <th className="p-5">Status</th>
                                            <th className="p-5">Period</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {invoices.map(inv => (
                                            <tr key={inv.id}>
                                                <td className="p-5 font-mono text-sm text-slate-500">
                                                    {format(new Date(inv.created_at), "dd MMM yyyy")}
                                                </td>
                                                <td className="p-5 font-black text-slate-800">₹{inv.amount.toLocaleString()}</td>
                                                <td className="p-5">
                                                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border",
                                                        inv.status === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                            "bg-amber-50 text-amber-600 border-amber-100"
                                                    )}>{inv.status}</span>
                                                </td>
                                                <td className="p-5 text-xs text-slate-400 font-bold">
                                                    {inv.period_start ? format(new Date(inv.period_start), "dd MMM") : "-"} →{" "}
                                                    {inv.period_end ? format(new Date(inv.period_end), "dd MMM yyyy") : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
