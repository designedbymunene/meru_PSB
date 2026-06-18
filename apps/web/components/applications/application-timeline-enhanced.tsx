"use client"

import { CheckCircle2, Circle, Clock, AlertCircle, ChevronRight, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type ApplicationStatus = 'pending' | 'under_review' | 'reviewed' | 'shortlisted' | 'interviewing' | 'interviewed' | 'offered' | 'rejected'

interface ApplicationTimelineEnhancedProps {
    status: ApplicationStatus | string
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
            statuses: ['pending', 'under_review', 'reviewed', 'shortlisted', 'interviewing', 'interviewed', 'offered', 'rejected'],
        },
        {
            id: 'reviewing',
            label: 'Under Review',
            description: 'HR is checking requirements',
            detail: 'Our team is reviewing your qualifications',
            estimatedTime: '3-7 business days',
            statuses: ['under_review', 'reviewed', 'shortlisted', 'interviewing', 'interviewed', 'offered', 'rejected'],
        },
        {
            id: 'shortlisted',
            label: 'Shortlisted',
            description: 'Qualified for next stage',
            detail: 'Congratulations! You\'ve made it to the shortlist',
            estimatedTime: '5-10 business days',
            statuses: ['shortlisted', 'interviewing', 'interviewed', 'offered'],
        },
        {
            id: 'interview',
            label: 'Interview',
            description: 'Face-to-face assessment',
            detail: 'Interview scheduled with our hiring team',
            estimatedTime: '1-2 weeks',
            statuses: ['interviewing', 'interviewed', 'offered'],
        },
        {
            id: 'final',
            label: 'Final Decision',
            description: status === 'rejected' ? 'Application Concluded' : 'Offer or feedback',
            detail: status === 'rejected' ? 'Unfortunately, your application was not successful on this occasion' : 'Final decision and next steps',
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
        const statusOrder = ['pending', 'under_review', 'reviewed', 'shortlisted', 'interviewing', 'interviewed', 'offered', 'rejected']
        const currentIndex = statusOrder.indexOf(status)
        const totalSteps = steps.length
        return Math.min(Math.max((currentIndex / (totalSteps - 1)) * 100, 10), 100)
    }

    const progress = calculateProgress()

    return (
        <div className="space-y-10">
            {/* Overall Progress Bar
            <div className="space-y-3 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 shadow-inner">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Overall Progress</span>
                    <span className="text-xs font-black text-blue-650 dark:text-blue-400">{Math.round(progress)}% Complete</span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 p-0.5">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.3)] dark:shadow-[0_0_15px_rgba(59,130,246,0.5)]",
                            status === 'rejected'
                                ? "bg-slate-400 dark:bg-slate-655"
                                : "bg-gradient-to-r from-blue-600 via-blue-400 to-blue-500"
                        )}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {(lastUpdated || appliedAt) && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest pt-1">
                        <Clock className="h-3 w-3" />
                        <span>Last updated: {lastUpdated
                            ? new Date(lastUpdated).toLocaleDateString()
                            : appliedAt
                                ? new Date(appliedAt).toLocaleDateString()
                                : 'Recently'
                        }</span>
                    </div>
                )}
            </div>
            */}

            {/* Timeline Steps */}
            <div className="relative space-y-6">
                {/* Vertical Line */}
                <div className="absolute left-10 top-5 bottom-5 w-0.5 bg-gradient-to-b from-blue-500/50 via-slate-200 dark:via-slate-800 to-slate-200 dark:to-slate-800 hidden sm:block" />

                {steps.map((step, index) => {
                    const stepStatus = getStepStatus(step.statuses)
                    const isComplete = stepStatus === 'complete' || (stepStatus === 'current' && step.id !== 'final')
                    const isCurrent = stepStatus === 'current'
                    const isError = status === 'rejected' && step.id === 'final'

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "relative flex gap-6 p-6 rounded-2xl transition-all duration-500 border group",
                                isCurrent ? "bg-blue-50/70 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.05)] dark:shadow-[0_0_20px_rgba(59,130,246,0.1)] scale-[1.02]" :
                                isError ? "bg-slate-50/80 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/80" :
                                "bg-slate-50/50 dark:bg-[#0d0f16] border-slate-200 dark:border-slate-800/50 opacity-65 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700",
                            )}
                        >
                            {/* Icon Wrapper */}
                            <div className="relative z-10 shrink-0">
                                <div className={cn(
                                    "flex items-center justify-center w-12 h-12 rounded-2xl border-2 shadow-2xl transition-all duration-700",
                                    isComplete ? "bg-emerald-500 border-emerald-400/50 text-white" :
                                    isCurrent ? "bg-blue-600 border-blue-400/50 text-white animate-pulse" :
                                    isError ? "bg-slate-500 border-slate-400/50 text-white" :
                                    "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600"
                                )}>
                                    {isComplete ? <CheckCircle2 className="h-6 w-6" /> :
                                     isError ? <XCircle className="h-6 w-6" /> :
                                     isCurrent ? <Clock className="h-6 w-6" /> :
                                     <Circle className="h-4 w-4 fill-current opacity-20" />}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4 mb-2">
                                    <div className={cn(
                                        "text-[10px] font-black uppercase tracking-[0.2em]",
                                        isCurrent ? "text-blue-600 dark:text-blue-400" :
                                        isError ? "text-slate-500 dark:text-slate-400" :
                                        "text-slate-400 dark:text-slate-500"
                                    )}>
                                        {step.label}
                                    </div>
                                    {isCurrent && !isError && (
                                        <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                                    )}
                                </div>

                                <h4 className={cn(
                                    "text-lg font-bold mb-1",
                                    isCurrent ? "text-slate-950 dark:text-white" : 
                                    isError ? "text-slate-700 dark:text-slate-300" : 
                                    "text-slate-500 dark:text-slate-400"
                                )}>
                                    {step.description}
                                </h4>

                                <p className={cn(
                                    "text-sm leading-relaxed mb-4",
                                    isCurrent ? "text-slate-750 dark:text-slate-300" : 
                                    isError ? "text-slate-600 dark:text-slate-405" : 
                                    "text-slate-400 dark:text-slate-500"
                                )}>
                                    {step.detail}
                                </p>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className={cn(
                                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                                        isComplete ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                                        isCurrent ? "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400" :
                                        isError ? "bg-slate-50 dark:bg-slate-950/20 border-slate-205 dark:border-slate-800/50 text-slate-500" :
                                        "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500"
                                    )}>
                                        <Clock className="h-3 w-3" />
                                        {step.estimatedTime}
                                    </div>

                                    {isCurrent && !isError && (
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-500 group-hover:translate-x-1 transition-transform cursor-pointer">
                                            In progress <ChevronRight className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
