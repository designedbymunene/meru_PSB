import { useRouter } from 'next/navigation'
import { CalendarIcon, UsersIcon, BuildingIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { UnifiedCard } from '@/components/shared/cards/unified-card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import type { VacancyWithRelations } from '@/types'
import { VACANCY_STATUS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface VacancyCardProps {
    vacancy: VacancyWithRelations
}

export function VacancyCard({ vacancy }: VacancyCardProps) {
    const router = useRouter()
    const now = new Date()
    const closingDate = new Date(vacancy.closingDate)
    closingDate.setHours(23, 59, 59, 999)
    const isPastDeadline = now > closingDate
    const isClosed = vacancy.status === VACANCY_STATUS.CLOSED || isPastDeadline

    const statusBadge = (
        <Badge variant={isClosed ? 'secondary' : 'default'}>
            {isClosed ? (isPastDeadline ? 'Expired' : 'Closed') : 'Open'}
        </Badge>
    )

    const metadata = (
        <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
                <CalendarIcon className={cn(
                    'h-3.5 w-3.5',
                    isPastDeadline ? 'text-destructive' : 'text-slate-400'
                )} />
                <span className={isPastDeadline ? 'text-destructive' : 'text-slate-600 dark:text-slate-400'}>
                    Closing: {format(closingDate, 'MMM dd, yyyy')}
                    {isPastDeadline && ' (Expired)'}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <UsersIcon className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">{vacancy.openPositions} Positions</span>
            </div>
            {vacancy.department && (
                <div className="flex items-center gap-2">
                    <BuildingIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">{vacancy.department.name}</span>
                </div>
            )}
        </div>
    )

    return (
        <UnifiedCard
            title={vacancy.title}
            subtitle={vacancy.department?.name}
            badge={statusBadge}
            metadata={metadata}
            children={
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                    {vacancy.description}
                </p>
            }
            actions={
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 rounded-lg hover:bg-primary/10 text-primary"
                    onClick={() => router.push(`/vacancies/${vacancy.id}`)}
                >
                    View Details
                </Button>
            }
            variant="inline-actions"
            onClick={() => router.push(`/vacancies/${vacancy.id}`)}
        />
    )
}
