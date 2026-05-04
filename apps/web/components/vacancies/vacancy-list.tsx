'use client'

import { useVacancies } from '@/hooks/use-vacancies'
import { VacancyCard } from './vacancy-card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { VacancyFilters } from '@/types'
import { EmptyState } from '@/components/shared/empty-state'

interface VacancyListProps {
    filters: VacancyFilters
    limit?: number
}

export function VacancyList({ filters, limit }: VacancyListProps) {
    const { data, isLoading, error } = useVacancies(filters)

    if (isLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: limit || 6 }).map((_, i) => (
                    <div key={i} className="space-y-4 border rounded-lg p-6">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Failed to load vacancies. Please try again later.
                </AlertDescription>
            </Alert>
        )
    }

    if (!data?.data || data.data.length === 0) {
        return (
            <EmptyState
                title="No vacancies found"
                description="Check back later for new job opportunities."
            />
        )
    }

    const displayedVacancies = limit ? data.data.slice(0, limit) : data.data

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedVacancies.map((vacancy) => (
                <VacancyCard key={vacancy.id} vacancy={vacancy} />
            ))}
        </div>
    )
}
