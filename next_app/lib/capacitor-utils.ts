import { Capacitor } from '@capacitor/core'

/**
 * Utility to check if the application should show the "Native-Feeling" UI.
 *
 * IMPORTANT: This must ONLY return true for genuine Capacitor WebView sessions.
 * Returning true for mobile web browsers (mandigrow.com on Chrome/Safari) causes
 * the `fixed inset-0` layout to activate, which breaks native browser scrolling
 * because the address bar dynamic height collapses the viewport unpredictably.
 *
 * Priority order:
 *  1. Capacitor.isNativePlatform() — definitive: we're inside a native WebView
 *  2. NEXT_PUBLIC_CAPACITOR=true  — build-time flag injected by build-mobile.sh
 *
 * REMOVED (by design — caused production scroll regression):
 *  - User Agent check (isMobileUA): Chrome on Android on mandigrow.com ≠ Capacitor
 *  - window.innerWidth < 1024: A 375px browser window is not a native app
 *
 * Mobile web users get the standard responsive layout with pb-20 bottom padding
 * to clear the MobileBottomNav. This is intentional and correct.
 */
export function isNativePlatform(): boolean {
    if (typeof window === 'undefined') return false;

    // 1. Definitive Capacitor WebView detection
    if (Capacitor.isNativePlatform()) return true;

    // 2. Build-time Capacitor flag (baked in by build-mobile.sh)
    if (process.env.NEXT_PUBLIC_CAPACITOR === 'true') return true;

    // Mobile web browsers use the standard responsive layout — NOT native layout.
    return false;
}
