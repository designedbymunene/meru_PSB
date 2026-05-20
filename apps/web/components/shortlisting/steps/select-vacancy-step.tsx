"use client"

import { useState } from "react"
import { useVacancies } from "@/hooks/use-vacancies"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
    Users, 
    Calendar, 
    Briefcase, 
    Search, 
    Check, 
    ChevronsUpDown,
    Sparkles,
    FileText
} from "lucide-react"
import { format } from "date-fns"
import { formatNumber } from "@/lib/utils"
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

interface SelectVacancyStepProps {
    selectedVacancyId: number | null
    onVacancySelect: (vacancyId: number) => void
}

export function SelectVacancyStep({
    selectedVacancyId,
    onVacancySelect,
}: SelectVacancyStepProps) {
    const [open, setOpen] = useState(false)
    const { data: vacancies } = useVacancies()
    const selectedVacancy = vacancies?.data?.find(v => v.id === selectedVacancyId)

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Combobox Search */}
            <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search Vacancy
                </label>
                
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between h-14 text-lg font-medium px-4 border-2 hover:border-primary/50 transition-all shadow-sm"
                        >
                            {selectedVacancy ? (
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-primary/10 rounded-md">
                                        <Briefcase className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="truncate">{selectedVacancy.title}</span>
                                </div>
                            ) : (
                                <span className="text-muted-foreground">Select a vacancy to begin...</span>
                            )}
                            <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command className="w-full">
                            <CommandInput placeholder="Search by title or advertisement number..." className="h-12" />
                            <CommandList className="max-h-[300px]">
                                <CommandEmpty>No vacancy found.</CommandEmpty>
                                <CommandGroup heading="Available Vacancies">
                                    {vacancies?.data?.map((vacancy) => (
                                        <CommandItem
                                            key={vacancy.id}
                                            value={`${vacancy.title} ${vacancy.advertisementNumber}`}
                                            onSelect={() => {
                                                onVacancySelect(vacancy.id)
                                                setOpen(false)
                                            }}
                                            className="py-3 px-4 flex flex-col items-start gap-0.5"
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span className="font-bold text-sm">{vacancy.title}</span>
                                                {selectedVacancyId === vacancy.id && (
                                                    <Check className="h-4 w-4 text-primary" />
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground tabular-nums">
                                                {vacancy.advertisementNumber}
                                            </span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Selected Vacancy Display or Improved Empty State */}
            {selectedVacancy ? (
                <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <div className="space-y-0.5">
                            <h3 className="text-xl font-bold tracking-tight">{selectedVacancy.title}</h3>
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5" />
                                {selectedVacancy.advertisementNumber}
                            </p>
                        </div>
                        <Badge variant="secondary" className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-none">
                            {selectedVacancy.status}
                        </Badge>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <Card className="border-none bg-muted/20 shadow-none hover:bg-muted/30 transition-colors">
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    <div className="p-1.5 bg-background rounded-md w-fit shadow-sm">
                                        <Users className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold tabular-nums">
                                            {formatNumber(selectedVacancy.applicationsCount || 0)}
                                        </p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Applications</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-muted/20 shadow-none hover:bg-muted/30 transition-colors">
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    <div className="p-1.5 bg-background rounded-md w-fit shadow-sm">
                                        <Briefcase className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold tabular-nums">
                                            {selectedVacancy.openPositions}
                                        </p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Positions</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-muted/20 shadow-none hover:bg-muted/30 transition-colors">
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    <div className="p-1.5 bg-background rounded-md w-fit shadow-sm">
                                        <Calendar className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold truncate">
                                            {format(new Date(selectedVacancy.closingDate), "MMM d, yyyy")}
                                        </p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Deadline</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="relative group overflow-hidden p-8 flex flex-col items-center justify-center text-center space-y-3 border-2 border-dashed rounded-2xl bg-muted/10 border-muted/50 hover:bg-muted/20 hover:border-primary/20 transition-all duration-700">
                    <div className="p-4 bg-background rounded-full shadow-lg group-hover:scale-110 transition-transform duration-500">
                        <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                        <h3 className="text-lg font-bold tracking-tight">Ready to process applicants?</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                                Search and select an active vacancy from the dropdown above to begin the automated batch shortlisting process.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
