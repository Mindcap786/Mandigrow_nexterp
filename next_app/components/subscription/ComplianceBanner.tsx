'use client';

import { useAuth } from '@/components/auth/auth-provider';
import { useSubscription } from '@/hooks/use-subscription';
import Link from 'next/link';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function ComplianceBanner() {
    const { profile } = useAuth();
    const sub = useSubscription();

    // Super admin and no-profile: never show
    if (!profile || profile.role === 'super_admin') return null;

    if (sub.complianceStatus === 'Compliant') return null;

    const graceEnd = sub.gracePeriodEnd
        ? format(new Date(sub.gracePeriodEnd), 'dd MMM yyyy')
        : null;
        
    const limit = sub.limits?.max_users || 0;

    if (sub.complianceStatus === 'Over_Limit_Grace') {
        return (
            <div className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-semibold print:hidden bg-amber-500 text-amber-950" role="alert">
                <div className="flex items-center gap-2.5 min-w-0">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse" />
                    <span className="truncate">
                        <strong>Team Limit Exceeded:</strong> Your team exceeds the {limit} user limit for your current plan. Please deactivate users {graceEnd ? `before ${graceEnd}` : 'soon'}, or your workspace will become read-only.
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                        href="/settings/team"
                        className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all bg-white text-amber-700 hover:bg-amber-50"
                    >
                        Manage Team
                    </Link>
                </div>
            </div>
        );
    }

    if (sub.complianceStatus === 'Over_Limit_Restricted') {
        return (
            <div className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-semibold print:hidden bg-red-600 text-white" role="alert">
                <div className="flex items-center gap-2.5 min-w-0">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">
                        <strong>Workspace Restricted:</strong> Your workspace is in Read-Only mode due to exceeding the {limit} user limit.
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                        href="/settings/team"
                        className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all bg-white text-red-600 hover:bg-red-50"
                    >
                        Deactivate Users
                    </Link>
                </div>
            </div>
        );
    }

    return null;
}
