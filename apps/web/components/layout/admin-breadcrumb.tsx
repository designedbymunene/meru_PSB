"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Breadcrumb configuration for admin routes
const breadcrumbConfig: Record<string, string> = {
    admin: "Admin",
    applications: "Applications",
    board: "Board",
    departments: "Departments",
    downloads: "Downloads",
    "job-groups": "Job Groups",
    profiles: "Profiles",
    reports: "Reports",
    settings: "Settings",
    shortlisting: "Shortlisting",
    support: "Support",
    vacancies: "Vacancies",
}

function capitalize(str: string): string {
    return str
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
}

export function AdminBreadcrumb() {
    const pathname = usePathname()

    // Remove locale prefix if present
    const pathSegments = pathname
        .split("/")
        .filter((segment) => segment && segment !== "[locale]")

    // If we're not on an admin page, don't render breadcrumbs
    if (!pathSegments.length || pathSegments[0] !== "admin") {
        return null
    }

    // Build breadcrumb items
    const items = pathSegments.map((segment, index) => {
        const href = "/" + pathSegments.slice(0, index + 1).join("/")
        const isLast = index === pathSegments.length - 1
        const label = breadcrumbConfig[segment] || capitalize(segment)

        return { segment, href, label, isLast }
    })

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {items.map((item, index) => (
                    <div key={item.segment} className="flex items-center gap-1.5">
                        <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                            {item.isLast ? (
                                <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link href={item.href}>{item.label}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        {!item.isLast && (
                            <BreadcrumbSeparator className={index === 0 ? "hidden md:block" : ""} />
                        )}
                    </div>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
