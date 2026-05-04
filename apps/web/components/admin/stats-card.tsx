import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: {
        value: number
        label: string
        positive?: boolean
    }
    loading?: boolean
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    loading
}: StatsCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {loading ? <Skeleton className="h-8 w-[100px]" /> : value}
                </div>
                {(description || trend) && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {trend && (
                            <span className={trend.positive ? "text-green-500" : "text-red-500"}>
                                {trend.value > 0 ? "+" : ""}{trend.value}%
                            </span>
                        )}
                        {trend && description && " "}
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
