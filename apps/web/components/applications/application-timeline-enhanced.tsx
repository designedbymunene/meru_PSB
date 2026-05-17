"use client"

import { CheckCircle2, Circle, Clock, AlertCircle, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type ApplicationStatus = 'pending' | 'under_review' | 'reviewed' | 'shortlisted' | 'interviewed' | 'offered' | 'rejected'

interface ApplicationTimelineEnhancedProps {
    status: ApplicationStatus
    lastUpdated?: string
    appliedAt?: string
}

export function ApplicationTimelineEnhanced({
    status,
    lastUpdated,
    appliedAt
}: ApplicationTimelineEnhancedProps) {
    const steps = [
        {
            id: 'submitted',
            label: 'Submitted',
            description: 'Application received',
            detail: 'Your application has been successfully submitted',
            estimatedTime: 'Immediate',
            statuses: ['pending', 'under_review', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'rejected'],
        },
        {
            id: 'reviewing',
            label: 'Under Review',
            description: 'HR is checking requirements',
            detail: 'Our team is reviewing your qualifications',
            estimatedTime: '3-7 business days',
            statuses: ['under_review', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'rejected'],
        },
        {
            id: 'shortlisted',
            label: 'Shortlisted',
            description: 'Qualified for next stage',
            detail: 'Congratulations! You\'ve made it to the shortlist',
            estimatedTime: '5-10 business days',
            statuses: ['shortlisted', 'interviewed', 'offered'],
        },
        {
            id: 'interview',
            label: 'Interview',
            description: 'Face-to-face assessment',
            detail: 'Interview scheduled with our hiring team',
            estimatedTime: '1-2 weeks',
            statuses: ['interviewed', 'offered'],
        },
        {
            id: 'final',
            label: 'Final Decision',
            description: 'Offer or feedback',
            detail: 'Final decision and next steps',
            estimatedTime: '2-3 business days',
            statuses: ['offered', 'rejected'],
        }
    ]

    const getStepStatus = (stepStatuses: string[]) => {
        if (status === 'rejected' && stepStatuses.includes('rejected')) return 'error'
        if (stepStatuses.includes(status)) return 'current'

        const currentIndex = steps.findIndex(s => s.statuses.includes(status))
        const stepIndex = steps.findIndex(s => s.statuses === stepStatuses)

        if (currentIndex > stepIndex) return 'complete'
        return 'upcoming'
    }

    const calculateProgress = () => {
        const statusOrder = ['pending', 'under_review', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'rejected']
        const currentIndex = statusOrder.indexOf(status)
        const totalSteps = steps.length
        return Math.min(Math.max((currentIndex / (totalSteps - 1)) * 100, 10), 100)
    }

    const progress = calculateProgress()

    return (
        <div className="space-y-6">
            {/* Overall Progress Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Overall Progress</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{Math.round(progress)}% Complete</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-700 ease-out",
                            status === 'rejected'
                                ? "bg-rose-500"
                                : "bg-gradient-to-r from-blue-500 to-blue-600"
                        )}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Last Updated */}
            {(lastUpdated || appliedAt) && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>Last updated: {lastUpdated
                        ? new Date(lastUpdated).toLocaleDateString()
                        : appliedAt
                            ? new Date(appliedAt).toLocaleDateString()
                            : 'Recently'
                    }</span>
                </div>
            )}

            {/* Timeline Steps */}
            <div className="space-y-4">
                {steps.map((step, index) => {
                    const stepStatus = getStepStatus(step.statuses)
                    const isComplete = stepStatus === 'complete' || (stepStatus === 'current' && step.id !== 'final')
                    const isCurrent = stepStatus === 'current'
                    const isError = status === 'rejected' && step.id === 'final'

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "relative flex gap-4 p-4 rounded-xl transition-all duration-300",
                                isCurrent && "bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-900/50 shadow-sm",
                                isError && "bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/50",
                            )}
                        >
                            {/* Icon */}
                            <div className={cn(
                                "flex items-center justify-center w-12 h-12 rounded-full border-2 border-white dark:border-slate-900 shadow-lg shrink-0 transition-all duration-500",
                                isComplete ? "bg-emerald-500 border-emerald-200 dark:border-emerald-800" :
                                isCurrent ? "bg-blue-500 border-blue-200 dark:border-blue-800 animate-pulse" :
                                isError ? "bg-rose-500 border-rose-200 dark:border-rose-800" :
                                "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            )}>
                                {isComplete ? <CheckCircle2 className="h-6 w-6 text-white" /> :
                                 isError ? <AlertCircle className="h-6 w-6 text-white" /> :
                                 isCurrent ? <Clock className="h-6 w-6 text-white" /> :
                                 <Circle className="h-6 w-6 fill-current opacity-20 text-slate-400" />}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <div>
                                        <div className={cn(
                                            "text-sm font-bold uppercase tracking-wider mb-1",
                                            isCurrent ? "text-blue-600 dark:text-blue-400" :
                                            isError ? "text-rose-600 dark:text-rose-400" :
                                            "text-slate-400"
                                        )}>
                                            {step.label}
                                        </div>
                                        <div className={cn(
                                            "text-base font-semibold",
                                            isCurrent || isError ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"
                                        )}>
                                            {step.description}
                                        </div>
                                    </div>
                                    {isCurrent && !isError && (
                                        <span className="flex h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                                    )}
                                </div>

                                <p className={cn(
                                    "text-sm mb-2",
                                    isCurrent || isError ? "text-slate-700 dark:text-slate-300" : "text-slate-500 dark:text-slate-500"
                                )}>
                                    {step.detail}
                                </p>

                                {/* Estimated Time */}
                                <div className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                    isComplete
                                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                        : isCurrent
                                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                )}>
                                    <Clock className="h-3 w-3" />
                                    <span>{step.estimatedTime}</span>
                                </div>

                                {/* Current Stage Message */}
                                {isCurrent && status === 'rejected' && step.id === 'final' && (
                                    <div className="mt-3 p-3 bg-rose-100 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900/30">
                                        <p className="text-sm font-medium text-rose-800 dark:text-rose-200">
                                            This application was not successful. Check the feedback section below for details.
                                        </p>
                                    </div>
                                )}

                                {isCurrent && !isError && (
                                    <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                                        <span className="font-medium">In progress</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
