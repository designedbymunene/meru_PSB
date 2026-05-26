"use client"

import { useJobGroups, useDeleteJobGroup } from "@/hooks/use-job-groups"
import { DataTable } from "@/components/admin/data-table"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Briefcase, CheckCircle, XCircle, Calendar } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { JobGroup, ApiResponse } from "@/types"
import { Badge } from "@/components/ui/badge"
import { formatNumber } from "@/lib/utils"
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
import { useState } from "react"
import { StatsCard } from "@/components/admin/stats-card"
import { JobGroupFormSheet } from "@/components/admin/job-group-form-sheet"
import { formatDistanceToNow } from "date-fns"

interface JobGroupsClientProps {
    initialData?: ApiResponse<JobGroup[]>
}

export function JobGroupsClient({ initialData }: JobGroupsClientProps) {
    const { data, isLoading } = useJobGroups(initialData)
    const deleteJobGroup = useDeleteJobGroup()
    const jobGroups = data?.data || []

    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [jobGroupToDelete, setJobGroupToDelete] = useState<number | null>(null)
    const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
    const [editingJobGroup, setEditingJobGroup] = useState<JobGroup | null>(null)

    // Calculate stats
    const totalJobGroups = jobGroups.length
    const activeJobGroups = jobGroups.filter(j => j.status === 'active').length
    const inactiveJobGroups = jobGroups.filter(j => j.status === 'inactive').length

    const handleDelete = (id: number) => {
        setJobGroupToDelete(id)
        setShowDeleteDialog(true)
    }

    const confirmDelete = () => {
        if (jobGroupToDelete) {
            deleteJobGroup.mutate(jobGroupToDelete)
            setShowDeleteDialog(false)
            setJobGroupToDelete(null)
        }
    }

    const columns: ColumnDef<JobGroup>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <div className="font-medium">{row.original.name}</div>
            ),
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => (
                <div className="max-w-md truncate text-sm text-muted-foreground">
                    {row.original.description || "-"}
                </div>
            ),
        },
        {
            accessorKey: "salaryMin",
            header: "Min Salary",
            cell: ({ row }) => (
                <div className="text-sm">{formatNumber(row.original.salaryMin)}</div>
            ),
        },
        {
            accessorKey: "salaryMax",
            header: "Max Salary",
            cell: ({ row }) => (
                <div className="text-sm">{formatNumber(row.original.salaryMax)}</div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
                    {row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Created",
            cell: ({ row }) => (
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const jobGroup = row.original

                return (
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingJobGroup(jobGroup)}
                        >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit job group</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(jobGroup.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete job group</span>
                        </Button>
                    </div>
                )
            },
        },
    ]

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Job Groups</h2>
                    <p className="text-slate-500 font-medium mt-1">Manage job groups and salary scales</p>
                </div>
                <Button onClick={() => setIsCreateSheetOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Job Group
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                    title="Total Job Groups"
                    value={isLoading ? 0 : totalJobGroups}
                    loading={isLoading}
                    icon={Briefcase}
                    description="All job groups"
                    className="col-span-1"
                />
                <StatsCard
                    title="Active Job Groups"
                    value={isLoading ? 0 : activeJobGroups}
                    loading={isLoading}
                    icon={CheckCircle}
                    description="Currently active"
                    className="col-span-1"
                />
                <StatsCard
                    title="Inactive Job Groups"
                    value={isLoading ? 0 : inactiveJobGroups}
                    loading={isLoading}
                    icon={XCircle}
                    description="Currently inactive"
                    className="col-span-1"
                />
            </div>

            {/* Table */}
            <div className="hidden md:block">
                {isLoading ? (
                    <TableSkeleton columnCount={7} />
                ) : (
                    <DataTable columns={columns} data={jobGroups} searchKey="name" searchPlaceholder="Search job groups..." />
                )}
            </div>

            {/* Create/Edit Sheet */}
            <JobGroupFormSheet
                open={isCreateSheetOpen || !!editingJobGroup}
                onOpenChange={(open) => {
                    setIsCreateSheetOpen(open)
                    if (!open) setEditingJobGroup(null)
                }}
                jobGroup={editingJobGroup}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the job group.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
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
