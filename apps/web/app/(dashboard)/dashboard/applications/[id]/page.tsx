'use client'

import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeftIcon, BuildingIcon } from 'lucide-react'
import { useApplication } from '@/hooks/use-applications'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ApplicationStatusBadge } from '@/components/applications/application-status-badge'
import { RequireAuth } from '@/components/auth/require-auth'

export default function ApplicationDetailPage() {
    return (
        <RequireAuth allowedRoles={['applicant']}>
            <ApplicationDetailContent />
        </RequireAuth>
    )
}

function ApplicationDetailContent() {
    const params = useParams()
    const router = useRouter()
    const id = Number(params?.id)

    const { data: applicationData, isLoading, error } = useApplication(id)

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    if (error || !applicationData?.data) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-red-500">Error loading application</div>
                <Button variant="link" onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    const { data: application } = applicationData

    return (
        <div className="container mx-auto py-8 space-y-8">
            <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to My Applications
            </Button>

            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{application.vacancy.title}</h1>
                    <div className="text-muted-foreground mt-1 flex items-center gap-2">
                        <BuildingIcon className="h-4 w-4" />
                        <Badge variant="outline">{application.vacancy.advertisementNumber}</Badge>
                    </div>
                </div>
                <ApplicationStatusBadge status={application.status} className="text-lg px-4 py-1" />
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Application Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Applied On</div>
                            <div>{format(new Date(application.appliedAt), 'PPP')}</div>
                        </div>
                    </CardContent>
                </Card>

                {(application.status === 'rejected' && application.rejectionReason) ||
                    (application.status === 'reviewed' && application.feedbackToApplicant) ? (
                    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900">
                        <CardHeader>
                            <CardTitle className="text-yellow-800 dark:text-yellow-200">Feedback</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {application.rejectionReason && (
                                <div className="mb-2">
                                    <div className="font-semibold text-sm">Rejection Reason:</div>
                                    <p>{application.rejectionReason}</p>
                                </div>
                            )}
                            {application.feedbackToApplicant && (
                                <div>
                                    <div className="font-semibold text-sm">Feedback:</div>
                                    <p>{application.feedbackToApplicant}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </div>
    )
}

import { Badge } from '@/components/ui/badge'
