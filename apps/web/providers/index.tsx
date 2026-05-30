'use client'

import type { ReactNode } from 'react'
import { QueryProvider } from './query-provider'
import { AuthProvider } from './auth-provider'
import { NuqsProvider } from './nuqs-adapter'
import { ThemeProvider } from './theme-provider'
import { AnalyticsProvider } from './analytics-provider'

export function Providers({ children }: { children: ReactNode }) {
    // Get GA4 measurement ID from environment variables
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

    return (
        <AnalyticsProvider measurementId={gaId}>
            <QueryProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <NuqsProvider>
                        <AuthProvider>{children}</AuthProvider>
                    </NuqsProvider>
                </ThemeProvider>
            </QueryProvider>
        </AnalyticsProvider>
    )
}

export { useAuthContext } from './auth-provider'
