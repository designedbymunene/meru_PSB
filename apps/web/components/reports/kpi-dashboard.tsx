'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { KPIReport } from '@meru/shared'
import { Clock, Users, FileText, TrendingUp, BarChart3 } from 'lucide-react'

export function KPIDashboard({ data }: { data: KPIReport }) {
    const avgAppsPerVacancy = data.totalVacancies > 0 
        ? (data.totalApplications / data.totalVacancies).toFixed(1)
        : '0'

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Time to Shortlist</CardTitle>
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Math.round(data.timeToShortlist.avg)} days</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Range: <span className="font-medium">{data.timeToShortlist.min}-{data.timeToShortlist.max}</span> days
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Time to Interview</CardTitle>
                    <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Math.round(data.timeToInterview.avg)} days</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Range: <span className="font-medium">{data.timeToInterview.min}-{data.timeToInterview.max}</span> days
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Vacancies</CardTitle>
                    <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalVacancies}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">{data.totalApplications}</span> total applications
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Apps / Vacancy</CardTitle>
                    <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{avgAppsPerVacancy}</div>
                    <p className="text-xs text-muted-foreground mt-1">Application reach</p>
                </CardContent>
            </Card>

            <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                    <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.averageRating.toFixed(1)}/10</div>
                    <p className="text-xs text-muted-foreground mt-1">Candidate quality score</p>
                </CardContent>
            </Card>
        </div>
    )
}
