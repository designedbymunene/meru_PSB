'use client'

import { useState } from 'react'
import { useVacancy, useVacancyPdfs } from '@/hooks/use-vacancies'
import { useParams } from 'next/navigation'
import { useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveDialog } from '@/components/shared/responsive-dialog/responsive-dialog'
import { ApplicationForm } from '@/components/applications/application-form'
import { useAuthContext } from '@/providers'
import { useMyProfile } from '@/hooks/use-applicant-profile'
import { calculateProfileCompletion } from '@meru/shared'
import {
    CalendarIcon,
    BuildingIcon,
    BriefcaseIcon,
    FileTextIcon,
    DownloadIcon,
    ArrowLeftIcon,
    UsersIcon,
    ClockIcon,
    CheckCircleIcon,
    ListChecksIcon,
    Share2Icon,
    AlertCircleIcon
} from 'lucide-react'
import { format } from 'date-fns'

interface VacancyDetailProps {
    initialVacancy?: any
    initialPdfs?: any
}

export function VacancyDetail({ initialVacancy, initialPdfs }: VacancyDetailProps) {
    const params = useParams()
    const router = useRouter()
    const id = Number(params?.id)
    const { user } = useAuthContext()
    const [applyDialogOpen, setApplyDialogOpen] = useState(false)

    const { data: vacancyData, isLoading, error } = useVacancy(id, initialVacancy)
    const { data: pdfsData } = useVacancyPdfs(id, initialPdfs)
    const { data: profileResponse } = useMyProfile()
    const profile = profileResponse?.data

    // Check if essential profile sections are complete
    const completion = calculateProfileCompletion(profile)
    const isProfileComplete = completion.canApply

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-[200px] w-full" />
                        <Skeleton className="h-[300px] w-full" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-[150px] w-full" />
                        <Skeleton className="h-[200px] w-full" />
                    </div>
                </div>
            </div>
        )
    }

    if (error || !vacancyData?.data) {
        return (
            <div className="max-w-5xl mx-auto p-10 text-center space-y-4">
                <div className="bg-destructive/10 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                    <FileTextIcon className="h-10 w-10 text-destructive" />
                </div>
                <h3 className="text-xl font-bold">Error loading vacancy details</h3>
                <p className="text-muted-foreground">The vacancy you are looking for might have been removed or is no longer available.</p>
                <Button onClick={() => router.back()} variant="outline">
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
            </div>
        )
    }

    const { data: vacancy } = vacancyData

    // Check if the deadline has passed
    const now = new Date()
    const closingDate = new Date(vacancy.closingDate)
    // Set deadline to end of day to be inclusive
    closingDate.setHours(23, 59, 59, 999)
    const isPastDeadline = now > closingDate
    const isClosed = vacancy.status === 'closed' || isPastDeadline

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-4">
                <Button 
                    variant="ghost" 
                    className="w-fit -ml-2 h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-transparent" 
                    onClick={() => router.back()}
                >
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Back to Opportunities
                </Button>
                
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="space-y-3">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                            {vacancy.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2">
                            {vacancy.department && (
                                <Badge variant="secondary" className="px-2.5 py-1 rounded-md bg-secondary/50 text-secondary-foreground border-none">
                                    <BriefcaseIcon className="mr-1.5 h-3.5 w-3.5 opacity-70" />
                                    {vacancy.department?.name || (typeof vacancy.department === 'string' ? vacancy.department : 'N/A')}
                                </Badge>
                            )}
                            <Badge variant="outline" className="px-2.5 py-1 rounded-md border-muted-foreground/20">
                                <BuildingIcon className="mr-1.5 h-3.5 w-3.5 opacity-70" />
                                {vacancy.jobGroup?.name || (typeof vacancy.jobGroup === 'string' ? vacancy.jobGroup : 'N/A')}
                            </Badge>
                            {isClosed && (
                                <Badge variant="destructive" className="px-2.5 py-1 rounded-md">
                                    Closed
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Description Card */}
                    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden ring-1 ring-border">
                        <CardHeader className="pb-3 border-b bg-muted/30">
                            <CardTitle className="text-xl font-semibold flex items-center">
                                <FileTextIcon className="mr-2.5 h-5 w-5 text-primary" />
                                Job Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {vacancy.description}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Requirements Card */}
                    {vacancy.jobRequirements && vacancy.jobRequirements.length > 0 && (
                        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden ring-1 ring-border">
                            <CardHeader className="pb-3 border-b bg-muted/30">
                                <CardTitle className="text-xl font-semibold flex items-center">
                                    <CheckCircleIcon className="mr-2.5 h-5 w-5 text-primary" />
                                    Key Requirements
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <ul className="grid gap-3 list-none p-0">
                                    {vacancy.jobRequirements.map((req, index) => (
                                        <li key={index} className="flex items-start gap-3 text-muted-foreground">
                                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                            <span className="text-[0.95rem]">{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Responsibilities Card */}
                    {vacancy.jobResponsibilities && vacancy.jobResponsibilities.length > 0 && (
                        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden ring-1 ring-border">
                            <CardHeader className="pb-3 border-b bg-muted/30">
                                <CardTitle className="text-xl font-semibold flex items-center">
                                    <ListChecksIcon className="mr-2.5 h-5 w-5 text-primary" />
                                    Main Responsibilities
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <ul className="grid gap-3 list-none p-0">
                                    {vacancy.jobResponsibilities.map((resp, index) => (
                                        <li key={index} className="flex items-start gap-3 text-muted-foreground">
                                            <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <span className="text-[10px] font-bold text-primary">{index + 1}</span>
                                            </div>
                                            <span className="text-[0.95rem]">{resp}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Action Card */}
                    <Card className={`overflow-hidden shadow-md ring-1 ${isClosed ? 'ring-muted bg-muted/5' : 'ring-primary/20 bg-primary/5'}`}>
                        <CardContent className="p-6 space-y-4">
                            {vacancy.hasApplied ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">
                                        <CheckCircleIcon className="h-5 w-5 shrink-0" />
                                        <span className="font-medium">You have already applied for this vacancy.</span>
                                    </div>
                                    <Button size="lg" disabled variant="outline" className="w-full">
                                        Application Submitted
                                    </Button>
                                </div>
                            ) : isClosed ? (
                                <div className="space-y-4 text-center py-2">
                                    <div className="p-3 bg-muted/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 text-muted-foreground">
                                        <ClockIcon className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium leading-tight">
                                        This vacancy is closed and no longer accepting applications.
                                    </p>
                                    <Button size="lg" disabled variant="secondary" className="w-full">
                                        Vacancy Closed
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-base">Interested in this role?</h3>
                                        <p className="text-xs text-muted-foreground leading-snug">
                                            Apply now with your current profile details.
                                        </p>
                                    </div>

                                    {!user ? (
                                        <Button
                                            size="lg"
                                            onClick={() => {
                                                const locale = window.location.pathname.split('/')[1]
                                                const localePrefix = ['en', 'sw'].includes(locale) ? `/${locale}` : ''
                                                window.location.href = `${localePrefix}/login?callbackUrl=/vacancies/${vacancy.id}`
                                            }}
                                            className="w-full h-10 text-sm shadow-md shadow-primary/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
                                        >
                                            Login to Apply
                                        </Button>
                                    ) : !isProfileComplete ? (
                                        <div className="space-y-3">
                                            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 rounded-lg border border-amber-200 dark:border-amber-900/40 space-y-2 shadow-sm">
                                                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider opacity-80">
                                                    <AlertCircleIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500" />
                                                    Action Required
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[11px] leading-relaxed opacity-90">
                                                        Complete your profile to enable applications. Missing:
                                                    </p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {completion.requiredMissing.map((m, i) => (
                                                            <Badge key={i} variant="outline" className="text-[9px] py-0 px-1 bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                                                                {m}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button 
                                                size="lg" 
                                                className="w-full h-10 text-sm shadow-md shadow-primary/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
                                                onClick={() => router.push('/dashboard/profile')}
                                            >
                                                Complete My Profile
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <Button 
                                                size="lg" 
                                                onClick={() => setApplyDialogOpen(true)}
                                                className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                Apply for this Role
                                            </Button>
                                            <ResponsiveDialog
                                                open={applyDialogOpen}
                                                onOpenChange={setApplyDialogOpen}
                                                title="Application Confirmation"
                                                description="Review your submission summary before finalizing your application."
                                                className="max-w-xl"
                                            >
                                                <ApplicationForm vacancyId={vacancy.id} vacancyTitle={vacancy.title} />
                                            </ResponsiveDialog>
                                        </>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Facts Card */}
                    <Card className="shadow-sm border-none ring-1 ring-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                Job Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-5 pt-2">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <CalendarIcon className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs text-muted-foreground">Closing Date</p>
                                    <p className={`text-sm font-semibold ${isPastDeadline ? 'text-destructive' : 'text-foreground'}`}>
                                        {format(new Date(vacancy.closingDate), 'PPP')}
                                        {isPastDeadline && ' (Expired)'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <UsersIcon className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs text-muted-foreground">Positions Available</p>
                                    <p className="text-sm font-semibold">{vacancy.openPositions} {vacancy.openPositions === 1 ? 'Opening' : 'Openings'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <ClockIcon className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs text-muted-foreground">Job Status</p>
                                    <Badge variant={isClosed ? "secondary" : "default"} className="mt-1 h-5 px-1.5 text-[10px] uppercase tracking-wider">
                                        {isClosed ? 'Inactive' : 'Active'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Downloads Card */}
                    <Card className="shadow-sm border-none ring-1 ring-border overflow-hidden">
                        <CardHeader className="pb-3 bg-muted/30 border-b">
                            <CardTitle className="text-sm font-bold flex items-center">
                                <DownloadIcon className="mr-2 h-4 w-4 text-primary" />
                                Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            {pdfsData?.data?.length ? (
                                pdfsData.data.map(pdf => (
                                    <Button key={pdf.id} variant="outline" className="w-full justify-start h-auto py-2.5 px-3 border-dashed hover:border-primary/50 hover:bg-primary/5" asChild>
                                        <a href={`/api/vacancies/${vacancy.id}/pdf/${pdf.id}`} target="_blank" rel="noopener noreferrer">
                                            <div className="flex items-center gap-3 w-full">
                                                <FileTextIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                                <div className="flex flex-col items-start overflow-hidden">
                                                    <span className="text-xs font-medium truncate w-full">{pdf.originalName}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">PDF Document</span>
                                                </div>
                                                <DownloadIcon className="ml-auto h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            </div>
                                        </a>
                                    </Button>
                                ))
                            ) : (
                                <div className="text-center py-4 space-y-2">
                                    <FileTextIcon className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                                    <p className="text-xs text-muted-foreground">No documents attached.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Share Card */}
                    <Card className="shadow-sm border-none ring-1 ring-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                Share
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full gap-2 text-xs h-9"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href)
                                    // toast.success('Link copied!')
                                }}
                            >
                                <Share2Icon className="h-3.5 w-3.5" />
                                Copy Job Link
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

