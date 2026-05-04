import { Badge } from '@/components/ui/badge'
import { APPLICATION_STATUS_COLORS } from '@/lib/constants'
import { ApplicationStatus } from '@/types'
import { cn } from '@/lib/utils'

interface ApplicationStatusBadgeProps {
    status: ApplicationStatus
    className?: string
}

export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
    const colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'

    return (
        <Badge
            variant="outline"
            className={cn("capitalize border-0", colorClass, className)}
        >
            Submitted
        </Badge>
    )
}
