'use client'

import { useMyApplications } from '@/hooks/use-applications'
import { ApplicationCard } from './application-card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { FileTextIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ApplicationFilters } from '@/types'

interface ApplicationListProps {
    filters?: ApplicationFilters
}

function SkeletonCard() {
    return (
        <div className="space-y-3 p-4 md:p-6 rounded-lg border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-4 w-2/3" />
        </div>
    )
}

export function ApplicationList({ filters }: ApplicationListProps) {
    const { data, isLoading, error } = useMyApplications(filters)

    if (isLoading) {
        return (
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4 md:px-0">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10 p-4 text-red-600 dark:text-red-400">
                <p className="font-medium">Failed to load applications</p>
                <p className="text-sm mt-1">Please try again later or contact support if the issue persists.</p>
            </div>
        )
    }

    if (!data?.data || data.data.length === 0) {
        return (
            <EmptyState
                title="No applications yet"
                description="You haven't applied to any positions yet. Browse open vacancies to get started."
                icon={FileTextIcon}
            />
        )
    }

    return (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4 md:px-0">
            {data.data.map((application) => (
                <ApplicationCard key={application.id} application={application} />
            ))}
        </div>
    )
}
