"use client"

import { VacancyForm } from "@/components/vacancies/vacancy-form"
import { useVacancy } from "@/hooks/use-vacancies"
import { Skeleton } from "@/components/ui/skeleton"
import { use } from "react"
import { useRouter } from "@/i18n/routing"

export default function EditVacancyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data, isLoading, error } = useVacancy(parseInt(id, 10))
    const router = useRouter() // Add router for back/error navigation if needed

    if (isLoading) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <Skeleton className="h-8 w-[200px]" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-[200px] w-full" />
                    <Skeleton className="h-[200px] w-full" />
                </div>
            </div>
        )
    }

    if (error || !data?.data) {
        // You might want to show a proper error component or redirect
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <h2 className="text-3xl font-bold text-destructive">Error loading vacancy</h2>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Edit Vacancy</h2>
            </div>
            <VacancyForm mode="edit" initialData={data.data} />
        </div>
    )
}
