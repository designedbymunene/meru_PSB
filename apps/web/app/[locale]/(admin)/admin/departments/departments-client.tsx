"use client"

import { useDepartments, useDeleteDepartment } from "@/hooks/use-departments"
import { DataTable } from "@/components/admin/data-table"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Building2, CheckCircle, XCircle, Calendar } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { Department, ApiResponse } from "@/types"
import { Badge } from "@/components/ui/badge"
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
import { DepartmentFormSheet } from "@/components/admin/department-form-sheet"
import { formatDistanceToNow } from "date-fns"

interface DepartmentsClientProps {
    initialData?: ApiResponse<Department[]>
}

export function DepartmentsClient({ initialData }: DepartmentsClientProps) {
    const { data: deptsData, isLoading } = useDepartments(initialData)

    const deleteDepartment = useDeleteDepartment()
    const departments = deptsData?.data || []

    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [departmentToDelete, setDepartmentToDelete] = useState<number | null>(null)
    const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)

    // Calculate stats
    const totalDepartments = departments.length
    const activeDepartments = departments.filter(d => d.status === 'active').length
    const inactiveDepartments = departments.filter(d => d.status === 'inactive').length

    const handleDelete = (id: number) => {
        setDepartmentToDelete(id)
        setShowDeleteDialog(true)
    }

    const confirmDelete = () => {
        if (departmentToDelete) {
            deleteDepartment.mutate(departmentToDelete)
            setShowDeleteDialog(false)
            setDepartmentToDelete(null)
        }
    }

    const columns: ColumnDef<Department>[] = [
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
                const department = row.original

                return (
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingDepartment(department)}
                        >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit department</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(department.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete department</span>
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
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Departments</h2>
                    <p className="text-slate-500 font-medium mt-1">Manage organizational departments</p>
                </div>
                <Button onClick={() => setIsCreateSheetOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Department
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                    title="Total Departments"
                    value={isLoading ? 0 : totalDepartments}
                    loading={isLoading}
                    icon={Building2}
                    description="All departments"
                />
                <StatsCard
                    title="Active Departments"
                    value={isLoading ? 0 : activeDepartments}
                    loading={isLoading}
                    icon={CheckCircle}
                    description="Currently active"
                />
                <StatsCard
                    title="Inactive Departments"
                    value={isLoading ? 0 : inactiveDepartments}
                    loading={isLoading}
                    icon={XCircle}
                    description="Currently inactive"
                />
            </div>

            {/* Table */}
            <div className="hidden md:block">
                {isLoading ? (
                    <TableSkeleton columnCount={5} />
                ) : (
                    <DataTable columns={columns} data={departments} searchKey="name" searchPlaceholder="Search departments..." />
                )}
            </div>

            {/* Create/Edit Sheet */}
            <DepartmentFormSheet
                open={isCreateSheetOpen || !!editingDepartment}
                onOpenChange={(open) => {
                    setIsCreateSheetOpen(open)
                    if (!open) setEditingDepartment(null)
                }}
                department={editingDepartment}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the department.
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
