"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
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
import { Input } from "@/components/ui/input"
import { ReactNode, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn, formatNumber } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
    searchPlaceholder?: string
    toolbar?: ReactNode
    onRowSelectionChange?: (selectedRows: TData[]) => void
    className?: string
    manualPagination?: boolean
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = "Filter...",
    toolbar,
    onRowSelectionChange,
    className,
    manualPagination = false
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = useState({})

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        manualPagination: manualPagination,
        state: {
            sorting,
            columnFilters,
            rowSelection,
        },
    })

    const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original)
    
    useEffect(() => {
        if (onRowSelectionChange) {
            onRowSelectionChange(selectedRows)
        }
    }, [rowSelection, onRowSelectionChange]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between gap-4">
                {searchKey ? (
                    <div className="flex flex-1 items-center">
                        <Input
                            placeholder={searchPlaceholder}
                            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn(searchKey)?.setFilterValue(event.target.value)
                            }
                            className="max-w-sm"
                            aria-label={`Search by ${searchPlaceholder}`}
                        />
                    </div>
                ) : <div className="flex-1" />}
                {toolbar && <div className="flex items-center gap-2" role="toolbar">{toolbar}</div>}
            </div>
            <div className="rounded-md border" role="region" aria-label="Data table">
                <Table role="table" aria-label="Data results table">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} role="row">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="px-6" role="columnheader">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, idx) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    role="row"
                                    aria-rowindex={idx + 1}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-6 py-4" role="cell">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow role="row">
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                    role="cell"
                                >
                                    <div className="flex h-full items-center justify-center text-muted-foreground p-4">
                                        No results found.
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {!manualPagination && (
                <div className="flex items-center justify-between space-x-2 py-4" role="navigation" aria-label="Table pagination">
                    <div className="flex-1 text-sm text-muted-foreground" role="status" aria-live="polite">
                        {formatNumber(table.getFilteredSelectedRowModel().rows.length)} of{" "}
                        {formatNumber(table.getFilteredRowModel().rows.length)} row(s) selected.
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            aria-label="Go to previous page"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            aria-label="Go to next page"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

