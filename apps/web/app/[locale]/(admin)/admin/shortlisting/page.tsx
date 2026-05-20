"use client"

import { useState } from "react"
import { RequireAuth } from "@/components/auth/require-auth"
import { ShortlistWizard } from "@/components/shortlisting/shortlist-wizard"
import { SelectVacancyStep } from "@/components/shortlisting/steps/select-vacancy-step"
import { ConfigureCriteriaStep } from "@/components/shortlisting/steps/configure-criteria-step"
import { ProcessingStep } from "@/components/shortlisting/steps/processing-step"
import { useSetShortlistCriteria, useRunShortlisting } from "@/hooks/use-shortlisting"
import { useAllApplications } from "@/hooks/use-applications"
import { useAuthContext } from "@/providers"

type ShortlistWeights = {
    education: number
    experience: number
    memberships: number
}

const DEFAULT_WEIGHTS: ShortlistWeights = {
    education: 40,
    experience: 40,
    memberships: 20,
}

export default function ShortlistingPage() {
    const [currentStep, setCurrentStep] = useState(1)
    const [selectedVacancyId, setSelectedVacancyId] = useState<number | null>(null)
    const [weights, setWeights] = useState<ShortlistWeights>(DEFAULT_WEIGHTS)
    const [minScore, setMinScore] = useState(50)
    const [runResults, setRunResults] = useState<{ processed: number; shortlisted: number } | null>(null)
    const [criteriaSaved, setCriteriaSaved] = useState(false)

    const { user } = useAuthContext()
    const setCriteria = useSetShortlistCriteria()
    const runShortlisting = useRunShortlisting()
    const { data: applicationsData } = useAllApplications(
        selectedVacancyId
            ? {
                vacancyId: selectedVacancyId.toString(),
                sortBy: "appliedAt",
                order: "desc",
                limit: "1000",
                offset: "0",
            }
            : undefined
    )

    const applicationsPayload: { data?: Array<{ status?: string }> } | Array<{ status?: string }> | undefined = applicationsData?.data
    const allApplications = Array.isArray(applicationsPayload)
        ? applicationsPayload
        : applicationsPayload?.data || []
    const queueApplications = allApplications.filter((application: { status?: string }) =>
        application.status === "pending" || application.status === "reviewed"
    )
    const totalApplications = queueApplications.length

    const handleVacancySelect = (vacancyId: number) => {
        setSelectedVacancyId(vacancyId)
        setCriteriaSaved(false)
        setWeights(DEFAULT_WEIGHTS)
        setMinScore(50)
        setRunResults(null)
    }

    const handleSaveCriteria = () => {
        if (!selectedVacancyId || !user) return
        setCriteria.mutate(
            {
                vacancyId: selectedVacancyId,
                weights,
                minScore,
            },
            {
                onSuccess: () => {
                    setCriteriaSaved(true)
                },
            }
        )
    }

    const handleRunShortlisting = () => {
        if (!selectedVacancyId || !user) return

        const runAction = () => {
            setCurrentStep(3)
            runShortlisting.mutate(selectedVacancyId, {
                onSuccess: (data) => {
                    setRunResults({
                        processed: data.data?.processed || 0,
                        shortlisted: data.data?.shortlisted || 0,
                    })
                },
                onError: () => {
                    setCurrentStep(2)
                },
            })
        }

        if (!criteriaSaved) {
            setCriteria.mutate(
                {
                    vacancyId: selectedVacancyId,
                    weights,
                    minScore,
                },
                {
                    onSuccess: () => {
                        setCriteriaSaved(true)
                        runAction()
                    },
                }
            )
        } else {
            runAction()
        }
    }

    const canGoNext = () => {
        switch (currentStep) {
            case 1:
                return selectedVacancyId !== null
            default:
                return false
        }
    }

    const canGoBack = () => {
        return currentStep === 2
    }

    return (
        <RequireAuth allowedRoles={["admin"]}>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Batch Shortlisting</h2>
                        <p className="text-muted-foreground">
                            Select a vacancy, set the scoring weights, and process pending applications in one run.
                        </p>
                    </div>
                    <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                        This workflow processes applications that are still pending or already reviewed, then moves matching
                        candidates to shortlisted status automatically.
                    </div>
                </div>

                <ShortlistWizard
                    currentStep={currentStep}
                    onStepChange={setCurrentStep}
                    canGoNext={canGoNext()}
                    canGoBack={canGoBack()}
                    isProcessing={runShortlisting.isPending}
                >
                    {currentStep === 1 && (
                        <SelectVacancyStep
                            selectedVacancyId={selectedVacancyId}
                            onVacancySelect={handleVacancySelect}
                        />
                    )}

                    {currentStep === 2 && selectedVacancyId && (
                        <ConfigureCriteriaStep
                            vacancyId={selectedVacancyId}
                            initialWeights={weights}
                            initialMinScore={minScore}
                            onWeightsChange={setWeights}
                            onMinScoreChange={setMinScore}
                            onSaveCriteria={handleSaveCriteria}
                            onRunShortlisting={handleRunShortlisting}
                            isSaving={setCriteria.isPending}
                            isRunning={runShortlisting.isPending}
                        />
                    )}

                    {currentStep === 3 && (
                        <ProcessingStep
                            isRunning={runShortlisting.isPending}
                            totalApplications={totalApplications}
                            results={runResults}
                            vacancyId={selectedVacancyId || 0}
                            onReset={() => {
                                setRunResults(null)
                                setCurrentStep(1)
                            }}
                        />
                    )}
                </ShortlistWizard>
            </div>
        </RequireAuth>
    )
}
