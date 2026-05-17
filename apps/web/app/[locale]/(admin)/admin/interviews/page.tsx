"use client"

import { RequireAuth } from "@/components/auth/require-auth"
import { useState } from "react"
import { useInterviewResults } from "@/hooks/use-interviews"
import { useVacancies } from "@/hooks/use-vacancies"
import { DataTable } from "@/components/admin/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { 
    Calendar, 
    MapPin, 
    Users, 
    Video, 
    CheckCircle, 
    Search, 
    ArrowLeft,
    TrendingUp,
    Clock,
    UserCheck,
    Check,
    ChevronsUpDown
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function InterviewsPage() {
    const [selectedVacancyId, setSelectedVacancyId] = useState<number | null>(null)
    const [open, setOpen] = useState(false)
    const { data: vacancies } = useVacancies()
    const { data: results, isLoading } = useInterviewResults(selectedVacancyId || 0)

    const selectedVacancy = vacancies?.data?.find(v => v.id === selectedVacancyId)
    const interviews = results?.data?.interviews || []

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "applicantName",
            header: "Applicant",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white">{row.original.applicantName}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                        App ID: #{row.original.applicationId}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "scheduledAt",
            header: "Scheduled",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {format(new Date(row.original.scheduledAt), "MMM dd, yyyy")}
                    </div>
                    <div className="text-xs text-muted-foreground pl-5">
                        {format(new Date(row.original.scheduledAt), "p")}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "venue",
            header: "Location",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-sm">
                    <div className={cn(
                        "p-1.5 rounded-md",
                        row.original.venue.includes('http') ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "bg-slate-50 text-slate-600 dark:bg-slate-800"
                    )}>
                        {row.original.venue.includes('http') ? (
                            <Video className="h-3.5 w-3.5" />
                        ) : (
                            <MapPin className="h-3.5 w-3.5" />
                        )}
                    </div>
                    <span className="truncate max-w-[180px] font-medium">{row.original.venue}</span>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status
                return (
                    <Badge className={cn(
                        "capitalize px-2.5 py-0.5 rounded-full border-none",
                        status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    )}>
                        {status}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "averageScore",
            header: "Avg Score",
            cell: ({ row }) => {
                const score = row.original.averageScore
                const isCompleted = row.original.status === 'completed'
                
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-0.5">
                                <span className={cn(
                                    "font-bold text-lg",
                                    isCompleted ? (score >= 70 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600") : "text-slate-400"
                                )}>
                                    {score.toFixed(1)}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-bold">/100</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                <Users className="h-3 w-3" />
                                <span>{row.original.scoresSubmitted}/{row.original.totalPanelMembers} Panelists</span>
                            </div>
                        </div>
                    </div>
                )
            },
        },
    ]

    return (
        <RequireAuth allowedRoles={['admin']}>
            <div className="w-full py-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                            Interview Management
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl">
                            Monitor interview progress, review average scores, and manage panel assessments across all vacancies.
                        </p>
                    </div>

                    <div className="flex flex-col gap-1.5 w-full md:w-[450px] shrink-0">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                            Filter by Vacancy
                        </label>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full h-14 justify-between rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left font-normal px-4"
                                >
                                    {selectedVacancy ? (
                                        <div className="flex flex-col items-start overflow-hidden">
                                            <span className="font-bold text-slate-900 dark:text-white truncate w-full">
                                                {selectedVacancy.title}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                                {selectedVacancy.advertisementNumber || `ID: #${selectedVacancy.id}`}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400">Choose a vacancy to view results...</span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full md:w-[450px] p-0 rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl" align="end">
                                <Command className="rounded-2xl">
                                    <CommandInput placeholder="Search vacancies by title or number..." className="h-12" />
                                    <CommandList className="max-h-[400px]">
                                        <CommandEmpty>No vacancy found.</CommandEmpty>
                                        <CommandGroup heading="Available Vacancies">
                                            {vacancies?.data?.map((vacancy) => (
                                                <CommandItem
                                                    key={vacancy.id}
                                                    value={`${vacancy.title} ${vacancy.advertisementNumber || ""}`}
                                                    onSelect={() => {
                                                        setSelectedVacancyId(vacancy.id)
                                                        setOpen(false)
                                                    }}
                                                    className="flex items-center justify-between p-3 cursor-pointer"
                                                >
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-bold">{vacancy.title}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                                                {vacancy.advertisementNumber || `ID: #${vacancy.id}`}
                                                            </span>
                                                            <Badge variant="outline" className={cn(
                                                                "text-[9px] px-1 py-0 h-4 border-none capitalize",
                                                                vacancy.status === 'open' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                                            )}>
                                                                {vacancy.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <Check
                                                        className={cn(
                                                            "ml-auto h-4 w-4 text-primary",
                                                            selectedVacancyId === vacancy.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <p className="text-[10px] text-slate-400 font-medium ml-1">
                            Search and select a vacancy to monitor candidate performance and interview status.
                        </p>
                    </div>
                </div>

                {selectedVacancy && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard 
                            title="Total Interviews" 
                            value={interviews.length} 
                            icon={Users}
                            description="Scheduled for this vacancy"
                        />
                        <StatCard 
                            title="Completed" 
                            value={interviews.filter(i => i.status === 'completed').length} 
                            icon={CheckCircle}
                            variant="success"
                            description="Interviews fully assessed"
                        />
                        <StatCard 
                            title="Pending" 
                            value={interviews.filter(i => i.status === 'scheduled').length} 
                            icon={Clock}
                            variant="warning"
                            description="Waiting for assessment"
                        />
                        <StatCard 
                            title="Avg Score" 
                            value={interviews.length > 0
                                ? (interviews.reduce((sum, i) => sum + i.averageScore, 0) / interviews.length).toFixed(1)
                                : '0.0'} 
                            icon={TrendingUp}
                            description="Mean across all candidates"
                        />
                    </div>
                )}

                <Card className="border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 p-6">
                        <CardTitle className="text-xl font-bold">Candidates Results</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : selectedVacancyId ? (
                            <DataTable 
                                columns={columns} 
                                data={interviews} 
                                searchKey="applicantName"
                                searchPlaceholder="Search by applicant name..."
                            />
                        ) : (
                            <div className="text-center py-20">
                                <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
                                    <Search className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Vacancy Selected</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                                    Please select a vacancy from the dropdown above to view its interview results and candidate scores.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </RequireAuth>
    )
}

function StatCard({ title, value, icon: Icon, description, variant = "default" }: any) {
    return (
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                        "p-3 rounded-2xl transition-colors",
                        variant === "success" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" :
                        variant === "warning" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20" :
                        "bg-primary/5 text-primary"
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {value}
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
                </div>
            </CardContent>
        </Card>
    )
}

