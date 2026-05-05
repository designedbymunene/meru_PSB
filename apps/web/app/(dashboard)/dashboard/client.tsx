'use client'

import { useSearchParams } from 'next/navigation'
import { ProfileCompletionModal } from '@/components/modals'
import { ApplicationList } from '@/components/applications/application-list'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useVacancies } from '@/hooks/use-vacancies'
import { useState } from 'react'

export function DashboardContent() {
    const searchParams = useSearchParams()
    const showProfileModal = searchParams.get('showProfileModal') === 'true'
    const [vacancyId, setVacancyId] = useState<string>('all')

    const { data: vacancies } = useVacancies()

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome to your dashboard! Track your applications here.</p>
                </div>
                <div className="w-64">
                    <Select value={vacancyId} onValueChange={setVacancyId}>
                        <SelectTrigger>
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

            {showProfileModal && <ProfileCompletionModal open={true} />}
        </>
    )
}
