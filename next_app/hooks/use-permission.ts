'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { hasPermission } from '@/lib/rbac/definitions'
import { MenuItem } from '@/lib/rbac/menus'

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

        if (isImpersonating) return true;

        const role = profile?.role;
        const isSuperAdmin = role === 'super_admin';
        const isMandiAdmin = role === 'tenant_admin' || role === 'owner' || role === 'admin' || role === 'company_admin';

        // 1. Admins (tenant_admin / owner) always get access to everything
        if (isMandiAdmin) return true;

        // 2. Super admin always gets access
        if (isSuperAdmin) return true;

        // 3. Module Level filtering (only for employee users)
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

        // 4. RBAC Matrix check — read directly from profile.rbac_matrix (User record)
        //    This is set by the tenant admin via Team Access > Permissions
        if (tKey) {
            const profileMatrix = (profile as any)?.rbac_matrix;
            const matrix = typeof profileMatrix === 'string'
                ? (() => { try { return JSON.parse(profileMatrix); } catch { return {}; } })()
                : (profileMatrix || {});

            // If the key is explicitly set to false, deny access
            if (matrix[tKey] === false) return false;
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
