'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { callApi } from '@/lib/frappeClient';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * /settings/billing/payment-callback
 *
 * Paytm redirects here after payment (GET or POST).
 * We read order_id from query params, verify with backend, then show success/fail.
 */
export default function PaymentCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
    const [message, setMessage] = useState('');
    const orderId = searchParams.get('order_id') || searchParams.get('ORDERID') || '';

    useEffect(() => {
        if (!orderId) {
            setStatus('failed');
            setMessage('Missing order ID. Cannot verify payment.');
            return;
        }
        verifyPayment();
    }, [orderId]);

    const verifyPayment = async () => {
        try {
            const res: any = await callApi('mandigrow.api.verify_paytm_payment', {
                order_id: orderId,
                paytm_response: JSON.stringify({ ORDERID: orderId }),
            });

            if (res?.success) {
                setStatus('success');
                setMessage(res.message || 'Payment confirmed. Your plan is now active.');
            } else {
                setStatus('failed');
                setMessage(res?.message || 'Payment verification failed. Contact support if amount was deducted.');
            }
        } catch (err: any) {
            setStatus('failed');
            setMessage('Could not verify payment. Contact support if amount was deducted.');
        }
    };

    if (status === 'verifying') {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                <h2 className="text-xl font-black text-slate-900">Verifying your payment...</h2>
                <p className="text-slate-500 font-bold text-sm">Please wait, do not close this page.</p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-900">Payment Successful! 🎉</h2>
                    <p className="text-slate-500 font-bold mt-2 max-w-sm">{message}</p>
                    {orderId && <p className="text-xs text-slate-400 mt-1">Order ID: <code>{orderId}</code></p>}
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

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <div className="text-center max-w-md">
                <h2 className="text-2xl font-black text-slate-900">Payment Failed</h2>
                <p className="text-slate-500 font-bold mt-2">{message}</p>
                {orderId && <p className="text-xs text-slate-400 mt-1">Order ID: <code>{orderId}</code></p>}
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
