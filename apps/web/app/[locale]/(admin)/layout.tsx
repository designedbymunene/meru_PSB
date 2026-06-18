import { AppSidebar } from "@/components/layout/sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { UserNav } from "@/components/layout/user-nav"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { ErrorBoundary } from "@/components/error-boundary"
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb"
import { NotificationBell } from "@/components/notifications/notification-bell"
// import { LanguageSwitcher } from "@/components/layout/language-switcher"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <AdminBreadcrumb />
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        {/* <LanguageSwitcher /> */}
                        <NotificationBell />
                        <UserNav />
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
                    <ErrorBoundary>
                        <div className="w-full py-4">
                            {children}
                        </div>
                    </ErrorBoundary>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
