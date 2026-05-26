import { Suspense } from 'react'
import { VacancyList } from '@/components/vacancies/vacancy-list'
import { VacancyFilters } from '@/components/vacancies/vacancy-filters'
import { getVacanciesServer } from '@/lib/api/vacancies-server'
import { getDepartmentsServer } from '@/lib/api/departments-server'
import { getJobGroupsServer } from '@/lib/api/job-groups-server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import type { VacancyFilters as VacancyFiltersType } from '@/types'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

interface PageProps {
    searchParams: SearchParams
}

export default async function VacanciesPage({ searchParams }: PageProps) {
    const resolvedSearchParams = await searchParams

    const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined
    const status = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : 'open'
    const departmentId = typeof resolvedSearchParams.departmentId === 'string' ? resolvedSearchParams.departmentId : undefined
    const jobGroupId = typeof resolvedSearchParams.jobGroupId === 'string' ? resolvedSearchParams.jobGroupId : undefined

    const filters: VacancyFiltersType = {
        search,
        status: status as 'open' | 'closed' | undefined,
        departmentId,
        jobGroupId,
    }

    // Fetch vacancies, departments, and job groups data on the server side concurrently
    const [initialData, initialDepartments, initialJobGroups] = await Promise.all([
        getVacanciesServer(filters).catch((err) => {
            console.error('Failed to fetch vacancies on server:', err)
            return { success: false, data: [] }
        }),
        getDepartmentsServer().catch((err) => {
            console.error('Failed to fetch departments on server:', err)
            return { success: false, data: [] }
        }),
        getJobGroupsServer().catch((err) => {
            console.error('Failed to fetch job groups on server:', err)
            return { success: false, data: [] }
        })
    ])

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            
            <main className="flex-1 w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="w-full py-8 space-y-10">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Career Opportunities</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl">
                                Join Meru County Government and contribute to our mission of delivering excellence through public service.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <Suspense fallback={<div className="h-10 w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl" />}>
                                <VacancyFilters initialDepartments={initialDepartments} initialJobGroups={initialJobGroups} />
                            </Suspense>

                            <Suspense fallback={<div className="h-64 w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-3xl" />}>
                                <VacancyList initialData={initialData} filters={filters} />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
