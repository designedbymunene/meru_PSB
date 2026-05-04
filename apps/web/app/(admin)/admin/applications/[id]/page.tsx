"use client"

import { useApplication } from "@/hooks/use-applications"
import { useProfileByUserId } from "@/hooks/use-applicant-profile"
import { use } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ApplicationStatusBadge } from "@/components/admin/application-status-badge"
import { ApplicationReviewDialog } from "@/components/admin/application-review-dialog"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, Calendar, User, CheckCircle, Loader2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { ProfileDetailView } from "@/components/admin/profile-detail-view"

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data, isLoading, error } = useApplication(parseInt(id, 10))
    const application = data?.data
    const [showReviewDialog, setShowReviewDialog] = useState(false)

    // Fetch applicant profile if we have the application
    const {
        data: profileResponse,
        isLoading: isProfileLoading
    } = useProfileByUserId(application?.applicantId || 0)

    // Only fetch if we have an applicantId
    const profile = profileResponse?.data

    if (isLoading) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
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

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between md:flex-row flex-col gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold tracking-tight">Application #{application.id}</h2>
                        <ApplicationStatusBadge status={application.status} />
                    </div>
                    <p className="text-muted-foreground mt-1">
                        Applied for <Link href={`/admin/vacancies/${application.vacancyId}`} className="font-medium underline underline-offset-4 hover:text-primary">{application.vacancy?.title}</Link>
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <ApplicationReviewDialog
                        applicationId={application.id}
                        currentStatus={application.status}
                        open={showReviewDialog}
                        onOpenChange={setShowReviewDialog}
                        trigger={
                            <Button>
                                <CheckCircle className="mr-2 h-4 w-4" /> Review Application
                            </Button>
                        }
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Applicant Info Side Panel */}
                <Card className="md:col-span-4 h-fit">
                    <CardHeader>
                        <CardTitle>Applicant Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <h4 className="font-semibold">{application.applicant?.fullName}</h4>
                                <p className="text-sm text-muted-foreground">Applicant</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{application.applicant?.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {isProfileLoading ? (
                                    <Skeleton className="h-4 w-24" />
                                ) : (
                                    <span>{profile?.phone || 'No phone number'}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Applied on {format(new Date(application.appliedAt), "PPP")}</span>
                            </div>
                        </div>


                    </CardContent>
                </Card>

                {/* Main Content Area */}
                <div className="md:col-span-8 space-y-6">

                    {/* Full Profile Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Detailed Applicant Profile</CardTitle>
                            <CardDescription>
                                Complete professional profile of the applicant
                            </CardDescription>
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
                                    <p>Applicant profile not found or access denied.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Review Notes (if any) */}
                    {application.notes && (
                        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900">
                            <CardHeader>
                                <CardTitle className="text-lg text-yellow-800 dark:text-yellow-500">Internal Review Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                    {application.notes}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
