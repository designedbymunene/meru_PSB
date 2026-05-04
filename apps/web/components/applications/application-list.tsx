'use client'

import { useMyApplications } from '@/hooks/use-applications'
import { ApplicationCard } from './application-card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { FileTextIcon } from 'lucide-react'
import type { ApplicationFilters } from '@/types'

interface ApplicationListProps {
    filters?: ApplicationFilters
}

export function ApplicationList({ filters }: ApplicationListProps) {
    const { data, isLoading, error } = useMyApplications(filters)

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        )
    }

    if (error) {
        return <div className="text-red-500">Failed to load applications.</div>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((application) => (
                <ApplicationCard key={application.id} application={application} />
            ))}
        </div>
    )
}
