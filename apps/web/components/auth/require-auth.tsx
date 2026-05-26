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
            router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
        }

        if (!isLoading && isAuthenticated && allowedRoles && user) {
            if (!allowedRoles.includes(user.role)) {
                // Redirect to appropriate page based on role
                if (user.role === 'admin') {
                    router.push('/admin')
                } else {
                    router.push('/dashboard')
                }
            }
        }
    }, [isLoading, isAuthenticated, user, allowedRoles, router, pathname])

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
