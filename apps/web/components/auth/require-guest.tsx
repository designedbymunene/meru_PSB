'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/routing'
import { Loader2 } from 'lucide-react'
import { useAuthContext } from '@/providers'

interface RequireGuestProps {
    children: React.ReactNode
}

export function RequireGuest({ children }: RequireGuestProps) {
    const router = useRouter()
    const { user, isLoading, isAuthenticated } = useAuthContext()

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            // Redirect to appropriate dashboard based on role
            if (user?.role === 'admin') {
                router.push('/admin')
            } else {
                router.push('/dashboard')
            }
        }
    }, [isLoading, isAuthenticated, user, router])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (isAuthenticated) {
        return null
    }

    return <>{children}</>
}
