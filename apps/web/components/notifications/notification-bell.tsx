import React, { useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useUnreadNotificationCount, useMarkAllNotificationsAsRead, useNotificationsPagination, useMarkNotificationAsRead } from '@/hooks/use-notifications'
import { Bell, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export function NotificationBell() {
    const [open, setOpen] = useState(false)
    const { data: unreadCount } = useUnreadNotificationCount()

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount && unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>
            <NotificationCenter open={open} onOpenChange={setOpen} />
        </>
    )
}

interface NotificationCenterProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

function NotificationCenter({ open, onOpenChange }: NotificationCenterProps) {
    const { notifications, isLoading, page, limit } = useNotificationsPagination()
    const { mutate: markAsRead } = useMarkNotificationAsRead()
    const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead()

    const unreadNotifications = notifications.filter((n: any) => !n.read)

    const handleMarkAsRead = (notificationId: number) => {
        markAsRead(notificationId)
    }

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'application_status':
                return 'border-l-blue-500'
            case 'interview_reminder':
                return 'border-l-green-500'
            case 'document_request':
                return 'border-l-orange-500'
            default:
                return 'border-l-gray-500'
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
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-96">
                <SheetHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <SheetTitle>Notifications</SheetTitle>
                            <SheetDescription>
                                {unreadNotifications.length > 0 && `${unreadNotifications.length} unread`}
                            </SheetDescription>
                        </div>
                        {unreadNotifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAllAsRead()}
                            >
                                Mark all as read
                            </Button>
                        )}
                    </div>
                </SheetHeader>

                <div className="mt-6 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {isLoading && (
                        <div className="text-center py-8 text-sm text-slate-500">
                            Loading notifications...
                        </div>
                    )}

                    {!isLoading && notifications.length === 0 && (
                        <div className="text-center py-8 text-sm text-slate-500">
                            No notifications yet
                        </div>
                    )}

                    {notifications.map((notification: any) => (
                        <div
                            key={notification.id}
                            className={cn(
                                'p-4 border-l-4 rounded-lg transition-all',
                                getNotificationColor(notification.type),
                                notification.read
                                    ? 'bg-slate-50 dark:bg-slate-900 opacity-70'
                                    : 'bg-white dark:bg-slate-800 cursor-pointer hover:shadow-md',
                            )}
                            onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                        <h3 className="font-semibold text-sm">{notification.title}</h3>
                                        {!notification.read && (
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-2">
                                        {format(new Date(notification.createdAt), 'MMM d, HH:mm')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default NotificationCenter
