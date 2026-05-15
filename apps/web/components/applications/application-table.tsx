'use client'

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
    return (
        <div className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900/40 border">
            <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                    <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="font-medium text-xs text-slate-500 uppercase tracking-wider px-8 py-4">Position</TableHead>
                        <TableHead className="font-medium text-xs text-slate-500 uppercase tracking-wider px-8 py-4 hidden md:table-cell">Department</TableHead>
                        <TableHead className="font-medium text-xs text-slate-500 uppercase tracking-wider px-8 py-4 hidden sm:table-cell">Applied Date</TableHead>
                        <TableHead className="font-medium text-xs text-slate-500 uppercase tracking-wider px-8 py-4">Status</TableHead>
                        <TableHead className="font-medium text-xs text-slate-500 uppercase tracking-wider px-8 py-4 text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((application) => (
                        <TableRow key={application.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0">
                            <TableCell className="px-8 py-5">
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-medium text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                        {application.vacancy?.title}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase md:hidden">
                                        {(application.vacancy as any)?.department?.name}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="px-8 py-5 hidden md:table-cell">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Building className="h-3.5 w-3.5 opacity-40" />
                                    {(application.vacancy as any)?.department?.name}
                                </div>
                            </TableCell>
                            <TableCell className="px-8 py-5 hidden sm:table-cell">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Calendar className="h-3.5 w-3.5 opacity-40" />
                                    {format(new Date(application.appliedAt), 'MMM dd, yyyy')}
                                </div>
                            </TableCell>
                            <TableCell className="px-8 py-5">
                                <ApplicationStatusBadge status={application.status} />
                            </TableCell>
                            <TableCell className="px-8 py-5 text-right">
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all" asChild>
                                    <Link href={`/dashboard/applications/${application.id}`}>
                                        <Eye className="h-5 w-5" />
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
