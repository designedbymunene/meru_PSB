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
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Required to Apply</span>
                    <span className="font-bold text-primary">{completion.requiredPercentage}%</span>
                </div>
                <Progress value={completion.requiredPercentage} className="h-2 rounded-sm" />
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{completion.requiredCompleteCount} of {completion.requiredTotalCount} required complete</span>
                    <span>{completion.optionalCompleteCount} of {completion.optionalTotalCount} optional complete</span>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 shadow-sm transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Progress Section */}
                <div className="flex-[2] min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Profile Completion Status</h3>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                {completion.requiredCompleteCount}/{completion.requiredTotalCount} Required
                            </span>
                        </div>
                        <span className="text-lg font-bold text-primary">{completion.requiredPercentage}%</span>
                    </div>
                    <Progress value={completion.requiredPercentage} className="h-2.5 rounded-sm" />
                </div>

                {/* Status/Missing Info Section */}
                <div className="flex-[3] flex items-center gap-4">
                    {completion.requiredMissing.length > 0 ? (
                        <div className="flex-1 flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-3 rounded-md">
                            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-amber-800">Incomplete Profile</p>
                                <p className="text-xs text-amber-700/90 truncate">
                                    Missing: {completion.requiredMissing.join(', ')}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-md">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-emerald-800">Profile Complete</p>
                                <p className="text-xs text-emerald-700/90">You have met the requirements to apply</p>
                            </div>
                        </div>
                    )}
                    
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-10 px-4 rounded-md flex items-center gap-2 border-slate-300"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <span className="text-sm font-semibold">Details</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <div
                className={cn(
                    'grid transition-all duration-300 ease-in-out',
                    isExpanded ? 'grid-rows-[1fr] opacity-100 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800' : 'grid-rows-[0fr] opacity-0'
                )}
            >
                <div className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <SectionGroup
                            title="Required Information"
                            items={completion.groups.required}
                        />

                        <SectionGroup
                            title="Additional Information"
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
        <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {title}
                </h4>
                <span className="text-xs font-semibold text-slate-500">
                    {items.filter((item) => item.completed).length}/{items.length} completed
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between text-sm p-2 rounded-md bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700/50"
                    >
                        <div className="flex items-center gap-3">
                            {item.completed ? (
                                <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                                </div>
                            ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                            )}
                            <span className={cn('font-medium', item.completed ? 'text-slate-600' : 'text-slate-900 dark:text-slate-100')}>
                                {item.label}
                            </span>
                        </div>
                        {!item.completed && item.required && (
                            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-sm">
                                Required
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
