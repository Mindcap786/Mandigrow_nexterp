'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { callApi } from '@/lib/frappeClient';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Loader2, ArrowLeft, CheckCircle2, ShieldCheck,
    Zap, Building2, TrendingUp, Tag, X, CreditCard,
    Receipt, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PLAN_ICONS: Record<string, any> = {
    basic: Zap,
    standard: TrendingUp,
    enterprise: Building2,
};

export default function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { profile } = useAuth();
    const { toast } = useToast();

    const planId = searchParams.get('plan_id');
    const cycle = (searchParams.get('cycle') || 'monthly') as 'monthly' | 'yearly';

    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Coupon state
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponLoading, setCouponLoading] = useState(false);

    useEffect(() => {
        if (planId) fetchPlanDetails();
        else router.push('/settings/billing');
    }, [planId]);

    const fetchPlanDetails = async () => {
        setLoading(true);
        try {
            // Fetch all plans from Frappe, find the one matching planId
            const plans: any[] = await callApi('mandigrow.api.get_plans') || [];
            const found = plans.find(
                p => (p.id || p.name) === planId || p.plan_name === planId
            );
            if (!found) {
                toast({ title: 'Plan not found', variant: 'destructive' });
                router.push('/settings/billing');
                return;
            }
            setPlan(found);
        } catch (err) {
            toast({ title: 'Error loading plan', variant: 'destructive' });
            router.push('/settings/billing');
        } finally {
            setLoading(false);
        }
    };

    const validateCoupon = async () => {
        if (!couponInput.trim()) return;
        setCouponLoading(true);
        try {
            const result: any = await callApi('mandigrow.api.validate_coupon', {
                code: couponInput.trim().toUpperCase(),
                plan_name: plan?.plan_name || plan?.name
            });
            if (!result?.valid) {
                toast({ title: 'Invalid Coupon', description: result?.error || 'Code not valid.', variant: 'destructive' });
                setAppliedCoupon(null);
            } else {
                setAppliedCoupon({ ...result, code: couponInput.trim().toUpperCase() });
                setCouponInput('');
                toast({ title: '✅ Coupon Applied!', description: `Discount of ${result.discount_value}${result.discount_type === 'percentage' ? '%' : '₹'} applied.` });
            }
        } catch (err: any) {
            toast({ title: 'Error validating coupon', description: err?.message, variant: 'destructive' });
        }
        setCouponLoading(false);
    };

    const basePrice = plan ? (cycle === 'yearly' ? (plan.price_yearly || plan.price_monthly * 10) : plan.price_monthly) : 0;
    const discount = (() => {
        if (!appliedCoupon) return 0;
        if (appliedCoupon.discount_type === 'percentage') return basePrice * appliedCoupon.discount_value / 100;
        return Math.min(appliedCoupon.discount_value, basePrice);
    })();
    const finalPrice = Math.max(0, basePrice - discount);

    const handleCheckout = async () => {
        if (!profile?.organization_id || !plan) return;
        setProcessing(true);
        try {
            const planKey = plan.plan_name || plan.name;

            // The payment_confirmed=True flag tells the backend this came through checkout
            // In a real Razorpay integration, you'd first create+verify a payment order here,
            // then pass the payment reference. For now we simulate payment confirmation.
            const result: any = await callApi('mandigrow.api.change_tenant_plan', {
                plan_name: planKey,
                billing_cycle: cycle,
                payment_confirmed: true,
                coupon_code: appliedCoupon?.code || null,
            });

            if (result?.success) {
                toast({
                    title: '🎉 Plan Activated!',
                    description: `You are now on the ${plan.display_name || planKey} plan.`
                });
                router.push('/settings/billing?activated=1');
            } else {
                toast({ title: 'Activation Failed', description: result?.message || 'Please contact support.', variant: 'destructive' });
            }
        } catch (err: any) {
            toast({ title: 'Checkout Failed', description: err?.message || 'Unexpected error.', variant: 'destructive' });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
    );

    if (!plan) return null;

    const PlanIcon = PLAN_ICONS[(plan.plan_name || plan.name || '').toLowerCase()] || Zap;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 flex items-start justify-center p-6 pt-12">
            <div className="w-full max-w-lg space-y-5">
                {/* Back */}
                <button
                    onClick={() => router.push('/settings/billing')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-bold uppercase tracking-widest transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Plans
                </button>

                {/* Header */}
                <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                            <PlanIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-[1000] tracking-tighter text-slate-900 uppercase">
                                {plan.display_name || plan.plan_name}
                            </h1>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                                {cycle === 'yearly' ? 'Annual' : 'Monthly'} Subscription
                            </p>
                        </div>
                    </div>

                    {/* Price breakdown */}
                    <div className="space-y-3 border-t border-slate-100 pt-5">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500 font-bold">
                                {plan.display_name} × 1 {cycle === 'yearly' ? 'year' : 'month'}
                            </span>
                            <span className="font-black text-slate-800">₹{basePrice.toLocaleString('en-IN')}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between items-center text-emerald-600">
                                <span className="text-sm font-bold flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5" />
                                    Coupon: {appliedCoupon?.code}
                                    ({appliedCoupon?.discount_type === 'percentage'
                                        ? `${appliedCoupon?.discount_value}% off`
                                        : `₹${appliedCoupon?.discount_value} off`})
                                </span>
                                <span className="font-black">−₹{discount.toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center border-t border-dashed border-slate-200 pt-3">
                            <span className="font-black text-slate-800 uppercase tracking-wide text-sm">Total Due</span>
                            <span className="text-3xl font-[1000] tracking-tighter text-purple-700">
                                ₹{finalPrice.toLocaleString('en-IN')}
                                <span className="text-sm font-bold text-slate-400 ml-1">/{cycle === 'yearly' ? 'yr' : 'mo'}</span>
                            </span>
                        </div>
                        {cycle === 'yearly' && basePrice < (plan.price_monthly || 0) * 12 && (
                            <p className="text-xs text-emerald-600 font-bold text-right">
                                🎉 You save ₹{((plan.price_monthly * 12) - basePrice).toLocaleString('en-IN')} vs monthly
                            </p>
                        )}
                    </div>
                </div>

                {/* Coupon */}
                <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" /> Promo / Coupon Code
                    </p>
                    {appliedCoupon ? (
                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span className="font-black text-emerald-700 text-sm">{appliedCoupon.code}</span>
                                <span className="text-emerald-600 text-xs font-bold">
                                    ({appliedCoupon.discount_type === 'percentage'
                                        ? `${appliedCoupon.discount_value}% off`
                                        : `₹${appliedCoupon.discount_value} off`})
                                </span>
                            </div>
                            <button onClick={() => setAppliedCoupon(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Input
                                value={couponInput}
                                onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                onKeyDown={e => e.key === 'Enter' && validateCoupon()}
                                placeholder="Enter coupon code"
                                className="flex-1 bg-slate-50 border-slate-200 h-11 font-mono font-bold text-black rounded-xl uppercase"
                            />
                            <Button
                                onClick={validateCoupon}
                                disabled={!couponInput.trim() || couponLoading}
                                variant="outline"
                                className="h-11 px-5 rounded-xl font-black text-xs uppercase tracking-widest border-slate-300"
                            >
                                {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Confirm Button */}
                <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Secure checkout — your plan activates immediately upon confirmation</span>
                    </div>
                    <Button
                        onClick={handleCheckout}
                        disabled={processing}
                        className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white font-[1000] tracking-widest uppercase rounded-2xl shadow-md shadow-purple-100 text-sm transition-all active:scale-[0.98]"
                    >
                        {processing ? (
                            <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing…</>
                        ) : (
                            <><CreditCard className="w-5 h-5 mr-2" /> Confirm & Activate Plan — ₹{finalPrice.toLocaleString('en-IN')}</>
                        )}
                    </Button>
                    <p className="text-[10px] text-slate-400 text-center font-medium">
                        By confirming, you agree to the MandiGrow subscription terms. Plan activates immediately.
                    </p>
                </div>

                {/* Features */}
                {plan.features && Object.keys(plan.features).length > 0 && (
                    <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5" /> What's Included
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(plan.features)
                                .filter(([_, v]) => v !== false && v !== null && v !== 0)
                                .map(([k, v]) => (
                                    <div key={k} className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                        {k.replace(/_/g, ' ')}{typeof v !== 'boolean' ? `: ${v}` : ''}
                                    </div>
                                ))}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-bold mt-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            Up to {plan.max_users === -1 ? '∞' : (plan.max_users || 1)} user{plan.max_users !== 1 ? 's' : ''}
                        </div>
                    </div>
                )}

                {/* Security badge */}
                <div className="flex justify-center">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>256-bit encrypted · MandiGrow Secure Billing</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
