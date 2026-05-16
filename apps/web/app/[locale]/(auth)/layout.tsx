import type { ReactNode } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/shared/logo'

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="p-4 border-b">
                <Link href="/" className="inline-flex items-center gap-2">
                    <Logo size="sm" variant="icon" />
                    <span className="font-semibold text-lg">Meru County Portal</span>
                </Link>
            </header>

            {/* Content */}
            <main className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
                {children}
            </main>

            {/* Footer */}
            <footer className="p-4 text-center text-sm text-muted-foreground border-t">
                <p>© {new Date().getFullYear()} Meru County Government. All rights reserved.</p>
            </footer>
        </div>
    )
}
