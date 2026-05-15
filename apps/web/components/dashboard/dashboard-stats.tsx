'use client'

import { FileText, CheckCircle, Clock, Bell } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DashboardStatsProps {
    stats: {
        applied: number
        shortlisted: number
        interviews: number
        saved: number
    }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    const items = [
        {
            label: 'Applied',
            value: stats.applied,
            icon: FileText,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50/50 dark:bg-blue-900/10',
        },
        {
            label: 'Shortlisted',
            value: stats.shortlisted,
            icon: CheckCircle,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50/50 dark:bg-emerald-900/10',
        },
        {
            label: 'Interviews',
            value: stats.interviews,
            icon: Clock,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50/50 dark:bg-amber-900/10',
        },
        {
            label: 'Saved',
            value: stats.saved,
            icon: Bell,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50/50 dark:bg-indigo-900/10',
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {items.map((item, idx) => (
                <Card key={idx} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 rounded-2xl shadow-sm py-0">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className={cn("p-2 rounded-xl", item.bg)}>
                            <item.icon className={cn("h-4 w-4", item.color)} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {item.label}
                            </p>
                            <p className="text-2xl font-semibold text-slate-900 dark:text-white leading-tight">
                                {item.value.toLocaleString()}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
