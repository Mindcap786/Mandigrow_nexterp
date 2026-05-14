'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { callApi } from '@/lib/frappeClient';
import { useAuth } from '@/components/auth/auth-provider';
import {
    ArrowLeft, ShieldCheck, Loader2, AlertCircle,
    CheckCircle2, XCircle, Clock, CreditCard,
    Ticket, Check, Zap, Building2, TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Plan {
    id: string;
    name: string;
    plan_name: string;
    display_name: string;
    price_monthly: number;
    price_yearly: number;
    max_users: number | null;
    max_total_users: number | null;
    features: Record<string, unknown>;
    description: string | null;
}

interface PaytmOrderResult {
    success: boolean;
    order_id: string;
    txn_token: string;
    amount: string;
    merchant_id: string;
    is_staging: boolean;
    error?: string;
}

type PaymentState = 'idle' | 'creating_order' | 'redirecting' | 'verifying' | 'success' | 'failed';

// ─── Paytm Redirect (no JS SDK — no CSP issues) ───────────────────────────────
function redirectToPaytm(order: PaytmOrderResult, callbackUrl: string) {
    const baseUrl = order.is_staging
        ? 'https://securestage.paytmpayments.com'
        : 'https://secure.paytmpayments.com';

    // Build a hidden form and POST to Paytm's hosted payment page
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${baseUrl}/theia/api/v1/showPaymentPage?mid=${order.merchant_id}&orderId=${order.order_id}`;

    const fields: Record<string, string> = {
        mid: order.merchant_id,
        orderId: order.order_id,
        txnToken: order.txn_token,
        amount: order.amount,
        callbackUrl,
    };

    Object.entries(fields).forEach(([key, val]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = val;
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BillingCheckout() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { profile } = useAuth();
    const { toast } = useToast();

    const planId = searchParams.get('plan_id') || '';
    const cycle = (searchParams.get('cycle') || 'monthly') as 'monthly' | 'yearly';
    const searchActivated = searchParams.get('activated');

    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<Plan | null>(null);
    const [allPlans, setAllPlans] = useState<Plan[]>([]);
    const [couponCode, setCouponCode] = useState('');
    const [couponStatus, setCouponStatus] = useState<any>(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [paymentState, setPaymentState] = useState<PaymentState>('idle');
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);

    // Show success if redirected back from Paytm
    useEffect(() => {
        if (searchActivated === '1') {
            setPaymentState('success');
        }
    }, [searchActivated]);

    // Load plan data from Frappe
    useEffect(() => {
        if (profile) fetchPlan();
    }, [profile, planId]);

    const fetchPlan = async () => {
        setLoading(true);
        try {
            const res: any = await callApi('mandigrow.api.get_tenant_subscription');
            const plans: Plan[] = res?.all_plans || [];
            setAllPlans(plans);

            const matched = plans.find(
                (p) =>
                    (p.plan_name || '').toLowerCase() === planId.toLowerCase() ||
                    (p.name || '').toLowerCase() === planId.toLowerCase()
            );

            if (!matched) {
                toast({ title: 'Plan not found', description: `Plan "${planId}" does not exist.`, variant: 'destructive' });
                router.push('/settings/billing');
                return;
            }
            setPlan(matched);
        } catch (err) {
            toast({ title: 'Error', description: 'Could not load plan details.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    // ── Price calculation ──────────────────────────────────────────────────────
    const basePrice = plan ? (cycle === 'yearly' ? plan.price_yearly : plan.price_monthly) : 0;
    const discount = couponStatus?.isValid
        ? couponStatus.type === 'percentage'
            ? Math.floor((basePrice * couponStatus.amount) / 100)
            : (couponStatus.amount || 0)
        : 0;
    const finalPrice = Math.max(0, basePrice - discount);

    // ── Coupon validation ─────────────────────────────────────────────────────
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        try {
            const res: any = await callApi('mandigrow.api.validate_coupon_code', {
                code: couponCode.trim().toUpperCase(),
                plan_name: plan?.name || planId,
            });
            if (res?.valid) {
                setCouponStatus({
                    isValid: true,
                    type: res.discount_type || 'percentage',
                    amount: res.discount_value || 0,
                    message: res.message || 'Discount applied',
                });
                toast({ title: '✅ Coupon Applied', description: res.message });
            } else {
                setCouponStatus(null);
                toast({ title: 'Invalid Coupon', description: res?.error || 'Coupon not valid.', variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Error', description: 'Could not validate coupon.', variant: 'destructive' });
        } finally {
            setCouponLoading(false);
        }
    };

    // ── Paytm Redirect Payment Flow ───────────────────────────────────────────
    // Uses Paytm's hosted payment page — NO JS SDK, NO CSP issues
    const handlePaytmPayment = async () => {
        if (!plan || !profile) return;
        setPaymentState('creating_order');
        setPaymentError(null);

        try {
            // Step 1: Create order on backend
            const orderRes: PaytmOrderResult = await callApi('mandigrow.api.create_paytm_order', {
                plan_name: plan.plan_name || plan.name,
                billing_cycle: cycle,
                coupon_code: couponStatus?.isValid ? couponCode.trim().toUpperCase() : null,
            }) as PaytmOrderResult;

            if (!orderRes?.success) {
                throw new Error(orderRes?.error || 'Failed to create payment order');
            }

            setOrderId(orderRes.order_id);
            setPaymentState('redirecting');

            // Step 2: Redirect to Paytm's hosted payment page (NO JS SDK needed)
            // Paytm will redirect back to /settings/billing/payment-callback after payment
            const callbackUrl = `${window.location.origin}/settings/billing/payment-callback?order_id=${orderRes.order_id}`;
            redirectToPaytm(orderRes, callbackUrl);

        } catch (err: any) {
            setPaymentState('failed');
            setPaymentError(err.message || 'Payment initiation failed.');
            toast({ title: 'Payment Error', description: err.message, variant: 'destructive' });
        }
    };

    // ── Free plan activation ──────────────────────────────────────────────────
    const handleAdminActivate = async () => {
        if (finalPrice > 0) {
            toast({ title: 'Payment Required', description: 'Please complete payment to activate this plan.', variant: 'destructive' });
            return;
        }
        setPaymentState('verifying');
        try {
            const res: any = await callApi('mandigrow.api.change_tenant_plan', {
                plan_name: plan?.plan_name || plan?.name || planId,
                billing_cycle: cycle,
                payment_confirmed: true,
                coupon_code: couponStatus?.isValid ? couponCode : null,
            });
            if (res?.success) {
                setPaymentState('success');
                toast({ title: '✅ Plan Activated', description: res.message });
                setTimeout(() => router.push('/settings/billing?activated=1'), 1500);
            } else {
                setPaymentState('failed');
                setPaymentError(res?.message || 'Activation failed.');
            }
        } catch (err: any) {
            setPaymentState('failed');
            setPaymentError(err.message);
        }
    };

    // ── Plan icon helper ──────────────────────────────────────────────────────
    const PlanIcon = (() => {
        const name = (plan?.plan_name || plan?.name || '').toLowerCase();
        if (name === 'enterprise') return Building2;
        if (name === 'professional' || name === 'standard') return TrendingUp;
        return Zap;
    })();

    const getUserCount = (p: Plan | null) => {
        if (!p) return 0;
        const total = p.max_total_users ?? p.max_users;
        return total === -1 ? '∞' : (total || 0);
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <p className="font-black text-slate-600">Plan not found</p>
                <Button onClick={() => router.push('/settings/billing')} variant="outline">← Back to Plans</Button>
            </div>
        );
    }

    // ── Success state ─────────────────────────────────────────────────────────
    if (paymentState === 'success') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment Confirmed!</h2>
                    <p className="text-slate-500 font-bold mt-1">
                        You are now on the <strong>{plan.display_name}</strong> plan.
                    </p>
                </div>
                <Button
                    onClick={() => router.push('/settings/billing')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 rounded-xl"
                >
                    View My Subscription →
                </Button>
            </div>
        );
    }

    // ── Failed state ──────────────────────────────────────────────────────────
    if (paymentState === 'failed') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment Failed</h2>
                    <p className="text-slate-500 font-bold mt-1">{paymentError || 'Something went wrong. Please try again.'}</p>
                    <p className="text-xs text-slate-400 mt-2">If your amount was deducted, contact support with Order ID: <code className="font-mono">{orderId}</code></p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => { setPaymentState('idle'); setPaymentError(null); }} className="bg-slate-900 text-white font-black rounded-xl">
                        Try Again
                    </Button>
                    <Button onClick={() => router.push('/settings/billing')} variant="outline" className="rounded-xl">
                        Back to Plans
                    </Button>
                </div>
            </div>
        );
    }

    // ── Redirecting state ─────────────────────────────────────────────────────
    if (paymentState === 'redirecting') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                <h2 className="text-xl font-black text-slate-900">Redirecting to Paytm...</h2>
                <p className="text-slate-500 font-bold text-sm text-center">
                    You will be redirected to Paytm's secure payment page.<br />
                    Please do not close this tab.
                </p>
            </div>
        );
    }

    // ── Main checkout UI ──────────────────────────────────────────────────────
    const isProcessing = paymentState === 'creating_order' || paymentState === 'redirecting' || paymentState === 'verifying';
    const isFree = finalPrice === 0;

    return (
        <div className="min-h-screen bg-[#F0F2F5] pb-20">
            {/* Page Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => router.push('/settings/billing')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Plans
                    </button>
                    <div className="flex-1 h-px bg-slate-200" />
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Checkout
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                {/* ── Plan Summary ─────────────────────────────────────────── */}
                <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-black text-slate-800 uppercase tracking-tight text-lg">Order Summary</h2>
                        <Button
                            variant="ghost"
                            className="text-xs font-black text-purple-600 hover:bg-purple-50 rounded-xl"
                            onClick={() => router.push('/settings/billing')}
                        >
                            Change Plan
                        </Button>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <PlanIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-black text-slate-900 uppercase tracking-tight">{plan.display_name}</p>
                            <p className="text-xs font-bold text-slate-400 mt-0.5">
                                {getUserCount(plan)} user{getUserCount(plan) === '∞' ? 's (unlimited)' : 's'} · {cycle === 'yearly' ? 'Annual' : 'Monthly'} subscription
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-slate-900 text-xl">
                                ₹{basePrice.toLocaleString()}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/{cycle === 'yearly' ? 'year' : 'month'}</p>
                        </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-slate-500">{plan.display_name} × 1 {cycle === 'yearly' ? 'year' : 'month'}</span>
                            <span className="font-black text-slate-800">₹{basePrice.toLocaleString()}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm text-emerald-600">
                                <span className="font-bold flex items-center gap-1">
                                    <Ticket className="w-3 h-3" /> Coupon Discount
                                </span>
                                <span className="font-black">−₹{discount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="border-t border-slate-100 pt-2 flex justify-between">
                            <span className="font-black text-slate-800">Total Due</span>
                            <span className="font-black text-xl text-slate-900">
                                ₹{finalPrice.toLocaleString()}
                                <span className="text-xs font-bold text-slate-400">/{cycle === 'yearly' ? 'yr' : 'mo'}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Coupon Code ───────────────────────────────────────────── */}
                <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Ticket className="w-4 h-4 text-blue-500" />
                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Promo / Coupon Code</h3>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => {
                                setCouponCode(e.target.value.toUpperCase());
                                if (couponStatus) setCouponStatus(null);
                            }}
                            className="rounded-xl border-slate-200 font-bold placeholder:text-slate-300 flex-1"
                            disabled={isProcessing}
                        />
                        <Button
                            onClick={handleApplyCoupon}
                            disabled={couponLoading || !couponCode.trim() || isProcessing}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl px-6"
                        >
                            {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                        </Button>
                    </div>
                    {couponStatus?.isValid && (
                        <div className="mt-3 flex items-center gap-2 text-emerald-600 bg-emerald-50 rounded-xl px-4 py-2 border border-emerald-100">
                            <Check className="w-4 h-4" />
                            <span className="text-xs font-black">{couponStatus.message}</span>
                        </div>
                    )}
                </div>

                {/* ── Payment Method ────────────────────────────────────────── */}
                {!isFree && (
                    <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <CreditCard className="w-4 h-4 text-purple-500" />
                            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Payment Method</h3>
                        </div>

                        <div className="p-4 rounded-2xl border-2 border-purple-400 bg-purple-50/30 flex items-center gap-4">
                            <div className="w-5 h-5 rounded-full border-2 border-purple-500 bg-purple-500 flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-slate-900">Paytm</p>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                    UPI · Cards · Net Banking · Wallets
                                </p>
                            </div>
                            <Badge className="bg-purple-100 text-purple-700 border-none text-[9px] font-black uppercase tracking-widest">
                                Recommended
                            </Badge>
                        </div>

                        <p className="text-[11px] text-slate-400 font-bold mt-3 flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            256-bit SSL encrypted · PCI-DSS compliant · Powered by Paytm
                        </p>
                    </div>
                )}

                {/* ── CTA Button ────────────────────────────────────────────── */}
                <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-3">
                    {!isFree ? (
                        <Button
                            onClick={handlePaytmPayment}
                            disabled={isProcessing}
                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-black text-base shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98]"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    {paymentState === 'creating_order' ? 'Preparing Order...' : 'Redirecting to Paytm...'}
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-5 h-5 mr-2" />
                                    Pay ₹{finalPrice.toLocaleString()} via Paytm
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleAdminActivate}
                            disabled={isProcessing}
                            className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base"
                        >
                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                            Confirm & Activate Plan — ₹{finalPrice.toLocaleString()}
                        </Button>
                    )}

                    <p className="text-center text-[11px] text-slate-400 font-bold">
                        By paying, you agree to our <a href="/terms" target="_blank" className="underline hover:text-purple-600">Terms</a>, <a href="/privacy" target="_blank" className="underline hover:text-purple-600">Privacy Policy</a>, and <a href="/refund-policy" target="_blank" className="underline hover:text-purple-600">Refund Policy</a>.
                        {!isFree && ' Plan activates immediately upon payment confirmation.'}
                    </p>

                    {Object.keys(plan.features || {}).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">What's Included</p>
                            <div className="grid grid-cols-2 gap-1.5">
                                {Object.entries(plan.features)
                                    .filter(([_, v]) => v !== false && v !== null && v !== 0)
                                    .slice(0, 8)
                                    .map(([k]) => (
                                        <div key={k} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                            {k.replace(/_/g, ' ')}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Redirecting info */}
                {paymentState === 'redirecting' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div>
                            <p className="font-black text-amber-900 text-sm">Redirecting to Paytm...</p>
                            <p className="text-xs font-bold text-amber-700">Complete your payment on Paytm's secure page. Do not close this tab.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
