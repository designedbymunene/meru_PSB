"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ApplicationStatusBadgeProps {
    status: string
    className?: string
}

export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default"

    // Normalize status for comparison
    const normalizedStatus = status.toLowerCase()

    switch (normalizedStatus) {
        case "pending":
            variant = "secondary"
            break
        case "reviewed":
        case "shortlisted":
        case "interviewed":
            variant = "outline"
            break
        case "accepted":
        case "approved":
            variant = "default"
            break
        case "rejected":
            variant = "destructive"
            break
        default:
            variant = "outline"
    }

    // Custom styling overrides if needed beyond variants
    const getBadgeColor = (status: string) => {
        switch (status) {
            case "pending": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900 dark:text-yellow-300"
            case "shortlisted": return "bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900 dark:text-blue-300"
            case "interviewed": return "bg-purple-100 text-purple-800 hover:bg-purple-100/80 dark:bg-purple-900 dark:text-purple-300"
            case "accepted": return "bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-300"
            case "rejected": return "bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-900 dark:text-red-300"
            default: return ""
        }
    }

    return (
        <Badge
            variant={variant}
            className={cn("capitalize", getBadgeColor(normalizedStatus), className)}
        >
            {status}
        </Badge>
    )
}
