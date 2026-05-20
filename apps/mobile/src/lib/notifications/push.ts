import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { toast } from 'sonner-native'
import { apiClient } from '@/lib/api/client'

try {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    })
} catch (error) {
    console.warn('[Notifications] Failed to set notification handler (native module may be missing in this build):', error)
}

const getProjectId = () => {
    return Constants.easConfig?.projectId
        ?? Constants.expoConfig?.extra?.eas?.projectId
        ?? Constants.expoConfig?.extra?.projectId
}

export const registerDevicePushToken = async () => {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync()
        const status = existingStatus === 'granted'
            ? existingStatus
            : (await Notifications.requestPermissionsAsync()).status

        if (status !== 'granted') {
            return { success: false, error: 'Push notification permission denied' }
        }

        const projectId = getProjectId()
        if (!projectId) {
            if (__DEV__) {
                console.warn('[Notifications] Missing Expo projectId; skipping push token registration')
            }
            return { success: false, error: 'Missing Expo projectId' }
        }

        const token = await Notifications.getExpoPushTokenAsync({ projectId })

        await apiClient.post('/account/push-token', {
            pushToken: token.data,
        })

        return { success: true, token: token.data }
    } catch (error: any) {
        console.warn('[Notifications] Push notification registration failed (native module may be missing in this build):', error?.message || error)
        return { success: false, error: error?.message || 'Push notification registration failed' }
    }
}

export const subscribeToForegroundNotifications = () => {
    try {
        return Notifications.addNotificationReceivedListener((notification) => {
            const title = notification.request.content.title || 'Notification'
            const body = notification.request.content.body || ''

            toast.info(title, body ? { description: body } : undefined)
        })
    } catch (error) {
        console.warn('[Notifications] Failed to subscribe to foreground notifications:', error)
        return { remove: () => {} } as any
    }
}
