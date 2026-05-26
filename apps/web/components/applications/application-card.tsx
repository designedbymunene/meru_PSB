import { useRouter } from '@/i18n/routing'
import { format } from 'date-fns'
import { CalendarIcon, EyeIcon } from 'lucide-react'
import { UnifiedCard } from '@/components/shared/cards/unified-card'
import { Button } from '@/components/ui/button'
import { ApplicationStatusBadge } from './application-status-badge'
import type { ApplicationWithRelations } from '@/types'

interface ApplicationCardProps {
    application: ApplicationWithRelations
}

export function ApplicationCard({ application }: ApplicationCardProps) {
    const router = useRouter()

    if (!application.vacancy) {
        return null
    }

    return (
        <UnifiedCard
            title={application.vacancy.title}
            subtitle={(application.vacancy as any)?.department?.name}
            badge={<ApplicationStatusBadge status={application.status} />}
            metadata={
                <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span>Applied: {format(new Date(application.appliedAt), 'MMM dd, yyyy')}</span>
                </div>
            }
            actions={
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-primary/10"
                    onClick={() => router.push(`/dashboard/applications/${application.id}`)}
                    title="View Application"
                >
                    <EyeIcon className="h-3.5 w-3.5 text-primary" />
                </Button>
            }
            variant="hover-actions"
            onClick={() => router.push(`/dashboard/applications/${application.id}`)}
        />
    )
}
