import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@/lib/supabaseClient'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

/**
 * Safe mock for createClient that prevents crashes during Frappe migration.
 */
export function createClient(url?: string, key?: string, options?: any) {
    if (!url || !key) return supabase;
    return supabase; // Always return proxy for now
}

// Detect if we're in a Capacitor native environment
// This check works at runtime in the WebView
export function isNative(): boolean {
    if (typeof window === 'undefined') return false
    // Capacitor sets this globally on the window object
    return !!(window as any).Capacitor?.isNativePlatform?.()
}

/**
 * Returns the correct auth redirect URL:
 * - Native app → deep link scheme mandigrow://auth/callback
 * - Web browser → standard origin-relative path
 */
function getRedirectUrl(): string {
    if (isNative()) {
        return 'mandigrow://auth/callback'
    }
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/auth/callback`
    }
    return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
}

// Supabase client initialization (Neutralized for Frappe Migration)
// We use a Recursive Proxy to gracefully handle any remaining calls to supabase.* without crashing.
// It is "thenable" so that 'await supabase.from().select()' won't crash.
const createDummyProxy = (): any => {
    const dummy: any = () => proxy;
    
    dummy.then = (onRes: any) => Promise.resolve(onRes({ data: null, error: null, count: 0 }));
    dummy.catch = (onErr: any) => Promise.resolve(dummy);
    dummy.finally = (onFin: any) => Promise.resolve(dummy);
    
    const proxy: any = new Proxy(dummy, {
        get: (target, prop) => {
            if (prop === 'then') return target.then;
            if (prop === 'catch') return target.catch;
            if (prop === 'finally') return target.finally;
            if (typeof prop === 'string' && ['on', 'subscribe', 'channel', 'removeChannel'].includes(prop)) {
                return () => proxy;
            }
            // Return proxy for everything else to allow chaining like .from().select().eq()...
            return proxy;
        }
    });
    
    return proxy;
};

export const supabase = new Proxy({} as any, {
    get: (target, prop) => {
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
 * Export redirect URL helper so login pages can pass it per auth call:
 * supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: getAuthRedirectUrl() } })
 */
export { getRedirectUrl as getAuthRedirectUrl }

