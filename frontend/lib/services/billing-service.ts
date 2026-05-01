/**
 * billing-service.ts — Legacy Supabase billing service
 * Migrated to Frappe. Billing is managed via Mandi Organization doctype.
 */
import { callApi } from "@/lib/frappeClient";

export async function getBillingInfo(orgId: string) {
    try {
        const res = await callApi('mandigrow.api.get_organization', { org_id: orgId });
        return res?.message || null;
    } catch (err) {
        console.error('[billing-service] Failed to get billing info:', err);
        return null;
    }
}

export async function updateBillingInfo(_orgId: string, _data: any) {
    // Billing updates are handled via Frappe Mandi Organization doctype
    console.warn('[billing-service] updateBillingInfo: use Frappe RPC directly.');
}
