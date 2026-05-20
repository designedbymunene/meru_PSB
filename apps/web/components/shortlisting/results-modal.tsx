"use client"

import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, Users, TrendingUp, X, Eye, ArrowRight, FileSpreadsheet, FileText, Calendar, Info } from "lucide-react"
import { formatNumber } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface ShortlistResults {
    processed: number
    shortlisted: number
}

interface ShortlistResultsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    results: ShortlistResults | null
    vacancyId: number
}

export function ShortlistResultsModal({
    open,
    onOpenChange,
    results,
    vacancyId,
}: ShortlistResultsModalProps) {
    const router = useRouter()

    if (!results) return null

    const rejectedCount = results.processed - results.shortlisted
    const successRate = results.processed > 0 ? (results.shortlisted / results.processed) * 100 : 0

    const handleViewShortlisted = () => {
        onOpenChange(false)
        router.push(`/admin/applications?vacancyId=${vacancyId}&status=shortlisted`)
    }

    const handleDownloadExcel = () => {
        const csvContent = `Rank,Applicant,Score,Status\n${results.shortlisted} shortlisted applicants\nClick "View Shortlisted" to see full details`
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `shortlist-results-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleDownloadPDF = () => {
        alert("PDF download will be available once the backend endpoint is implemented")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-primary p-8 text-primary-foreground relative">
                    <div className="absolute top-4 right-4">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onOpenChange(false)}
                            className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="space-y-2">
                        <div className="p-3 bg-white/20 rounded-2xl w-fit">
                            <CheckCircle2 className="h-8 w-8 text-white" />
                        </div>
                        <DialogTitle className="text-3xl font-bold tracking-tight">Shortlisting Complete</DialogTitle>
                        <p className="text-primary-foreground/80 text-lg">
                            We've processed {formatNumber(results.processed)} applications successfully.
                        </p>
                    </div>
                </div>

                <div className="p-8 space-y-8 bg-background">
                    {/* Main Stats */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Shortlisted</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-extrabold text-primary tabular-nums">
                                    {formatNumber(results.shortlisted)}
                                </span>
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                                    {successRate.toFixed(1)}%
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-1 border-l pl-6">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Below Threshold</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-muted-foreground/60 tabular-nums">
                                    {formatNumber(rejectedCount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Hub */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Next Steps</h3>
                        <div className="grid gap-3">

                            
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleViewShortlisted}
                                    className="flex-1 h-12 font-semibold"
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Candidates
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleDownloadExcel}
                                    className="flex-1 h-12 font-semibold"
                                >
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Export List
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="p-4 bg-muted/50 rounded-xl flex gap-3 items-start border border-muted">
                        <div className="p-1 bg-background rounded shadow-sm">
                            <Info className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            All shortlisted candidates have been notified via the platform. 
                            You can now proceed to bulk schedule interviews or review individual profiles.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
