'use client'

import { useParams } from 'next/navigation'
import { useRouter } from '@/i18n/routing'
import { format } from 'date-fns'
import { ArrowLeftIcon, BuildingIcon, CalendarIcon, FileTextIcon, ListTodoIcon, MapPinIcon, UsersIcon, BriefcaseIcon, Calendar as CalendarIcon2, Bell, BookOpen, Download, Navigation, Clock, CheckCircle2, Video, Share2Icon, XCircle, AlertCircle } from 'lucide-react'
import { useApplication } from '@/hooks/use-applications'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UnifiedCard } from '@/components/shared/cards/unified-card'
import { ApplicationStatusBadge } from '@/components/applications/application-status-badge'
import { ApplicationTimelineEnhanced } from '@/components/applications/application-timeline-enhanced'
import { ApplicationActivityFeed } from '@/components/applications/application-activity-feed'
import { RequireAuth } from '@/components/auth/require-auth'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'

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
        <div className="min-h-screen bg-slate-50/50 dark:bg-[#0a0c10] text-slate-700 dark:text-slate-200">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#0a0c10]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50">
                <div className="w-full px-4 md:px-8 lg:px-12 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            Back
                        </Button>

                        <div className="flex-1 flex flex-col items-start sm:items-center text-left sm:text-center px-4 overflow-hidden">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate w-full max-w-xl">
                                {application.vacancy?.title}
                            </h1>
                            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                                {(application.vacancy as any)?.department?.name}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <ApplicationStatusBadge status={application.status} />
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/50"
                                onClick={() => {
                                    if (navigator.share && application.vacancy?.title) {
                                        navigator.share({
                                            title: `Application for ${application.vacancy.title}`,
                                            text: `Check out my application progress for ${application.vacancy.title}`,
                                            url: window.location.href
                                        }).then(() => {
                                            toast.success('Shared successfully');
                                        }).catch(() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            toast.success('Application link copied to clipboard');
                                        });
                                    } else {
                                        navigator.clipboard.writeText(window.location.href);
                                        toast.success('Application link copied to clipboard');
                                    }
                                }}
                            >
                                <Share2Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">Share Application</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full px-4 md:px-8 lg:px-12 py-6 md:py-8">
                <div className="grid gap-8 lg:grid-cols-12 max-w-[1600px] mx-auto">

                    {/* Left Column - Job Info, Stats & What's Next */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Position Overview Card */}
                        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden shadow-sm dark:shadow-2xl">
                            <div className="p-8">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                        {application.vacancy?.title}
                                    </h2>
                                    <p className="text-sm font-bold text-blue-500 uppercase tracking-widest">
                                        {(application.vacancy as any)?.department?.name}
                                    </p>
                                </div>

                                <div className="grid gap-8 sm:grid-cols-2">
                                    <div className="flex items-center gap-4 group">
                                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                                            <BuildingIcon className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Reference</div>
                                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                {application.vacancy?.advertisementNumber || 'MCPSB/2026/002'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group">
                                        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 group-hover:bg-green-500/20 transition-colors">
                                            <BriefcaseIcon className="h-5 w-5 text-green-400" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Job Group</div>
                                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                {application.vacancy?.jobGroup?.name || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group">
                                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                                            <CalendarIcon className="h-5 w-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Closing Date</div>
                                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                {application.vacancy?.closingDate ? format(new Date(application.vacancy.closingDate), 'MMMM d, yyyy') : 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group">
                                        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
                                            <CalendarIcon className="h-5 w-5 text-orange-400" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Applied</div>
                                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                {format(new Date(application.appliedAt), 'MMMM d, yyyy')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Card */}
                        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden shadow-sm dark:shadow-2xl">
                            <div className="p-8">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Quick Stats</h2>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-800/50">
                                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Status</span>
                                        <ApplicationStatusBadge status={application.status} size="sm" />
                                    </div>
                                    <div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-800/50">
                                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Applied Date</span>
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                            {format(new Date(application.appliedAt), 'MMMM d, yyyy')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-4">
                                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Days Since</span>
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                            {Math.floor((Date.now() - new Date(application.appliedAt).getTime()) / (1000 * 60 * 60 * 24))} days
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What's Next Card - Prominent Position */}
                        <div className={cn(
                            "bg-white dark:bg-slate-900 border-2 rounded-xl overflow-hidden shadow-sm relative transition-all duration-300",
                            application.status === 'rejected'
                                ? "border-slate-205 dark:border-slate-800/80 shadow-sm"
                                : (application.status === 'shortlisted' || application.status === 'interviewing' || application.status === 'interviewed')
                                    ? "border-green-200 dark:border-green-500/30 dark:shadow-[0_0_30px_rgba(34,197,94,0.1)]"
                                    : "border-blue-200 dark:border-blue-500/30 dark:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                        )}>
                            {application.status === 'rejected' && (
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-5 pointer-events-none">
                                    <XCircle className="h-24 w-24 text-slate-500" />
                                </div>
                            )}
                            {(application.status === 'shortlisted' || application.status === 'interviewing' || application.status === 'interviewed') && (
                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                    <CheckCircle2 className="h-24 w-24 text-green-500" />
                                </div>
                            )}
                            <div className="p-8 relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={cn(
                                        "p-3 rounded-xl border",
                                        application.status === 'rejected'
                                            ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50"
                                            : (application.status === 'shortlisted' || application.status === 'interviewing' || application.status === 'interviewed') 
                                                ? "bg-green-50 dark:bg-green-500/20 border-green-200 dark:border-green-500/30" 
                                                : "bg-blue-50 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/30"
                                    )}>
                                        {application.status === 'rejected' ? (
                                            <XCircle className="h-6 w-6 text-slate-650 dark:text-slate-400" />
                                        ) : (
                                            <BookOpen className={cn("h-6 w-6", (application.status === 'shortlisted' || application.status === 'interviewing' || application.status === 'interviewed') ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400")} />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {application.status === 'rejected' ? "Application Outcome" : "What's Next?"}
                                        </h2>
                                        <p className={cn(
                                            "text-xs font-bold uppercase tracking-widest mt-1", 
                                            application.status === 'rejected'
                                                ? "text-slate-500 dark:text-slate-400"
                                                : (application.status === 'shortlisted' || application.status === 'interviewing' || application.status === 'interviewed') 
                                                    ? "text-green-500" 
                                                    : "text-blue-500"
                                        )}>
                                            {application.status === 'rejected'
                                                ? "Application concluded"
                                                : (application.status === 'shortlisted' || application.status === 'interviewing' || application.status === 'interviewed') 
                                                    ? "Next steps for your application" 
                                                    : "Waiting for initial review"}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    {(application.status === 'interviewing' || application.status === 'interviewed') ? (
                                        <>
                                            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                                                Your interview has been <span className="text-emerald-600 dark:text-emerald-400 font-bold underline underline-offset-4">scheduled</span>. Please review the details below and prepare accordingly.
                                            </p>
                                            {application.interviews?.[0] && (
                                                <div className="my-6 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 space-y-4">
                                                    <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-500/20 pb-4">
                                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                                            <Clock className="h-4 w-4" />
                                                            <span>Interview Schedule</span>
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                                                            {application.interviews[0].virtualLink ? "Virtual / Online" : "Physical Venue"}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="flex items-start gap-3">
                                                            <CalendarIcon className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date & Time</p>
                                                                <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                                                                    {format(new Date(application.interviews[0].scheduledAt), "PPP p")}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {application.interviews[0].virtualLink ? (
                                                            <div className="flex items-start gap-3">
                                                                <Video className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Virtual Meeting</p>
                                                                    <p className="text-sm font-medium text-slate-800 dark:text-white mt-0.5 truncate">
                                                                        {application.interviews[0].venue || "Online Video Call"}
                                                                    </p>
                                                                    <Button 
                                                                        size="sm" 
                                                                        className="mt-3 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold gap-2 shadow-lg shadow-emerald-950"
                                                                        asChild
                                                                    >
                                                                        <a href={application.interviews[0].virtualLink} target="_blank" rel="noopener noreferrer">
                                                                            <Video className="h-4 w-4" /> Join Virtual Interview
                                                                        </a>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-start gap-3">
                                                                <MapPinIcon className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Physical Venue</p>
                                                                    <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                                                                        {application.interviews[0].venue || "Boardroom / Main Office"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            <p className="text-slate-600 dark:text-slate-400">
                                                We strongly recommend reviewing our comprehensive interview preparation guide to ensure you are fully equipped for the session.
                                            </p>
                                            <div className="pt-4">
                                                <Button
                                                    variant="default"
                                                    size="lg"
                                                    className="gap-3 bg-emerald-600 hover:bg-emerald-700 text-white border-none h-14 px-8 font-bold text-base shadow-lg shadow-emerald-950"
                                                    onClick={() => router.push(`/dashboard/applications/${id}/prep-guide`)}
                                                >
                                                    <BookOpen className="h-5 w-5" />
                                                    View Interview Preparation Guide
                                                </Button>
                                            </div>
                                        </>
                                    ) : application.status === 'shortlisted' ? (
                                        <>
                                            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                                                Congratulations! You've been <span className="text-green-600 dark:text-green-400 font-bold underline underline-offset-4">shortlisted</span> for this position.
                                            </p>
                                            <p className="text-slate-600 dark:text-slate-400">
                                                Our hiring team is currently scheduling interviews. In the meantime, we recommend reviewing our interview preparation materials to increase your chances of success.
                                            </p>
                                            <div className="pt-4">
                                                <Button
                                                    variant="default"
                                                    size="lg"
                                                    className="gap-3 bg-green-600 hover:bg-green-700 text-white border-none h-14 px-8 font-bold text-base shadow-lg shadow-green-900/20"
                                                    onClick={() => router.push(`/dashboard/applications/${id}/prep-guide`)}
                                                >
                                                    <BookOpen className="h-5 w-5" />
                                                    View Interview Preparation Guide
                                                </Button>
                                            </div>
                                        </>
                                    ) : application.status === 'rejected' ? (
                                        <>
                                            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                                                Thank you for your interest in the <span className="font-semibold text-slate-900 dark:text-white">{application.vacancy?.title}</span> position.
                                            </p>
                                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 text-sm text-slate-600 dark:text-slate-450 leading-relaxed space-y-3">
                                                <p>
                                                    We regret to inform you that your application was not successful on this occasion. The selection process was highly competitive, with a large number of outstanding applications.
                                                </p>
                                                <p>
                                                    We sincerely appreciate the time, effort, and interest you invested in applying to the Meru County Public Service Board.
                                                </p>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                                Your credentials will remain in our talent database. We encourage you to keep your profile updated and explore other active vacancies that align with your career goals.
                                            </p>
                                            <div className="pt-2">
                                                <Button
                                                    variant="default"
                                                    size="lg"
                                                    className="gap-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold h-12 px-6 rounded-xl shadow-sm transition-all duration-300"
                                                    onClick={() => router.push('/vacancies')}
                                                >
                                                    <BriefcaseIcon className="h-4 w-4" />
                                                    Explore Other Vacancies
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                                                Your application is currently in the <span className="text-blue-600 dark:text-blue-400 font-bold">Queue</span>.
                                            </p>
                                            <p className="text-slate-600 dark:text-slate-400">
                                                Our HR team typically reviews applications within 7-14 business days. You will receive an email notification as soon as your status changes.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Timeline */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Application Timeline */}
                        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden shadow-sm dark:shadow-2xl">
                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                                        <ListTodoIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Application Progress</h2>
                                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">
                                            Track your application journey through each stage
                                        </p>
                                    </div>
                                </div>

                                <ApplicationTimelineEnhanced
                                    status={application.status as any}
                                    lastUpdated={application.updatedAt}
                                    appliedAt={application.appliedAt}
                                />
                            </div>
                        </div>

                        {/* Actionable CTAs - What's Next (Shortlisted) */}
                        {application.status === 'shortlisted' && (
                            <div className="bg-gradient-to-br from-green-50 dark:from-green-500/10 to-transparent border border-green-200 dark:border-green-500/20 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">What's Next?</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                                    Congratulations! You've been shortlisted. Prepare for your interview.
                                </p>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white border-none h-11 font-medium shadow-lg shadow-green-900/20"
                                    onClick={() => router.push(`/dashboard/applications/${id}/prep-guide`)}
                                >
                                    <BookOpen className="h-4 w-4" />
                                    Interview Preparation Guide
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
