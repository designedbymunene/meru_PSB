"use client"

import { useAllApplications, useExportApplications } from "@/hooks/use-applications"
import { DataTable } from "@/components/admin/data-table"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { ColumnDef } from "@tanstack/react-table"
import { ApplicationWithRelations } from "@/types"
import { ApplicationStatusBadge } from "@/components/admin/application-status-badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye, CheckCircle, XCircle, Download } from "lucide-react"
import { ApplicationReviewDialog } from "@/components/admin/application-review-dialog"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useVacancies } from "@/hooks/use-vacancies"


export default function ApplicationsPage() {
    const [vacancyId, setVacancyId] = useState<string>('all')
    const filters = vacancyId !== 'all' ? { 
        vacancyId: vacancyId,
        sortBy: 'appliedAt' as const,
        order: 'desc' as const,
        limit: '50',
        offset: '0'
    } : {
        sortBy: 'appliedAt' as const,
        order: 'desc' as const,
        limit: '50',
        offset: '0'
    }

    const { data, isLoading } = useAllApplications(filters)
    const applications = data?.data || []

    const { data: vacancies } = useVacancies()

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
            accessorKey: "vacancy.title",
            header: "Vacancy",
            cell: ({ row }) => row.original.vacancy?.title
        },
        {
            accessorKey: "appliedAt",
            header: "Submitted",
            cell: ({ row }) => format(new Date(row.original.appliedAt), "PP"),
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

    const { mutate: exportApps, isPending: isExporting } = useExportApplications()

    const handleExport = () => {
        exportApps(filters)
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-3xl font-bold tracking-tight">Applications</h2>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="w-full sm:w-[320px]">
                            <Select value={vacancyId} onValueChange={setVacancyId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Filter by Vacancy" />
                                </SelectTrigger>
                                <SelectContent className="max-w-[400px]">
                                    <SelectItem value="all">All Vacancies</SelectItem>
                                    {vacancies?.data?.map((vacancy) => (
                                        <SelectItem
                                            key={vacancy.id}
                                            value={String(vacancy.id)}
                                            title={vacancy.title}
                                            className="max-w-[380px]"
                                        >
                                            <span className="block truncate">
                                                {vacancy.title}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleExport}
                            disabled={isExporting}
                            variant="outline"
                            size="sm"
                            className="h-9 whitespace-nowrap"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            {isExporting ? 'Exporting...' : 'Export CSV'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="hidden md:block">
                {isLoading ? (
                    <TableSkeleton columnCount={6} />
                ) : (
                    <DataTable columns={columns} data={applications} searchKey="applicantName" searchPlaceholder="Search by name..." />
                )}
            </div>
        </div>
    )
}
