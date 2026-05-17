"use client"

import { Activity, CheckCircle, Eye, Calendar, FileText, XCircle, Mail, Shield } from "lucide-react"
import { cn, format } from "@/lib/utils"
import type { AuditLogWithRelations } from "@meru/shared"

interface ActivityItem {
    id: string
    type: 'submitted' | 'viewed' | 'reviewed' | 'shortlisted' | 'interviewed' | 'offered' | 'rejected' | 'email_sent' | 'status_update'
    title: string
    description: string
    timestamp: Date
    icon?: React.ElementType
}

interface ApplicationActivityFeedProps {
    activities?: ActivityItem[]
    auditLogs?: AuditLogWithRelations[]
    appliedAt?: Date
}

// Map audit log actions to activity types
function getActivityTypeFromAction(action: string): ActivityItem['type'] {
    switch (action) {
        case 'STATUS_UPDATE':
        case 'REVIEW_SUBMITTED':
            return 'status_update'
        case 'BULK_STATUS_UPDATE':
            return 'reviewed'
        default:
            return 'viewed'
    }
}

// Map audit log actions to display info
function getActivityInfo(action: string, newState?: any): { title: string; description: string } {
    switch (action) {
        case 'STATUS_UPDATE':
            return {
                title: 'Status Updated',
                description: `Status changed to ${newState?.status || 'updated'}`
            }
        case 'REVIEW_SUBMITTED':
            return {
                title: 'Review Submitted',
                description: 'Your application has been reviewed by the hiring team'
            }
        case 'BULK_STATUS_UPDATE':
            return {
                title: 'Status Updated',
                description: 'Application status was updated'
            }
        default:
            return {
                title: 'Activity Recorded',
                description: 'An update was made to your application'
            }
    }
}

// Convert audit logs to activity items
function auditLogsToActivities(auditLogs: AuditLogWithRelations[], appliedAt: Date): ActivityItem[] {
    // Start with the initial submission
    const activities: ActivityItem[] = [
        {
            id: 'submission',
            type: 'submitted',
            title: 'Application Submitted',
            description: 'Your application was successfully submitted',
            timestamp: appliedAt
        }
    ]

    // Add audit log activities
    for (const log of auditLogs) {
        const { title, description } = getActivityInfo(log.action, log.newState)
        activities.push({
            id: String(log.id),
            type: getActivityTypeFromAction(log.action),
            title,
            description,
            timestamp: new Date(log.createdAt)
        })
    }

    return activities
}

const activityConfig = {
    submitted: {
        icon: FileText,
        color: 'blue',
        bgColor: 'bg-blue-50 dark:bg-blue-950/30',
        borderColor: 'border-blue-200 dark:border-blue-900/50',
        textColor: 'text-blue-700 dark:text-blue-300'
    },
    viewed: {
        icon: Eye,
        color: 'purple',
        bgColor: 'bg-purple-50 dark:bg-purple-950/30',
        borderColor: 'border-purple-200 dark:border-purple-900/50',
        textColor: 'text-purple-700 dark:text-purple-300'
    },
    reviewed: {
        icon: CheckCircle,
        color: 'emerald',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
        borderColor: 'border-emerald-200 dark:border-emerald-900/50',
        textColor: 'text-emerald-700 dark:text-emerald-300'
    },
    shortlisted: {
        icon: CheckCircle,
        color: 'green',
        bgColor: 'bg-green-50 dark:bg-green-950/30',
        borderColor: 'border-green-200 dark:border-green-900/50',
        textColor: 'text-green-700 dark:text-green-300'
    },
    interviewed: {
        icon: Calendar,
        color: 'orange',
        bgColor: 'bg-orange-50 dark:bg-orange-950/30',
        borderColor: 'border-orange-200 dark:border-orange-900/50',
        textColor: 'text-orange-700 dark:text-orange-300'
    },
    offered: {
        icon: CheckCircle,
        color: 'green',
        bgColor: 'bg-green-50 dark:bg-green-950/30',
        borderColor: 'border-green-200 dark:border-green-900/50',
        textColor: 'text-green-700 dark:text-green-300'
    },
    rejected: {
        icon: XCircle,
        color: 'rose',
        bgColor: 'bg-rose-50 dark:bg-rose-950/30',
        borderColor: 'border-rose-200 dark:border-rose-900/50',
        textColor: 'text-rose-700 dark:text-rose-300'
    },
    email_sent: {
        icon: Mail,
        color: 'slate',
        bgColor: 'bg-slate-50 dark:bg-slate-900/30',
        borderColor: 'border-slate-200 dark:border-slate-800',
        textColor: 'text-slate-700 dark:text-slate-300'
    },
    status_update: {
        icon: Shield,
        color: 'amber',
        bgColor: 'bg-amber-50 dark:bg-amber-950/30',
        borderColor: 'border-amber-200 dark:border-amber-900/50',
        textColor: 'text-amber-700 dark:text-amber-300'
    }
}

export function ApplicationActivityFeed({ activities, auditLogs, appliedAt }: ApplicationActivityFeedProps) {
    // Convert audit logs to activities if provided
    let displayActivities: ActivityItem[] = []

    if (auditLogs && appliedAt) {
        displayActivities = auditLogsToActivities(auditLogs, appliedAt)
    } else if (activities) {
        displayActivities = activities
    }

    if (displayActivities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Activity className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No activity yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Activity will appear here as your application progresses
                </p>
            </div>
        )
    }

    // Sort activities by timestamp descending
    const sortedActivities = [...displayActivities].sort((a, b) =>
        b.timestamp.getTime() - a.timestamp.getTime()
    )

    return (
        <div className="space-y-4">
            {sortedActivities.map((activity, index) => {
                const config = activityConfig[activity.type]
                const Icon = activity.icon || config.icon

                return (
                    <div
                        key={activity.id}
                        className={cn(
                            "flex gap-3 p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
                            config.bgColor,
                            config.borderColor
                        )}
                    >
                        {/* Icon */}
                        <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full shrink-0",
                            config.textColor
                        )}>
                            <Icon className="h-5 w-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div>
                                    <p className={cn(
                                        "text-sm font-semibold",
                                        config.textColor
                                    )}>
                                        {activity.title}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                        {activity.description}
                                    </p>
                                </div>
                            </div>

                            {/* Timestamp */}
                            <time className="text-xs text-slate-500 dark:text-slate-500">
                                {formatRelativeTime(activity.timestamp)}
                            </time>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function formatRelativeTime(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
}
