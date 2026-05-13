'use client'

import { useSearchParams } from 'next/navigation'
import { ProfileCompletionModal } from '@/components/modals'
import { ApplicationList } from '@/components/applications/application-list'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useVacancies } from '@/hooks/use-vacancies'
import { useDashboard } from '@/hooks/use-dashboard'
import { useAuthContext } from '@/providers'
import { useState } from 'react'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { OngoingActivity } from '@/components/dashboard/ongoing-activity'
import { VacancyCard } from '@/components/vacancies/vacancy-card'
import { Button } from '@/components/ui/button'
import { ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardContent() {
    const { user } = useAuthContext()
    const searchParams = useSearchParams()
    const showProfileModal = searchParams.get('showProfileModal') === 'true'
    const [vacancyId, setVacancyId] = useState<string>('all')

    const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard()
    const { data: vacancies } = useVacancies()

    if (isDashboardLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="flex justify-between items-end">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-48" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <Skeleton className="h-64 w-full rounded-3xl" />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        )
    }

    const data = dashboardData?.data

    return (
        <div className="pb-12">
            {/* Welcome Section */}
            <div className="flex flex-row justify-between items-center mb-8">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Welcome back,</p>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-0.5">
                        {user?.fullName?.split(' ')[0] || 'Applicant'} 👋
                    </h1>
                </div>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-slate-200 dark:border-slate-800" asChild>
                    <Link href="/vacancies">
                        <Search className="h-5 w-5" />
                    </Link>
                </Button>
            </div>

            {/* Quick Stats */}
            {data && <DashboardStats stats={data.quickStats} />}

            <div className="grid lg:grid-cols-3 gap-8 mb-12">
                {/* Ongoing Activity */}
                <div className="lg:col-span-1 space-y-5">
                    <div className="flex justify-between items-center px-1">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ongoing Activity</h2>
                        <Button variant="link" size="sm" className="text-primary font-bold text-xs" asChild>
                            <Link href="/dashboard/applications">View All</Link>
                        </Button>
                    </div>
                    {data && <OngoingActivity activity={data.ongoingActivity} />}
                </div>

                {/* Recent Applications or Filtered List */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {vacancyId === 'all' ? 'Your Applications' : 'Filtered Applications'}
                        </h2>
                        <div className="w-full sm:w-64">
                            <Select value={vacancyId} onValueChange={setVacancyId}>
                                <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800">
                                    <SelectValue placeholder="Filter by Vacancy" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Vacancies</SelectItem>
                                    {vacancies?.data?.map((vacancy) => (
                                        <SelectItem key={vacancy.id} value={String(vacancy.id)}>
                                            {vacancy.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <ApplicationList filters={vacancyId !== 'all' ? { 
                        vacancyId: String(parseInt(vacancyId)),
                        sortBy: 'appliedAt' as const,
                        order: 'desc' as const,
                        limit: '50',
                        offset: '0'
                    } : undefined} />
                </div>
            </div>

            {/* Recommended Jobs */}
            <div className="space-y-6">
                <div className="flex justify-between items-center px-1">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recommended Jobs</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Based on your preferences</p>
                    </div>
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-slate-200 dark:border-slate-800" asChild>
                        <Link href="/vacancies">
                            <ChevronRight className="h-5 w-5 text-primary" />
                        </Link>
                    </Button>
                </div>

                {data?.recommended && data.recommended.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.recommended.map((item) => (
                            <VacancyCard 
                                key={item.id} 
                                vacancy={{
                                    ...item,
                                    id: parseInt(item.id.replace('vac_', '')),
                                    closingDate: item.deadline,
                                    openPositions: item.vacancyCount,
                                    department: item.department ? { ...item.department, id: 0 } : null,
                                    jobGroup: item.jobGroup ? { ...item.jobGroup, id: 0, name: item.jobGroup.code || '' } : null,
                                    status: item.status as any,
                                    createdAt: new Date().toISOString(),
                                    createdBy: 0,
                                    advertisementNumber: ''
                                } as any} 
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="border border-dashed bg-slate-50/50 dark:bg-slate-900/50">
                        <CardContent className="p-8 text-center">
                            <p className="text-slate-900 dark:text-slate-100 font-bold text-sm">
                                No recommended jobs available
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
                                Try refreshing later to see new opportunities.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {showProfileModal && <ProfileCompletionModal open={true} />}
        </div>
    )
}
