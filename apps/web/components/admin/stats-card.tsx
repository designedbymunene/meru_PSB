import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatNumber } from "@/lib/utils"

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
    className?: string
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    loading,
    className
}: StatsCardProps) {
    return (
        <Card className={cn("overflow-hidden border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow", className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {title}
                        </p>
                        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {loading ? <Skeleton className="h-9 w-20 rounded-lg" /> : formatNumber(value)}
                        </div>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
                
                {(description || trend) && (
                    <div className="mt-4 flex items-center gap-2">
                        {trend && (
                            <span className={cn(
                                "text-xs font-black px-2 py-0.5 rounded-full uppercase",
                                trend.positive 
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            )}>
                                {trend.value > 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
                            </span>
                        )}
                        {description && (
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 truncate">
                                {description}
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
