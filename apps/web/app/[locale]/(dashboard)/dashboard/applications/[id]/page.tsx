'use client'

import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeftIcon, BuildingIcon, CalendarIcon, FileTextIcon } from 'lucide-react'
import { useApplication } from '@/hooks/use-applications'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UnifiedCard } from '@/components/shared/cards/unified-card'
import { ApplicationStatusBadge } from '@/components/applications/application-status-badge'
import { RequireAuth } from '@/components/auth/require-auth'
import { Badge } from '@/components/ui/badge'

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
            <div className="container mx-auto max-w-4xl py-6 md:py-8 px-4 md:px-6 space-y-6">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        )
    }

    if (error || !applicationData?.data) {
        return (
            <div className="container mx-auto max-w-4xl py-6 md:py-8 px-4 md:px-6">
                <div className="text-center space-y-4">
                    <div className="text-red-500 font-medium">Error loading application</div>
                    <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        )
    }

    const { data: application } = applicationData

    if (!application?.vacancy) {
        return (
            <div className="container mx-auto max-w-4xl py-6 md:py-8 px-4 md:px-6">
                <div className="text-center space-y-4">
                    <div className="text-red-500 font-medium">Application data incomplete</div>
                    <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-4xl py-6 md:py-8 px-4 md:px-6 space-y-6">
            <Button variant="ghost" className="pl-0 mb-2" onClick={() => router.back()}>
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to My Applications
            </Button>

            {/* Header Section */}
            <UnifiedCard
                title={application.vacancy?.title || 'Application'}
                subtitle={(application.vacancy as any)?.department?.name}
                badge={<ApplicationStatusBadge status={application.status} />}
                metadata={
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <BuildingIcon className="h-4 w-4 text-slate-400" />
                            <span className="font-medium text-slate-600 dark:text-slate-400">
                                {application.vacancy?.advertisementNumber}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <CalendarIcon className="h-4 w-4 text-slate-400" />
                            <span>Applied: {format(new Date(application.appliedAt), 'PPP')}</span>
                        </div>
                    </div>
                }
            />

            {/* Application Details Section */}
            <UnifiedCard
                title="Application Details"
                icon={<FileTextIcon className="h-5 w-5 text-primary" />}
                contentClassName="space-y-4"
            >
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                            Status
                        </div>
                        <ApplicationStatusBadge status={application.status} />
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                            Applied On
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {format(new Date(application.appliedAt), 'PPP')}
                        </div>
                    </div>
                </div>
            </UnifiedCard>

            {/* Feedback Section - Show for rejected or reviewed applications */}
            {(application.status === 'rejected' && application.rejectionReason) ||
                (application.status === 'reviewed' && application.feedbackToApplicant) ? (
                <UnifiedCard
                    title="Feedback"
                    headerClassName="pb-3 border-b border-yellow-200 dark:border-yellow-900/30"
                    contentClassName="space-y-4 pt-4"
                    className="border-yellow-200 dark:border-yellow-900/50 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/20 dark:to-slate-900"
                >
                    {application.rejectionReason && (
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-widest text-yellow-700 dark:text-yellow-400 mb-2">
                                Rejection Reason
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {application.rejectionReason}
                            </p>
                        </div>
                    )}
                    {application.feedbackToApplicant && (
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-widest text-yellow-700 dark:text-yellow-400 mb-2">
                                Feedback
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {application.feedbackToApplicant}
                            </p>
                        </div>
                    )}
                </UnifiedCard>
            ) : null}

            {/* Additional Info Section */}
            {application.status === 'pending' && (
                <UnifiedCard
                    title="What's Next?"
                    contentClassName="space-y-3"
                    className="border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-900"
                >
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Your application is being reviewed by the hiring team. You'll receive updates on your application status via email. Check back here to see any feedback or next steps.
                    </p>
                </UnifiedCard>
            )}
        </div>
    )
}
