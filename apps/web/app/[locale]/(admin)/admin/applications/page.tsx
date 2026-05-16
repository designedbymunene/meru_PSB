"use client"

import { useAllApplications, useExportApplications, useBulkUpdateStatus } from "@/hooks/use-applications"
import { DataTable } from "@/components/admin/data-table"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { ColumnDef } from "@tanstack/react-table"
import { ApplicationWithRelations } from "@/types"
import { ApplicationStatusBadge } from "@/components/admin/application-status-badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye, CheckCircle, Download, Search, FilterX, MoreHorizontal } from "lucide-react"
import { ApplicationReviewDialog } from "@/components/admin/application-review-dialog"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useVacancies } from "@/hooks/use-vacancies"
import { useQueryState } from "nuqs"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { formatNumber } from "@/lib/utils"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"


export default function ApplicationsPage() {
    const [vacancyId, setVacancyId] = useQueryState('vacancyId', { defaultValue: 'all', shallow: false })
    const [status, setStatus] = useQueryState('status', { defaultValue: 'all', shallow: false })
    const [search, setSearch] = useQueryState('search', { defaultValue: '', shallow: false, throttleMs: 500 })
    
    const [selectedRows, setSelectedRows] = useState<ApplicationWithRelations[]>([])

    const filters = {
        vacancyId: vacancyId !== 'all' ? vacancyId : undefined,
        status: status !== 'all' ? (status as any) : undefined,
        searchTerm: search || undefined,
        sortBy: 'appliedAt' as const,
        order: 'desc' as const,
        limit: '100',
        offset: '0'
    }

    const { data, isLoading } = useAllApplications(filters)
    const applications = data?.data || []

    const { data: vacancies } = useVacancies()

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
            id: "applicantName",
            accessorFn: (row) => row.applicant?.fullName,
            header: "Applicant",
            cell: ({ row }) => {
                const applicant = row.original.applicant
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-slate-100">{applicant?.fullName || 'Anonymous'}</span>
                        <span className="text-xs text-muted-foreground">{applicant?.email}</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "vacancy.title",
            header: "Vacancy",
            cell: ({ row }) => (
                <div className="flex flex-col max-w-[200px]">
                    <span className="truncate font-medium">{row.original.vacancy?.title}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{row.original.vacancy?.advertisementNumber}</span>
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <ApplicationStatusBadge status={row.original.status} />
        },
        {
            accessorKey: "appliedAt",
            header: "Submitted",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm">{format(new Date(row.original.appliedAt), "PP")}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{format(new Date(row.original.appliedAt), "p")}</span>
                </div>
            ),
        },

        {
            id: "actions",
            cell: ({ row }) => {
                const application = row.original
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const [showReviewDialog, setShowReviewDialog] = useState(false)

                return (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="View Application">
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
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="Review">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="sr-only">Review</span>
                                </Button>
                            }
                        />
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/profiles/${application.applicantId}`}>
                                        View Applicant Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                    Reject Application
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        },
    ]

    const { mutate: exportApps, isPending: isExporting } = useExportApplications()
    const { mutate: bulkUpdate, isPending: isBulkUpdating } = useBulkUpdateStatus()

    const handleExport = () => {
        exportApps(filters)
    }

    const handleBulkStatusUpdate = (newStatus: string) => {
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

    const clearFilters = () => {
        setVacancyId('all')
        setStatus('all')
        setSearch('')
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
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

                <div className="grid gap-4 md:grid-cols-12 items-end">
                    <div className="md:col-span-4 relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-9 h-10"
                            value={search || ''}
                            onChange={(e) => setSearch(e.target.value || null)}
                        />
                    </div>
                    
                    <div className="md:col-span-3">
                        <Select value={vacancyId || 'all'} onValueChange={(val) => setVacancyId(val)}>
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="All Vacancies" />
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

                    <div className="md:col-span-3">
                        <Select value={status || 'all'} onValueChange={(val) => setStatus(val)}>
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="reviewed">Reviewed</SelectItem>
                                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                <SelectItem value="interviewed">Interviewed</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="md:col-span-2">
                        <Button 
                            variant="ghost" 
                            className="w-full h-10 justify-start px-2 text-muted-foreground hover:text-primary"
                            onClick={clearFilters}
                            disabled={!search && vacancyId === 'all' && status === 'all'}
                        >
                            <FilterX className="mr-2 h-4 w-4" />
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </div>

            <div className="hidden md:block">
                {isLoading ? (
                    <TableSkeleton columnCount={6} />
                ) : (
                    <DataTable 
                        columns={columns} 
                        data={applications} 
                        onRowSelectionChange={setSelectedRows}
                        toolbar={
                            selectedRows.length > 0 && (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                    <span className="text-sm font-medium mr-2">{formatNumber(selectedRows.length)} selected</span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="sm" variant="outline" className="h-8" disabled={isBulkUpdating}>
                                                Bulk Action
                                                <MoreHorizontal className="ml-2 h-3 w-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Change Status To:</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('shortlisted')}>
                                                Shortlist
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('interviewed')}>
                                                Mark as Interviewed
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('accepted')}>
                                                Accept / Approve
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                className="text-destructive"
                                                onClick={() => handleBulkStatusUpdate('rejected')}
                                            >
                                                Reject Selected
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )
                        }
                    />
                )}
            </div>
        </div>
    )
}


