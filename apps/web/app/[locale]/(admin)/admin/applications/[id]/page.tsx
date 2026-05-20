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
import { Mail, Phone, Calendar, User, CheckCircle, Loader2, Layout, X, FileText, Clock, Tag as TagIcon, Briefcase, Video, MapPin, Users } from "lucide-react"
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
        <div className="grid gap-6 lg:grid-cols-12">
            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-4">
                <div className="sticky top-4 space-y-4">
                    {/* Interview Schedule Card */}
                    {application.interviews?.[0] && (
                        <Card className="border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-3 text-white flex items-center justify-between">
                                <div className="flex items-center gap-2 font-semibold text-sm">
                                    <Clock className="h-4 w-4" />
                                    <span>Scheduled Interview</span>
                                </div>
                                <Badge variant="secondary" className="bg-white/20 text-white border-none text-[10px] uppercase tracking-wider font-bold">
                                    {application.interviews[0].virtualLink ? "Virtual / Online" : "Physical Venue"}
                                </Badge>
                            </div>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-start gap-2.5 text-xs">
                                    <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Date & Time</p>
                                        <p className="font-semibold text-foreground mt-0.5">
                                            {format(new Date(application.interviews[0].scheduledAt), "PPP p")}
                                        </p>
                                    </div>
                                </div>

                                <Separator className="bg-emerald-500/10" />

                                {application.interviews[0].virtualLink ? (
                                    <div className="space-y-2.5">
                                        <div className="flex items-start gap-2.5 text-xs">
                                            <Video className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Virtual Meeting</p>
                                                <p className="font-medium text-foreground mt-0.5 truncate">
                                                    {application.interviews[0].venue || "Online Video Call"}
                                                </p>
                                            </div>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm gap-2"
                                            asChild
                                        >
                                            <a href={application.interviews[0].virtualLink} target="_blank" rel="noopener noreferrer">
                                                <Video className="h-3.5 w-3.5" /> Join Virtual Interview
                                            </a>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-2.5 text-xs">
                                        <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Physical Venue</p>
                                            <p className="font-semibold text-foreground mt-0.5">
                                                {application.interviews[0].venue || "Boardroom / Main Office"}
                                              </p>
                                        </div>
                                    </div>
                                )}

                                <Separator className="bg-emerald-500/10" />

                                <ScheduleInterviewDialog
                                    applicationId={application.id}
                                    vacancyId={application.vacancyId}
                                    existingInterview={application.interviews[0]}
                                    trigger={
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="w-full text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 gap-1.5 h-8 font-semibold"
                                        >
                                            <Calendar className="h-3.5 w-3.5" /> Reschedule Interview
                                        </Button>
                                    }
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Internal Notes, Tags & Status Pipeline */}
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Board Review
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Status Pipeline integrated here */}
                            <div className="pb-1 overflow-x-auto no-scrollbar">
                                <ApplicationStatusPipeline
                                    currentStatus={application.status}
                                    onStatusClick={onStatusClick}
                                />
                            </div>

                            <Separator className="bg-primary/10" />

                            <div className="grid grid-cols-2 gap-4">
                                {tags.length > 0 && (
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Tags</p>
                                        <div className="flex flex-wrap gap-1">
                                            {tags.map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="text-[9px] px-1.5 py-0 bg-background/50"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="space-y-1">
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Contact</p>
                                    <div className="space-y-1">
                                        <ContactItem icon={Mail} value={application.applicant?.email} />
                                        <ContactItem
                                            icon={Phone}
                                            value={isProfileLoading ? undefined : (profile?.phone || profile?.phoneNumber)}
                                            fallback="No phone"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-primary/10" />

                            <div>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Reviewer Comments</p>
                                {application.notes ? (
                                    <p className="text-xs leading-relaxed whitespace-pre-wrap line-clamp-4 hover:line-clamp-none transition-all">{application.notes}</p>
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">No internal notes yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Application Details */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">Application Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <h3 className="font-semibold text-xs">{vacancy?.title}</h3>
                                <p className="text-[10px] text-muted-foreground">
                                    Ref: {vacancy?.referenceNumber || "N/A"}
                                </p>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-[9px] font-medium text-muted-foreground uppercase">Department</p>
                                    <p className="text-xs truncate">{vacancy?.department?.name || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-medium text-muted-foreground uppercase">Type</p>
                                    <p className="text-xs truncate">{vacancy?.employmentType || "N/A"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-8 space-y-4">
                {/* Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle>Applicant Profile</CardTitle>
                        <CardDescription>Complete professional profile for {application.applicant?.fullName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isProfileLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : profile ? (
                            <ProfileDetailView profile={profile} />
                        ) : (
                            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg">
                                <p>Profile not found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Audit Trail */}
                <Card>
                    <CardHeader>
                        <CardTitle>Decision History</CardTitle>
                        <CardDescription>Application audit trail and logs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ApplicationAuditLogs logs={(application as any).auditLogs || []} />
                    </CardContent>
                </Card>
            </main>
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
        <div className="flex items-center gap-2 text-sm">
            <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{value || fallback || "N/A"}</span>
        </div>
    )
}
