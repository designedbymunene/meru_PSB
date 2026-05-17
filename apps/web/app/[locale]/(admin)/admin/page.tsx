"use client"

import { useAllApplications } from "@/hooks/use-applications"
import { useVacancies } from "@/hooks/use-vacancies"
import { StatsCard } from "@/components/admin/stats-card"
import { QuickActions } from "@/components/admin/quick-actions"
import { ApplicationStatusOverview } from "@/components/admin/application-status-overview"
import { Users, FileText, CheckCircle, Clock } from "lucide-react"

export default function AdminDashboardPage() {
    const { data: vacanciesData, isLoading: isLoadingVacancies } = useVacancies()
    const { data: applicationsData, isLoading: isLoadingApplications } = useAllApplications()

    const vacancies = vacanciesData?.data || []
    // Handle both direct array and paginated response { data, pagination }
    const applications = Array.isArray(applicationsData?.data) 
        ? applicationsData.data 
        : (applicationsData?.data as any)?.data || []

    // Calculate stats
    const totalVacancies = vacancies.length
    const openVacancies = vacancies.filter(v => v.status === 'open').length

    const totalApplications = applications.length
    const pendingApplications = applications.filter(a => a.status === 'pending').length

    const isLoading = isLoadingVacancies || isLoadingApplications

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h2>
                    <p className="text-slate-500 font-medium mt-1">System overview and administrative controls</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Vacancies"
                    value={isLoading ? 0 : totalVacancies}
                    loading={isLoading}
                    icon={FileText}
                    description="All job advertisements"
                />
                <StatsCard
                    title="Open Vacancies"
                    value={isLoading ? 0 : openVacancies}
                    loading={isLoading}
                    icon={CheckCircle}
                    description="Live for applications"
                />
                <StatsCard
                    title="Total Applications"
                    value={isLoading ? 0 : totalApplications}
                    loading={isLoading}
                    icon={Users}
                    description="Cumulative total"
                />
                <StatsCard
                    title="Pending Review"
                    value={isLoading ? 0 : pendingApplications}
                    loading={isLoading}
                    icon={Clock}
                    description="Awaiting action"
                />
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-6">
                    <QuickActions />
                </div>

                {/* Sidebar Area */}
                <div className="lg:col-span-4 space-y-6">
                    <ApplicationStatusOverview />
                </div>
            </div>
        </div>
    )
}
