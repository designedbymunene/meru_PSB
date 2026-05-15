import { Suspense } from 'react'
import { VacancyList } from '@/components/vacancies/vacancy-list'
import { VacancyFilters } from '@/components/vacancies/vacancy-filters'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function VacanciesPage() {
    return (
        <div className="w-full py-8 space-y-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Career Opportunities</h1>
                <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl">
                    Join Meru County Government and contribute to our mission of delivering excellence through public service.
                </p>
            </div>

            <div className="space-y-8">
                <Suspense fallback={<div className="h-10 w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl" />}>
                    <VacancyFilters />
                </Suspense>

                <Suspense fallback={<div className="h-64 w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-3xl" />}>
                    <VacancyList />
                </Suspense>
            </div>
        </div>
    )
}
