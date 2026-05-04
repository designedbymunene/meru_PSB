'use client'

import type { ReactNode } from 'react'
import { QueryProvider } from './query-provider'
import { AuthProvider } from './auth-provider'
import { NuqsProvider } from './nuqs-adapter'

export function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryProvider>
            <NuqsProvider>
                <AuthProvider>{children}</AuthProvider>
            </NuqsProvider>
        </QueryProvider>
    )
}

export { useAuthContext } from './auth-provider'
