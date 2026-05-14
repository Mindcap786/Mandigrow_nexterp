'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { callApi } from '@/lib/frappeClient';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * /settings/billing/payment-callback
 *
 * Two ways this page is reached:
 * 1. Paytm redirects the browser here after payment (our new flow with redirect mode)
 * 2. The old paytm_payment_callback Frappe route does a server-side redirect here
 *
 * In both cases we have ?order_id=MG-ORG-... in the URL.
 * We call verify_paytm_payment to confirm with Paytm's server and activate the plan.
 */
export default function PaymentCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [status, setStatus] = useState<'verifying' | 'success' | 'failed' | 'pending'>('verifying');
    const [message, setMessage] = useState('Verifying your payment with Paytm...');
    const [planName, setPlanName] = useState('');
    const [txnId, setTxnId] = useState('');

    const orderId   = searchParams.get('order_id') || searchParams.get('ORDERID') || '';
    const hasError  = searchParams.get('error') === '1';
    const paytmStatus = searchParams.get('STATUS') || '';

    useEffect(() => {
        // If Paytm sent STATUS=TXN_FAILURE in URL params, show fail immediately
        if (hasError || paytmStatus === 'TXN_FAILURE') {
            setStatus('failed');
            setMessage('Payment was not completed. Please try again.');
            return;
        }

        if (!orderId) {
            setStatus('failed');
            setMessage('Missing order ID. Cannot verify payment. Please contact support.');
            return;
        }

        verifyPayment();
    }, [orderId, hasError, paytmStatus]);

    const verifyPayment = async () => {
        setStatus('verifying');
        try {
            const res: any = await callApi('mandigrow.api.verify_paytm_payment', {
                order_id: orderId,
                paytm_response: JSON.stringify({ ORDERID: orderId }),
            });

            if (res?.success) {
                setPlanName(res.plan_name || '');
                setTxnId(res.txn_id || '');
                setStatus('success');
                setMessage(res.message || 'Payment confirmed. Your plan is now active!');
                // Auto-redirect to billing page after 3 seconds
                setTimeout(() => router.replace('/settings/billing?activated=1'), 3000);
            } else if (res?.pending) {
                setStatus('pending');
                setMessage('Your payment is still being processed by Paytm. Please wait a moment and click Verify again.');
            } else {
                setStatus('failed');
                setMessage(res?.message || 'Payment verification failed. Contact support if amount was deducted.');
            }
        } catch (err: any) {
            setStatus('failed');
            setMessage('Could not connect to verification server. If amount was deducted, contact support.');
        }
    };

    // ── Verifying ─────────────────────────────────────────────────────────────
    if (status === 'verifying') {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-black text-slate-900">Verifying Payment...</h2>
                    <p className="text-slate-500 font-bold text-sm mt-1">Please wait. Do not close or refresh this page.</p>
                </div>
                {orderId && (
                    <p className="text-xs text-slate-400 font-mono bg-slate-100 px-3 py-1 rounded-lg">
                        Order: {orderId}
                    </p>
                )}
            </div>
        );
    }

    // ── Pending ───────────────────────────────────────────────────────────────
    if (status === 'pending') {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-amber-600" />
                </div>
                <div className="text-center max-w-sm">
                    <h2 className="text-xl font-black text-slate-900">Payment Pending</h2>
                    <p className="text-slate-500 font-bold text-sm mt-2">{message}</p>
                    {orderId && <p className="text-xs text-slate-400 mt-2 font-mono">Order: {orderId}</p>}
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={verifyPayment}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl px-6"
                    >
                        Verify Again
                    </Button>
                    <Button onClick={() => router.push('/settings/billing')} variant="outline" className="rounded-xl">
                        Back to Plans
                    </Button>
                </div>
            </div>
        );
    }

    // ── Success ───────────────────────────────────────────────────────────────
    if (status === 'success') {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="text-center max-w-sm">
                    <h2 className="text-2xl font-black text-slate-900">Payment Successful! 🎉</h2>
                    <p className="text-slate-500 font-bold mt-2">{message}</p>
                    {planName && (
                        <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-black text-emerald-800 capitalize">{planName} Plan Activated</span>
                        </div>
                    )}
                    {txnId && <p className="text-xs text-slate-400 mt-2 font-mono">Txn ID: {txnId}</p>}
                    {orderId && <p className="text-xs text-slate-400 font-mono">Order: {orderId}</p>}
                    <p className="text-xs text-slate-400 mt-3">Redirecting to your dashboard in a moment...</p>
                </div>
                <Button
                    onClick={() => router.replace('/settings/billing?activated=1')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 rounded-xl"
                >
                    Go to My Subscription →
                </Button>
            </div>
        );
    }

    // ── Failed ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <div className="text-center max-w-sm">
                <h2 className="text-2xl font-black text-slate-900">Payment Failed</h2>
                <p className="text-slate-500 font-bold mt-2">{message}</p>
                {orderId && (
                    <p className="text-xs text-slate-400 mt-2">
                        If your amount was deducted, contact support with Order ID:{' '}
                        <code className="font-mono bg-slate-100 px-1 rounded">{orderId}</code>
                    </p>
                )}
            </div>
            <div className="flex gap-3">
                <Button
                    onClick={() => router.push('/settings/billing/checkout')}
                    className="bg-slate-900 text-white font-black rounded-xl"
                >
                    Try Again
                </Button>
                <Button onClick={() => router.push('/settings/billing')} variant="outline" className="rounded-xl">
                    Back to Plans
                </Button>
            </div>
        </div>
    );
}
