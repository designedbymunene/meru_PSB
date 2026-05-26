"use client"

import { useVacancies, useDeleteVacancy, useVacancyStats } from "@/hooks/use-vacancies"
import { DataTable } from "@/components/admin/data-table"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { Button } from "@/components/ui/button"
import { Plus, Eye, Users, Building2, Briefcase, Calendar, Edit, Trash, Loader2, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { VacancyWithRelations, VacancyFilters as VacancyFiltersType } from "@/types"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { formatNumber, formatSalaryRange } from "@/lib/utils"
import { VacancyFilters } from "@/components/vacancies/vacancy-filters"
import { useQueryState } from "nuqs"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState, Suspense } from "react"

const VacancyActions = ({ vacancy }: { vacancy: VacancyWithRelations }) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const deleteVacancy = useDeleteVacancy()

    return (
        <div className="flex items-center justify-end gap-1">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                asChild
                title="View Details"
            >
                <Link href={`/admin/vacancies/${vacancy.id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                </Link>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                asChild
                title="Edit Vacancy"
            >
                <Link href={`/admin/vacancies/${vacancy.id}/edit`}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                </Link>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteDialog(true)}
                title="Delete Vacancy"
            >
                <Trash className="h-4 w-4" />
                <span className="sr-only">Delete</span>
            </Button>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the vacancy
                            &quot;{vacancy.title}&quot; and all associated applications.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteVacancy.mutate(vacancy.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function VacanciesPageContent() {
    const [search] = useQueryState('search')
    const [departmentId] = useQueryState('departmentId')
    const [jobGroupId] = useQueryState('jobGroupId')
    const [status] = useQueryState('status', { defaultValue: 'all' })

    const filters: VacancyFiltersType = {
        search: search || undefined,
        status: status === 'all' ? undefined : (status as 'open' | 'closed'),
        departmentId: departmentId || undefined,
        jobGroupId: jobGroupId || undefined,
    }

    const { data, isLoading } = useVacancies(filters)
    const vacancies = data?.data || []

    const { data: statsResponse, isLoading: isLoadingStats } = useVacancyStats()
    const stats = statsResponse?.data

    const columns: ColumnDef<VacancyWithRelations>[] = [
        {
            accessorKey: "title",
            header: "Vacancies",
            cell: ({ row }) => {
                const vacancy = row.original
                return (
                    <div className="flex flex-col gap-1 py-1 max-w-[320px] md:max-w-[400px]">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900 dark:text-white whitespace-normal break-words leading-snug">
                                {vacancy.title}
                            </span>
                            <Badge variant={vacancy.status === 'open' ? 'default' : 'secondary'} className="capitalize h-4.5 text-[9px] px-1.5 font-semibold">
                                {vacancy.status}
                            </Badge>
                        </div>
                        <div className="flex flex-col gap-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {vacancy.department && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Building2 className="h-3.5 w-3.5 shrink-0 opacity-60" />
                                    <span className="whitespace-normal break-words leading-tight">{vacancy.department.name}</span>
                                </div>
                            )}
                            <span className="font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                                Ref: {vacancy.advertisementNumber}
                            </span>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "jobGroup",
            header: "Job Group",
            cell: ({ row }) => {
                const vacancy = row.original
                const jg = vacancy.jobGroup
                return (
                    <div className="flex flex-col gap-1 py-1">
                        <div className="flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                            <Badge variant="outline" className="w-fit text-[10px] font-semibold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 uppercase tracking-wide">
                                {jg?.name || 'Job Group'}
                            </Badge>
                        </div>
                        {jg && (
                            <span className="text-[10px] text-muted-foreground font-medium">
                                {formatSalaryRange(jg.salaryMin, jg.salaryMax)}
                            </span>
                        )}
                        <div className="flex flex-col gap-0.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                <Users className="h-3.5 w-3.5 shrink-0 opacity-60 text-slate-500" />
                                <span>{formatNumber(vacancy.applicationsCount || 0)} Applicants</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium ml-4.5">
                                ({formatNumber(vacancy.openPositions)} {vacancy.openPositions === 1 ? 'position' : 'positions'} open)
                            </span>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "closingDate",
            header: "Deadline",
            cell: ({ row }) => {
                const date = new Date(row.original.closingDate)
                const isExpired = date < new Date() && row.original.status === 'open'
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{format(date, "PP")}</span>
                        {isExpired && <span className="text-[9px] text-destructive font-bold uppercase tracking-wider">Expired</span>}
                    </div>
                )
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right">Action</div>,
            cell: ({ row }) => <VacancyActions vacancy={row.original} />,
        },
    ]

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Vacancies</h2>
                    <p className="text-muted-foreground">Manage and monitor job advertisements</p>
                </div>
                <Button asChild>
                    <Link href="/admin/vacancies/new">
                        <Plus className="mr-2 h-4 w-4" /> Create Vacancy
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-primary/70 font-medium flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Total Vacancies
                        </CardDescription>
                        {isLoadingStats ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary/40 mt-2" />
                        ) : (
                            <CardTitle className="text-3xl font-bold text-primary">{formatNumber(stats?.totalVacancies || 0)}</CardTitle>
                        )}
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Open Vacancies
                        </CardDescription>
                        {isLoadingStats ? (
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mt-2" />
                        ) : (
                            <CardTitle className="text-3xl font-bold">{formatNumber(stats?.openVacancies || 0)}</CardTitle>
                        )}
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-medium flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-rose-500" />
                            Closed Vacancies
                        </CardDescription>
                        {isLoadingStats ? (
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mt-2" />
                        ) : (
                            <CardTitle className="text-3xl font-bold">{formatNumber(stats?.closedVacancies || 0)}</CardTitle>
                        )}
                    </CardHeader>
                </Card>
                <Card className="border-indigo-200 bg-indigo-50/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-indigo-700 font-medium flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            Open Positions
                        </CardDescription>
                        {isLoadingStats ? (
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-700/40 mt-2" />
                        ) : (
                            <CardTitle className="text-3xl font-bold text-indigo-700">{formatNumber(stats?.totalOpenPositions || 0)}</CardTitle>
                        )}
                    </CardHeader>
                </Card>
            </div>

            <VacancyFilters />

            <div className="mt-4">
                {isLoading ? (
                    <TableSkeleton columnCount={6} />
                ) : (
                    <DataTable columns={columns} data={vacancies} />
                )}
            </div>
        </div>
    )
}

export default function VacanciesPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <TableSkeleton columnCount={6} />
            </div>
        }>
            <VacanciesPageContent />
        </Suspense>
    )
}
