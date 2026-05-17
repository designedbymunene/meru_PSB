'use client'

import { BoardPackGenerator } from '@/components/board/board-pack-generator'
import { BoardResolutionForm } from '@/components/board/board-resolution-form'
import { ResolutionHistory } from '@/components/board/resolution-history'
import { useVacancies } from '@/hooks/use-vacancies'

export default function BoardPage() {
    const { data: vacanciesData } = useVacancies({})
    const vacancies = vacanciesData?.data || []

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Board Governance</h2>
                    <p className="text-muted-foreground">Manage official board packs, analytics, and recruitment resolutions</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <BoardPackGenerator vacancies={vacancies} />
                </div>
                <div className="lg:col-span-2">
                    <BoardResolutionForm vacancies={vacancies} />
                </div>
                <div className="col-span-full">
                    <ResolutionHistory />
                </div>
            </div>
        </div>
    )
}
