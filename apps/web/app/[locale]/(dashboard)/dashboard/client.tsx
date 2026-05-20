'use client'

import { useSearchParams } from 'next/navigation'
import { ProfileCompletionModal } from '@/components/modals'
import { useVacancies } from '@/hooks/use-vacancies'
import { useDashboard } from '@/hooks/use-dashboard'
import { useAuthContext } from '@/providers'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { OngoingActivity } from '@/components/dashboard/ongoing-activity'
import { RecommendedVacancies } from '@/components/dashboard/recommended-vacancies'
import { Button } from '@/components/ui/button'
import { ChevronRight, Search, Eye, Calendar as CalendarIcon, ArrowRight, User as UserIcon, FileText } from 'lucide-react'
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
import { format } from 'date-fns'

export function DashboardContent() {
    const { user } = useAuthContext()
    const searchParams = useSearchParams()
    const showProfileModal = searchParams.get('showProfileModal') === 'true'

    const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard()

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
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
                <div className="space-y-8">
                    <Skeleton className="h-[250px] w-full rounded-3xl" />
                    <Skeleton className="h-[300px] w-full rounded-3xl" />
                    <Skeleton className="h-[250px] w-full rounded-3xl" />
                </div>
            </div>
        )
    }

    const data = dashboardData?.data
    const today = new Date()

    return (
        <div className="pb-16 space-y-10">
            {/* 1. Welcome Section & Actions Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/10 dark:border-primary/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2 relative z-10">
                    <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                        <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                        {format(today, 'EEEE, MMMM do, yyyy')}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Welcome back, {user?.fullName?.split(' ')[0] || 'Applicant'}!
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl font-medium">
                        Track your active job applications, complete your profile details, and discover recommended public service vacancies.
                    </p>
                </div>
                <div className="flex items-center gap-3 relative z-10 shrink-0 w-full md:w-auto">
                    <Button variant="default" size="default" className="rounded-xl shadow-lg shadow-primary/10 text-sm font-semibold px-6 h-11 flex-1 md:flex-none" asChild>
                        <Link href="/vacancies">
                            <Search className="mr-2 h-4 w-4" />
                            Explore Jobs
                        </Link>
                    </Button>
                    <Button variant="outline" size="default" className="rounded-xl border-slate-200 dark:border-slate-800 text-sm font-semibold px-6 h-11 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50 flex-1 md:flex-none" asChild>
                        <Link href="/dashboard/profile">
                            <UserIcon className="mr-2 h-4 w-4 text-slate-500" />
                            My Profile
                        </Link>
                    </Button>
                </div>
                {/* Visual decorations */}
                <div className="absolute right-0 top-0 -mt-6 -mr-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute left-1/3 bottom-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* 2. Quick Stats Counters */}
            {data && <DashboardStats stats={data.quickStats} />}

            {/* 3. Ongoing Activity - Horizontal Scroll Row */}
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

            {/* 4. Recommended vacancies grid */}
            {data && data.recommended && data.recommended.length > 0 && (
                <RecommendedVacancies vacancies={data.recommended} />
            )}

            {/* 5. Recent Submissions list */}
            <div className="space-y-5">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Recent Applications</h2>
                    <Button variant="ghost" size="sm" className="text-primary font-medium text-base h-auto p-0 hover:no-underline" asChild>
                        <Link href="/dashboard/applications" className="flex items-center gap-1">
                            View all <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
                
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900/40">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="font-semibold text-xs text-slate-400 uppercase tracking-wider px-6 py-4">Position</TableHead>
                                <TableHead className="font-semibold text-xs text-slate-400 uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Applied Date</TableHead>
                                <TableHead className="font-semibold text-xs text-slate-400 uppercase tracking-wider px-6 py-4 text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.ongoingActivity ? (
                                <TableRow className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/25 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0">
                                    <TableCell className="px-6 py-5">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight">
                                                {data.ongoingActivity.vacancy.title}
                                            </span>
                                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                                                {data.ongoingActivity.vacancy.refNumber}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 hidden sm:table-cell">
                                        <span className="text-sm font-semibold text-slate-500">
                                            {data.ongoingActivity.appliedAt 
                                                ? format(new Date(data.ongoingActivity.appliedAt), 'MMMM dd, yyyy') 
                                                : format(new Date(), 'MMMM dd, yyyy')}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-right">
                                        <Button variant="ghost" className="rounded-xl text-primary font-bold text-xs hover:bg-primary/5 hover:text-primary transition-all h-9 px-4" asChild>
                                            <Link href={`/dashboard/applications/${data.ongoingActivity.id.replace('app_', '')}`}>
                                                Track progress <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-32 text-center">
                                        <p className="text-slate-400 text-sm font-medium">No recent applications found</p>
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
