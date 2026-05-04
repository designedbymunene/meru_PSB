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
            variant = "secondary" // Yellow/Gray usually for pending
            break
        case "reviewed":
            variant = "outline" // Blue/Info for reviewed but not decided
            break
        case "accepted":
        case "approved": // Handle potential synonym
            variant = "default" // Green/Primary for success
            break
        case "rejected":
            variant = "destructive" // Red for rejection
            break
        default:
            variant = "outline"
    }

    // Custom styling overrides if needed beyond variants
    const getBadgeColor = (status: string) => {
        switch (status) {
            case "pending": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900 dark:text-yellow-300"
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
