"use client"

import { useVacancies } from "@/hooks/use-vacancies"
import { DataTable } from "@/components/admin/data-table"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { VacancyWithRelations } from "@/types"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash, FileText } from "lucide-react"
import { useDeleteVacancy } from "@/hooks/use-vacancies"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

export default function VacanciesPage() {
    const { data, isLoading } = useVacancies()
    const deleteVacancy = useDeleteVacancy()
    const vacancies = data?.data || []

    const columns: ColumnDef<VacancyWithRelations>[] = [
        {
            accessorKey: "advertisementNumber",
            header: "Ref No.",
        },
        {
            accessorKey: "title",
            header: "Title",
        },

        {
            accessorKey: "closingDate",
            header: "Closing Date",
            cell: ({ row }) => format(new Date(row.original.closingDate), "PP"),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'open' ? 'default' : 'secondary'}>
                    {row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: "applicationsCount", // Assuming backend returns this, otherwise we might not have it in list
            header: "Applications",
            cell: ({ row }) => {
                // Fallback if not available
                return row.original.openPositions ? `${row.original.openPositions} Pos.` : '-'
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const vacancy = row.original
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
                                    <Link href={`/admin/vacancies/${vacancy.id}`}>
                                        <FileText className="mr-2 h-4 w-4" /> View Details
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/vacancies/${vacancy.id}/edit`}>
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
                                        This action cannot be undone. This will permanently delete the vacancy.
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
                    </>
                )
            },
        },
    ]

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Vacancies</h2>
                <div className="flex items-center space-x-2">
                    <Button asChild>
                        <Link href="/admin/vacancies/new">
                            <Plus className="mr-2 h-4 w-4" /> Create Vacancy
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="hidden md:block">
                {isLoading ? (
                    <TableSkeleton columnCount={7} />
                ) : (
                    <DataTable columns={columns} data={vacancies} searchKey="title" />
                )}
            </div>
        </div>
    )
}
