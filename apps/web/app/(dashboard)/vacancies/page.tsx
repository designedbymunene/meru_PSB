import { Suspense } from 'react'
import { VacancyList } from '@/components/vacancies/vacancy-list'
import { VacancyFilters } from '@/components/vacancies/vacancy-filters'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function VacanciesPage(props: { searchParams: SearchParams }) {
    const searchParams = await props.searchParams

    // Parse filters from search params
    const filters = {
        search: (searchParams.search as string) || undefined,
        status: (searchParams.status as 'open' | 'closed') || 'open',
        departmentId: searchParams.departmentId ? Number(searchParams.departmentId) : undefined,
    }

    return (
        <div className="w-full py-8 space-y-8">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Career Opportunities</h1>
                <p className="text-muted-foreground">
                    Explore available positions and help us serve the people of Meru County.
                </p>
            </div>

            <Suspense fallback={<div>Loading filters...</div>}>
                <VacancyFilters />
            </Suspense>

            <Suspense fallback={<div>Loading vacancies...</div>}>
                <VacancyList filters={filters} />
            </Suspense>
        </div>
    )
}
