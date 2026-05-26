'use client'

import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Calendar, Building } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ApplicationStatusBadge } from "./application-status-badge"
import type { ApplicationWithRelations } from "@/types"

interface ApplicationTableProps {
    data: ApplicationWithRelations[]
}

export function ApplicationTable({ data }: ApplicationTableProps) {
    const columns: ColumnDef<ApplicationWithRelations>[] = [
        {
            accessorKey: "vacancy.title",
            header: "Applications",
            cell: ({ row }) => {
                const application = row.original
                const vacancy = application.vacancy
                if (!vacancy) return null
                
                return (
                    <div className="flex flex-col gap-1 py-1 max-w-[320px] md:max-w-[400px]">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors whitespace-normal break-words leading-snug">
                            {vacancy.title}
                        </span>
                        <div className="flex flex-col gap-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {(vacancy as any).department && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Building className="h-3.5 w-3.5 shrink-0 opacity-60" />
                                    <span className="whitespace-normal break-words leading-tight">{(vacancy as any).department.name}</span>
                                </div>
                            )}
                            <span className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">
                                Advert No: {vacancy.advertisementNumber}
                            </span>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <ApplicationStatusBadge status={row.original.status} />
            ),
        },
        {
            accessorKey: "appliedAt",
            header: "Applied Date",
            cell: ({ row }) => {
                const date = new Date(row.original.appliedAt)
                return (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="h-3.5 w-3.5 shrink-0 opacity-40" />
                        <span>{format(date, 'MMM dd, yyyy')}</span>
                    </div>
                )
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right">Action</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all" asChild>
                        <Link href={`/dashboard/applications/${row.original.id}`}>
                            <Eye className="h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            ),
        },
    ]

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900/40 border">
            <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id} className="font-medium text-xs text-slate-500 uppercase tracking-wider px-8 py-4">
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="px-8 py-4">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400 text-sm">
                                No applications found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
