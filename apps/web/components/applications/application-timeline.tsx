"use client"

import { CheckCircle2, Circle, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type ApplicationStatus = 'pending' | 'under_review' | 'reviewed' | 'shortlisted' | 'interviewing' | 'interviewed' | 'offered' | 'rejected'

interface ApplicationTimelineProps {
    status: ApplicationStatus | string
}

export function ApplicationTimeline({ status }: ApplicationTimelineProps) {
    const steps = [
        {
            id: 'submitted',
            label: 'Submitted',
            description: 'Application received',
            statuses: ['pending', 'under_review', 'reviewed', 'shortlisted', 'interviewing', 'interviewed', 'offered', 'rejected'],
        },
        {
            id: 'reviewing',
            label: 'Under Review',
            description: 'HR is checking requirements',
            statuses: ['under_review', 'reviewed', 'shortlisted', 'interviewing', 'interviewed', 'offered', 'rejected'],
        },
        {
            id: 'shortlisted',
            label: 'Shortlisted',
            description: 'Qualified for the next stage',
            statuses: ['shortlisted', 'interviewing', 'interviewed', 'offered'],
        },
        {
            id: 'interview',
            label: 'Interview',
            description: 'Face-to-face assessment',
            statuses: ['interviewing', 'interviewed', 'offered'],
        },
        {
            id: 'final',
            label: 'Final Decision',
            description: 'Offer or feedback',
            statuses: ['offered', 'rejected'],
        }
    ]

    const getStepStatus = (stepStatuses: string[]) => {
        if (status === 'rejected' && stepStatuses.includes('rejected')) return 'error'
        if (stepStatuses.includes(status)) return 'current'
        
        // Find if any future step has the current status
        const currentIndex = steps.findIndex(s => s.statuses.includes(status))
        const stepIndex = steps.findIndex(s => s.statuses === stepStatuses)
        
        if (currentIndex > stepIndex) return 'complete'
        return 'upcoming'
    }

    return (
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
            {steps.map((step, index) => {
                const stepStatus = getStepStatus(step.statuses)
                const isComplete = stepStatus === 'complete' || (stepStatus === 'current' && step.id !== 'final')
                const isCurrent = stepStatus === 'current'
                const isError = status === 'rejected' && step.id === 'final'

                return (
                    <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Icon */}
                        <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-all duration-500",
                            isComplete ? "bg-emerald-500 text-white" : 
                            isCurrent ? "bg-primary text-primary-foreground animate-pulse" :
                            isError ? "bg-rose-500 text-white" :
                            "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        )}>
                            {isComplete ? <CheckCircle2 className="h-5 w-5" /> : 
                             isError ? <AlertCircle className="h-5 w-5" /> :
                             isCurrent ? <Clock className="h-5 w-5" /> :
                             <Circle className="h-5 w-5 fill-current opacity-20" />}
                        </div>

                        {/* Content */}
                        <div className="w-[calc(100%-4rem)] md:w-[45%] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 group-hover:shadow-md">
                            <div className="flex items-center justify-between mb-1">
                                <time className={cn(
                                    "text-xs font-bold uppercase tracking-widest",
                                    isCurrent ? "text-primary" : "text-slate-400"
                                )}>
                                    {step.label}
                                </time>
                                {isCurrent && (
                                    <span className="flex h-2 w-2 rounded-full bg-primary" />
                                )}
                            </div>
                            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{step.description}</div>
                            {isCurrent && status === 'rejected' && step.id === 'final' && (
                                <div className="text-xs font-medium text-rose-500 mt-2 p-2 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-100 dark:border-rose-900/30">
                                    This application was not successful. Check feedback below.
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
