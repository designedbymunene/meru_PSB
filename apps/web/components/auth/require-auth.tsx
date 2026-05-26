'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from '@/i18n/routing'
import { Loader2 } from 'lucide-react'
import { useAuthContext } from '@/providers'

interface RequireAuthProps {
    children: React.ReactNode
    allowedRoles?: ('admin' | 'applicant')[]
}

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, isLoading, isAuthenticated } = useAuthContext()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Use window.location.href for proper redirect that triggers middleware
            const locale = window.location.pathname.split('/')[1]
            const localePrefix = ['en', 'sw'].includes(locale) ? `/${locale}` : ''
            window.location.href = `${localePrefix}/login?callbackUrl=${encodeURIComponent(pathname)}`
        }

        if (!isLoading && isAuthenticated && allowedRoles && user) {
            if (!allowedRoles.includes(user.role)) {
                // Redirect to appropriate page based on role using hard redirect
                const locale = window.location.pathname.split('/')[1]
                const localePrefix = ['en', 'sw'].includes(locale) ? `/${locale}` : ''
                if (user.role === 'admin') {
                    window.location.href = `${localePrefix}/admin`
                } else {
                    window.location.href = `${localePrefix}/dashboard`
                }
            }
        }
    }, [isLoading, isAuthenticated, user, allowedRoles, pathname])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return null
    }

    return <>{children}</>
}
