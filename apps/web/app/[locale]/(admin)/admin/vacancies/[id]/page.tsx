"use client"

import { useVacancy } from "@/hooks/use-vacancies"
import { useAllApplications } from "@/hooks/use-applications"
import { Skeleton } from "@/components/ui/skeleton"
import { use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Edit, Eye, CheckCircle, ArrowLeft, Users, Calendar, Building, Briefcase } from "lucide-react"
import { format } from "date-fns"
import { formatNumber } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/admin/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { ApplicationWithRelations } from "@/types"
import { ApplicationReviewDialog } from "@/components/admin/application-review-dialog"
import { useState } from "react"

export default function VacancyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const vacancyId = parseInt(id, 10)
    
    const { data: vacancyData, isLoading: isLoadingVacancy, error } = useVacancy(vacancyId)
    const { data: applicationsData, isLoading: isLoadingApplications } = useAllApplications({ 
        vacancyId: id,
        limit: '100'
    })

    const vacancy = vacancyData?.data
    const applications = Array.isArray(applicationsData?.data) ? applicationsData.data : (applicationsData?.data as any)?.data || []

    const columns: ColumnDef<ApplicationWithRelations>[] = [
        {
            id: "applicantName",
            accessorFn: (row) => row.applicant?.fullName,
            header: "Applicant",
            cell: ({ row }) => {
                const applicant = row.original.applicant
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{applicant?.fullName || 'Anonymous'}</span>
                        <span className="text-xs text-muted-foreground">{applicant?.email}</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "appliedAt",
            header: "Submitted",
            cell: ({ row }) => format(new Date(row.original.appliedAt), "PP"),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={
                    row.original.status === 'pending' ? 'secondary' : 
                    row.original.status === 'accepted' ? 'default' : 
                    'destructive'
                } className="capitalize">
                    {row.original.status}
                </Badge>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const application = row.original
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const [showReviewDialog, setShowReviewDialog] = useState(false)

                return (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/applications/${application.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                            </Link>
                        </Button>

                        <ApplicationReviewDialog
                            applicationId={application.id}
                            currentStatus={application.status}
                            open={showReviewDialog}
                            onOpenChange={setShowReviewDialog}
                            trigger={
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="sr-only">Review</span>
                                </Button>
                            }
                        />
                    </div>
                )
            },
        },
    ]

    if (isLoadingVacancy) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-[200px]" />
                </div>
                <Skeleton className="h-[400px] w-full" />
            </div>
        )
    }

    if (error || !vacancy) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <h2 className="text-2xl font-bold">Vacancy not found</h2>
                <Button asChild variant="outline">
                    <Link href="/admin/vacancies">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vacancies
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex flex-col gap-4">
                <Link 
                    href="/admin/vacancies" 
                    className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vacancies
                </Link>
                
                <div className="flex items-center justify-between md:flex-row flex-col gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant={vacancy.status === 'open' ? 'default' : 'secondary'} className="capitalize">
                                {vacancy.status}
                            </Badge>
                            <span className="text-xs font-mono text-muted-foreground">{vacancy.advertisementNumber}</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">{vacancy.title}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/admin/vacancies/${vacancy.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Vacancy
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                {vacancy.description}
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Requirements</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-5 space-y-2">
                                    {vacancy.jobRequirements.map((req, i) => (
                                        <li key={i} className="text-sm text-slate-600 dark:text-slate-400">{req}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Responsibilities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-5 space-y-2">
                                    {vacancy.jobResponsibilities.map((resp, i) => (
                                        <li key={i} className="text-sm text-slate-600 dark:text-slate-400">{resp}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Applications</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Total of {formatNumber(applications.length)} candidates applied
                                </p>
                            </div>
                            <Users className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoadingApplications ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ) : applications.length > 0 ? (
                                <DataTable columns={columns} data={applications} searchKey="applicantName" />
                            ) : (
                                <div className="text-center py-10 border-2 border-dashed rounded-xl">
                                    <Users className="mx-auto h-10 w-10 text-muted-foreground opacity-20" />
                                    <p className="mt-2 text-sm text-muted-foreground font-medium">No applications received yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vacancy Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                                    <Briefcase className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Group</p>
                                    <p className="text-sm font-medium">{vacancy.jobGroup?.name || 'N/A'}</p>
                                </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                                    <Building className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</p>
                                    <p className="text-sm font-medium">{vacancy.department?.name || 'N/A'}</p>
                                </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                                    <Users className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Open Positions</p>
                                    <p className="text-sm font-medium">{formatNumber(vacancy.openPositions)} Position(s)</p>
                                </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Closing Date</p>
                                    <p className="text-sm font-medium">{format(new Date(vacancy.closingDate), 'PPP')}</p>
                                    {new Date(vacancy.closingDate) < new Date() && (
                                        <Badge variant="destructive" className="mt-1 text-[10px]">Closed/Expired</Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Placeholder for vacancy stats/analytics */}
                    <Card className="bg-primary/5 border-primary/10">
                        <CardHeader>
                            <CardTitle className="text-sm">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Applications</span>
                                <span className="text-sm font-bold">{formatNumber(applications.length)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Pending Review</span>
                                <span className="text-sm font-bold text-orange-500">
                                    {formatNumber(applications.filter(a => a.status === 'pending').length)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
