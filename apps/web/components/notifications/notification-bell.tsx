'use client'

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
import { Bell, Trash2, CheckCircle2, Clock, RotateCcw, Building2, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Separator } from '@/components/ui/separator'

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
                {unreadCount !== undefined && unreadCount > 0 && (
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
                return 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800'
            case 'interview_reminder':
                return 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800'
            case 'document_request':
                return 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800'
            default:
                return 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900/20 dark:border-slate-800'
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'application_status':
                return <CheckCircle2 className="h-4 w-4" />
            case 'interview_reminder':
                return <Clock className="h-4 w-4" />
            case 'document_request':
                return <Smartphone className="h-4 w-4" />
            default:
                return <Bell className="h-4 w-4" />
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md border-l-slate-200 dark:border-l-slate-800 p-0 flex flex-col">
                <SheetHeader className="p-6 border-b border-slate-100 dark:border-slate-800 text-left">
                    <div className="flex items-center justify-between pr-8">
                        <div>
                            <SheetTitle className="text-2xl font-bold tracking-tight">Notifications</SheetTitle>
                            <SheetDescription className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                {unreadNotifications.length > 0 
                                    ? `You have ${unreadNotifications.length} unread messages.` 
                                    : 'Stay updated with your application progress.'}
                            </SheetDescription>
                        </div>
                        {unreadNotifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAllAsRead()}
                                className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10 text-xs font-bold uppercase tracking-wider"
                            >
                                Mark all as read
                            </Button>
                        )}
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <p className="text-sm font-medium">Loading notifications...</p>
                        </div>
                    )}

                    {!isLoading && notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full">
                                <Bell className="h-8 w-8 opacity-20" />
                            </div>
                            <p className="text-sm font-medium">No notifications yet</p>
                        </div>
                    )}

                    {!isLoading && notifications.length > 0 && (
                        <div className="space-y-3">
                            {notifications.map((notification: any) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        'group relative p-4 rounded-2xl border transition-all duration-200',
                                        notification.read
                                            ? 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 opacity-60'
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/30 cursor-pointer',
                                    )}
                                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                                >
                                    <div className="flex gap-4">
                                        <div className={cn(
                                            "mt-0.5 h-8 w-8 rounded-xl border flex items-center justify-center shrink-0",
                                            getNotificationColor(notification.type)
                                        )}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className={cn(
                                                    "text-sm font-bold truncate",
                                                    !notification.read ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"
                                                )}>
                                                    {notification.title}
                                                </h3>
                                                {!notification.read && (
                                                    <span className="h-2 w-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-3">
                                                <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    {format(new Date(notification.createdAt), 'MMM d, HH:mm')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex gap-3">
                         <Button
                            variant="outline"
                            className="w-full h-11 rounded-xl font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                            onClick={() => onOpenChange(false)}
                        >
                            Close
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

export default NotificationCenter
