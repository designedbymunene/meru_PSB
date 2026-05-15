'use client'

import { useState } from 'react'
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ApplicantProfileWithRelations } from '@/types'
import { calculateProfileCompletion } from '@meru/shared'

interface ProfileCompletionProps {
    profile: ApplicantProfileWithRelations | null | undefined
    compact?: boolean
}

export function ProfileCompletion({ profile, compact = false }: ProfileCompletionProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const completion = calculateProfileCompletion(profile)

    if (compact) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span>Required to Apply</span>
                    <span className="font-black text-primary">{completion.requiredPercentage}%</span>
                </div>
                <Progress value={completion.requiredPercentage} className="h-1.5" />
                <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                    <span>{completion.requiredCompleteCount} of {completion.requiredTotalCount} required complete</span>
                    <span>{completion.optionalCompleteCount} of {completion.optionalTotalCount} optional complete</span>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-all duration-300">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Profile Completion</h3>
                        <span className="text-lg font-black text-primary">{completion.requiredPercentage}%</span>
                    </div>
                    <Progress value={completion.requiredPercentage} className="h-2 mb-1" />
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {completion.requiredCompleteCount} of {completion.requiredTotalCount} required sections complete
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
            </div>

            {completion.requiredMissing.length > 0 && !isExpanded && (
                <div className="mt-3 flex items-center gap-2 text-[11px] text-amber-600 dark:text-amber-500 font-medium bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-900/50">
                    <AlertCircle className="h-3 w-3" />
                    <span className="truncate">
                        Required: {completion.requiredMissing[0]}
                        {completion.requiredMissing.length > 1 ? ` +${completion.requiredMissing.length - 1} more` : ''}
                    </span>
                </div>
            )}

            <div
                className={cn(
                    'grid transition-all duration-300 ease-in-out',
                    isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'
                )}
            >
                <div className="overflow-hidden">
                    <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {completion.requiredMissing.length > 0 && (
                            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-xl">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5" />
                                    <div className="text-[11px]">
                                        <p className="font-bold text-amber-800 dark:text-amber-200 mb-0.5">Missing Required Info</p>
                                        <p className="text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                                            Please complete: {completion.requiredMissing.join(', ')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <SectionGroup
                            title="Required to Apply"
                            items={completion.groups.required}
                        />

                        <SectionGroup
                            title="Optional Enhancements"
                            items={completion.groups.optional}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function SectionGroup({
    title,
    items,
}: {
    title: string
    items: { id: string; label: string; percentage: number; completed: boolean; required: boolean }[]
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {title}
                </h4>
                <span className="text-[10px] font-bold text-slate-400">
                    {items.filter((item) => item.completed).length}/{items.length}
                </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between text-xs p-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            {item.completed ? (
                                <div className="h-4 w-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-500" />
                                </div>
                            ) : (
                                <div className="h-4 w-4 rounded-full border border-slate-200 dark:border-slate-700" />
                            )}
                            <span className={cn('font-medium', item.completed ? 'text-slate-500' : 'text-slate-700 dark:text-slate-300')}>
                                {item.label}
                            </span>
                        </div>
                        {!item.completed && item.required && (
                            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                Required
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
