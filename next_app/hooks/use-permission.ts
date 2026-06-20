'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { hasPermission } from '@/lib/rbac/definitions'
import { MenuItem } from '@/lib/rbac/menus'

// Navigation keys that are always accessible (no matter the matrix)
const ALWAYS_ALLOWED = new Set(['nav.dashboard'])

// Roles that bypass RBAC matrix entirely (full access)
const ADMIN_ROLES = new Set(['tenant_admin', 'owner', 'admin', 'company_admin', 'super_admin'])

export function usePermission() {
    const { profile } = useAuth()
    const [isImpersonating, setIsImpersonating] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setIsImpersonating(localStorage.getItem('mandi_impersonation_mode') === 'true')
        setLoading(false)
    }, [profile])

    const can = (item: MenuItem | string | any): boolean => {
        const tKey = typeof item === 'string' ? item : item?.tKey;
        const menuItem = typeof item === 'string' ? null : item;

        // Impersonating admins see everything
        if (isImpersonating) return true;

        const role = profile?.role;
        const isSuperAdmin = role === 'super_admin';
        const isMandiAdmin = ADMIN_ROLES.has(role as string);

        // 1. Tenant-Level Hard Restriction (From Super Admin)
        // If the Super Admin explicitly unchecked this feature in the Tenant's Menu Access Matrix,
        // it overrides everything else and blocks access, EVEN for the Tenant Admin.
        if (tKey && !isSuperAdmin) {
            const orgMatrixRaw = (profile?.organization as any)?.rbac_matrix;
            const orgMatrix = typeof orgMatrixRaw === 'string'
                ? (() => { try { return JSON.parse(orgMatrixRaw); } catch { return null; } })()
                : (orgMatrixRaw || null);
            
            if (orgMatrix && typeof orgMatrix === 'object' && Object.keys(orgMatrix).length > 0) {
                if (orgMatrix[tKey] === false) {
                    return false; // Feature explicitly disabled by Super Admin for this tenant
                }
            }
        }

        // 2. Admins / owners / super_admin always have full access (to whatever is allowed by the tenant)
        if (isMandiAdmin || isSuperAdmin) return true;

        // 3. Dashboard is always visible
        if (tKey && ALWAYS_ALLOWED.has(tKey)) return true;

        // 4. Module Level filtering
        if (menuItem?.module && profile?.organization?.enabled_modules) {
            const enabled = profile.organization.enabled_modules;
            if (!enabled.includes(menuItem.module)) {
                if (menuItem.module === 'finance' && (enabled.includes('mandi') || enabled.includes('wholesale'))) {
                    // allow finance items even if 'finance' module not explicitly listed
                } else {
                    return false;
                }
            }
        }

        // 4. RBAC Matrix check — DENY BY DEFAULT for member-level users
        //    If rbac_matrix exists (was saved), treat absence of key as DENIED.
        //    If rbac_matrix is empty/null (legacy), fall through to role-based check.
        if (tKey) {
            const profileMatrix = (profile as any)?.rbac_matrix;
            const matrixRaw = typeof profileMatrix === 'string'
                ? (() => { try { return JSON.parse(profileMatrix); } catch { return null; } })()
                : (profileMatrix || null);

            if (matrixRaw && typeof matrixRaw === 'object' && Object.keys(matrixRaw).length > 0) {
                // Matrix has been configured — explicit deny-by-default
                // If key is not in matrix or explicitly false → DENY
                return matrixRaw[tKey] === true;
            }
            // No matrix configured → fall through to role-based check below
        }

        // 5. Role-based permission check for menu items with explicit permission requirements
        if (menuItem) {
            const permissionOk = !menuItem.permission || hasPermission(role, menuItem.permission as any);
            if (!permissionOk) return false;

            const domainOk = !menuItem.domain || profile?.business_domain === menuItem.domain;
            return domainOk;
        }

        return true;
    }

    return { can, employee: null, isImpersonating, profile, loading };
}
