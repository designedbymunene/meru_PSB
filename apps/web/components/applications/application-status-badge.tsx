import { Badge } from '@/components/ui/badge'
import { APPLICATION_STATUS_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'

type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'interviewing' | 'interview_scheduled' | 'interviewed' | 'accepted' | 'rejected'

interface ApplicationStatusBadgeProps {
    status: ApplicationStatus | string
    className?: string
    size?: 'default' | 'sm'
}

const statusConfig: Record<string, { label: string; colors: string }> = {
    pending: {
        label: 'Pending Review',
        colors: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    },
    reviewed: {
        label: 'Under Review',
        colors: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    },
    shortlisted: {
        label: 'Shortlisted',
        colors: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800'
    },
    interviewing: {
        label: 'Interview Scheduled',
        colors: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
    },
    interview_scheduled: {
        label: 'Interview Scheduled',
        colors: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
    },
    interviewed: {
        label: 'Interviewed',
        colors: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
    },
    accepted: {
        label: 'Accepted',
        colors: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    },
    rejected: {
        label: 'Not Successful',
        colors: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800'
    }
}

export function ApplicationStatusBadge({ status, className, size = 'default' }: ApplicationStatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.pending

    return (
        <Badge
            variant="outline"
            className={cn(
                "capitalize font-medium",
                size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1',
                config.colors,
                className
            )}
        >
            {config.label}
        </Badge>
    )
}
