'use client'

import { useSearchParams } from 'next/navigation'
import { ProfileCompletionModal } from '@/components/modals'
import { useVacancies } from '@/hooks/use-vacancies'
import { useDashboard } from '@/hooks/use-dashboard'
import { useAuthContext } from '@/providers'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { OngoingActivity } from '@/components/dashboard/ongoing-activity'
import { Button } from '@/components/ui/button'
import { ChevronRight, Search, Eye, ExternalLink, Calendar as CalendarIcon, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export function DashboardContent() {
    const { user } = useAuthContext()
    const searchParams = useSearchParams()
    const showProfileModal = searchParams.get('showProfileModal') === 'true'

    const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard()
    const { data: vacancies } = useVacancies()

    if (isDashboardLoading) {
        return (
            <div className="space-y-8 animate-pulse pb-12">
                <div className="flex justify-between items-center">
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-32 rounded-full" />
                        <Skeleton className="h-10 w-64 rounded-xl" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
                <div className="grid lg:grid-cols-3 gap-8">
                    <Skeleton className="lg:col-span-1 h-[400px] w-full rounded-[2.5rem]" />
                    <Skeleton className="lg:col-span-2 h-[400px] w-full rounded-3xl" />
                </div>
            </div>
        )
    }

    const data = dashboardData?.data
    const today = new Date()

    return (
        <div className="pb-16 space-y-12">
            {/* Refined Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500 font-medium text-xs uppercase tracking-wider">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {format(today, 'EEEE, MMMM do')}
                    </div>
                    <h1 className="text-4xl font-semibold text-slate-900 dark:text-white tracking-tight">
                        Hello, {user?.fullName?.split(' ')[0] || 'Applicant'}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-slate-800 text-sm font-medium px-5 h-10" asChild>
                        <Link href="/vacancies">
                            <Search className="mr-2 h-4 w-4" />
                            Browse Vacancies
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            {data && <DashboardStats stats={data.quickStats} />}

            {/* Ongoing Activity - Horizontal Scroll Row */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white px-1">Active Progress</h2>
                <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                    {data?.ongoingActivity ? (
                        <OngoingActivity activity={data.ongoingActivity} />
                    ) : (
                        <div className="flex-1">
                            <OngoingActivity activity={null} />
                        </div>
                    )}
                    {/* Placeholder for multiple items if API supports it in future */}
                </div>
            </div>

            {/* Recent Submissions - Full Width Row */}
            <div className="space-y-6">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Recent Applications</h2>
                    <Button variant="link" size="sm" className="text-primary font-medium text-base h-auto p-0 hover:no-underline" asChild>
                        <Link href="/dashboard/applications" className="flex items-center gap-1">
                            View all applications <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
                
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900/40">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="font-medium text-sm text-slate-500 uppercase tracking-wider px-8 py-5">Position</TableHead>
                                <TableHead className="font-medium text-sm text-slate-500 uppercase tracking-wider px-8 py-5 hidden sm:table-cell">Applied Date</TableHead>
                                <TableHead className="font-medium text-sm text-slate-500 uppercase tracking-wider px-8 py-5 text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.ongoingActivity ? (
                                <TableRow className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0">
                                    <TableCell className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                                {data.ongoingActivity.vacancy.title}
                                            </span>
                                            <span className="text-sm text-slate-400 font-medium uppercase">
                                                {data.ongoingActivity.vacancy.refNumber}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 py-6 hidden sm:table-cell">
                                        <span className="text-base text-slate-500">
                                            {format(new Date(), 'MMMM dd, yyyy')}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-8 py-6 text-right">
                                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all" asChild>
                                            <Link href={`/dashboard/applications/${data.ongoingActivity.id.replace('app_', '')}`}>
                                                <Eye className="h-6 w-6" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-40 text-center">
                                        <p className="text-slate-400 text-base">No recent applications found</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {showProfileModal && <ProfileCompletionModal open={true} />}
        </div>
    )
}
