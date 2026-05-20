'use client'

import { FileText, CheckCircle, Clock, Bookmark } from 'lucide-react'
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
            description: 'Applications submitted',
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50/50 dark:bg-blue-900/10',
            hoverGlow: 'hover:border-blue-300 dark:hover:border-blue-800/40 hover:shadow-blue-500/5',
        },
        {
            label: 'Shortlisted',
            value: stats.shortlisted,
            icon: CheckCircle,
            description: 'Qualified for review',
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50/50 dark:bg-emerald-900/10',
            hoverGlow: 'hover:border-emerald-300 dark:hover:border-emerald-800/40 hover:shadow-emerald-500/5',
        },
        {
            label: 'Interviews',
            value: stats.interviews,
            icon: Clock,
            description: 'Upcoming schedules',
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50/50 dark:bg-amber-900/10',
            hoverGlow: 'hover:border-amber-300 dark:hover:border-amber-800/40 hover:shadow-amber-500/5',
        },
        {
            label: 'Saved',
            value: stats.saved,
            icon: Bookmark,
            description: 'Saved vacancies',
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50/50 dark:bg-indigo-900/10',
            hoverGlow: 'hover:border-indigo-300 dark:hover:border-indigo-800/40 hover:shadow-indigo-500/5',
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, idx) => (
                <Card 
                    key={idx} 
                    className={cn(
                        "group border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 rounded-2xl shadow-sm py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
                        item.hoverGlow
                    )}
                >
                    <CardContent className="p-5 flex items-start gap-4">
                        <div className={cn("p-2.5 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110", item.bg)}>
                            <item.icon className={cn("h-5 w-5", item.color)} />
                        </div>
                        <div className="space-y-1 min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                {item.label}
                            </p>
                            <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">
                                {item.value.toLocaleString()}
                            </p>
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                                {item.description}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
