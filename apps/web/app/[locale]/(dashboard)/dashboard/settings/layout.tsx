import type { Metadata } from 'next'
import { RequireAuth } from '@/components/auth/require-auth'

export const metadata: Metadata = {
    title: 'Settings | Meru County Recruitment Portal',
    description: 'Manage your account settings and security preferences',
}

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <RequireAuth allowedRoles={['applicant']}>
            {children}
        </RequireAuth>
    )
}
