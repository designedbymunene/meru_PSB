import { apiClient } from './client'

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

export interface NotificationsResponse {
    data: Notification[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

export const notificationsApi = {
    getNotifications: (page: number, limit: number) =>
        apiClient.get<NotificationsResponse>('/notifications', { params: { page, limit } }),
    
    getUnreadCount: () =>
        apiClient.get<{ unreadCount: number }>('/notifications/unread-count'),
    
    markAsRead: (notificationId: number) =>
        apiClient.patch<Notification>(`/notifications/${notificationId}`),
    
    markAllAsRead: () =>
        apiClient.patch('/notifications/read-all'),
    
    deleteNotification: (notificationId: number) =>
        apiClient.delete(`/notifications/${notificationId}`),
    
    getPreferences: () =>
        apiClient.get<NotificationPreference>('/notifications/preferences'),
    
    updatePreferences: (preferences: Partial<Omit<NotificationPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) =>
        apiClient.put<NotificationPreference>('/notifications/preferences', preferences),

    // Web Push
    getVapidKey: () =>
        apiClient.get<{ vapidKey: string }>('/notifications/web-push/vapid-key'),

    subscribeToWebPush: (subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) =>
        apiClient.post('/notifications/web-push/subscribe', subscription),

    unsubscribeFromWebPush: (endpoint: string) =>
        apiClient.post('/notifications/web-push/unsubscribe', { endpoint }),

    getWebPushSubscriptions: () =>
        apiClient.get<{ subscriptions: any[] }>('/notifications/web-push/subscriptions'),

    // Test notifications (admin only)
    sendTestNotification: (data: {
        userId?: number
        title: string
        message: string
        type?: 'application_status' | 'interview_reminder' | 'document_request' | 'application_update' | 'general'
        data?: Record<string, any>
    }) =>
        apiClient.post('/notifications/test', data)
}
