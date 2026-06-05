import { apiClient } from './api/client'

export type WebPushSubscription = {
    endpoint: string
    keys: {
        p256dh: string
        auth: string
    }
}

/**
 * Get VAPID public key for subscription
 */
export async function getVapidPublicKey(): Promise<string> {
    const response = await apiClient.get<{ vapidKey: string }>('/notifications/web-push/vapid-key')
    return response.data.vapidKey
}

/**
 * Convert base64 string to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const buffer = new ArrayBuffer(rawData.length)
    const outputArray = new Uint8Array(buffer)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        throw new Error('This browser does not support desktop notifications')
    }

    if (Notification.permission === 'granted') {
        return 'granted'
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission()
        return permission
    }

    return Notification.permission
}

/**
 * Subscribe to web push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
    try {
        // Request permission
        const permission = await requestNotificationPermission()
        if (permission !== 'granted') {
            console.warn('[WebPush] Notification permission not granted')
            return null
        }

        // Register service worker
        if (!('serviceWorker' in navigator)) {
            throw new Error('Service workers are not supported in this browser')
        }

        const registration = await navigator.serviceWorker.ready

        // Get VAPID public key
        const vapidKey = await getVapidPublicKey()

        // Subscribe to push
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey)
        })

        // Send subscription to server
        const subscriptionData = subscription.toJSON() as WebPushSubscription
        await apiClient.post('/notifications/web-push/subscribe', subscriptionData)

        console.log('[WebPush] Successfully subscribed to push notifications')
        return subscription
    } catch (error) {
        console.error('[WebPush] Failed to subscribe to push notifications:', error)
        return null
    }
}

/**
 * Unsubscribe from web push notifications
 */
export async function unsubscribeFromPushNotifications(subscription: PushSubscription): Promise<void> {
    try {
        const subscriptionData = subscription.toJSON() as WebPushSubscription

        await apiClient.post('/notifications/web-push/unsubscribe', {
            endpoint: subscriptionData.endpoint
        })

        await subscription.unsubscribe()

        console.log('[WebPush] Successfully unsubscribed from push notifications')
    } catch (error) {
        console.error('[WebPush] Failed to unsubscribe from push notifications:', error)
        throw error
    }
}

/**
 * Check if currently subscribed to push notifications
 */
export async function isSubscribedToPushNotifications(): Promise<boolean> {
    try {
        if (!('serviceWorker' in navigator)) {
            return false
        }

        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()

        return subscription !== null
    } catch (error) {
        console.error('[WebPush] Failed to check subscription status:', error)
        return false
    }
}

/**
 * Get current push subscription
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
    try {
        if (!('serviceWorker' in navigator)) {
            return null
        }

        const registration = await navigator.serviceWorker.ready
        return await registration.pushManager.getSubscription()
    } catch (error) {
        console.error('[WebPush] Failed to get subscription:', error)
        return null
    }
}
