import { Suspense } from 'react'
import { ApplicationList } from '@/components/applications/application-list'
import { RequireAuth } from '@/components/auth/require-auth'

export default function MyApplicationsPage() {
    return (
        <RequireAuth allowedRoles={['applicant']}>
            <div className="container mx-auto py-8 space-y-8">
                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
                    <p className="text-muted-foreground">
                        Track the status of your submitted job applications.
                    </p>
                </div>

                <Suspense fallback={<div>Loading...</div>}>
                    <ApplicationList />
                </Suspense>
            </div>
        </RequireAuth>
    )
}
