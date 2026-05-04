import Link from 'next/link'
import { CalendarIcon, UsersIcon, BuildingIcon, ArrowRightIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import type { VacancyWithRelations } from '@/types'
import { VACANCY_STATUS } from '@/lib/constants'

interface VacancyCardProps {
    vacancy: VacancyWithRelations
}

export function VacancyCard({ vacancy }: VacancyCardProps) {
    const now = new Date()
    const closingDate = new Date(vacancy.closingDate)
    // Set deadline to end of day to be inclusive
    closingDate.setHours(23, 59, 59, 999)
    const isPastDeadline = now > closingDate
    const isClosed = vacancy.status === VACANCY_STATUS.CLOSED || isPastDeadline

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <CardTitle className="line-clamp-2 text-xl font-bold">
                        {vacancy.title}
                    </CardTitle>
                    <Badge variant={isClosed ? "secondary" : "default"}>
                        {isClosed ? (isPastDeadline ? 'Expired' : 'Closed') : 'Open'}
                    </Badge>
                </div>

            </CardHeader>
            <CardContent className="flex-1">
                <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        <span className={isPastDeadline ? 'text-destructive' : ''}>
                            Closing: {format(closingDate, 'MMM dd, yyyy')}
                            {isPastDeadline && ' (Expired)'}
                        </span>
                    </div>
                    {vacancy.department && (
                        <div className="ml-6 text-xs text-muted-foreground">
                            Dept: {vacancy.department.name}
                        </div>
                    )}
                    <div className="flex items-center text-muted-foreground">
                        <UsersIcon className="w-4 h-4 mr-2" />
                        <span>{vacancy.openPositions} Positions</span>
                    </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
                    {vacancy.description}
                </p>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full" variant="outline">
                    <Link href={`/vacancies/${vacancy.id}`}>
                        View Details
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
