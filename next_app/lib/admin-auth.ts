/**
 * admin-auth.ts — Legacy Admin Authentication
 * Migrated to Frappe. All admin auth is now handled by Frappe session + roles.
 */
import { NextRequest } from 'next/server';

export async function verifyAdminAccess(request: NextRequest, _module?: string, _permission?: string) {
    // Frappe handles admin auth via session cookies and role-based access.
    // This stub allows legacy API routes to compile without crashing.
    return {
        user: null,
        profile: null,
        supabaseAdmin: null,
        authorized: false,
        error: 'Admin auth has been migrated to Frappe. Use Frappe session-based auth.',
        status: 401,
    };
}
