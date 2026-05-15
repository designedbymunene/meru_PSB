"use client"

import { useAllApplications } from "@/hooks/use-applications"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export function ApplicationStatusOverview() {
    const { data, isLoading } = useAllApplications()
    const applications = data?.data || []

    const total = applications.length
    
    const statuses = [
        { key: 'pending', label: 'Pending Review', color: 'bg-slate-500', badgeVariant: 'secondary' as const },
        { key: 'shortlisted', label: 'Shortlisted', color: 'bg-blue-500', badgeVariant: 'default' as const },
        { key: 'interviewed', label: 'Interviewed', color: 'bg-purple-500', badgeVariant: 'default' as const },
        { key: 'accepted', label: 'Accepted', color: 'bg-green-500', badgeVariant: 'default' as const },
        { key: 'rejected', label: 'Rejected', color: 'bg-red-500', badgeVariant: 'destructive' as const },
    ]

    const stats = statuses.map(status => {
        const count = applications.filter(a => a.status === status.key).length
        const percentage = total > 0 ? (count / total) * 100 : 0
        return { ...status, count, percentage }
    })

    if (isLoading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Application Overview</CardTitle>
                    <CardDescription>Loading status breakdown...</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between h-4 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
                            <div className="h-2 w-full bg-slate-50 dark:bg-slate-900 animate-pulse rounded" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Application Overview</CardTitle>
                <CardDescription>Breakdown by status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    {stats.map((stat) => (
                        <div key={stat.key} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${stat.color}`} />
                                    <span className="font-medium">{stat.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{stat.count}</span>
                                    <span className="font-bold">{Math.round(stat.percentage)}%</span>
                                </div>
                            </div>
                            <Progress value={stat.percentage} className="h-2" />
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-500">Total Applications</span>
                        <span className="text-xl font-bold">{total}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
