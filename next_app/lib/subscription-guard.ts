/**
 * subscription-guard.ts — Legacy Subscription Checking
 * Migrated to Frappe. Tenant subscription is managed via Mandi Organization doctype.
 */

export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'suspended';

export function invalidateSubscriptionCache(_orgId: string) {
    // No-op: Frappe manages subscription state in the Mandi Organization doctype.
}

export async function checkSubscription(_orgId: string): Promise<{
    status: SubscriptionStatus;
    daysRemaining: number;
    planName: string;
}> {
    // Default to active — Frappe handles subscription enforcement server-side.
    return { status: 'active', daysRemaining: 365, planName: 'Enterprise' };
}
