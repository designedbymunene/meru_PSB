"use client"

import { useState } from "react"
import { RequireAuth } from "@/components/auth/require-auth"
import { ShortlistWizard } from "@/components/shortlisting/shortlist-wizard"
import { SelectVacancyStep } from "@/components/shortlisting/steps/select-vacancy-step"
import { ConfigureCriteriaStep } from "@/components/shortlisting/steps/configure-criteria-step"
import { ProcessingStep } from "@/components/shortlisting/steps/processing-step"
import { ShortlistResultsModal } from "@/components/shortlisting/results-modal"
import { WeightDistributionBar } from "@/components/shortlisting/weight-distribution-bar"
import { useSetShortlistCriteria, useRunShortlisting } from "@/hooks/use-shortlisting"
import { useVacancies } from "@/hooks/use-vacancies"
import { useApplications } from "@/hooks/use-applications"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, TrendingUp } from "lucide-react"
import { formatNumber } from "@/lib/utils"
import { useAuthContext } from "@/providers"

const DEFAULT_WEIGHTS = {
    qualifications: 30,
    experience: 25,
    skills: 20,
    education: 15,
    certifications: 10,
}

export default function ShortlistingPage() {
    const [currentStep, setCurrentStep] = useState(1)
    const [selectedVacancyId, setSelectedVacancyId] = useState<number | null>(null)
    const [weights, setWeights] = useState(DEFAULT_WEIGHTS)
    const [minScore, setMinScore] = useState(50)
    const [showResults, setShowResults] = useState(false)
    const [shortlistResults, setShortlistResults] = useState<any>(null)
    const [criteriaSaved, setCriteriaSaved] = useState(false)

    const { user } = useAuthContext()
    const setCriteria = useSetShortlistCriteria()
    const runShortlisting = useRunShortlisting()
    const { data: vacancies } = useVacancies()
    const { data: applicationsData } = useApplications(
        selectedVacancyId ? { vacancyId: selectedVacancyId.toString() } : undefined
    )

    const selectedVacancy = vacancies?.data?.find(v => v.id === selectedVacancyId)
    const totalApplications = (Array.isArray(applicationsData?.data) ? applicationsData.data : (applicationsData?.data as any)?.data || []).length

    const handleVacancySelect = (vacancyId: number) => {
        setSelectedVacancyId(vacancyId)
        setCriteriaSaved(false)
        setWeights(DEFAULT_WEIGHTS)
        setMinScore(50)
    }

    const handleSaveCriteria = () => {
        if (!selectedVacancyId || !user) return
        setCriteria.mutate(
            {
                vacancyId: selectedVacancyId,
                weights,
                minScore,
                configuredBy: user.userId,
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
                    setShortlistResults(data.data)
                    setShowResults(true)
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
                    configuredBy: user.userId,
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

    const handleResultsComplete = (results: any) => {
        setShortlistResults(results)
        setShowResults(true)
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
                        <h2 className="text-3xl font-bold tracking-tight">Shortlisting Management</h2>
                        <p className="text-muted-foreground">
                            Configure criteria and run automated shortlisting for vacancies
                        </p>
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
                            onNext={() => setCurrentStep(2)}
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
                            results={shortlistResults}
                            vacancyId={selectedVacancyId || 0}
                            onReset={() => setCurrentStep(1)}
                        />
                    )}
                </ShortlistWizard>
            </div>
        </RequireAuth>
    )
}
