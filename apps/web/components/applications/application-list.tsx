'use client'

import { useState } from 'react'
import { useQueryState } from 'nuqs'
import { useMyApplications } from '@/hooks/use-applications'
import { ApplicationCard } from './application-card'
import { ApplicationTable } from './application-table'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { FileTextIcon, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ApplicationFilters } from '@/types'

interface ApplicationListProps {
    filters?: ApplicationFilters
}

export function ApplicationList({ filters: manualFilters }: ApplicationListProps) {
    const [search] = useQueryState('search')
    const [status] = useQueryState('status')
    const [view, setView] = useState<'grid' | 'table'>('table')

    const activeFilters: ApplicationFilters = manualFilters || {
        searchTerm: search || undefined,
        status: (status as any) || undefined,
    } as any

    const { data, isLoading, error } = useMyApplications(activeFilters)

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-4 border rounded-3xl p-6 bg-slate-50/50 dark:bg-slate-900/20">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-3/4 rounded-lg" />
                                    <Skeleton className="h-3 w-1/2 rounded-lg" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                            <div className="flex justify-end pt-2">
                                <Skeleton className="h-9 w-9 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-3xl border border-red-100 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10 p-6 text-red-600 dark:text-red-400">
                <p className="font-semibold">Unable to sync applications</p>
                <p className="text-sm mt-1 opacity-80">Please refresh the page or check your connection.</p>
            </div>
        )
    }

    if (!data?.data || data.data.length === 0) {
        return (
            <EmptyState
                title={search || status ? "No matching applications" : "No applications yet"}
                description={search || status ? "Try adjusting your filters to find what you're looking for." : "You haven't applied to any positions yet. Start your journey by exploring open vacancies."}
                icon={FileTextIcon}
            />
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Your History ({data.data.length})
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
                    {data.data.map((application) => (
                        <ApplicationCard key={application.id} application={application} />
                    ))}
                </div>
            ) : (
                <ApplicationTable data={data.data} />
            )}
        </div>
    )
}
