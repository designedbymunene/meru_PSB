"use client"

import { VacancyForm } from "@/components/vacancies/vacancy-form"

export default function CreateVacancyPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Create Vacancy</h2>
            </div>
            <VacancyForm mode="create" />
        </div>
    )
}
