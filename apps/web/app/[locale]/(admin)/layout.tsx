import { AppSidebar } from "@/components/layout/sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { UserNav } from "@/components/layout/user-nav"
import { ThemeToggle } from "@/components/layout/theme-toggle"
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
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        {/* <LanguageSwitcher /> */}
                        <UserNav />
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
                    <div className="w-full py-4">
                        {children}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
