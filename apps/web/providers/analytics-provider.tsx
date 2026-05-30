'use client'

import { ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initializeGA, trackPageView } from '@/lib/analytics'

interface AnalyticsProviderProps {
    children: ReactNode
    measurementId?: string
}

/**
 * Analytics Provider Component
 * Initializes GA4 and tracks page views
 * Add this to your root layout
 */
export function AnalyticsProvider({
    children,
    measurementId,
}: AnalyticsProviderProps) {
    const pathname = usePathname()

    useEffect(() => {
        // Initialize GA4 if measurement ID is provided
        if (measurementId) {
            initializeGA(measurementId)
        }
    }, [measurementId])

    useEffect(() => {
        // Track page views when pathname changes
        if (pathname) {
            trackPageView(pathname, document.title)
        }
    }, [pathname])

    return <>{children}</>
}

export default AnalyticsProvider
