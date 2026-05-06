'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Lock, CreditCard, AlertOctagon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

// ── Statuses that BLOCK all application access ─────────────────────────────
const BLOCKED_STATUSES = new Set(['suspended', 'expired', 'locked']);
// Status that shows a warning but still allows access (with degraded features)
const WARNING_STATUSES = new Set(['grace_period']);

export function SubscriptionEnforcer() {
    const { user, profile, subscription, loading } = useAuth();
    const [blockLevel, setBlockLevel] = useState<'none' | 'warning' | 'blocked'>('none');
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && user && profile) {
            checkAccess();
        }
    }, [user, profile, loading, pathname, subscription]);

    const checkAccess = () => {
        // Skip check for Admin Portal, Public Pages, Billing, and Suspended page
        const exemptPaths = ['/admin', '/public', '/login', '/signup', '/suspended', '/settings/billing'];
        if (exemptPaths.some(p => pathname?.startsWith(p)) || pathname === '/') return;

        // Super Admin Org (Mandi HQ) is exempt
        if (profile?.organization?.name === "Mandi HQ" || profile?.role === 'super_admin') return;

        // Use backend-computed subscription state as the SOURCE OF TRUTH
        const status = subscription?.status || profile?.organization?.status || 'active';
        const isLocked = subscription?.is_locked === true;

        if (isLocked || BLOCKED_STATUSES.has(status)) {
            setBlockLevel('blocked');
        } else if (WARNING_STATUSES.has(status)) {
            setBlockLevel('warning');
        } else {
            setBlockLevel('none');
        }
    };

    if (blockLevel === 'none') return null;

    const orgStatus = subscription?.status || profile?.organization?.status || 'unknown';
    const isSuspended = orgStatus === 'suspended';

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center text-center p-4">
            <div className="bg-[#111] border border-red-500/30 p-8 rounded-2xl max-w-md shadow-2xl animate-in fade-in zoom-in">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    {isSuspended ? (
                        <AlertOctagon className="w-8 h-8 text-red-500" />
                    ) : blockLevel === 'warning' ? (
                        <Clock className="w-8 h-8 text-amber-500" />
                    ) : (
                        <Lock className="w-8 h-8 text-red-500" />
                    )}
                </div>
                <h1 className="text-2xl font-black text-white mb-2">
                    {isSuspended ? 'ACCOUNT SUSPENDED' : blockLevel === 'warning' ? 'GRACE PERIOD ACTIVE' : 'SUBSCRIPTION EXPIRED'}
                </h1>
                <p className="text-gray-400 mb-6">
                    {isSuspended
                        ? "Your organization has been suspended by the administrator. Please contact support."
                        : blockLevel === 'warning'
                        ? "Your subscription has expired. You have a limited grace period to renew before your account is locked."
                        : "Your subscription has expired and the grace period has ended. Please renew to restore access."
                    }
                </p>
                <Button
                    className="w-full bg-neon-blue text-black font-bold h-12"
                    onClick={() => window.location.href = '/settings/billing'}
                >
                    <CreditCard className="w-4 h-4 mr-2" /> 
                    {isSuspended ? 'Contact Support' : 'Renew Now to Restore Access'}
                </Button>
                <p className="text-xs text-gray-600 mt-4">Contact support@mandigrow.com if this is an error.</p>
            </div>
        </div>
    );
}
