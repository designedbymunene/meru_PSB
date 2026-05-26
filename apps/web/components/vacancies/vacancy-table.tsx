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
import { Badge } from "@/components/ui/badge"
import { Eye, Calendar, Building, Users } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import type { VacancyWithRelations } from "@/types"

interface VacancyTableProps {
    data: VacancyWithRelations[]
}

export function VacancyTable({ data }: VacancyTableProps) {
    const columns: ColumnDef<VacancyWithRelations>[] = [
        {
            accessorKey: "title",
            header: "Vacancies",
            cell: ({ row }) => {
                const vacancy = row.original
                return (
                    <div className="flex flex-col gap-1 py-1 max-w-[320px] md:max-w-[400px]">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors whitespace-normal break-words leading-snug">
                            {vacancy.title}
                        </span>
                        <div className="flex flex-col gap-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {vacancy.department && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Building className="h-3.5 w-3.5 shrink-0 opacity-60" />
                                    <span className="whitespace-normal break-words leading-tight">{vacancy.department.name}</span>
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
            accessorKey: "jobGroup",
            header: "Job Group",
            cell: ({ row }) => {
                const vacancy = row.original
                return (
                    <div className="flex flex-col gap-1 py-1">
                        <Badge variant="outline" className="w-fit text-[10px] font-semibold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 uppercase tracking-wide">
                            {vacancy.jobGroup?.name || 'Job Group'}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <Users className="h-3.5 w-3.5 shrink-0 opacity-60" />
                            <span>{vacancy.openPositions} {vacancy.openPositions === 1 ? 'Position' : 'Positions'}</span>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "closingDate",
            header: "Deadline",
            cell: ({ row }) => {
                const date = new Date(row.original.closingDate)
                const isExpired = date < new Date()
                return (
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className={`h-3.5 w-3.5 shrink-0 ${isExpired ? 'text-red-400' : 'opacity-40'}`} />
                        <span className={isExpired ? 'text-red-500 font-semibold' : 'text-slate-500'}>
                            {format(date, 'MMM dd, yyyy')}
                        </span>
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
                        <Link href={`/vacancies/${row.original.id}`}>
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
                                <TableHead key={header.id} className="font-medium text-xs text-slate-500 uppercase tracking-wider px-4 md:px-6 py-4">
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
                                data-state={row.getIsSelected() && "selected"}
                                className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="px-4 md:px-6 py-4">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400 text-sm">
                                No results found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
