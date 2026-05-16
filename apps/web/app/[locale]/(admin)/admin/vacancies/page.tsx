"use client"

import { useVacancies, useDeleteVacancy } from "@/hooks/use-vacancies"
import { DataTable } from "@/components/admin/data-table"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Edit, Trash, FileText, Users } from "lucide-react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { VacancyWithRelations } from "@/types"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { formatNumber } from "@/lib/utils"
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
import { VacancyFilters } from "@/components/vacancies/vacancy-filters"
import { useQueryState } from "nuqs"

const VacancyActions = ({ vacancy }: { vacancy: VacancyWithRelations }) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const deleteVacancy = useDeleteVacancy()

    return (
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild title="View Details">
                <Link href={`/admin/vacancies/${vacancy.id}`}>
                    <FileText className="h-4 w-4" />
                    <span className="sr-only">View</span>
                </Link>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild title="Edit Vacancy">
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

export default function VacanciesPage() {
    const [search] = useQueryState('search')
    const [status] = useQueryState('status')
    const [departmentId] = useQueryState('departmentId')
    const [jobGroupId] = useQueryState('jobGroupId')

    const filters = {
        search: search || undefined,
        status: (status as 'open' | 'closed') || undefined,
        departmentId: departmentId || undefined,
        jobGroupId: jobGroupId || undefined,
    }

    const { data, isLoading } = useVacancies(filters)
    const vacancies = data?.data || []

    const columns: ColumnDef<VacancyWithRelations>[] = [
        {
            accessorKey: "advertisementNumber",
            header: "Ref No.",
            cell: ({ row }) => (
                <span className="font-mono text-xs font-medium">{row.original.advertisementNumber}</span>
            )
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{row.original.title}</span>
                    <span className="text-xs text-muted-foreground">{row.original.department?.name}</span>
                </div>
            )
        },
        {
            accessorKey: "closingDate",
            header: "Closing Date",
            cell: ({ row }) => {
                const date = new Date(row.original.closingDate)
                const isExpired = date < new Date() && row.original.status === 'open'
                return (
                    <div className="flex flex-col">
                        <span>{format(date, "PP")}</span>
                        {isExpired && <span className="text-[10px] text-destructive font-bold uppercase">Expired</span>}
                    </div>
                )
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'open' ? 'default' : 'secondary'} className="capitalize">
                    {row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: "applicationsCount",
            header: () => (
                <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>Apps</span>
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold">{formatNumber(row.original.applicationsCount || 0)}</span>
                    <span className="text-[10px] text-muted-foreground">{formatNumber(row.original.openPositions)} positions</span>
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => <VacancyActions vacancy={row.original} />,
        },
    ]

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
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

            <VacancyFilters />

            <div className="mt-4">
                {isLoading ? (
                    <TableSkeleton columnCount={6} />
                ) : (
                    <DataTable columns={columns} data={vacancies} searchKey="title" />
                )}
            </div>
        </div>
    )
}
