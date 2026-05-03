'use client'

import { supabase } from '@/lib/supabaseClient'; // No-op stub — all calls return null
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { callApi, callApiGet, logout as frappeLogout } from '@/lib/frappeClient'

// Local minimal shapes — we no longer depend on @supabase/supabase-js.
interface User { id: string; email?: string }
interface Session { user: User }
import { useRouter, usePathname } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Onboarding } from '@/components/auth/onboarding'
import { cacheClear, cacheClearForSession, cacheFlushExcept, setActiveCacheUser } from '@/lib/data-cache'
import { useIdleTimeout } from '@/lib/hooks/useIdleTimeout'
import { LogOut } from 'lucide-react'
import { useLanguage } from '@/components/i18n/language-provider'
import { cn } from '@/lib/utils'


interface Profile {
    id: string
    organization_id: string
    role: string
    full_name: string | null
    business_domain: 'mandi' | 'wholesaler'
    rbac_matrix?: any
    session_version?: number
    _fetchedAt?: number
    organization: {
        id: string
        name: string
        subscription_tier: string
        status: 'trial' | 'active' | 'grace_period' | 'suspended' | 'expired'
        trial_ends_at: string | null
        is_active?: boolean
        enabled_modules?: string[]
        brand_color?: string
        brand_color_secondary?: string
        logo_url?: string
        address?: string
        city?: string
        gstin?: string
        phone?: string
        settings?: any
    }
    subscription?: {
        status: string;
        is_active: boolean;
        trial_ends_at: string | null;
        current_period_end: string | null;
        grace_ends_at: string | null;
        days_left: number | null;
        grace_period_days: number;
        show_reminder: boolean;
        org_id: string;
        org_name: string;
        subscription_tier: string;
    }
    alerts?: any[]
}

interface AuthContextType {
    session: Session | null
    user: User | null
    profile: Profile | null
    subscription: any | null
    isComplianceVisible: boolean
    loading: boolean
    signOut: (options?: { confirm?: boolean }) => Promise<void>
    refreshOrg: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    subscription: null,
    isComplianceVisible: false,
    loading: true,
    signOut: async () => { },
    refreshOrg: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    
    // INSTANT HYDRATION: Synchronously load profile from cache during first render
    const [profile, setProfile] = useState<Profile | null>(null);

    const [isComplianceVisible, setIsComplianceVisible] = useState(() => {
        if (typeof window === 'undefined') return false;
        return sessionStorage.getItem('mandi_compliance_visible') === 'true';
    })

    // ONLY show loading if we have no session AND no cached profile
    const [loading, setLoading] = useState(true);

    const [fetchingProf, setFetchingProf] = useState(false)
    const [profileNotFound, setProfileNotFound] = useState(false)

    // Track the previous user so we can flush their cache when a different user signs in
    // (shared device / multi-account scenario)
    const prevUserIdRef = useRef<string | null>(null);
    const pendingAuthRef = useRef<Promise<any> | null>(null);

    // Idle logout warning state — shown 1 minute before auto-logout fires
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [idleWarning, setIdleWarning] = useState<{ secondsLeft: number } | null>(null);

    const router = useRouter()
    const pathname = usePathname()
    const { toast } = useToast()

    // Language context is provided by parent, so this is safe to call directly
    const { t } = useLanguage()

    // Derived subscription for easy consumption
    const subscription = profile?.subscription ?? null;

    const fetchProfile = async (userId: string, isRetry = false): Promise<Profile | null> => {
        if (fetchingProf && !isRetry) return null;
        setFetchingProf(true);

        try {
            const context: any = await callApi('mandigrow.api.get_full_user_context', {
                p_user_id: userId
            });
            if (context) {
                setProfileNotFound(false);
                return context as unknown as Profile;
            }
            return null;
        } catch (err: any) {
            console.error("[Auth] Profile fetch failed:", JSON.stringify(err, null, 2));
            return null;
        } finally {
            setFetchingProf(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const initAuth = async () => {
            try {
                const loggedInUserId = await callApiGet<string>('mandigrow.api.get_logged_user');

                if (loggedInUserId && loggedInUserId !== 'Guest') {
                    const authUser = { id: loggedInUserId };
                    setUser(authUser as any);
                    setSession({ user: authUser } as any);
                    
                    setActiveCacheUser(loggedInUserId);
                    prevUserIdRef.current = loggedInUserId;

                    const freshProfile = await fetchProfile(loggedInUserId);
                    if (isMounted && freshProfile) {
                        // ── SECURITY: Invalidate cache if role changed ─────────
                        // Prevents super_admin from seeing tenant dashboard due to stale cache
                        const cachedRaw = localStorage.getItem('mandi_profile_cache');
                        if (cachedRaw) {
                            try {
                                const cached = JSON.parse(cachedRaw);
                                if (cached.role !== freshProfile.role) {
                                    console.warn('[Auth] Role mismatch detected — flushing stale cache', { cached: cached.role, fresh: freshProfile.role });
                                    cacheClearForSession();
                                }
                            } catch { /* ignore parse errors */ }
                        }
                        // ────────────────────────────────────────────────────────
                        const profileToCache = { ...freshProfile, _fetchedAt: Date.now() };
                        setProfile(profileToCache);
                        localStorage.setItem('mandi_profile_cache', JSON.stringify(profileToCache));
                        localStorage.setItem('mandi_profile_cache_org_id', freshProfile.organization_id);
                    }
                } else {
                    if (isMounted) {
                        setActiveCacheUser(null);
                        cacheClearForSession();
                        setProfile(null);
                        localStorage.removeItem('mandi_profile_cache');
                    }
                }
            } catch (err) {
                 console.error("[Auth] Fatal initialization error:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        initAuth();

        return () => {
            isMounted = false;
        };
    }, []); // Run ONLY once on mount

    const signOut = async (options?: { confirm?: boolean }) => {
        if (options?.confirm) {
            setIsLogoutModalOpen(true);
            return;
        }

        if (isLoggingOut) return;
        setIsLoggingOut(true);

        console.info('[Auth] signOut() called', { timestamp: new Date().toISOString() });

        // ATOMIC LOCAL CLEANUP: Execute local state wiping immediately
        // This ensures the user is "logged out" in their browser even if the network hangs.
        const cleanupLocalState = () => {
             console.log('[Auth] Cleaning up local session state...');
             setActiveCacheUser(null);
             prevUserIdRef.current = null;
             cacheClearForSession(); // Wipes in-memory store + localStorage cache
             
             setProfile(null);
             localStorage.removeItem('mandi_profile_cache');
             localStorage.removeItem('mandi_profile_cache_org_id');
             localStorage.removeItem('mandi_active_token');
             localStorage.removeItem('mandi_impersonation_mode');
             localStorage.removeItem('mandi_session_v');
             localStorage.removeItem('mandi_session_v_set_at');
             
             // Clear session storage if any
             sessionStorage.clear();
        };

        try {
            console.log('[Auth] Initiating sign out sequence...');
            
            // 1. Local cleanup first (priority)
            cleanupLocalState();
            
            // 2. Call Frappe logout endpoint
            await Promise.race([
                frappeLogout(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Sign-out timeout')), 2000))
            ]).catch(err => console.warn('[Auth] Server signout slow or failed:', err.message));

        } catch (err) {
            console.error('[Auth] Forced logout safety caught error:', err);
        } finally {
            console.log('[Auth] Sign out complete. Redirecting...');
            setIsLogoutModalOpen(false);
            setIsLoggingOut(false);
            
            // USE window.location.replace for a cleaner redirect that doesn't mess with history
            // and ensures no lingering React state interferes.
            window.location.replace('/login');
        }
    }

    const refreshProfile = async () => {
        if (user) {
            const fresh = await fetchProfile(user.id);
            if (fresh) setProfile({ ...fresh, _fetchedAt: Date.now() });
        }
    };

    const isPublicPath = pathname === '/login' ||
                         pathname === '/' ||
                         pathname === '/subscribe' ||
                         pathname === '/checkout' ||
                         pathname === '/join' ||
                         pathname === '/faq' ||
                         pathname === '/privacy' ||
                         pathname === '/terms' ||
                         pathname === '/contact' ||
                         pathname === '/mandi-billing' ||
                         pathname === '/commission-agent-software' ||
                         pathname === '/mandi-khata-software' ||
                         pathname === '/blog' ||
                         pathname?.startsWith('/blog/') ||
                         pathname?.startsWith('/public') ||
                         pathname?.startsWith('/auth/callback');

    // Routing and Security Enforcement
    useEffect(() => {
        if (loading) return;

        const isSuperAdmin = profile?.role === 'super_admin';
        const isLandingPath = pathname === '/login' || pathname === '/';

        if (session && profile && isLandingPath) {
            router.push(isSuperAdmin ? '/admin' : '/dashboard');
            return;
        }

        if (session && profile) {
            const isAdminPath = pathname?.startsWith('/admin');
            const isImpersonating = localStorage.getItem('mandi_impersonation_mode') === 'true';

            // ── STRICT ADMIN/TENANT ISOLATION ────────────────────────────────
            // super_admin MUST be on /admin (unless impersonating a tenant)
            // Regular user MUST NOT access /admin paths
            // This fires on EVERY navigation, not just login.
            if (isSuperAdmin && !isAdminPath && !isImpersonating && !isLandingPath) {
                console.info('[Auth] Super admin on tenant path — redirecting to /admin');
                router.replace('/admin');
                return;
            }

            if (!isSuperAdmin && isAdminPath && !isLandingPath) {
                console.warn('[Auth] Non-admin on admin path — redirecting to /dashboard');
                router.replace('/dashboard');
                return;
            }
            // ────────────────────────────────────────────────────────────────
        }

        if (!session && !profile && !isPublicPath) {
            router.push('/login');
            return;
        }

        // Subscription Enforcement — Handles Trial → Grace → Lockout flow
        if (profile && !isSuperAdmin && profile.organization?.name !== "Mandi HQ") {

            const org = profile.organization as any;
            const now = new Date();
            const trialEnd = org.trial_ends_at ? new Date(org.trial_ends_at) : null;
            const gracePeriodEnd = org.grace_period_ends_at ? new Date(org.grace_period_ends_at) : null;
            
            const isPastMainExpiry = trialEnd && now > trialEnd;
            const isPastGracePeriod = !gracePeriodEnd || now > gracePeriodEnd;

            // Trial expired — but check if we're still in grace period
            const isTrialExpired = org.status === 'trial' && isPastMainExpiry && isPastGracePeriod;
            const isManuallyExpired = org.status === 'expired' && isPastGracePeriod;

            if ((isTrialExpired || isManuallyExpired || org.is_active === false) && !isPublicPath) {
                if (org.is_active === false && pathname !== '/suspended') {
                    router.push('/suspended');
                } else if ((isTrialExpired || isManuallyExpired) && pathname !== '/admin/billing/renewal') {
                    router.push('/admin/billing/renewal');
                }
            }
        }

        // Versioning check — Forces logout if a security bump was triggered on the backend
        if (profile?.session_version !== undefined && !isPublicPath) {
             const v = localStorage.getItem('mandi_session_v');
             const currentV = v ? parseInt(v, 10) : 0;
             const remoteV = profile.session_version || 0;
             
             // DIAGNOSTIC: Log the comparison
             console.log('[Auth] Version Check:', { localV: v, currentV, remoteV, hasProfile: !!profile, pathname });
             
             // CRITICAL FIX: Only trigger logout if there's a CONFIRMED version bump
             // AND at least 5 seconds have passed since initialization (to prevent race conditions)
             if (currentV > 0 && currentV < remoteV) {
                 // This is only a logout trigger if we're SURE this is a real security bump
                 // Check: has localStorage been populated for at least 1 second?
                 const cachedAt = localStorage.getItem('mandi_session_v_set_at');
                 const now = Date.now();
                 
                 if (cachedAt) {
                    const timeSinceSet = now - parseInt(cachedAt, 10);
                    console.warn(`[Auth] Session version mismatch (local:${currentV} < remote:${remoteV}). Time since set: ${timeSinceSet}ms`);
                    
                    // Only logout if enough time has passed (prevents race condition on initial load)
                    if (timeSinceSet > 2000) {
                        console.warn(`[Auth] CONFIRMED version mismatch - logging out after ${timeSinceSet}ms`);
                        signOut();
                    } else {
                        console.log(`[Auth] Version mismatch detected but too soon - likely race condition. Skipping logout.`);
                    }
                 }
             } else if (!v && profile.session_version) {
                 // No local version found but remote has one - initialize it instead of logging out
                 localStorage.setItem('mandi_session_v', profile.session_version.toString());
                 localStorage.setItem('mandi_session_v_set_at', Date.now().toString());
                 console.log('[Auth] Initialized session_version in localStorage:', profile.session_version);
             }
        }
    }, [loading, session, profile, pathname, router, isPublicPath]);

    const showOnboarding = !loading && !!user && !profile && profileNotFound && !isPublicPath;

    // ── Idle Auto-Logout (10 minutes of zero activity) ──────────────────────
    // Only active when the user is logged in and on a protected page.
    // Any mouse move, key press, scroll, or touch resets the timer.
    useIdleTimeout({
        idleMs: 10 * 60 * 1000,   // 10 minutes
        warningMs: 60 * 1000,      // show warning 1 minute before logout
        enabled: !!session && !loading && !isPublicPath,
        onWarning: (secondsLeft) => {
            setIdleWarning({ secondsLeft });
        },
        onReset: () => {
            setIdleWarning(null);
        },
        onTimeout: () => {
            setIdleWarning(null);
            toast({
                title: 'Session Expired',
                description: 'You were automatically signed out due to inactivity.',
                duration: 5000,
            });
            signOut();
        },
    });
    // ────────────────────────────────────────────────────────────────────────

    return (
        <AuthContext.Provider value={{ session, user, profile, subscription, isComplianceVisible, loading, signOut, refreshOrg: refreshProfile }}>
            {showOnboarding ? <Onboarding onComplete={refreshProfile} /> : children}

            {/* ── Logout Confirmation Modal ────────────────────────────────── */}
            {isLogoutModalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                >
                    <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="h-1.5 bg-red-500 w-full" />
                        <div className="p-8">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <LogOut className={cn("w-8 h-8 text-red-500", isLoggingOut && "animate-pulse")} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 text-center mb-2">
                                {isLoggingOut ? t('common.signing_out') : t('common.logout') + '?'}
                            </h3>
                            <p className="text-gray-500 text-center text-sm leading-relaxed mb-8">
                                {isLoggingOut 
                                    ? t('common.please_wait_signing_out') 
                                    : "Are you sure you want to end your current session? You will need to sign in again to access your dashboard."
                                }
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => signOut()}
                                    disabled={isLoggingOut}
                                    className="w-full h-14 bg-red-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200 disabled:opacity-50"
                                >
                                    {isLoggingOut ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>{t('common.processing')}...</span>
                                        </>
                                    ) : (
                                        "Yes, Log Me Out"
                                    )}
                                </button>
                                
                                <button
                                    onClick={() => setIsLogoutModalOpen(false)}
                                    disabled={isLoggingOut}
                                    className="w-full h-14 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* ─────────────────────────────────────────────────────────────── */}

            {/* ── Idle Timeout Warning Modal ───────────────────────────────── */}
            {/* Shown 1 minute before auto-logout. User can dismiss by clicking  */}
            {/* 'Stay Logged In' which resets the idle timer via activity event. */}
            {idleWarning && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Session expiry warning"
                    className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
                >
                    <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        {/* Countdown bar */}
                        <div
                            className="h-1.5 bg-amber-400 transition-all duration-1000"
                            style={{ width: `${(idleWarning.secondsLeft / 60) * 100}%` }}
                        />
                        <div className="p-6">
                            <div className="flex items-start gap-4 mb-5">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 text-base">Are you still there?</p>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        You'll be signed out in{' '}
                                        <span className="font-bold text-amber-600 tabular-nums">
                                            {idleWarning.secondsLeft}s
                                        </span>
                                        {' '}due to inactivity.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    id="idle-stay-logged-in"
                                    onClick={() => setIdleWarning(null)}
                                    className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-700 transition-colors active:scale-95"
                                >
                                    Stay Logged In
                                </button>
                                <button
                                    id="idle-sign-out-now"
                                    onClick={() => { setIdleWarning(null); signOut(); }}
                                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors active:scale-95"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* ─────────────────────────────────────────────────────────────── */}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
