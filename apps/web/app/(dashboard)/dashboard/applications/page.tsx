import { Suspense } from 'react'
import { ApplicationList } from '@/components/applications/application-list'
import { ApplicationFilters } from '@/components/applications/application-filters'
import { RequireAuth } from '@/components/auth/require-auth'

export default function MyApplicationsPage() {
    return (
        <RequireAuth allowedRoles={['applicant']}>
            <div className="w-full py-8 space-y-10">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">My Applications</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl">
                        Track the journey of your professional growth. Monitor your application status and next steps.
                    </p>
                </div>

                <div className="space-y-8">
                    <Suspense fallback={<div className="h-10 w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl" />}>
                        <ApplicationFilters />
                    </Suspense>

                    <Suspense fallback={<div className="h-64 w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-3xl" />}>
                        <ApplicationList />
                    </Suspense>
                </div>
            </div>
        </RequireAuth>
    )
}
