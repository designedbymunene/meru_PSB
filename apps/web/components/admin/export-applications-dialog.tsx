'use client'

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Download, Building2, Clock, Loader2 } from 'lucide-react'
import { useDepartments } from '@/hooks/use-departments'
import { useExportApplications } from '@/hooks/use-applications'

interface ExportApplicationsDialogProps {
    trigger?: React.ReactNode
}

export function ExportApplicationsDialog({ trigger }: ExportApplicationsDialogProps) {
    const [open, setOpen] = useState(false)
    const [departmentId, setDepartmentId] = useState<string>('all')
    const [status, setStatus] = useState<string>('all')

    const { data: departments, isLoading: isLoadingDepts } = useDepartments()
    const { mutate: exportApps, isPending: isExporting } = useExportApplications()

    const handleExport = () => {
        const filters = {
            departmentId: departmentId === 'all' ? undefined : departmentId,
            status: status === 'all' ? undefined : (status as any),
            offset: '0',
            order: 'desc' as const,
            sortBy: 'appliedAt' as const,
            limit: '50'
        }

        exportApps(filters, {
            onSuccess: () => {
                setOpen(false)
            }
        })
    }

    const statusOptions = [
        { label: 'All Statuses', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Under Review', value: 'under_review' },
        { label: 'Shortlisted', value: 'shortlisted' },
        { label: 'Interviewed', value: 'interviewed' },
        { label: 'Offered', value: 'offered' },
        { label: 'Not Successful', value: 'rejected' },
    ]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="h-10">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Export Applications</DialogTitle>
                    <DialogDescription>
                        Generate and download a CSV report of applications. You can filter by department or application status.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="department" className="text-sm font-semibold flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            Department
                        </Label>
                        <Select
                            value={departmentId}
                            onValueChange={setDepartmentId}
                            disabled={isLoadingDepts || isExporting}
                        >
                            <SelectTrigger id="department" className="w-full h-11 rounded-xl border-slate-200">
                                <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments?.data?.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            Application Status
                        </Label>
                        <Select
                            value={status}
                            onValueChange={setStatus}
                            disabled={isExporting}
                        >
                            <SelectTrigger id="status" className="w-full h-11 rounded-xl border-slate-200">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={isExporting}
                        className="rounded-xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="rounded-xl font-bold shadow-md shadow-primary/20"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Download CSV
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
