"use client"

import { useAllApplications, useExportApplications, useBulkUpdateStatus, useApplicationStats } from "@/hooks/use-applications"
import { DataTable } from "@/components/admin/data-table"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { ColumnDef } from "@tanstack/react-table"
import { ApplicationWithRelations } from "@/types"
import { ApplicationStatusBadge } from "@/components/admin/application-status-badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye, Download, MapPin, User2, Calendar, Loader2, Inbox, CheckCircle2, XCircle, Clock } from "lucide-react"
import { useState, Suspense } from "react"
import { useQueryState } from "nuqs"
import { Checkbox } from "@/components/ui/checkbox"
import { formatNumber, cn } from "@/lib/utils"
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { BulkActionsBar } from "@/components/admin/bulk-actions-bar"
import { AdminApplicationFilters } from "@/components/admin/admin-application-filters"
import { Badge } from "@/components/ui/badge"
import { ScheduleInterviewDialog } from "@/components/admin/schedule-interview-dialog"


const ApplicationActions = ({ application }: { application: ApplicationWithRelations }) => {
    return (
        <div className="flex items-center justify-end gap-2">
            {(application.status === 'shortlisted' || application.status === 'interviewing') && (
                <ScheduleInterviewDialog
                    applicationId={application.id}
                    vacancyId={application.vacancyId}
                    existingInterview={application.interviews?.[0]}
                    trigger={
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            title={application.interviews?.[0] ? "Update Interview Schedule" : "Schedule Interview"}
                        >
                            <Calendar className="h-4 w-4" />
                            <span className="sr-only">Schedule</span>
                        </Button>
                    }
                />
            )}
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                asChild
                title="View Details"
            >
                <Link href={`/admin/applications/${application.id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                </Link>
            </Button>
        </div>
    )
}

function ApplicationsPageContent() {
    const [search] = useQueryState('search', { defaultValue: '', throttleMs: 500 })
    const [status] = useQueryState('status', { defaultValue: '' })
    const [vacancyId] = useQueryState('vacancyId', { defaultValue: '' })
    const [departmentId] = useQueryState('departmentId', { defaultValue: '' })
    const [jobGroupId] = useQueryState('jobGroupId', { defaultValue: '' })

    const [selectedRows, setSelectedRows] = useState<ApplicationWithRelations[]>([])

    const filters = {
        vacancyId: vacancyId && vacancyId !== '' ? vacancyId : undefined,
        departmentId: departmentId && departmentId !== '' ? departmentId : undefined,
        jobGroupId: jobGroupId && jobGroupId !== '' ? jobGroupId : undefined,
        status: status && status !== '' ? (status as any) : undefined,
        searchTerm: search || undefined,
        sortBy: 'appliedAt' as const,
        order: 'desc' as const,
        limit: '100',
        offset: '0'
    }

    const { data, isLoading } = useAllApplications(filters)
    const applications = Array.isArray(data?.data) ? data.data : (data?.data as any)?.data || []

    const { data: statsResponse, isLoading: isLoadingStats } = useApplicationStats()
    const stats = statsResponse?.data

    const columns: ColumnDef<ApplicationWithRelations>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "applicantInfo",
            header: "Applicant Details",
            cell: ({ row }) => {
                const applicant = row.original.applicant
                const profile = applicant?.applicantProfile
                return (
                    <div className="flex flex-col gap-0.5 min-w-[180px]">
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                            {applicant?.fullName || 'Anonymous'}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">
                                {profile?.idNumber || 'No ID'}
                            </span>
                            <span className="h-0.5 w-0.5 rounded-full bg-slate-300" />
                            <span className="truncate">{applicant?.email}</span>
                        </div>
                    </div>
                )
            }
        },
        {
            id: "demographics",
            header: "Demographics",
            cell: ({ row }) => {
                const profile = row.original.applicant?.applicantProfile
                if (!profile) return <span className="text-muted-foreground text-[10px]">-</span>
                return (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[10px]">
                            <User2 className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{profile.gender || 'N/A'}</span>
                            {profile.impairment && (
                                <Badge variant="outline" className="h-4 px-1 text-[8px] border-amber-200 bg-amber-50 text-amber-700 font-bold uppercase">
                                    PWD
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{profile.homeCounty?.name || 'N/A'}</span>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "vacancy",
            header: "Applied For",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5 max-w-[200px]">
                    <span className="truncate font-medium text-xs text-slate-700 dark:text-slate-300">{row.original.vacancy?.title}</span>
                    <span className="font-mono text-[9px] text-primary font-bold uppercase tracking-tight">
                        {row.original.vacancy?.advertisementNumber}
                    </span>
                </div>
            )
        },

        {
            accessorKey: "appliedAt",
            header: "Submitted",
            cell: ({ row }) => (
                <div className="flex flex-col text-[10px] text-muted-foreground">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                        {format(new Date(row.original.appliedAt), "MMM dd, yyyy")}
                    </span>
                    <span className="uppercase">
                        {format(new Date(row.original.appliedAt), "p")}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <ApplicationStatusBadge status={row.original.status} />
        },
        {
            id: "actions",
            header: () => <div className="text-right">Action</div>,
            cell: ({ row }) => <ApplicationActions application={row.original} />,
        },
    ]

    const { mutate: exportApps, isPending: isExporting } = useExportApplications()
    const { mutate: bulkUpdate, isPending: isBulkUpdating } = useBulkUpdateStatus()

    const handleExport = () => {
        exportApps(filters)
    }

    const handleBulkStatusUpdate = (newStatus: string) => {
        if (newStatus === 'clear') {
            setSelectedRows([])
            return
        }

        bulkUpdate({
            applicationIds: selectedRows.map(r => r.id),
            status: newStatus as any,
            notes: `Bulk status update to ${newStatus}`
        }, {
            onSuccess: () => {
                setSelectedRows([])
            }
        })
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Applications</h2>
                        <p className="text-muted-foreground">Manage and review job applications</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleExport}
                            disabled={isExporting}
                            variant="outline"
                            size="sm"
                            className="h-10"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            {isExporting ? 'Exporting...' : 'Export CSV'}
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                    <Card className="bg-primary/5 border-primary/10">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-primary/70 font-medium flex items-center gap-2">
                                <Inbox className="h-4 w-4" />
                                Total Applications
                            </CardDescription>
                            {isLoadingStats ? (
                                <Loader2 className="h-8 w-8 animate-spin text-primary/40 mt-2" />
                            ) : (
                                <CardTitle className="text-3xl font-bold text-primary">{formatNumber(stats?.total || 0)}</CardTitle>
                            )}
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="font-medium flex items-center gap-2 text-amber-600">
                                <Clock className="h-4 w-4" />
                                Pending Review
                            </CardDescription>
                            {isLoadingStats ? (
                                <Loader2 className="h-8 w-8 animate-spin text-amber-600/40 mt-2" />
                            ) : (
                                <CardTitle className="text-3xl font-bold">{formatNumber(stats?.pending || 0)}</CardTitle>
                            )}
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="font-medium flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                Accepted / Shortlisted
                            </CardDescription>
                            {isLoadingStats ? (
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mt-2" />
                            ) : (
                                <CardTitle className="text-3xl font-bold">{formatNumber(stats?.accepted || 0)}</CardTitle>
                            )}
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="font-medium flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-rose-500" />
                                Rejected
                            </CardDescription>
                            {isLoadingStats ? (
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mt-2" />
                            ) : (
                                <CardTitle className="text-3xl font-bold">{formatNumber(stats?.rejected || 0)}</CardTitle>
                            )}
                        </CardHeader>
                    </Card>
                </div>

                <AdminApplicationFilters />
            </div>

            <div className="hidden md:block">
                {isLoading ? (
                    <TableSkeleton columnCount={6} rowCount={10} />
                ) : (
                    <>
                        <DataTable
                            columns={columns}
                            data={applications}
                            onRowSelectionChange={setSelectedRows}
                        />
                        <BulkActionsBar
                            selectedCount={selectedRows.length}
                            onAction={handleBulkStatusUpdate}
                            isPending={isBulkUpdating}
                        />
                    </>
                )}
            </div>
        </div>
    )
}

export default function ApplicationsPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <TableSkeleton columnCount={6} rowCount={10} />
            </div>
        }>
            <ApplicationsPageContent />
        </Suspense>
    )
}


