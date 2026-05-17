'use client'

import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeftIcon, BuildingIcon, CalendarIcon, FileTextIcon, ListTodoIcon, MapPinIcon, UsersIcon, BriefcaseIcon, Calendar as CalendarIcon2, Bell, BookOpen, Download } from 'lucide-react'
import { useApplication } from '@/hooks/use-applications'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UnifiedCard } from '@/components/shared/cards/unified-card'
import { ApplicationStatusBadge } from '@/components/applications/application-status-badge'
import { ApplicationTimelineEnhanced } from '@/components/applications/application-timeline-enhanced'
import { ApplicationActivityFeed } from '@/components/applications/application-activity-feed'
import { ApplicationQuickActions } from '@/components/applications/application-quick-actions'
import { RequireAuth } from '@/components/auth/require-auth'
import { cn } from '@/lib/utils'
import { useState } from 'react'

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
    const [showMobileSidebar, setShowMobileSidebar] = useState(false)

    const { data: applicationData, isLoading, error } = useApplication(id)

    // Use real audit logs from the backend
    const activities = applicationData?.data
        ? (applicationData.data.auditLogs || [])
        : []

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="w-full px-8 md:px-12 lg:px-16 py-6 md:py-8">
                    <div className="w-full space-y-6">
                        <Skeleton className="h-10 w-32" />
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2 space-y-6">
                                <Skeleton className="h-64 w-full" />
                                <Skeleton className="h-48 w-full" />
                            </div>
                            <div className="space-y-6">
                                <Skeleton className="h-48 w-full" />
                                <Skeleton className="h-32 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !applicationData?.data) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center w-full px-8 md:px-12 lg:px-16">
                <div className="text-center space-y-4 max-w-md">
                    <div className="text-red-500 font-medium text-lg">Error loading application</div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        We couldn't load your application details. Please try again.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
                        <Button onClick={() => window.location.reload()}>Try Again</Button>
                    </div>
                </div>
            </div>
        )
    }

    const { data: application } = applicationData

    if (!application?.vacancy) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center w-full px-8 md:px-12 lg:px-16">
                <div className="text-center space-y-4 max-w-md">
                    <div className="text-red-500 font-medium text-lg">Application data incomplete</div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        The application data could not be loaded properly.
                    </p>
                    <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
                <div className="w-full px-8 md:px-12 lg:px-16 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
                                <ArrowLeftIcon className="h-4 w-4" />
                                Back
                            </Button>
                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate max-w-md">
                                    {application.vacancy?.title}
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {(application.vacancy as any)?.department?.name}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <ApplicationStatusBadge status={application.status} />
                            <ApplicationQuickActions
                                applicationId={application.id.toString()}
                                vacancyTitle={application.vacancy?.title}
                                onShare={() => console.log('Shared')}
                                onDownload={() => console.log('Downloaded')}
                                onPrint={() => console.log('Printed')}
                                onContactSupport={() => console.log('Contact support')}
                                onGetHelp={() => console.log('Get help')}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full px-8 md:px-12 lg:px-16 py-6 md:py-8">
                <div className="w-full grid gap-6 lg:grid-cols-2">

                    {/* Mobile Sidebar Toggle */}
                    <button
                        onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
                    >
                        <ListTodoIcon className="h-6 w-6" />
                        {showMobileSidebar ? (
                            <ArrowLeftIcon className="h-5 w-5" />
                        ) : (
                            <span className="text-sm font-medium">Details</span>
                        )}
                    </button>

                    {/* Left Column - Main Content */}
                    <div className={cn(
                        "lg:col-span-1 space-y-6 transition-all duration-300",
                        showMobileSidebar && "hidden lg:block"
                    )}>

                        {/* Position Overview Card */}
                        <UnifiedCard
                            title={application.vacancy?.title || 'Application'}
                            subtitle={(application.vacancy as any)?.department?.name}
                            contentClassName="pt-6"
                        >
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                                        <BuildingIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Reference</div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                                            {application.vacancy?.advertisementNumber || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
                                        <MapPinIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Location</div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                                            {(application.vacancy as any)?.location || 'TBD'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                                        <BriefcaseIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Type</div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                                            {(application.vacancy as any)?.employmentType || 'Full-time'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                                        <CalendarIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Applied</div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                                            {format(new Date(application.appliedAt), 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </UnifiedCard>

                        {/* Activity Feed */}
                        <UnifiedCard
                            title="Activity History"
                            subtitle="See all updates and changes to your application"
                            icon={<Bell className="h-5 w-5 text-primary" />}
                            contentClassName="pt-6 pb-8"
                        >
                            <ApplicationActivityFeed
                                auditLogs={activities}
                                appliedAt={new Date(application.appliedAt)}
                            />
                        </UnifiedCard>

                        {/* Feedback Section - Conditional */}
                        {(application.status === 'rejected' && application.rejectionReason) ||
                            (application.status === 'reviewed' && application.feedbackToApplicant) ? (
                            <UnifiedCard
                                title="Feedback"
                                headerClassName="pb-3"
                                contentClassName="space-y-4 pt-4"
                                className={cn(
                                    "border-2",
                                    application.status === 'rejected'
                                        ? "border-red-200 dark:border-red-900/50 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-slate-900"
                                        : "border-yellow-200 dark:border-yellow-900/50 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/20 dark:to-slate-900"
                                )}
                            >
                                {application.rejectionReason && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={cn(
                                                "p-1.5 rounded-lg",
                                                application.status === 'rejected'
                                                    ? "bg-red-100 dark:bg-red-900/30"
                                                    : "bg-yellow-100 dark:bg-yellow-900/30"
                                            )}>
                                                <FileTextIcon className={cn(
                                                    "h-4 w-4",
                                                    application.status === 'rejected'
                                                        ? "text-red-600 dark:text-red-400"
                                                        : "text-yellow-600 dark:text-yellow-400"
                                                )} />
                                            </div>
                                            <div className="text-xs font-semibold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                                                {application.status === 'rejected' ? 'Rejection Reason' : 'Review Notes'}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-10">
                                            {application.rejectionReason}
                                        </p>
                                    </div>
                                )}
                                {application.feedbackToApplicant && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                                <UsersIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="text-xs font-semibold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                                                Feedback for You
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-10">
                                            {application.feedbackToApplicant}
                                        </p>
                                    </div>
                                )}
                            </UnifiedCard>
                        ) : null}
                    </div>

                    {/* Right Column - Sidebar (1/3 width) */}
                    <div className={cn(
                        "space-y-6 transition-all duration-300",
                        !showMobileSidebar && "hidden lg:block"
                    )}>
                        {/* Mobile Close Button */}
                        <div className="lg:hidden flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Details</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowMobileSidebar(false)}
                                className="gap-2"
                            >
                                <ArrowLeftIcon className="h-4 w-4" />
                                Close
                            </Button>
                        </div>

                        {/* Quick Stats Card */}
                        <UnifiedCard
                            title="Quick Stats"
                            contentClassName="space-y-4"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Current Status</span>
                                    <ApplicationStatusBadge status={application.status} size="sm" />
                                </div>
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Applied Date</span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {format(new Date(application.appliedAt), 'MMM d, yyyy')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Days Since</span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {Math.floor((Date.now() - new Date(application.appliedAt).getTime()) / (1000 * 60 * 60 * 24))} days
                                    </span>
                                </div>
                            </div>
                        </UnifiedCard>

                        {/* Application Timeline */}
                        <UnifiedCard
                            title="Application Progress"
                            subtitle="Track your application journey through each stage"
                            icon={<ListTodoIcon className="h-5 w-5 text-primary" />}
                            contentClassName="pt-6 pb-8"
                        >
                            <ApplicationTimelineEnhanced
                                status={application.status as any}
                                lastUpdated={application.updatedAt}
                                appliedAt={application.appliedAt}
                            />
                        </UnifiedCard>

                        {/* Actionable CTAs - What's Next */}
                        {application.status === 'shortlisted' && (
                            <UnifiedCard
                                title="What's Next?"
                                contentClassName="space-y-3"
                                className="border-green-200 dark:border-green-900/50 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-slate-900"
                            >
                                <div className="space-y-3">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                        Congratulations! You've been shortlisted. Prepare for your interview.
                                    </p>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="w-full gap-2"
                                        onClick={() => {/* Navigate to interview prep */}}
                                    >
                                        <BookOpen className="h-4 w-4" />
                                        Interview Preparation
                                    </Button>
                                </div>
                            </UnifiedCard>
                        )}

                        {(application.status === 'interview_scheduled' || application.status === 'interviewed') && (
                            <UnifiedCard
                                title="What's Next?"
                                contentClassName="space-y-3"
                                className="border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-slate-900"
                            >
                                <div className="space-y-3">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                        Your interview is scheduled! Review the preparation materials.
                                    </p>
                                    <div className="space-y-2">
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="w-full gap-2"
                                            onClick={() => {/* Navigate to interview prep */}}
                                        >
                                            <BookOpen className="h-4 w-4" />
                                            View Preparation Guide
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full gap-2"
                                            onClick={() => {/* Add to calendar */}}
                                        >
                                            <CalendarIcon2 className="h-4 w-4" />
                                            Add to Calendar
                                        </Button>
                                    </div>
                                </div>
                            </UnifiedCard>
                        )}

                        {application.status === 'offered' && (
                            <UnifiedCard
                                title="🎉 Congratulations!"
                                contentClassName="space-y-3"
                                className="border-green-200 dark:border-green-900/50 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-slate-900"
                            >
                                <div className="space-y-3">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                        You've received an offer! Review the details and respond.
                                    </p>
                                    <div className="space-y-2">
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="w-full gap-2"
                                            onClick={() => {/* View offer details */}}
                                        >
                                            <FileTextIcon className="h-4 w-4" />
                                            View Offer Details
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full gap-2"
                                            onClick={() => {/* Download offer letter */}}
                                        >
                                            <Download className="h-4 w-4" />
                                            Download Offer Letter
                                        </Button>
                                    </div>
                                </div>
                            </UnifiedCard>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
