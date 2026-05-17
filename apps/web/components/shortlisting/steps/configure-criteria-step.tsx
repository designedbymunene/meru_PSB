"use client"

import { useState, useMemo, useEffect } from "react"
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
    Zap, 
    BookOpen, 
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
    onWeightsChange: (weights: Record<string, number>) => void
    onMinScoreChange: (minScore: number) => void
    onSaveCriteria: () => void
    onRunShortlisting: () => void
    isSaving: boolean
    isRunning: boolean
}

const WEIGHT_CONFIG = {
    qualifications: {
        label: "Qualifications",
        description: "Academic and professional qualifications",
        icon: GraduationCap,
    },
    experience: {
        label: "Experience",
        description: "Years of relevant work experience",
        icon: Briefcase,
    },
    skills: {
        label: "Skills",
        description: "Relevant technical and soft skills",
        icon: Zap,
    },
    education: {
        label: "Education",
        description: "Educational background and achievements",
        icon: BookOpen,
    },
    certifications: {
        label: "Certifications",
        description: "Professional certifications and memberships",
        icon: Award,
    },
}

// Simplified scoring calculation for preview
function calculateEstimatedScore(profile: any, weights: Record<string, number>): number {
    if (!profile) return 0

    let score = 0

    if (weights.education && profile.qualifications && Array.isArray(profile.qualifications)) {
        const levels: Record<string, number> = {
            "PhD": 30,
            "Masters": 25,
            "Bachelor": 20,
            "Diploma": 15,
            "Certificate": 10,
        }
        let maxScore = 0
        for (const qual of profile.qualifications) {
            const points = levels[qual.level] || 0
            if (points > maxScore) maxScore = points
        }
        score += (maxScore * weights.education) / 100
    }

    if (weights.experience && profile.employmentHistory && Array.isArray(profile.employmentHistory)) {
        let totalDays = 0
        for (const job of profile.employmentHistory) {
            if (!job.startDate) continue
            const start = new Date(job.startDate)
            const end = job.endDate ? new Date(job.endDate) : new Date()
            totalDays += (end.getTime() - start.getTime()) / (1000 * 3600 * 24)
        }
        const years = totalDays / 365.25
        const expScore = Math.min(years * 5, 25)
        score += (expScore * weights.experience) / 100
    }

    if (weights.certifications && profile.professionalMemberships && Array.isArray(profile.professionalMemberships)) {
        const membershipScore = Math.min(profile.professionalMemberships.length * 5, 15)
        score += (membershipScore * weights.certifications) / 100
    }

    if (weights.skills && profile.skills) {
        const skillsScore = Math.min(profile.skills.length * 2, 20)
        score += (skillsScore * weights.skills) / 100
    }

    if (weights.qualifications && profile.qualifications && Array.isArray(profile.qualifications)) {
        score += (15 * weights.qualifications) / 100
    }

    return Math.round(score)
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
    const [weights, setWeights] = useState<Record<string, number>>(initialWeights)
    const [minScore, setMinScore] = useState(initialMinScore)
    const [importFromVacancyId, setImportFromVacancyId] = useState<string>("")

    const { data: applicationsData } = useApplications({
        vacancyId: vacancyId.toString(),
        status: "pending,reviewed,shortlisted",
    })

    const { data: vacancies } = useVacancies()
    const { data: importedCriteria } = useShortlistCriteria(parseInt(importFromVacancyId) || 0)

    const applications = Array.isArray(applicationsData?.data) ? applicationsData.data : (applicationsData?.data as any)?.data || []

    // Normalizing weights logic
    const normalizedWeights = useMemo(() => {
        const total = Object.values(weights).reduce((sum, value) => sum + value, 0)
        if (total === 0) return weights

        const normalized: Record<string, number> = {}
        for (const [key, value] of Object.entries(weights)) {
            normalized[key] = Math.round((value / total) * 100)
        }

        const normalizedTotal = Object.values(normalized).reduce((sum, value) => sum + value, 0)
        if (normalizedTotal !== 100) {
            const difference = 100 - normalizedTotal
            const maxKey = Object.entries(normalized).reduce((a, b) =>
                normalized[a[0]] > normalized[b[0]] ? a : b
            )[0]
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
            .map(app => ({
                ...app,
                score: calculateEstimatedScore(app.applicantProfileSnapshot, normalizedWeights),
            }))
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
            setWeights(importedCriteria.data.weights)
            setMinScore(importedCriteria.data.minScore)
        }
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
                    
                    <div className="space-y-5">
                        {Object.entries(WEIGHT_CONFIG).map(([key, config]) => {
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
                                        {app.applicantProfileSnapshot?.fullName || "Applicant"}
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
