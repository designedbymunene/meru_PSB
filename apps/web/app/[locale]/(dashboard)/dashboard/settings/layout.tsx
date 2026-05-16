import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Settings | Meru County Recruitment Portal',
    description: 'Manage your account settings and security preferences',
}

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
