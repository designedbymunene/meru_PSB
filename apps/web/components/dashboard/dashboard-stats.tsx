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
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            borderColor: 'border-blue-100',
        },
        {
            label: 'Shortlisted',
            value: stats.shortlisted,
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-50',
            borderColor: 'border-green-100',
        },
        {
            label: 'Interviews',
            value: stats.interviews,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            borderColor: 'border-amber-100',
        },
        {
            label: 'Saved',
            value: stats.saved,
            icon: Bell,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            borderColor: 'border-indigo-100',
        },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {items.map((item, idx) => (
                <Card key={idx} className={cn("border shadow-sm overflow-hidden", item.borderColor)}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className={cn("p-2 rounded-xl", item.bg)}>
                            <item.icon className={cn("h-5 w-5", item.color)} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{item.value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
