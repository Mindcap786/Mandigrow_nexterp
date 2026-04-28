/**
 * Platform detection utilities.
 * Extracted from supabaseClient.ts so we can delete that file.
 */

/** Returns true when running inside a Capacitor WebView (iOS/Android). */
export function isNative(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window as any).Capacitor?.isNativePlatform?.();
}

/**
 * Returns the correct auth redirect URL:
 * - Native app → deep link scheme mandigrow://auth/callback
 * - Web browser → standard origin-relative path
 */
export function getAuthRedirectUrl(): string {
    if (isNative()) {
        return 'mandigrow://auth/callback';
    }
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/auth/callback`;
    }
    return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`;
}
