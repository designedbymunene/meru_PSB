import Link from 'next/link'
import { format } from 'date-fns'
import { CalendarIcon, EyeIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ApplicationStatusBadge } from './application-status-badge'
import type { ApplicationWithRelations } from '@/types'

interface ApplicationCardProps {
    application: ApplicationWithRelations
}

export function ApplicationCard({ application }: ApplicationCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {application.vacancy.title}
                </CardTitle>
                <ApplicationStatusBadge status={application.status} />
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-end mt-2">
                    <div className="text-xs text-muted-foreground">
                        <div className="flex items-center mt-1">
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            Applied: {format(new Date(application.appliedAt), 'MMM dd, yyyy')}
                        </div>

                    </div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/applications/${application.id}`}>
                            <EyeIcon className="mr-2 h-3 w-3" />
                            View
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
