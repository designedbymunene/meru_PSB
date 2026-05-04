"use client"

import { useJobGroups, useDeleteJobGroup } from "@/hooks/use-job-groups"
import { DataTable } from "@/components/admin/data-table"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Edit, Trash } from "lucide-react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { JobGroup } from "@/types"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

export default function JobGroupsPage() {
    const { data, isLoading } = useJobGroups()
    const deleteJobGroup = useDeleteJobGroup()
    const jobGroups = data?.data || []

    const columns: ColumnDef<JobGroup>[] = [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "salaryMin",
            header: "Min Salary",
        },
        {
            accessorKey: "salaryMax",
            header: "Max Salary",
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
            id: "actions",
            cell: ({ row }) => {
                const jobGroup = row.original
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const [showDeleteDialog, setShowDeleteDialog] = useState(false)

                return (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/job-groups/${jobGroup.id}`}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)} className="text-destructive">
                                    <Trash className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => deleteJobGroup.mutate(jobGroup.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                )
            },
        },
    ]

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Job Groups</h2>
                <div className="flex items-center space-x-2">
                    <Button asChild>
                        <Link href="/admin/job-groups/new">
                            <Plus className="mr-2 h-4 w-4" /> Create Job Group
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="hidden md:block">
                {isLoading ? (
                    <TableSkeleton columnCount={5} />
                ) : (
                    <DataTable columns={columns} data={jobGroups} searchKey="name" />
                )}
            </div>
        </div>
    )
}
