"use client"

import Link from "next/link"
import { usePathname } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/layout/user-nav"
// import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { Logo } from "@/components/shared/logo"
import { Menu, LayoutDashboard, Briefcase, FileText } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { useAuthContext } from "@/providers"

const navItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Vacancies",
        href: "/vacancies",
        icon: Briefcase,
    },
    {
        title: "Applications",
        href: "/dashboard/applications",
        icon: FileText,
    },
]

export function Header() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const { isAuthenticated } = useAuthContext()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center w-full justify-between">
                <div className="flex items-center gap-8">
                    <Logo href="/" size="md" variant="short" showRecruitmentLabel />
                    {isAuthenticated && (
                        <nav className="hidden md:flex items-center space-x-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[12px] font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2",
                                        pathname === item.href 
                                            ? "text-primary bg-primary/5" 
                                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            ))}
                        </nav>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* <LanguageSwitcher /> */}
                    <div className="hidden md:block">
                        <UserNav />
                    </div>
                    
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px] border-r border-slate-200 dark:border-r-slate-800 p-0">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <Logo href="/" size="sm" variant="short" showRecruitmentLabel />
                            </div>
                            <div className="p-6">
                                {isAuthenticated && (
                                    <div className="flex flex-col space-y-2">
                                        {navItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-4 rounded-2xl text-[13px] font-semibold uppercase tracking-wider transition-all",
                                                    pathname === item.href 
                                                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                                        : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                                                )}
                                            >
                                                <item.icon className="h-5 w-5" />
                                                {item.title}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-0 w-full p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                                <UserNav showDetails />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
