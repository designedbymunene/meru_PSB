"use client"

import { cn } from "@/lib/utils"

interface WeightDistributionBarProps {
    weights: Record<string, number>
    className?: string
}

const WEIGHT_COLORS: Record<string, string> = {
    education: "bg-primary",
    experience: "bg-primary/70",
    memberships: "bg-primary/40",
}

const WEIGHT_LABELS: Record<string, string> = {
    education: "Education",
    experience: "Experience",
    memberships: "Memberships",
}

export function WeightDistributionBar({ weights, className }: WeightDistributionBarProps) {
    const total = Object.values(weights).reduce((sum, value) => sum + value, 0)
    const entries = Object.entries(weights).filter(([_, value]) => value > 0)

    if (total === 0) {
        return (
            <div className={cn("space-y-2", className)}>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-muted-foreground/20 w-full flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No weights set</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={cn("space-y-3", className)}>
            {/* Distribution Bar */}
            <div className="h-4 bg-muted rounded-full overflow-hidden flex">
                {entries.map(([key, value]) => {
                    const percentage = (value / total) * 100
                    return (
                        <div
                            key={key}
                            className={cn("h-full transition-all duration-300", WEIGHT_COLORS[key])}
                            style={{ width: `${percentage}%` }}
                            title={`${WEIGHT_LABELS[key]}: ${value}%`}
                        />
                    )
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3">
                {entries.map(([key, value]) => {
                    const percentage = ((value / total) * 100).toFixed(0)
                    return (
                        <div key={key} className="flex items-center gap-1.5">
                            <div
                                className={cn("w-3 h-3 rounded-full", WEIGHT_COLORS[key])}
                            />
                            <span className="text-xs text-muted-foreground">
                                {WEIGHT_LABELS[key]}: {percentage}%
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Total Indicator */}
            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Weight</span>
                <span className={cn(
                    "font-semibold",
                    total === 100 ? "text-primary" : "text-muted-foreground"
                )}>
                    {total.toFixed(0)}%
                </span>
            </div>
        </div>
    )
}
