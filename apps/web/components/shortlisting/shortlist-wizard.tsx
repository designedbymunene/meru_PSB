"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Circle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface WizardStep {
    id: number
    title: string
    description: string
}

const WIZARD_STEPS: WizardStep[] = [
    { id: 1, title: "Select Vacancy", description: "Choose the vacancy to process" },
    { id: 2, title: "Configure Criteria", description: "Set weights and shortlist threshold" },
    { id: 3, title: "Processing", description: "Running batch shortlisting" },
]

interface ShortlistWizardProps {
    children: React.ReactNode
    currentStep: number
    onStepChange: (step: number) => void
    canGoNext: boolean
    canGoBack: boolean
    onNext?: () => void
    onBack?: () => void
    isProcessing?: boolean
    previewContent?: React.ReactNode
}

export function ShortlistWizard({
    children,
    currentStep,
    onStepChange,
    canGoNext,
    canGoBack,
    onNext,
    onBack,
    isProcessing = false,
    previewContent,
}: ShortlistWizardProps) {
    const handleBack = () => {
        if (onBack) {
            onBack()
        } else if (canGoBack) {
            onStepChange(currentStep - 1)
        }
    }

    const handleNext = () => {
        if (onNext) {
            onNext()
        } else if (canGoNext) {
            onStepChange(currentStep + 1)
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar - Steps */}
            <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
                {/* Steps List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Steps</h2>
                    <div className="hidden lg:block space-y-2">
                        {WIZARD_STEPS.map((step) => {
                            const isCompleted = currentStep > step.id
                            const isCurrent = currentStep === step.id
                            const isUpcoming = currentStep < step.id

                            return (
                                <button
                                    key={step.id}
                                    onClick={() => !isProcessing && !isUpcoming && onStepChange(step.id)}
                                    disabled={isProcessing || isUpcoming}
                                    className={cn(
                                        "w-full text-left p-4 rounded-lg border transition-all",
                                        isCurrent && "border-primary bg-primary/5",
                                        isCompleted && "border-primary/30",
                                        isUpcoming && "border-muted opacity-60",
                                        !isUpcoming && !isProcessing && "hover:border-primary/50"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Step Icon */}
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                                            isCompleted && "bg-primary",
                                            isCurrent && "bg-primary",
                                            isUpcoming && "bg-muted"
                                        )}>
                                            {isCompleted ? (
                                                <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                                            ) : isCurrent ? (
                                                <span className="text-sm font-semibold text-primary-foreground">{step.id}</span>
                                            ) : (
                                                <Circle className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>

                                        {/* Step Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "font-medium text-sm",
                                                isCurrent && "text-primary",
                                                isCompleted && "text-primary",
                                                isUpcoming && "text-muted-foreground"
                                            )}>
                                                {step.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                    {/* Mobile Step Indicator */}
                    <div className="lg:hidden flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        {WIZARD_STEPS.map((step) => {
                            const isCompleted = currentStep > step.id
                            const isCurrent = currentStep === step.id

                            return (
                                <div key={step.id} className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                                        isCompleted && "bg-primary text-primary-foreground",
                                        isCurrent && "bg-primary text-primary-foreground",
                                        !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                                    )}>
                                        {isCompleted ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            step.id
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Dynamic Preview Area - Desktop only */}
                {previewContent && (
                    <div className="hidden lg:block space-y-4">
                        <h2 className="text-lg font-semibold">Overview</h2>
                        {previewContent}
                    </div>
                )}
            </div>

            {/* Right Side - Main Content */}
            <div className="flex-1 min-w-0">
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            {/* Step Header */}
                            <div className="space-y-0.5 pb-3 border-b">
                                <h2 className="text-lg font-semibold">
                                    {WIZARD_STEPS[currentStep - 1].title}
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    {WIZARD_STEPS[currentStep - 1].description}
                                </p>
                            </div>

                            {/* Step Content */}
                            <div className="min-h-[350px]">{children}</div>

                            {/* Navigation */}
                            {currentStep < WIZARD_STEPS.length && (
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={handleBack}
                                        disabled={!canGoBack || isProcessing}
                                    >
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>Step {currentStep} of {WIZARD_STEPS.length}</span>
                                        <div className="h-1 w-24 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{ width: `${(currentStep / WIZARD_STEPS.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    {canGoNext && currentStep < WIZARD_STEPS.length - 1 && (
                                        <Button onClick={handleNext} disabled={isProcessing}>
                                            Next
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
