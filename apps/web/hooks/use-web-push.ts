import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    isSubscribedToPushNotifications,
    getPushSubscription,
    requestNotificationPermission
} from '@/lib/web-push'
import { notificationsApi } from '@/lib/api/notifications'

export function useWebPush() {
    const [isSupported, setIsSupported] = useState(false)
    const [permission, setPermission] = useState<NotificationPermission | null>(null)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        // Check if push notifications are supported
        const supported = 'serviceWorker' in navigator && 'Notification' in window && 'PushManager' in window
        setIsSupported(supported)

        if (supported) {
            // Check current permission
            setPermission(Notification.permission)

            // Check subscription status
            isSubscribedToPushNotifications().then(setIsSubscribed)

            // Register service worker
            registerServiceWorker()
        }
    }, [])

    const registerServiceWorker = async () => {
        try {
            if ('serviceWorker' in navigator) {
                await navigator.serviceWorker.register('/sw.js')
                console.log('[WebPush] Service worker registered')
            }
        } catch (error) {
            console.error('[WebPush] Failed to register service worker:', error)
        }
    }

    const subscribe = async () => {
        if (!isSupported) {
            toast.error('Push notifications are not supported in this browser')
            return
        }

        setIsLoading(true)

        try {
            // Request permission
            const result = await requestNotificationPermission()

            if (result !== 'granted') {
                toast.error('Notification permission denied. Please enable notifications in your browser settings.')
                setPermission(result)
                setIsLoading(false)
                return
            }

            setPermission('granted')

            // Subscribe
            const subscription = await subscribeToPushNotifications()

            if (subscription) {
                setIsSubscribed(true)
                toast.success('Push notifications enabled')
            } else {
                toast.error('Failed to enable push notifications')
            }
        } catch (error) {
            console.error('[WebPush] Subscription failed:', error)
            toast.error('Failed to enable push notifications')
        } finally {
            setIsLoading(false)
        }
    }

    const unsubscribe = async () => {
        setIsLoading(true)

        try {
            const subscription = await getPushSubscription()

            if (subscription) {
                await unsubscribeFromPushNotifications(subscription)
                setIsSubscribed(false)
                toast.success('Push notifications disabled')
            } else {
                setIsSubscribed(false)
            }
        } catch (error) {
            console.error('[WebPush] Unsubscription failed:', error)
            toast.error('Failed to disable push notifications')
        } finally {
            setIsLoading(false)
        }
    }

    const toggle = async () => {
        if (isSubscribed) {
            await unsubscribe()
        } else {
            await subscribe()
        }
    }

    return {
        isSupported,
        permission,
        isSubscribed,
        isLoading,
        subscribe,
        unsubscribe,
        toggle
    }
}
