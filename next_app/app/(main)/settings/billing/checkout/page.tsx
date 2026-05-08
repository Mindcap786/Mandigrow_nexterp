'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import BillingCheckout from './BillingCheckout';

export const dynamic = 'force-dynamic';

export default function BillingCheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        }>
            <BillingCheckout />
        </Suspense>
    );
}
