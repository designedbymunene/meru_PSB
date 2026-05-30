import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useUnreadNotificationCount, useMarkNotificationAsRead, useNotifications } from '@/hooks/use-notifications'
import { format } from 'date-fns'

export function NotificationCenter() {
    const [page, setPage] = useState(1)
    const { data: notifications, isLoading } = useNotifications(page)
    const { data: unreadCount } = useUnreadNotificationCount()
    const { mutate: markAsRead } = useMarkNotificationAsRead()

    const handleMarkAsRead = (notificationId: number) => {
        markAsRead(notificationId)
    }

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'application_status':
                return '#3B82F6'
            case 'interview_reminder':
                return '#10B981'
            case 'document_request':
                return '#F97316'
            default:
                return '#6B7280'
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'application_status':
                return '📋'
            case 'interview_reminder':
                return '📅'
            case 'document_request':
                return '📄'
            default:
                return '📢'
        }
    }

    return (
        <View className="flex-1 bg-white dark:bg-slate-950">
            {/* Header */}
            <View className="px-4 py-4 border-b border-slate-200 dark:border-slate-800">
                <Text className="text-2xl font-bold dark:text-white">Notifications</Text>
                {unreadCount && unreadCount > 0 && (
                    <Text className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {unreadCount} unread
                    </Text>
                )}
            </View>

            {/* Notifications List */}
            <ScrollView className="flex-1">
                {isLoading && (
                    <View className="flex-1 items-center justify-center py-8">
                        <ActivityIndicator size="large" color="#3B82F6" />
                    </View>
                )}

                {!isLoading && notifications && notifications.length === 0 && (
                    <View className="flex-1 items-center justify-center py-8">
                        <Text className="text-slate-500 dark:text-slate-400">
                            No notifications yet
                        </Text>
                    </View>
                )}

                {notifications && notifications.map(notification => (
                    <TouchableOpacity
                        key={notification.id}
                        onPress={() => !notification.read && handleMarkAsRead(notification.id)}
                        className={`border-l-4 px-4 py-4 border-b border-slate-200 dark:border-slate-800 ${
                            notification.read
                                ? 'bg-slate-50 dark:bg-slate-900'
                                : 'bg-white dark:bg-slate-800'
                        }`}
                        style={{ borderLeftColor: getNotificationColor(notification.type) }}
                    >
                        <View className="flex-row items-start">
                            <Text className="text-2xl mr-3">
                                {getNotificationIcon(notification.type)}
                            </Text>
                            <View className="flex-1">
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-base font-semibold dark:text-white flex-1">
                                        {notification.title}
                                    </Text>
                                    {!notification.read && (
                                        <View className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
                                    )}
                                </View>
                                <Text className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    {notification.message}
                                </Text>
                                <Text className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                                    {format(new Date(notification.createdAt), 'MMM d, HH:mm')}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    )
}

export default NotificationCenter
