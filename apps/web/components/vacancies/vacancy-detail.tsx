'use client'

import { useVacancy, useVacancyPdfs } from '@/hooks/use-vacancies'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ApplicationForm } from '@/components/applications/application-form'
import { useAuthContext } from '@/providers'
import { useMyProfile } from '@/hooks/use-applicant-profile'
import {
    CalendarIcon,
    BuildingIcon,
    BriefcaseIcon,
    FileTextIcon,
    DownloadIcon,
    ArrowLeftIcon
} from 'lucide-react'
import { format } from 'date-fns'

export function VacancyDetail() {
    const params = useParams()
    const router = useRouter()
    const id = Number(params?.id)
    const { user } = useAuthContext()

    const { data: vacancyData, isLoading, error } = useVacancy(id)
    const { data: pdfsData } = useVacancyPdfs(id)
    const { data: profileResponse } = useMyProfile()
    const profile = profileResponse?.data

    // Check if essential profile sections are complete
    // We check for: Basic info, Qualifications
    const isProfileComplete = profile &&
        profile.idNumber &&
        profile.phone &&
        profile.email &&
        profile.qualifications &&
        profile.qualifications.length > 0

    if (isLoading) {
        return <div className="space-y-4 max-w-4xl mx-auto p-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-[200px] w-full" />
        </div>
    }

    if (error || !vacancyData?.data) {
        return (
            <div className="text-center py-10">
                <h3 className="text-lg text-red-500">Error loading vacancy details</h3>
                <Button onClick={() => router.back()} variant="link">Go Back</Button>
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
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
            <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Opportunities
            </Button>

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{vacancy.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground">
                            {vacancy.department && (
                                <span className="flex items-center">
                                    <BriefcaseIcon className="mr-2 h-4 w-4" />
                                    {vacancy.department?.name || (typeof vacancy.department === 'string' ? vacancy.department : 'N/A')}
                                </span>
                            )}
                            <Badge variant="outline" className="ml-2">
                                {vacancy.jobGroup?.name || (typeof vacancy.jobGroup === 'string' ? vacancy.jobGroup : 'N/A')}
                            </Badge>
                        </div>
                    </div>

                    {user ? (
                        <>
                            {vacancy.hasApplied ? (
                                <div className="space-y-2">
                                    <Button size="lg" disabled variant="secondary" className="cursor-not-allowed">
                                        Applied
                                    </Button>
                                    <p className="text-sm text-green-600 font-medium">
                                        You have already applied for this vacancy.
                                    </p>
                                </div>
                            ) : isProfileComplete ? (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="lg" disabled={isClosed}>
                                            {isClosed ? 'Vacancy Closed' : 'Apply Now'}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Apply for {vacancy.title}</DialogTitle>
                                            <DialogDescription>
                                                Please confirm your application.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <ApplicationForm vacancyId={vacancy.id} vacancyTitle={vacancy.title} />
                                    </DialogContent>
                                </Dialog>
                            ) : (
                                <div className="space-y-2">
                                    <Button size="lg" disabled>
                                        Apply Now
                                    </Button>
                                    <p className="text-sm text-destructive font-medium">
                                        Please complete your profile to apply.
                                        <Button variant="link" className="px-1 h-auto py-0 text-destructive underline" onClick={() => router.push('/dashboard/profile')}>
                                            Go to Profile
                                        </Button>
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <Button size="lg" disabled={isClosed} onClick={() => router.push(`/login?callbackUrl=/vacancies/${vacancy.id}`)}>
                            {isClosed ? 'Vacancy Closed' : 'Login to Apply'}
                        </Button>
                    )}

                </div>

                <div className="flex gap-4 text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                    <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Closing:{' '}
                        <span className={`font-semibold ml-1 ${isPastDeadline ? 'text-destructive' : ''}`}>
                            {format(new Date(vacancy.closingDate), 'PPP')}
                            {isPastDeadline && ' (Expired)'}
                        </span>
                    </div>
                    <div className="flex items-center">
                        <UsersIcon className="mr-2 h-4 w-4" />
                        Positions: <span className="font-semibold ml-1">{vacancy.openPositions}</span>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <section>
                        <h3 className="text-xl font-semibold mb-4">Description</h3>
                        <div className="prose max-w-none text-muted-foreground">
                            {vacancy.description}
                        </div>
                    </section>

                    {vacancy.jobRequirements && vacancy.jobRequirements.length > 0 && (
                        <section>
                            <h3 className="text-xl font-semibold mb-4">Requirements</h3>
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                {vacancy.jobRequirements.map((req, index) => (
                                    <li key={index}>{req}</li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {vacancy.jobResponsibilities && vacancy.jobResponsibilities.length > 0 && (
                        <section>
                            <h3 className="text-xl font-semibold mb-4">Responsibilities</h3>
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                {vacancy.jobResponsibilities.map((resp, index) => (
                                    <li key={index}>{resp}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Downloads</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {pdfsData?.data?.length ? (
                                pdfsData.data.map(pdf => (
                                    <Button key={pdf.id} variant="outline" className="w-full justify-start" asChild>
                                        <a href={`/api/vacancies/${vacancy.id}/pdf/${pdf.id}`} target="_blank" rel="noopener noreferrer">
                                            <FileTextIcon className="mr-2 h-4 w-4" />
                                            {pdf.originalName}
                                            <DownloadIcon className="ml-auto h-4 w-4" />
                                        </a>
                                    </Button>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No documents attached.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Share this Job</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                    navigator.clipboard.writeText(window.location.href)
                                    // toast.success('Link copied!')
                                }}>
                                    Copy Link
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function UsersIcon({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
}
