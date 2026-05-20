"use client"

import { useState, useMemo, useEffect, type Dispatch, type SetStateAction } from "react"
import { useApplications } from "@/hooks/use-applications"
import { useVacancies } from "@/hooks/use-vacancies"
import { useShortlistCriteria } from "@/hooks/use-shortlisting"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
    GraduationCap, 
    Briefcase, 
    Award, 
    Info, 
    Save, 
    Play, 
    CheckCircle2, 
    XCircle,
    Copy
} from "lucide-react"
import { WeightDistributionBar } from "../weight-distribution-bar"
import { formatNumber, cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ConfigureCriteriaStepProps {
    vacancyId: number
    initialWeights: Record<string, number>
    initialMinScore: number
    onWeightsChange: Dispatch<SetStateAction<ShortlistWeights>>
    onMinScoreChange: (minScore: number) => void
    onSaveCriteria: () => void
    onRunShortlisting: () => void
    isSaving: boolean
    isRunning: boolean
}

type ShortlistWeights = {
    education: number
    experience: number
    memberships: number
}

const WEIGHT_CONFIG = {
    education: {
        label: "Education",
        description: "Highest qualification achieved",
        icon: GraduationCap,
    },
    experience: {
        label: "Experience",
        description: "Years of relevant work experience",
        icon: Briefcase,
    },
    memberships: {
        label: "Memberships",
        description: "Professional memberships and licences",
        icon: Award,
    },
}

const SCORE_LEVELS: Array<[RegExp, number]> = [
    [/ph\.?d|doctor/i, 100],
    [/master|mba|msc|ma/i, 90],
    [/post.?grad/i, 80],
    [/bachelor|degree|bsc|ba|bed|bcom|llb/i, 70],
    [/diploma/i, 55],
    [/certificate/i, 40],
    [/kcse|secondary|high school/i, 20],
]

const PRESET_WEIGHTS = {
    balanced: { education: 40, experience: 40, memberships: 20 },
    experienceHeavy: { education: 25, experience: 55, memberships: 20 },
    qualificationHeavy: { education: 55, experience: 30, memberships: 15 },
}

const WEIGHT_KEYS = Object.keys(WEIGHT_CONFIG) as Array<keyof ShortlistWeights>

function normalizeWeightsInput(weights?: Partial<Record<string, number>>) {
    return {
        education: weights?.education ?? weights?.qualifications ?? 0,
        experience: weights?.experience ?? weights?.skills ?? 0,
        memberships: weights?.memberships ?? weights?.certifications ?? weights?.professionalMemberships ?? 0,
    }
}

function scoreQualificationLevel(level: unknown) {
    const value = String(level || '').trim()
    if (!value) return 0

    for (const [pattern, score] of SCORE_LEVELS) {
        if (pattern.test(value)) return score
    }

    return 0
}

// Matches the backend scoring model so the preview reflects real results.
function calculateEstimatedScore(profile: any, weights: Record<string, number>): number {
    if (!profile) return 0

    const qualifications = Array.isArray(profile.qualifications) ? profile.qualifications : []
    const employmentHistory = Array.isArray(profile.employmentHistory) ? profile.employmentHistory : []
    const professionalMemberships = Array.isArray(profile.professionalMemberships) 
        ? profile.professionalMemberships 
        : Array.isArray(profile.memberships) ? profile.memberships : []
    const professionalDetails = Array.isArray(profile.professionalDetails) ? profile.professionalDetails : []

    let educationScore = 0
    for (const qual of qualifications) {
        educationScore = Math.max(educationScore, scoreQualificationLevel(qual?.level))
    }

    let experienceScore = 0
    if (employmentHistory.length > 0) {
        let totalDays = 0
        for (const job of employmentHistory) {
            if (!job.startDate) continue
            const start = new Date(job.startDate)
            const end = job.endDate ? new Date(job.endDate) : new Date()

            if (isNaN(start.getTime()) || isNaN(end.getTime())) continue

            totalDays += Math.max(0, (end.getTime() - start.getTime()) / (1000 * 3600 * 24))
        }
        const years = totalDays / 365.25
        experienceScore = Math.min(Math.round((years / 10) * 100), 100)
    }

    const membershipsScore = Math.min((professionalMemberships.length + professionalDetails.length) * 25, 100)

    const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0)
    if (totalWeight <= 0) return 0

    const score =
        (educationScore * (weights.education || 0)) +
        (experienceScore * (weights.experience || 0)) +
        (membershipsScore * (weights.memberships || 0))

    return Math.round(score / totalWeight)
}

export function ConfigureCriteriaStep({
    vacancyId,
    initialWeights,
    initialMinScore,
    onWeightsChange,
    onMinScoreChange,
    onSaveCriteria,
    onRunShortlisting,
    isSaving,
    isRunning,
}: ConfigureCriteriaStepProps) {
    const [weights, setWeights] = useState<ShortlistWeights>(() => normalizeWeightsInput(initialWeights))
    const [minScore, setMinScore] = useState(initialMinScore)
    const [importFromVacancyId, setImportFromVacancyId] = useState<string>("")

    const { data: applicationsData } = useApplications({
        vacancyId: vacancyId.toString(),
        sortBy: "appliedAt",
        order: "desc",
        limit: "1000",
        offset: "0",
    })

    const { data: vacancies } = useVacancies()
    const { data: importedCriteria } = useShortlistCriteria(parseInt(importFromVacancyId) || 0)

    type PreviewApplication = {
        id: number
        profileSnapshot?: any
        applicantProfileSnapshot?: any
        applicant?: {
            fullName: string
            applicantProfile?: any
        }
    }

    const rawApplications = Array.isArray(applicationsData?.data)
        ? applicationsData.data as PreviewApplication[]
        : ((applicationsData?.data as any)?.data || []) as PreviewApplication[]

    const applications = useMemo(() => {
        return rawApplications.filter((app: any) => 
            app.status === "pending" || app.status === "reviewed"
        )
    }, [rawApplications])

    // Normalizing weights logic
    const normalizedWeights = useMemo<ShortlistWeights>(() => {
        const total = Object.values(weights).reduce((sum, value) => sum + value, 0)
        if (total === 0) return weights

        const normalized: ShortlistWeights = {
            education: 0,
            experience: 0,
            memberships: 0,
        }

        for (const [key, value] of Object.entries(weights) as Array<[keyof ShortlistWeights, number]>) {
            normalized[key] = Math.round((value / total) * 100)
        }

        const normalizedTotal = Object.values(normalized).reduce((sum, value) => sum + value, 0)
        if (normalizedTotal !== 100) {
            const difference = 100 - normalizedTotal
            const maxKey = (Object.keys(normalized) as Array<keyof ShortlistWeights>).reduce(
                (currentMax, key) => (normalized[key] > normalized[currentMax] ? key : currentMax),
                'education'
            )
            normalized[maxKey] += difference
        }

        return normalized
    }, [weights])

    // Update parent when values change
    useEffect(() => {
        onWeightsChange(normalizedWeights)
    }, [normalizedWeights, onWeightsChange])

    useEffect(() => {
        onMinScoreChange(minScore)
    }, [minScore, onMinScoreChange])

    // Scoring Distribution
    const scoredApplications = useMemo(() => {
        return applications
            .map(app => {
                const profile = app.profileSnapshot ?? app.applicantProfileSnapshot ?? app.applicant?.applicantProfile
                return {
                    ...app,
                    score: calculateEstimatedScore(profile, normalizedWeights),
                    displayName: app.applicantProfileSnapshot?.fullName || app.applicant?.fullName || "Applicant"
                }
            })
            .sort((a, b) => b.score - a.score)
    }, [applications, normalizedWeights])

    const distribution = useMemo(() => {
        const bins = Array(10).fill(0)
        scoredApplications.forEach(app => {
            const binIndex = Math.min(Math.floor(app.score / 10), 9)
            bins[binIndex]++
        })
        return bins
    }, [scoredApplications])

    const qualifiedCount = scoredApplications.filter(app => app.score >= minScore).length
    const rejectedCount = scoredApplications.length - qualifiedCount
    const successRate = scoredApplications.length > 0 ? (qualifiedCount / scoredApplications.length) * 100 : 0

    const handleImportCriteria = () => {
        if (importedCriteria?.data) {
            setWeights(normalizeWeightsInput(importedCriteria.data.weights))
            setMinScore(importedCriteria.data.minScore)
        }
    }

    const applyPreset = (preset: keyof typeof PRESET_WEIGHTS) => {
        setWeights(PRESET_WEIGHTS[preset])
    }

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column: Configuration */}
            <div className="space-y-6">
                {/* Import Section */}
                <div className="flex items-end gap-3 p-4 bg-muted/30 rounded-lg border border-dashed">
                    <div className="flex-1 space-y-2">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                            Import Criteria from Template
                        </Label>
                        <Select value={importFromVacancyId} onValueChange={setImportFromVacancyId}>
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select another vacancy..." />
                            </SelectTrigger>
                            <SelectContent>
                                {vacancies?.data?.filter(v => v.id !== vacancyId).map(v => (
                                    <SelectItem key={v.id} value={v.id.toString()}>
                                        {v.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button 
                        variant="secondary" 
                        size="icon"
                        disabled={!importFromVacancyId}
                        onClick={handleImportCriteria}
                        title="Import criteria"
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>

                {/* Weights Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Scoring Weights</Label>
                        <Badge variant="outline" className="font-mono">Total: 100%</Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => applyPreset("balanced")}>
                            Balanced
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => applyPreset("experienceHeavy")}>
                            Experience heavy
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => applyPreset("qualificationHeavy")}>
                            Qualification heavy
                        </Button>
                    </div>

                    <WeightDistributionBar weights={normalizedWeights} />
                    
                    <div className="space-y-5">
                        {WEIGHT_KEYS.map((key) => {
                            const config = WEIGHT_CONFIG[key]
                            const value = weights[key]
                            const Icon = config.icon
                            return (
                                <div key={key} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 bg-primary/10 rounded-md">
                                                <Icon className="h-3.5 w-3.5 text-primary" />
                                            </div>
                                            <Label className="text-sm font-medium">{config.label}</Label>
                                        </div>
                                        <span className="text-sm font-semibold tabular-nums">{normalizedWeights[key]}%</span>
                                    </div>
                                    <Slider
                                        value={[value]}
                                        onValueChange={([v]) => setWeights(prev => ({ ...prev, [key]: v }))}
                                        max={100}
                                        step={5}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Threshold Section */}
                <div className="pt-6 border-t space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Minimum Score Threshold</Label>
                        <span className="text-2xl font-bold text-primary">{minScore}%</span>
                    </div>
                    <Slider
                        value={[minScore]}
                        onValueChange={([v]) => setMinScore(v)}
                        max={100}
                        step={5}
                        className="py-2"
                    />
                    <p className="text-xs text-muted-foreground">
                        Applicants must score at least {minScore}% to be shortlisted
                    </p>
                </div>
            </div>

            {/* Right Column: Live Preview & Distribution */}
            <div className="space-y-6">
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <Info className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                        Changing weights or threshold immediately updates the estimated results below.
                    </p>
                </div>

                {/* Distribution Histogram */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold">Applicant Score Distribution</Label>
                    <div className="h-24 flex items-end gap-1 px-1">
                        {distribution.map((count, i) => {
                            const height = distribution.length > 0 ? (count / Math.max(...distribution, 1)) * 100 : 0
                            const isAboveThreshold = (i * 10) + 10 > minScore
                            return (
                                <div 
                                    key={i} 
                                    className={cn(
                                        "flex-1 rounded-t-sm transition-all duration-300",
                                        isAboveThreshold ? "bg-primary" : "bg-muted-foreground/30"
                                    )}
                                    style={{ height: `${Math.max(height, 5)}%` }}
                                    title={`${i*10}-${(i+1)*10}%: ${count} applicants`}
                                />
                            )
                        })}
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                    </div>
                </div>

                {/* Impact Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4 space-y-1">
                            <p className="text-xs text-muted-foreground">Qualified</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-primary">{qualifiedCount}</span>
                                <span className="text-xs text-muted-foreground">of {applications.length}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 space-y-1">
                            <p className="text-xs text-muted-foreground">Success Rate</p>
                            <span className="text-2xl font-bold">{successRate.toFixed(1)}%</span>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Applicants */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold">Top Ranked (Preview)</Label>
                    <div className="space-y-2">
                        {scoredApplications.slice(0, 3).map((app, i) => (
                            <div key={app.id} className="flex items-center justify-between p-2 rounded-md border bg-background text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-muted-foreground w-4">#{i+1}</span>
                                    <span className="font-medium truncate max-w-[150px]">
                                        {app.displayName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-mono font-semibold">{app.score}%</span>
                                    {app.score >= minScore ? (
                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t">
                    <Button
                        onClick={onSaveCriteria}
                        disabled={isSaving || isRunning}
                        variant="outline"
                        className="flex-1"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "Saving..." : "Save Configuration"}
                    </Button>
                    <Button
                        onClick={onRunShortlisting}
                        disabled={isRunning}
                        className="flex-1"
                    >
                        {isRunning ? (
                            "Processing..."
                        ) : (
                            <>
                                <Play className="mr-2 h-4 w-4" />
                                Run Shortlisting
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
