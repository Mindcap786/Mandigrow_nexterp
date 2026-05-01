/**
 * supabaseClient.ts — Legacy Compatibility Shim
 * 
 * MandiGrow has fully migrated from Supabase to Frappe + MariaDB.
 * This file provides no-op stubs so that any remaining legacy imports
 * (e.g. `import { supabase } from '@/lib/supabaseClient'`) do not crash.
 * 
 * All real data operations go through `@/lib/frappeClient` → `callApi()`.
 */

// Detect if we're in a Capacitor native environment
export function isNative(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window as any).Capacitor?.isNativePlatform?.();
}

/**
 * Returns the correct auth redirect URL:
 * - Native app → deep link scheme mandigrow://auth/callback
 * - Web browser → standard origin-relative path
 */
function getRedirectUrl(): string {
    if (isNative()) {
        return 'mandigrow://auth/callback';
    }
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/auth/callback`;
    }
    return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`;
}

// ---------------------------------------------------------------------------
// No-op Supabase Proxy
// ---------------------------------------------------------------------------
// A recursive proxy that swallows all chained calls like:
//   supabase.from('x').select('*').eq('id', 1)
// and resolves to { data: null, error: null }.
// ---------------------------------------------------------------------------
const createDummyProxy = (): any => {
    const dummy: any = () => proxy;
    
    dummy.then = (onRes: any) => Promise.resolve(onRes({ data: null, error: null, count: 0 }));
    dummy.catch = (_onErr: any) => Promise.resolve(dummy);
    dummy.finally = (_onFin: any) => Promise.resolve(dummy);
    
    const proxy: any = new Proxy(dummy, {
        get: (target, prop) => {
            if (prop === 'then') return target.then;
            if (prop === 'catch') return target.catch;
            if (prop === 'finally') return target.finally;
            if (typeof prop === 'string' && ['on', 'subscribe', 'channel', 'removeChannel'].includes(prop)) {
                return () => proxy;
            }
            return proxy;
        }
    });
    
    return proxy;
};

export const supabase = new Proxy({} as any, {
    get: (_target, prop) => {
        if (prop === 'auth') {
            return {
                getSession: async () => ({ data: { session: null }, error: null }),
                getUser: async () => ({ data: { user: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
                signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
                signOut: async () => ({ error: null }),
            };
        }
        if (prop === 'storage') {
            return {
                from: () => ({
                    getPublicUrl: (path: string) => ({ data: { publicUrl: path } }),
                })
            };
        }
        return createDummyProxy();
    }
});

/**
 * Legacy stub for `createClient` — returns the same no-op proxy.
 * Files that used to do ``
 * have been repointed to this module.
 */
export function createClient(_url?: string, _key?: string, _options?: any) {
    return supabase;
}

/**
 * Legacy stub for `createBrowserClient` from @supabase/ssr.
 */
export function createBrowserClient(_url?: string, _key?: string, _options?: any) {
    return supabase;
}

export { getRedirectUrl as getAuthRedirectUrl };
