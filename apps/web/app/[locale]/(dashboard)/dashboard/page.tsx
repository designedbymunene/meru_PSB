import { Suspense } from 'react'
import type { Metadata } from 'next'
import { DashboardContent } from './client'

export const metadata: Metadata = {
    title: 'Dashboard | Meru County Recruitment Portal',
    description: 'Your recruitment dashboard',
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DashboardContent />
        </Suspense>
    )
}
