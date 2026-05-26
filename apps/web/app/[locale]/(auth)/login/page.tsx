import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth'
import { Suspense } from 'react'

export const metadata: Metadata = {
    title: 'Sign In | Meru County Recruitment Portal',
    description: 'Sign in to access the Meru County Recruitment Portal',
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-md h-[400px] flex items-center justify-center bg-card rounded-xl border animate-pulse">
                <div className="text-muted-foreground text-sm">Loading login...</div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
