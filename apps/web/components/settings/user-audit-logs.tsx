'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Shield,
    History,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    EyeOff,
    Key,
    LogOut,
    Smartphone,
    User,
    FileText,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    Calendar
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import type { AuditLog } from "@/lib/api/account"

interface UserAuditLogsProps {
    logs: AuditLog[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
    }
    onPageChange: (page: number) => void
    onFilterChange: (action?: string) => void
    isLoading?: boolean
}

const ACTION_CONFIG: Record<string, {
    label: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
    description: string
}> = {
    'LOGIN': {
        label: 'Login',
        icon: LogOut,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        description: 'Successfully logged into account'
    },
    'LOGOUT': {
        label: 'Logout',
        icon: LogOut,
        color: 'text-slate-600 dark:text-slate-400',
        bgColor: 'bg-slate-50 dark:bg-slate-800/50',
        description: 'Logged out of account'
    },
    'PASSWORD_CHANGE': {
        label: 'Password Changed',
        icon: Key,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        description: 'Account password was updated'
    },
    '2FA_ENABLED': {
        label: '2FA Enabled',
        icon: Shield,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        description: 'Two-factor authentication was enabled'
    },
    '2FA_DISABLED': {
        label: '2FA Disabled',
        icon: Shield,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        description: 'Two-factor authentication was disabled'
    },
    'SESSION_CREATED': {
        label: 'New Session',
        icon: Smartphone,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        description: 'New device logged into account'
    },
    'SESSION_REVOKED': {
        label: 'Session Revoked',
        icon: EyeOff,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        description: 'A session was revoked'
    },
    'PROFILE_UPDATED': {
        label: 'Profile Updated',
        icon: User,
        color: 'text-indigo-600 dark:text-indigo-400',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        description: 'Profile information was updated'
    },
    'DOCUMENT_UPLOADED': {
        label: 'Document Uploaded',
        icon: FileText,
        color: 'text-teal-600 dark:text-teal-400',
        bgColor: 'bg-teal-50 dark:bg-teal-900/20',
        description: 'A document was uploaded to account'
    },
    'DOCUMENT_DELETED': {
        label: 'Document Deleted',
        icon: FileText,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        description: 'A document was deleted from account'
    },
}

export function UserAuditLogs({
    logs,
    pagination,
    onPageChange,
    onFilterChange,
    isLoading = false
}: UserAuditLogsProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedAction, setSelectedAction] = useState<string>('all')

    const filteredLogs = logs.filter(log => {
        const matchesAction = selectedAction === 'all' || log.action === selectedAction
        const matchesSearch = !searchQuery ||
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.targetType.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesAction && matchesSearch
    })

    const getActionConfig = (action: string) => {
        return ACTION_CONFIG[action] || {
            label: action.replace(/_/g, ' '),
            icon: Info,
            color: 'text-slate-600 dark:text-slate-400',
            bgColor: 'bg-slate-50 dark:bg-slate-800/50',
            description: 'System action'
        }
    }

    const handleExport = () => {
        const csvContent = [
            ['Date', 'Action', 'Target Type', 'Target ID', 'IP Address'].join(','),
            ...logs.map(log => [
                format(new Date(log.createdAt), 'PPp'),
                log.action,
                log.targetType,
                log.targetId.toString(),
                log.ipAddress || 'N/A'
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const uniqueActions = Array.from(new Set(logs.map(log => log.action)))

    return (
        <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-slate-900/40">
            <CardHeader className="border-b border-slate-50 dark:border-slate-800/60 pb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2.5 rounded-xl">
                            <History className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Activity Logs</CardTitle>
                            <CardDescription>Track your account activity and security events</CardDescription>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={logs.length === 0}
                        className="rounded-xl"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search activities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-700"
                        />
                    </div>
                    <Select value={selectedAction} onValueChange={(value) => {
                        setSelectedAction(value)
                        onFilterChange(value === 'all' ? undefined : value)
                    }}>
                        <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-700 w-full sm:w-[200px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by action" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Actions</SelectItem>
                            {uniqueActions.map(action => (
                                <SelectItem key={action} value={action}>
                                    {getActionConfig(action).label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Logs */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 animate-pulse">
                                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-3xl border-slate-200 dark:border-slate-800">
                        <Calendar className="h-12 w-12 text-slate-300 mb-3" />
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">No activity logs found</p>
                        <p className="text-xs text-slate-500 font-medium">
                            {searchQuery || selectedAction !== 'all'
                                ? 'Try adjusting your filters to see more results'
                                : 'Your account activity will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredLogs.map((log, index) => {
                            const config = getActionConfig(log.action)
                            const Icon = config.icon

                            return (
                                <div
                                    key={log.id}
                                    className="group relative flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all hover:border-primary/20 hover:shadow-sm"
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                        config.bgColor
                                    )}>
                                        <Icon className={cn("h-5 w-5", config.color)} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {config.label}
                                                </p>
                                                <p className="text-xs text-slate-500 font-medium">
                                                    {config.description}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter py-0 flex-shrink-0">
                                                {log.targetType}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                                            <time className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(log.createdAt), 'PPp')}
                                            </time>
                                            {log.ipAddress && (
                                                <span className="flex items-center gap-1">
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    {log.ipAddress}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-500 font-medium">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} activities
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(pagination.page - 1)}
                                disabled={!pagination.hasPrev}
                                className="rounded-lg h-9"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum = i + 1
                                    if (pagination.page > 3) pageNum = pagination.page - 3 + i
                                    if (pageNum > pagination.totalPages) return null

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={pagination.page === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => onPageChange(pageNum)}
                                            className={cn(
                                                "rounded-lg h-9 w-9",
                                                pagination.page === pageNum && "bg-primary text-primary-foreground"
                                            )}
                                        >
                                            {pageNum}
                                        </Button>
                                    )
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(pagination.page + 1)}
                                disabled={!pagination.hasNext}
                                className="rounded-lg h-9"
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
