/**
 * /api/mandi/_lib/server-client.ts
 *
 * Shared server client factory for all /api/mandi/* routes.
 * Migrated from Supabase to Frappe — all auth + data goes through Frappe RPC.
 */
import { NextResponse } from 'next/server'

export async function createMandiServerClient() {
    // Returns the no-op proxy. All real data calls should use callApi().
    return {}; // Frappe handles all auth via session cookies
}

/**
 * Validates the caller — stub for legacy compatibility.
 * Real auth is handled by Frappe session cookies.
 */
export async function requireAuth(_supabase: any) {
    return { user: null, profile: null, response: null }
}

/**
 * Robust role-based check for domain APIs.
 * Returns { ok: true } if allowed, or { ok: false, response: NextResponse } if blocked.
 */
export function validateRole(profile: { role?: string }, allowedRoles: string[]) {
    const role = profile?.role ?? 'authenticated';
    const extendedAllowed = Array.from(new Set(['owner', 'admin', ...allowedRoles]));
    
    if (!extendedAllowed.includes(role)) {
        return { 
            ok: false, 
            response: NextResponse.json({ 
                error: 'Insufficient permissions', 
                detail: `Role '${role}' is not authorized for this action.` 
            }, { status: 403 }) 
        };
    }
    
    return { ok: true, response: null };
}

/**
 * Standard error response helpers
 */
export const apiError = {
    unauthorized: () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    forbidden: () => NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 }),
    notFound: (resource = 'Resource') => NextResponse.json({ error: `${resource} not found` }, { status: 404 }),
    validation: (issues: unknown) => NextResponse.json({ error: 'Validation failed', issues }, { status: 422 }),
    server: (msg: string) => NextResponse.json({ error: msg }, { status: 500 }),
    conflict: (msg: string) => NextResponse.json({ error: msg }, { status: 409 }),
}

/**
 * Audit log — no-op stub. Frappe handles audit trails natively.
 */
export function auditLog(_supabase: any, _entry: any) {
    // No-op: Frappe tracks all document changes via its built-in versioning.
}
