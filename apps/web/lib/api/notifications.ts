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
        apiClient.put<NotificationPreference>('/notifications/preferences', preferences)
}
