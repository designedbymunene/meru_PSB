"use client"

import { useMyInterviews } from "@/hooks/use-interviews"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { format, isAfter, isBefore, startOfDay } from "date-fns"
import { 
    Calendar, 
    MapPin, 
    Users, 
    Video, 
    FileText, 
    Search, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    ChevronRight,
    ExternalLink
} from "lucide-react"
import { SubmitScoreDialog } from "./submit-score-dialog"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

export function MyInterviewsList() {
    const { data: interviews, isLoading } = useMyInterviews()
    const [selectedInterview, setSelectedInterview] = useState<any | null>(null)
    const [showScoreDialog, setShowScoreDialog] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("upcoming")

    const filteredInterviews = useMemo(() => {
        if (!interviews?.data) return []

        return interviews.data.filter((interview) => {
            const matchesSearch = 
                interview.application?.applicant?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                interview.vacancy?.title?.toLowerCase().includes(searchQuery.toLowerCase())
            
            if (!matchesSearch) return false

            const interviewDate = new Date(interview.scheduledAt)
            const today = startOfDay(new Date())

            if (activeTab === "upcoming") {
                return (interview.status === "scheduled" || interview.status === "rescheduled") && 
                       (isAfter(interviewDate, today) || interviewDate.toDateString() === today.toDateString())
            }
            if (activeTab === "completed") {
                return interview.status === "completed"
            }
            if (activeTab === "all") {
                return true
            }
            return true
        })
    }, [interviews, searchQuery, activeTab])

    if (isLoading) {
        return <InterviewListSkeleton />
    }

    const counts = {
        upcoming: interviews?.data?.filter(i => (i.status === "scheduled" || i.status === "rescheduled") && (isAfter(new Date(i.scheduledAt), startOfDay(new Date())) || new Date(i.scheduledAt).toDateString() === new Date().toDateString())).length || 0,
        completed: interviews?.data?.filter(i => i.status === "completed").length || 0,
        all: interviews?.data?.length || 0
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <Tabs defaultValue="upcoming" className="w-full sm:w-auto" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                        <TabsTrigger value="upcoming" className="relative">
                            Upcoming
                            {counts.upcoming > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full">
                                    {counts.upcoming}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                        <TabsTrigger value="all">All</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search applicants..." 
                        className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {filteredInterviews.length === 0 ? (
                <EmptyState 
                    tab={activeTab} 
                    hasSearch={searchQuery.length > 0} 
                    onClearSearch={() => setSearchQuery("")} 
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                    {filteredInterviews.map((interview) => (
                        <InterviewCard 
                            key={interview.id} 
                            interview={interview} 
                            onAction={() => {
                                setSelectedInterview(interview)
                                setShowScoreDialog(true)
                            }}
                        />
                    ))}
                </div>
            )}

            <SubmitScoreDialog
                interview={selectedInterview}
                open={showScoreDialog}
                onOpenChange={setShowScoreDialog}
            />
        </div>
    )
}

function InterviewCard({ interview, onAction }: { interview: any, onAction: () => void }) {
    const isCompleted = interview.status === 'completed'
    const isCancelled = interview.status === 'cancelled'
    const date = new Date(interview.scheduledAt)
    const isToday = startOfDay(date).getTime() === startOfDay(new Date()).getTime()

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all hover:shadow-md border-slate-200 dark:border-slate-800",
            isToday && !isCompleted && "border-l-4 border-l-primary"
        )}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                                {interview.application?.applicant?.fullName || "Unknown Applicant"}
                            </CardTitle>
                            {isToday && !isCompleted && (
                                <Badge variant="default" className="bg-orange-500 hover:bg-orange-600 animate-pulse">
                                    Today
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {interview.vacancy?.title || "Unknown Vacancy"}
                        </p>
                    </div>
                    <Badge className={cn(
                        "capitalize",
                        isCompleted ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        isCancelled ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    )}>
                        {interview.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                            <Calendar className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Date</p>
                            <p className="font-semibold">{format(date, "MMM dd, yyyy")}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                            <Clock className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Time</p>
                            <p className="font-semibold">{format(date, "p")}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                            {interview.venue.includes('http') ? (
                                <Video className="h-4 w-4 text-blue-500" />
                            ) : (
                                <MapPin className="h-4 w-4 text-slate-500" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Location</p>
                            <p className="font-semibold truncate pr-2">{interview.venue}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                            <Users className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Panel</p>
                            <p className="font-semibold">{interview.panelMemberDetails?.length || 0} Members</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button 
                        className={cn(
                            "flex-1 gap-2 rounded-xl h-11",
                            isCompleted ? "bg-emerald-600 hover:bg-emerald-700" : "bg-primary"
                        )}
                        onClick={onAction}
                        disabled={isCancelled}
                    >
                        {isCompleted ? (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                Update Assessment
                            </>
                        ) : (
                            <>
                                <FileText className="h-4 w-4" />
                                Submit Assessment
                            </>
                        )}
                    </Button>
                    
                    {interview.virtualLink && !isCompleted && !isCancelled && (
                        <Button 
                            variant="outline" 
                            className="rounded-xl h-11 border-blue-200 dark:border-blue-900 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            asChild
                        >
                            <a href={interview.virtualLink} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Join Call
                            </a>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function EmptyState({ tab, hasSearch, onClearSearch }: { tab: string, hasSearch: boolean, onClearSearch: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed rounded-3xl bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800">
            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                {hasSearch ? (
                    <Search className="h-10 w-10 text-slate-400" />
                ) : tab === 'upcoming' ? (
                    <Clock className="h-10 w-10 text-slate-400" />
                ) : (
                    <CheckCircle2 className="h-10 w-10 text-slate-400" />
                )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {hasSearch ? "No results found" : 
                 tab === 'upcoming' ? "No upcoming interviews" : 
                 tab === 'completed' ? "No completed interviews yet" : 
                 "No interviews found"}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-6">
                {hasSearch 
                    ? "We couldn't find any interviews matching your search criteria." 
                    : tab === 'upcoming' 
                        ? "You don't have any interviews scheduled for today or in the future."
                        : "Interviews you have already assessed will appear here."}
            </p>
            {hasSearch && (
                <Button variant="outline" onClick={onClearSearch}>
                    Clear Search
                </Button>
            )}
        </div>
    )
}

function InterviewListSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <Skeleton className="h-10 w-full sm:w-[300px] rounded-lg" />
                <Skeleton className="h-10 w-full sm:w-[250px] rounded-lg" />
            </div>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <Skeleton className="h-6 w-20" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                            <div className="mt-6 flex gap-3">
                                <Skeleton className="h-11 flex-1" />
                                <Skeleton className="h-11 w-24" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
