import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { callApi } from '@/lib/frappeClient';

export async function initializePush(
  userId: string | undefined, 
  orgId: string | undefined,
  router: any
) {
  // Only run on native, not web
  if (!Capacitor.isNativePlatform()) return;
  if (!userId || !orgId) return;
  
  try {
    console.log("Configuring Capacitor Push Notifications via Frappe");
    
    // Request permission
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') {
        console.warn("Push permissions denied by user.");
        return;
    }
    
    // Register with APNs/FCM
    await PushNotifications.register();
    
    // Save token to Frappe instead of Supabase
    PushNotifications.addListener('registration', async (token) => {
        console.log("Push registration token:", token.value);
        
        try {
            await callApi('mandigrow.api.register_device_token', {
                user_id: userId,
                organization_id: orgId,
                token: token.value,
                platform: Capacitor.getPlatform(),
            });
            console.log("Device token registered with Frappe successfully.");
        } catch (error) {
            console.error('Failed to register device token with Frappe:', error);
        }
    });

    PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on push registration: ', JSON.stringify(error));
    });
    
    // Handle notification received while app is OPEN
    PushNotifications.addListener('pushNotificationReceived', 
        (notification) => {
            console.log('Push received in foreground:', notification);
        }
    );
    
    // Handle notification TAP (app was in background/closed)
    PushNotifications.addListener('pushNotificationActionPerformed',
        (action) => {
            console.log('Push action performed:', action);
            const route = action.notification.data?.route;
            if (route && router) {
                router.push(route);
            }
        }
    );

  } catch (err: any) {
    console.error("Failed to initialize push notifications", err);
  }
}

export async function registerPushNotifications() {
    console.log('[push-notifications] Managed via initializePush');
}

export async function unregisterPushNotifications() {
    console.log('[push-notifications] Managed via initializePush');
}
