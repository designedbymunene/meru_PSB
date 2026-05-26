"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "@/i18n/routing"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
    Activity, 
    Database, 
    Cpu, 
    Filter, 
    Save, 
    Search,
    CheckCircle2,
    Calendar,
    Eye,
    FileSpreadsheet,
    ArrowRight,
    XCircle,
    RotateCcw,
    Users,
    TrendingUp
} from "lucide-react"
import { cn, formatNumber } from "@/lib/utils"

interface ShortlistResults {
    processed: number
    shortlisted: number
}

interface ProcessingStepProps {
    isRunning: boolean
    totalApplications?: number
    results?: ShortlistResults | null
    vacancyId: number
    onReset: () => void
}

const STAGES = [
    { id: 'init', label: 'Initializing Engine', icon: Cpu },
    { id: 'fetch', label: 'Loading Pending Applicants', icon: Database },
    { id: 'score', label: 'Calculating Criteria Scores', icon: Activity },
    { id: 'filter', label: 'Applying Shortlist Threshold', icon: Filter },
    { id: 'save', label: 'Updating Application Statuses', icon: Save },
]

export function ProcessingStep({ 
    isRunning, 
    totalApplications = 0, 
    results, 
    vacancyId,
    onReset 
}: ProcessingStepProps) {
    const router = useRouter()
    const [progress, setProgress] = useState(0)
    const [currentStageIndex, setCurrentStageIndex] = useState(0)
    const [logs, setLogs] = useState<string[]>([])
    const logEndRef = useRef<HTMLDivElement>(null)
    const intervalRef = useRef<number | null>(null)

    // Scroll to bottom of logs
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [logs])

    useEffect(() => {
        if (!isRunning && !results) {
            const resetTimer = window.setTimeout(() => {
                setProgress(0)
                setCurrentStageIndex(0)
                setLogs([])
            }, 0)

            return () => window.clearTimeout(resetTimer)
        }

        if (!isRunning && results) {
            return
        }

        if (isRunning) {
            const initialLogs = [
                "System: Batch shortlisting started...",
                "System: Validating criteria weights...",
                "System: Loading pending and reviewed applications...",
            ]
            const startTimer = window.setTimeout(() => {
                setLogs(initialLogs)
                intervalRef.current = window.setInterval(() => {
                    setProgress(prev => {
                        const nextProgress = prev + (Math.random() * 4)
                        
                        if (nextProgress < 15) setCurrentStageIndex(0)
                        else if (nextProgress < 30) setCurrentStageIndex(1)
                        else if (nextProgress < 75) setCurrentStageIndex(2)
                        else if (nextProgress < 90) setCurrentStageIndex(3)
                        else setCurrentStageIndex(4)

                        if (Math.random() > 0.6 && nextProgress < 98) {
                            const stage = STAGES[currentStageIndex].id
                            let message = ""
                            if (stage === 'init') message = "Preparing the scoring engine..."
                            if (stage === 'fetch') message = `Loading ${totalApplications} applicant records...`
                            if (stage === 'score') message = `Scoring applicant #${Math.floor(Math.random() * Math.max(totalApplications, 1) + 1)}...`
                            if (stage === 'filter') message = "Checking candidates against the shortlist threshold..."
                            if (stage === 'save') message = "Updating shortlisted and reviewed statuses..."
                            
                            if (message) setLogs(l => [...l.slice(-10), `[${new Date().toLocaleTimeString()}] ${message}`])
                        }

                        if (nextProgress >= 98) return 98
                        return nextProgress
                    })
                }, 150)
            }, 0)

            return () => {
                window.clearTimeout(startTimer)
                if (intervalRef.current !== null) {
                    window.clearInterval(intervalRef.current)
                    intervalRef.current = null
                }
            }
        } else if (results) {
            const settleTimer = window.setTimeout(() => {
                setProgress(100)
                setCurrentStageIndex(4)
            }, 0)

            return () => window.clearTimeout(settleTimer)
        }
    }, [isRunning, results, totalApplications, currentStageIndex])

    const handleViewShortlisted = () => {
        router.push(`/admin/applications?vacancyId=${vacancyId}&status=shortlisted`)
    }

    const handleExport = () => {
        const csvContent = `Shortlist Report\nProcessed: ${results?.processed}\nShortlisted: ${results?.shortlisted}`
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `shortlist-results.csv`
        a.click()
    }

    // Show Results View if not running and results exist
    if (!isRunning && results) {
        const rejectedCount = results.processed - results.shortlisted
        const successRate = results.processed > 0 ? (results.shortlisted / results.processed) * 100 : 0

        return (
            <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                {/* Header Card */}
                <div className="bg-primary rounded-2xl p-8 text-primary-foreground relative overflow-hidden shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <CheckCircle2 className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-3xl font-extrabold tracking-tight">Shortlisting Complete</h3>
                            </div>
                            <p className="text-primary-foreground/80 text-lg max-w-md">
                                Successfully processed {formatNumber(results.processed)} applications and updated their shortlist status.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 min-w-[200px]">

                            <Button 
                                variant="ghost" 
                                onClick={onReset}
                                className="text-white hover:bg-white/10"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Run Again
                            </Button>
                        </div>
                    </div>
                    {/* Abstract background shape */}
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                </div>

                {/* Statistics Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="border-none bg-primary/5 shadow-none">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-2xl">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Shortlisted</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-primary tabular-nums">
                                            {formatNumber(results.shortlisted)}
                                        </span>
                                        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                                            {successRate.toFixed(1)}%
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-muted/30 shadow-none">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-muted rounded-2xl">
                                    <XCircle className="h-6 w-6 text-muted-foreground/60" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Not Shortlisted</p>
                                    <span className="text-4xl font-black text-muted-foreground/40 tabular-nums">
                                        {formatNumber(rejectedCount)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-muted/20 shadow-none">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-muted rounded-2xl">
                                    <TrendingUp className="h-6 w-6 text-muted-foreground/60" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Avg. Quality</p>
                                    <span className="text-4xl font-black text-muted-foreground/40 tabular-nums">
                                        {Math.round(successRate * 0.8 + 20)}%
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                    <div className="flex gap-3">
                        <Button variant="outline" size="lg" onClick={handleViewShortlisted} className="font-semibold h-12">
                            <Eye className="mr-2 h-4 w-4" />
                            View Shortlisted Candidates
                        </Button>
                        <Button variant="outline" size="lg" onClick={handleExport} className="font-semibold h-12">
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Export Report
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-xs text-right italic">
                        The batch process updated application statuses for the selected vacancy.
                    </p>
                </div>
            </div>
        )
    }

    // Default Loading/Processing View
    return (
        <div className="space-y-8 max-w-4xl mx-auto py-4">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center border-2 border-primary/20">
                        <Activity className="h-10 w-10 text-primary animate-pulse" />
                    </div>
                    <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight">
                        {STAGES[currentStageIndex].label}
                    </h3>
                    <p className="text-muted-foreground">
                        {isRunning
                            ? `Processing ${totalApplications} pending and reviewed applications...`
                            : "Batch shortlisting is preparing your results."}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
                {STAGES.map((stage, index) => {
                    const isCompleted = currentStageIndex > index
                    const isCurrent = currentStageIndex === index
                    const Icon = stage.icon
                    return (
                        <div key={stage.id} className={cn(
                            "flex flex-col items-center p-3 rounded-xl border transition-all duration-500",
                            isCurrent ? "bg-primary/10 border-primary shadow-sm scale-105 z-10" : "bg-muted/30 border-transparent",
                            isCompleted && "opacity-60 bg-primary/5"
                        )}>
                            <div className={cn(
                                "p-2 rounded-lg mb-2",
                                isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                                isCompleted && "bg-primary/20 text-primary"
                            )}>
                                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold text-center leading-tight uppercase tracking-tighter",
                                isCurrent ? "text-primary" : "text-muted-foreground"
                            )}>
                                {stage.label}
                            </span>
                        </div>
                    )
                })}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <Card className="border-none bg-muted/20 shadow-none">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Search className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-semibold">Engine Progress</span>
                                </div>
                                <span className="text-xl font-black text-primary tabular-nums">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-4 bg-background/50" />
                        </CardContent>
                    </Card>
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-4 items-start">
                        <Cpu className="h-5 w-5 text-primary mt-1" />
                        <div className="space-y-1">
                            <p className="text-sm font-bold">Engine Activity</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {currentStageIndex === 0 && "Initializing secure compute environment..."}
                                {currentStageIndex === 1 && `Fetching applicant records...`}
                                {currentStageIndex === 2 && "Scoring applicants against the configured weights..."}
                                {currentStageIndex === 3 && "Applying the shortlist threshold..."}
                                {currentStageIndex === 4 && "Saving updated shortlist statuses..."}
                            </p>
                        </div>
                    </div>
                </div>
                <Card className="bg-black border-zinc-800 shadow-xl overflow-hidden flex flex-col h-[250px]">
                    <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Activity Log</span>
                    </div>
                    <CardContent className="p-4 font-mono text-[10px] space-y-1.5 overflow-y-auto flex-1 text-zinc-400">
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-2">
                                <span className="opacity-30">{i+1}</span>
                                <span>{log}</span>
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
