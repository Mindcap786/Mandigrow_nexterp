'use client';

import { supabase } from '@/lib/supabaseClient'; // No-op stub — all calls return null
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { callApi } from '@/lib/frappeClient'

export function ImpersonationBanner() {
    const [isImpersonating, setIsImpersonating] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { signOut } = useAuth();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const flag = localStorage.getItem('mandi_impersonation_mode');
            if (flag === 'true' && pathname !== '/login') {
                setIsImpersonating(true);
            } else {
                setIsImpersonating(false);
            }
        }
    }, [pathname]);

    const handleExit = async () => {
        localStorage.removeItem('mandi_impersonation_mode');
        localStorage.removeItem('mandi_admin_restore_session'); // Legacy cleanup
        setIsImpersonating(false);

        // Clear local cache to force fresh data load
        localStorage.removeItem('mandi_profile_cache');

        try {
            await callApi('mandigrow.api.restore_admin_context', {});
            // Hard reload to completely reset React Auth Context & Domain Context
            window.location.href = '/admin';
        } catch (e) {
            console.error("Failed to restore admin session:", e);
            window.location.href = '/admin'; // Fallback redirect
        }
    };

    if (!isImpersonating) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white px-4 py-2 flex items-center justify-between text-xs font-bold font-sans shadow-lg shadow-red-600/20">
            <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>SAFE MODE: You are impersonating a tenant. All actions are audited.</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleExit} className="h-6 text-white hover:bg-red-700 px-2 flex items-center gap-1 border border-white/20">
                <XCircle className="w-3 h-3" /> Exit Impersonation
            </Button>
        </div>
    );
}
