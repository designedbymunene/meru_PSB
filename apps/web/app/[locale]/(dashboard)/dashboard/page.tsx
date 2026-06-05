import { Suspense } from 'react'
import type { Metadata } from 'next'
import { DashboardContent } from './client'
import { RequireAuth } from '@/components/auth/require-auth'

export const metadata: Metadata = {
    title: 'Dashboard | Meru County Recruitment Portal',
    description: 'Your recruitment dashboard',
}

export default function DashboardPage() {
    return (
        <RequireAuth allowedRoles={['applicant']}>
            <Suspense fallback={<div>Loading...</div>}>
                <DashboardContent />
            </Suspense>
        </RequireAuth>
    )
}
