import type { ReactNode } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/shared/logo'
import { Footer } from '@/components/layout/footer'
import { ThemeToggle } from '@/components/layout/theme-toggle'
// import { LanguageSwitcher } from '@/components/layout/language-switcher'

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="border-b bg-background sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <Logo size="sm" variant="icon" />
                            <span className="font-semibold text-lg">Meru County Portal</span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/vacancies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Vacancies
                            </Link>
                            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                About
                            </Link>
                            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Contact
                            </Link>
                            <div className="flex items-center gap-4 ml-4 pl-4 border-l">
                                <ThemeToggle />
                                {/* <LanguageSwitcher /> */}
                            </div>
                            <Link href="/login" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                                Login
                            </Link>
                            <Link href="/register" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                                Register
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    )
}
