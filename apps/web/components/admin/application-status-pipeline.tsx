"use client"

import { cn } from "@/lib/utils"
import { APPLICATION_STATUS } from "@/lib/constants"
import { CheckCircle, Circle, Dot, XCircle } from "lucide-react"

interface StatusStep {
    id: string
    label: string
}

const steps: StatusStep[] = [
    { id: APPLICATION_STATUS.PENDING, label: "Applied" },
    { id: APPLICATION_STATUS.REVIEWED, label: "Reviewed" },
    { id: APPLICATION_STATUS.SHORTLISTED, label: "Shortlisted" },
    { id: APPLICATION_STATUS.INTERVIEWED, label: "Interviewed" },
    { id: APPLICATION_STATUS.ACCEPTED, label: "Decision" },
]

interface ApplicationStatusPipelineProps {
    currentStatus: string
    onStatusClick: (status: string) => void
}

export function ApplicationStatusPipeline({
    currentStatus,
    onStatusClick,
}: ApplicationStatusPipelineProps) {
    const getCurrentStepIndex = () => {
        if (currentStatus === APPLICATION_STATUS.REJECTED) {
            return steps.findIndex(s => s.id === APPLICATION_STATUS.ACCEPTED)
        }
        if (currentStatus === APPLICATION_STATUS.INTERVIEWING) {
            return steps.findIndex(s => s.id === APPLICATION_STATUS.INTERVIEWED)
        }
        return steps.findIndex(s => s.id === currentStatus)
    }

    const currentStepIndex = getCurrentStepIndex()
    const isRejected = currentStatus === APPLICATION_STATUS.REJECTED

    return (
        <div className="flex items-center w-full py-2 overflow-x-auto no-scrollbar">
            {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex
                const isCurrent = index === currentStepIndex
                const isFinal = index === steps.length - 1
                const stepStatus = isRejected && isCurrent ? "rejected" : isCurrent ? "current" : isCompleted ? "completed" : "pending"

                // Only allow clicking the NEXT step or the FINAL step (decision)
                // and don't allow clicking if already rejected or accepted
                const isClickable = (index === currentStepIndex + 1 || (isFinal && index > currentStepIndex)) && 
                                   currentStatus !== APPLICATION_STATUS.ACCEPTED && 
                                   currentStatus !== APPLICATION_STATUS.REJECTED

                return (
                    <div key={step.id} className="flex items-center group">
                        {/* Step Circle & Label */}
                        <button
                            onClick={() => isClickable && onStatusClick(step.id)}
                            disabled={!isClickable}
                            className={cn(
                                "flex flex-col items-center gap-1 relative transition-all",
                                isClickable ? "cursor-pointer hover:opacity-80" : "cursor-default opacity-60"
                            )}
                        >
                            <div
                                className={cn(
                                    "h-6 w-6 rounded-full border flex items-center justify-center transition-colors",
                                    stepStatus === "completed" && "bg-primary border-primary text-primary-foreground",
                                    stepStatus === "current" && "border-primary text-primary bg-background",
                                    stepStatus === "rejected" && "border-destructive text-destructive bg-background",
                                    stepStatus === "pending" && "border-muted text-muted-foreground bg-background"
                                )}
                            >
                                {stepStatus === "completed" ? (
                                    <CheckCircle className="h-3.5 w-3.5" />
                                ) : stepStatus === "rejected" ? (
                                    <XCircle className="h-3.5 w-3.5" />
                                ) : stepStatus === "current" ? (
                                    <Dot className="h-5 w-5" />
                                ) : (
                                    <Circle className="h-3 w-3 fill-current opacity-20" />
                                )}
                            </div>
                            <span
                                className={cn(
                                    "text-[9px] font-medium whitespace-nowrap px-0.5",
                                    stepStatus === "completed" && "text-primary",
                                    stepStatus === "current" && "text-primary font-bold",
                                    stepStatus === "rejected" && "text-destructive font-bold",
                                    stepStatus === "pending" && "text-muted-foreground"
                                )}
                            >
                                {isFinal && currentStatus === APPLICATION_STATUS.ACCEPTED ? "Accepted" : 
                                 isFinal && currentStatus === APPLICATION_STATUS.REJECTED ? "Not Successful" : 
                                 step.label}
                            </span>
                        </button>

                        {/* Connector Line */}
                        {!isFinal && (
                            <div
                                className={cn(
                                    "h-[1px] w-6 md:w-10 -mt-4 mx-1 transition-colors",
                                    isCompleted ? "bg-primary" : "bg-muted"
                                )}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
