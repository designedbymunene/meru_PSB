import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi, Notification, NotificationPreference } from '@/lib/api/notifications'
import { useState } from 'react'

export type { NotificationType, Notification, NotificationPreference } from '@/lib/api/notifications'

interface NotificationsResponse {
    data: Notification[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

export function useNotifications(page = 1, limit = 20) {
    return useQuery({
        queryKey: ['notifications', page, limit],
        queryFn: async () => {
            const response = await notificationsApi.getNotifications(page, limit)
            return response.data.data
        }
    })
}

export function useNotificationsPagination() {
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(20)
    const { data, isLoading, error } = useNotifications(page, limit)

    return {
        notifications: data || [],
        page,
        setPage,
        limit,
        setLimit,
        isLoading,
        error,
        goToPage: (p: number) => setPage(p),
        nextPage: () => setPage(prev => prev + 1),
        prevPage: () => setPage(prev => Math.max(1, prev - 1))
    }
}

export function useUnreadNotificationCount() {
    return useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: async () => {
            const response = await notificationsApi.getUnreadCount()
            return response.data.unreadCount
        },
        refetchInterval: 30000 // Poll every 30 seconds
    })
}

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (notificationId: number) => {
            const response = await notificationsApi.markAsRead(notificationId)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
        }
    })
}

export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            const response = await notificationsApi.markAllAsRead()
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
        }
    })
}

export function useDeleteNotification() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (notificationId: number) => {
            await notificationsApi.deleteNotification(notificationId)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
    })
}

export function useNotificationPreferences() {
    return useQuery({
        queryKey: ['notification-preferences'],
        queryFn: async () => {
            const response = await notificationsApi.getPreferences()
            return response.data
        }
    })
}

export function useUpdateNotificationPreferences() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (preferences: Partial<Omit<NotificationPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
            const response = await notificationsApi.updatePreferences(preferences)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
        }
    })
}
