'use client'

import { useState } from 'react'
import { useVacancies } from '@/hooks/use-vacancies'
import { VacancyCard } from './vacancy-card'
import { VacancyTable } from './vacancy-table'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, LayoutGrid, List } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { VacancyFilters } from '@/types'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useQueryState } from 'nuqs'

interface VacancyListProps {
    filters?: VacancyFilters
    limit?: number
}

export function VacancyList({ filters: manualFilters, limit }: VacancyListProps) {
    const [search] = useQueryState('search')
    const [status] = useQueryState('status', { defaultValue: 'open' })
    const [departmentId] = useQueryState('departmentId')
    const [jobGroupId] = useQueryState('jobGroupId')

    // Combine manual filters with query state filters
    const activeFilters: VacancyFilters = manualFilters || {
        search: search || undefined,
        status: (status as 'open' | 'closed' | undefined) || 'open',
        departmentId: departmentId || undefined,
        jobGroupId: jobGroupId || undefined,
    }

    const { data, isLoading, error } = useVacancies(activeFilters)
    const [view, setView] = useState<'grid' | 'table'>('table')

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: limit || 6 }).map((_, i) => (
                        <div key={i} className="space-y-4 border rounded-2xl p-6 bg-slate-50/50">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <Skeleton className="h-6 w-16" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                            <div className="flex justify-end pt-2">
                                <Skeleton className="h-8 w-24 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Available Vacancies ({data.data.length})
                </h2>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setView('table')}
                        className={cn(
                            "h-8 px-3 rounded-lg gap-2 transition-all",
                            view === 'table' 
                                ? "bg-white dark:bg-slate-700 shadow-sm text-primary" 
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <List className="h-4 w-4" />
                        <span className="text-xs font-medium">Table</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setView('grid')}
                        className={cn(
                            "h-8 px-3 rounded-lg gap-2 transition-all",
                            view === 'grid' 
                                ? "bg-white dark:bg-slate-700 shadow-sm text-primary" 
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <LayoutGrid className="h-4 w-4" />
                        <span className="text-xs font-medium">Grid</span>
                    </Button>
                </div>
            </div>

            {view === 'grid' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {displayedVacancies.map((vacancy) => (
                        <VacancyCard key={vacancy.id} vacancy={vacancy} />
                    ))}
                </div>
            ) : (
                <VacancyTable data={displayedVacancies} />
            )}
        </div>
    )
}
