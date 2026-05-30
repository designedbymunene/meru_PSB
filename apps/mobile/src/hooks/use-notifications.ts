import { useState, useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

// Set notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
})

export type NotificationType = 'application_status' | 'interview_reminder' | 'document_request' | 'application_update' | 'general'

export interface Notification {
    id: number
    userId: number
    type: NotificationType
    title: string
    message: string
    data: Record<string, any> | null
    read: boolean
    readAt: string | null
    createdAt: string
    updatedAt: string
}

export interface NotificationPreference {
    id: number
    userId: number
    statusUpdates: 'email' | 'push' | 'in_app' | 'none'
    interviewReminders: 'email' | 'push' | 'in_app' | 'none'
    documentRequests: 'email' | 'push' | 'in_app' | 'none'
    emailDigest: 'instant' | 'daily' | 'weekly' | 'none'
    createdAt: string
    updatedAt: string
}

// Hook for managing push notifications
export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>()
    const [notification, setNotification] = useState<Notifications.Notification | undefined>()
    const notificationListener = useRef<Notifications.EventSubscription>()
    const responseListener = useRef<Notifications.EventSubscription>()

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            setExpoPushToken(token)
            if (token) {
                updatePushToken(token)
            }
        })

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification)
        })

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            const { notification } = response
            const data = notification.request.content.data
            handleNotificationResponse(data)
        })

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current)
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current)
            }
        }
    }, [])

    return {
        expoPushToken,
        notification,
        sendPushNotification: async (title: string, body: string, data?: Record<string, any>) => {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data: data || {},
                    badge: 1,
                },
                trigger: null,
            })
        },
    }
}

async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) {
        console.log('Must use physical device for push notifications')
        return undefined
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!')
        return undefined
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
    
    if (!projectId) {
        console.error('Missing projectId for Expo notifications')
        return undefined
    }

    try {
        const token = await Notifications.getExpoPushTokenAsync({
            projectId,
        })
        return token.data
    } catch (e) {
        console.error('Error getting Expo push token:', e)
        return undefined
    }
}

async function updatePushToken(token: string) {
    try {
        await apiClient.patch('/users/push-token', { pushToken: token })
    } catch (error) {
        console.error('Failed to update push token:', error)
    }
}

function handleNotificationResponse(data: Record<string, any>) {
    const { applicationId, interviewId, type } = data
    if (applicationId && type === 'application_status') {
        // Navigate to application details
    } else if (interviewId && type === 'interview_reminder') {
        // Navigate to interview details
    }
}

// Hook for fetching in-app notifications
export function useNotifications(page = 1, limit = 10) {
    return useQuery({
        queryKey: ['notifications', page, limit],
        queryFn: async () => {
            const response = await apiClient.get<any>('/notifications', {
                params: { page, limit }
            })
            return response.data.data
        }
    })
}

export function useUnreadNotificationCount() {
    return useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: async () => {
            const response = await apiClient.get<{ unreadCount: number }>('/notifications/unread-count')
            return response.data.unreadCount
        },
        refetchInterval: 30000
    })
}

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (notificationId: number) => {
            const response = await apiClient.patch<Notification>(`/notifications/${notificationId}`)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
        }
    })
}

export function useNotificationPreferences() {
    return useQuery({
        queryKey: ['notification-preferences'],
        queryFn: async () => {
            const response = await apiClient.get<NotificationPreference>('/notifications/preferences')
            return response.data
        }
    })
}

export function useUpdateNotificationPreferences() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (preferences: any) => {
            const response = await apiClient.put<NotificationPreference>('/notifications/preferences', preferences)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
        }
    })
}
