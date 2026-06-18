"use client"

import { useApplication } from "@/hooks/use-applications"
import { useProfileByUserId } from "@/hooks/use-applicant-profile"
import { use } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ApplicationStatusBadge } from "@/components/admin/application-status-badge"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, Calendar, User, CheckCircle, Loader2, Layout, X, FileText, Clock, Tag as TagIcon, Briefcase, Video, MapPin, Users, ClipboardList, Building2, ShieldCheck } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { ProfileDetailView } from "@/components/admin/profile-detail-view"
import { ApplicationAuditLogs } from "@/components/admin/application-audit-logs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { APPLICATION_STATUS } from "@/lib/constants"
import { ApplicationStatusPipeline } from "@/components/admin/application-status-pipeline"
import { ApplicationReviewSheet } from "@/components/admin/application-review-sheet"
import { ScheduleInterviewDialog } from "@/components/admin/schedule-interview-dialog"

type ReviewAction = "review" | "shortlist" | "interview" | "accept" | "reject"

interface ReviewActionConfig {
    label: string
    icon: React.ElementType
    variant: "default" | "destructive" | "outline" | "secondary"
    description: string
}

const reviewActions: Record<string, ReviewActionConfig> = {
    [APPLICATION_STATUS.PENDING]: {
        label: "Start Review",
        icon: CheckCircle,
        variant: "default",
        description: "Begin reviewing this application"
    },
    [APPLICATION_STATUS.REVIEWED]: {
        label: "Shortlist Candidate",
        icon: CheckCircle,
        variant: "default",
        description: "Move to shortlist for interviews"
    },
    [APPLICATION_STATUS.SHORTLISTED]: {
        label: "Review / Transition",
        icon: CheckCircle,
        variant: "outline",
        description: "Move to interviewed or reject"
    },
    [APPLICATION_STATUS.INTERVIEWING]: {
        label: "Make Decision",
        icon: CheckCircle,
        variant: "default",
        description: "Accept or reject candidate"
    },
    [APPLICATION_STATUS.INTERVIEWED]: {
        label: "Make Decision",
        icon: CheckCircle,
        variant: "default",
        description: "Accept or reject candidate"
    },
    [APPLICATION_STATUS.ACCEPTED]: {
        label: "Update Status",
        icon: FileText,
        variant: "outline",
        description: "Update application status"
    },
    [APPLICATION_STATUS.REJECTED]: {
        label: "Update Status",
        icon: FileText,
        variant: "outline",
        description: "Update application status"
    }
}

function getReviewActionConfig(status: string): ReviewActionConfig {
    return reviewActions[status] || reviewActions.pending
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data, isLoading, error } = useApplication(parseInt(id, 10))
    const application = data?.data
    const [showReviewSheet, setShowReviewSheet] = useState(false)
    const [isQuickReview, setIsQuickReview] = useState(false)
    const [targetReviewStatus, setTargetReviewStatus] = useState<string | undefined>()

    const {
        data: profileResponse,
        isLoading: isProfileLoading
    } = useProfileByUserId(application?.applicantId || 0)

    const profile = profileResponse?.data
    const reviewConfig = application ? getReviewActionConfig(application.status) : reviewActions.pending
    const ReviewIcon = reviewConfig.icon

    if (isLoading) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <Skeleton className="h-8 w-[200px]" />
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-[400px] w-full" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </div>
        )
    }

    if (error || !application) {
        return <div className="p-8">Application not found</div>
    }

    const vacancy = application.vacancy
    const tags = (application as any).tags || []

    const handleStatusClick = (status: string) => {
        setTargetReviewStatus(status)
        setShowReviewSheet(true)
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                            {application.applicant?.fullName}
                        </h1>
                        <ApplicationStatusBadge status={application.status} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <span className="font-medium">Application #{application.id}</span>
                        <span>·</span>
                        <p className="text-sm md:text-base">
                            Applied for{" "}
                            <Link
                                href={`/admin/vacancies/${application.vacancyId}`}
                                className="font-medium text-primary hover:underline underline-offset-4"
                            >
                                {vacancy?.title}
                            </Link>
                            {" "}· {format(new Date(application.appliedAt), "PPP")}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        size="sm"
                        variant={isQuickReview ? "secondary" : "outline"}
                        onClick={() => setIsQuickReview(!isQuickReview)}
                        className="gap-2"
                    >
                        {isQuickReview ? (
                            <><X className="h-4 w-4" /> Exit Quick Review</>
                        ) : (
                            <><Layout className="h-4 w-4" /> Quick Review</>
                        )}
                    </Button>

                    {(application.status === APPLICATION_STATUS.SHORTLISTED || application.status === APPLICATION_STATUS.INTERVIEWING) && (
                        <ScheduleInterviewDialog
                            applicationId={application.id}
                            vacancyId={application.vacancyId}
                            existingInterview={application.interviews?.[0]}
                            trigger={
                                <Button 
                                    size="sm" 
                                    variant={application.interviews?.[0] ? "outline" : "default"} 
                                    className="gap-2"
                                >
                                    <Calendar className="h-4 w-4" />
                                    {application.interviews?.[0] ? "Reschedule Interview" : "Schedule Interview"}
                                </Button>
                            }
                        />
                    )}

                    <ApplicationReviewSheet
                        applicationId={application.id}
                        vacancyId={application.vacancyId}
                        currentStatus={application.status}
                        targetStatus={targetReviewStatus}
                        currentTags={tags}
                        open={showReviewSheet}
                        onOpenChange={(open) => {
                            setShowReviewSheet(open)
                            if (!open) setTargetReviewStatus(undefined)
                        }}
                        trigger={
                            <Button size="sm" variant={reviewConfig.variant} className="gap-2">
                                <ReviewIcon className="h-4 w-4" />
                                {reviewConfig.label}
                            </Button>
                        }
                    />
                </div>
            </div>

            {isQuickReview ? (
                <QuickReviewMode
                    vacancy={vacancy}
                    profile={profile}
                    applicantName={application.applicant?.fullName}
                    isProfileLoading={isProfileLoading}
                />
            ) : (
                <StandardView
                    application={application}
                    vacancy={vacancy}
                    profile={profile}
                    tags={tags}
                    isProfileLoading={isProfileLoading}
                    reviewLabel={reviewConfig.label}
                    reviewVariant={reviewConfig.variant}
                    reviewDescription={reviewConfig.description}
                    ReviewIcon={reviewConfig.icon}
                    setShowReviewSheet={setShowReviewSheet}
                    onStatusClick={handleStatusClick}
                />
            )}
        </div>
    )
}

function QuickReviewMode({
    vacancy,
    profile,
    applicantName,
    isProfileLoading
}: {
    vacancy: any
    profile: any
    applicantName?: string
    isProfileLoading: boolean
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Vacancy Requirements */}
            <Card className="sticky top-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-lg">Requirements</CardTitle>
                    </div>
                    <CardDescription className="text-sm">{vacancy?.title}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            Required Qualifications
                        </h4>
                        <ul className="space-y-2">
                            {(vacancy?.jobRequirements as string[] || []).map((req, i) => (
                                <li key={i} className="text-sm pl-4 border-l-2 border-muted text-muted-foreground">
                                    {req}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <Separator />
                    <div>
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Key Responsibilities
                        </h4>
                        <ul className="space-y-2">
                            {(vacancy?.jobResponsibilities as string[] || []).map((resp, i) => (
                                <li key={i} className="text-sm pl-4 border-l-2 border-muted text-muted-foreground">
                                    {resp}
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Applicant Profile - Quick Review */}
            <Card className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-lg">Candidate</CardTitle>
                    </div>
                    <CardDescription className="text-sm">{applicantName}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isProfileLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : profile ? (
                        <ProfileDetailView profile={profile} />
                    ) : (
                        <p className="text-sm text-muted-foreground">Profile not found</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function StandardView({
    application,
    vacancy,
    profile,
    tags,
    isProfileLoading,
    reviewLabel,
    reviewVariant,
    reviewDescription,
    ReviewIcon,
    setShowReviewSheet,
    onStatusClick
}: {
    application: any
    vacancy: any
    profile: any
    tags: string[]
    isProfileLoading: boolean
    reviewLabel: string
    reviewVariant: "default" | "destructive" | "outline" | "secondary"
    reviewDescription: string
    ReviewIcon: React.ElementType
    setShowReviewSheet: (open: boolean) => void
    onStatusClick: (status: string) => void
}) {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-12">
                {/* Sidebar */}
                <aside className="lg:col-span-3 space-y-4">
                    {/* Application Highlights Card */}
                    <Card className="border-primary/20 bg-primary/5 overflow-hidden">
                        <CardHeader className="pb-3 border-b border-primary/10 bg-white/50 dark:bg-slate-900/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">Application Highlights</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 gap-4">
                                <HighlightItem 
                                    label="Vacancy" 
                                    value={vacancy?.title} 
                                    subValue={vacancy?.advertisementNumber}
                                    icon={<Briefcase className="h-4 w-4 text-primary/60" />}
                                />
                                <HighlightItem 
                                    label="Department" 
                                    value={vacancy?.department?.name || 'N/A'} 
                                    icon={<Building2 className="h-4 w-4 text-primary/60" />}
                                />
                                <HighlightItem 
                                    label="Job Group" 
                                    value={vacancy?.jobGroup?.name || 'N/A'} 
                                    icon={<TagIcon className="h-4 w-4 text-primary/60" />}
                                />
                                <HighlightItem 
                                    label="Applied On" 
                                    value={format(new Date(application.appliedAt), "MMM d, yyyy")} 
                                    subValue={format(new Date(application.appliedAt), "p")}
                                    icon={<Calendar className="h-4 w-4 text-primary/60" />}
                                />
                                 <HighlightItem 
                                    label="Last Updated" 
                                    value={format(new Date(application.updatedAt), "MMM d, yyyy")} 
                                    icon={<Clock className="h-4 w-4 text-primary/60" />}
                                />
                            </div>
                            
                            {tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-primary/10">
                                    <span className="text-[10px] font-black uppercase text-primary/40 tracking-widest mr-2">Tags:</span>
                                    {tags.map((tag: string) => (
                                        <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] h-5">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="sticky top-4 space-y-4">
                        {/* Interview Schedule Card */}
                        {application.interviews?.[0] && (
                            <Card className="border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10 shadow-sm overflow-hidden rounded-2xl">
                                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white flex items-center justify-between">
                                    <div className="flex items-center gap-2 font-bold text-sm">
                                        <Calendar className="h-4 w-4" />
                                        <span>Interview Scheduled</span>
                                    </div>
                                    <Badge variant="secondary" className="bg-white/20 text-white border-none text-[10px] uppercase tracking-wider font-bold">
                                        {application.interviews[0].virtualLink ? "Virtual" : "Physical"}
                                    </Badge>
                                </div>
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                            <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Date & Time</p>
                                            <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                                {format(new Date(application.interviews[0].scheduledAt), "PPP p")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                            {application.interviews[0].virtualLink ? <Video className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> : <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Location / Venue</p>
                                            <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                                                {application.interviews[0].venue || (application.interviews[0].virtualLink ? "Virtual Meeting" : "N/A")}
                                            </p>
                                        </div>
                                    </div>

                                    {application.interviews[0].virtualLink && (
                                        <Button 
                                            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 mt-2 h-11"
                                            asChild
                                        >
                                            <a href={application.interviews[0].virtualLink} target="_blank" rel="noopener noreferrer">
                                                <Video className="h-4 w-4" /> Join Interview
                                            </a>
                                        </Button>
                                    )}

                                    <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/30">
                                        <ScheduleInterviewDialog
                                            applicationId={application.id}
                                            vacancyId={application.vacancyId}
                                            existingInterview={application.interviews[0]}
                                            trigger={
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="w-full text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-bold h-9"
                                                >
                                                    Reschedule Interview
                                                </Button>
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Internal Controls Card */}
                        <Card className="rounded-2xl shadow-sm border-slate-200 dark:border-slate-800">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                    Review Pipeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="pb-2 overflow-x-auto no-scrollbar">
                                    <ApplicationStatusPipeline
                                        currentStatus={application.status}
                                        onStatusClick={onStatusClick}
                                    />
                                </div>

                                <Separator className="bg-slate-100 dark:bg-slate-800" />

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Reviewer Notes</p>
                                        {application.notes ? (
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{application.notes}</p>
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">No notes provided for this review stage.</p>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Email</p>
                                            <ContactItem icon={Mail} value={application.applicant?.email} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Phone</p>
                                            <ContactItem
                                                icon={Phone}
                                                value={isProfileLoading ? undefined : (profile?.phone || profile?.phoneNumber)}
                                                fallback="Not set"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="lg:col-span-9 space-y-6">
                    {/* Profile */}
                    <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">Candidate Portfolio</CardTitle>
                                    <CardDescription className="font-medium">Complete professional documentation for {application.applicant?.fullName}</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" asChild className="rounded-xl font-bold">
                                    <Link href={`/admin/profiles/${application.applicantId}`}>
                                        View Full Profile
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isProfileLoading ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                                </div>
                            ) : profile ? (
                                <div className="p-6 pt-2">
                                    <ProfileDetailView profile={profile} />
                                </div>
                            ) : (
                                <div className="text-center py-20 text-slate-400">
                                    <User className="h-12 w-12 mx-auto opacity-20 mb-4" />
                                    <p className="font-medium">Profile data unavailable</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Audit Trail */}
                    <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-lg">Audit Trail</CardTitle>
                            <CardDescription className="font-medium text-slate-500">History of all administrative actions on this application</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <ApplicationAuditLogs logs={(application as any).auditLogs || []} />
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    )
}

function HighlightItem({ 
    label, 
    value, 
    subValue, 
    icon 
}: { 
    label: string; 
    value?: string | null; 
    subValue?: string | null;
    icon: React.ReactNode 
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
            </div>
            <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate" title={value || ''}>
                    {value || 'N/A'}
                </p>
                {subValue && (
                    <p className="text-[10px] font-bold text-primary uppercase mt-0.5">{subValue}</p>
                )}
            </div>
        </div>
    )
}

function ContactItem({
    icon: Icon,
    value,
    fallback
}: {
    icon: React.ElementType
    value?: string
    fallback?: string
}) {
    return (
        <div className="flex items-center gap-2 text-[13px] font-bold text-slate-700 dark:text-slate-300">
            <Icon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{value || fallback || "N/A"}</span>
        </div>
    )
}
