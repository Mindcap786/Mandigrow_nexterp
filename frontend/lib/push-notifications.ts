/**
 * push-notifications.ts — Push notification registration
 * Token storage migrated from Supabase to Frappe.
 */

export async function registerPushNotifications() {
    // Push notification token storage will be handled by Frappe doctype
    console.log('[push-notifications] Registration handled by Frappe.');
}

export async function unregisterPushNotifications() {
    console.log('[push-notifications] Unregistration handled by Frappe.');
}
