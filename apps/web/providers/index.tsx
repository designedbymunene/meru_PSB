'use client'

import type { ReactNode } from 'react'
import { QueryProvider } from './query-provider'
import { AuthProvider } from './auth-provider'
import { NuqsProvider } from './nuqs-adapter'
import { ThemeProvider } from './theme-provider'

export function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <NuqsProvider>
                    <AuthProvider>{children}</AuthProvider>
                </NuqsProvider>
            </ThemeProvider>
        </QueryProvider>
    )
}

export { useAuthContext } from './auth-provider'
