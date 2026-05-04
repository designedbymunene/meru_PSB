"use client"

import { useAllApplications } from "@/hooks/use-applications"
import { useVacancies } from "@/hooks/use-vacancies"
import { StatsCard } from "@/components/admin/stats-card"
import { RecentApplications } from "@/components/admin/recent-applications"
import { Users, FileText, CheckCircle, Clock } from "lucide-react"

export default function AdminDashboardPage() {
    const { data: vacanciesData, isLoading: isLoadingVacancies } = useVacancies()
    const { data: applicationsData, isLoading: isLoadingApplications } = useAllApplications()

    const vacancies = vacanciesData?.data || []
    const applications = applicationsData?.data || []

    // Calculate stats
    const totalVacancies = vacancies.length
    const openVacancies = vacancies.filter(v => v.status === 'open').length

    const totalApplications = applications.length
    const pendingApplications = applications.filter(a => a.status === 'pending').length

    const isLoading = isLoadingVacancies || isLoadingApplications

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Vacancies"
                    value={isLoading ? 0 : totalVacancies}
                    loading={isLoading}
                    icon={FileText}
                    description="All created vacancies"
                />
                <StatsCard
                    title="Open Vacancies"
                    value={isLoading ? 0 : openVacancies}
                    loading={isLoading}
                    icon={CheckCircle}
                    description="Currently accepting applications"
                />
                <StatsCard
                    title="Total Applications"
                    value={isLoading ? 0 : totalApplications}
                    loading={isLoading}
                    icon={Users}
                    description="All time applications"
                />
                <StatsCard
                    title="Pending Review"
                    value={isLoading ? 0 : pendingApplications}
                    loading={isLoading}
                    icon={Clock}
                    description="Applications awaiting review"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 lg:col-span-4">
                    {/* We can put a chart here in the future, for now maybe just recent applications takes full width or split with something else */}
                    <RecentApplications />
                </div>
                <div className="col-span-3 lg:col-span-3">
                    {/* Maybe a 'Recent Activities' or 'Quick Actions' list in future */}
                    {/* For now leaving it empty or we can make RecentApplications full width if we remove grid-cols-7 */}
                </div>
            </div>
        </div>
    )
}
