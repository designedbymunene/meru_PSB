'use client'

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Filter, X } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useDepartments } from "@/hooks/use-departments"
import { useVacancies } from "@/hooks/use-vacancies"
import { ReportFilters as Filters } from "@meru/shared"

interface ReportFiltersProps {
    filters: Filters
    onFiltersChange: (filters: Filters) => void
}

export function ReportFilters({ filters, onFiltersChange }: ReportFiltersProps) {
    const { data: departments } = useDepartments()
    const { data: vacancies } = useVacancies()

    const [date, setDate] = React.useState<DateRange | undefined>({
        from: filters.startDate ? new Date(filters.startDate) : undefined,
        to: filters.endDate ? new Date(filters.endDate) : undefined,
    })

    const handleDateChange = (newDate: DateRange | undefined) => {
        setDate(newDate)
        if (newDate?.from && newDate?.to) {
            onFiltersChange({
                ...filters,
                startDate: newDate.from.toISOString(),
                endDate: newDate.to.toISOString(),
            })
        } else if (!newDate) {
            onFiltersChange({
                ...filters,
                startDate: undefined,
                endDate: undefined,
            })
        }
    }

    const clearFilters = () => {
        setDate(undefined)
        onFiltersChange({})
    }

    const hasFilters = !!(filters.departmentId || filters.vacancyId || filters.startDate || filters.endDate)

    return (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
                <Filter className="h-4 w-4" />
                Filters
            </div>

            {/* Department Filter */}
            <Select
                value={filters.departmentId?.toString() || "all"}
                onValueChange={(val) => onFiltersChange({ ...filters, departmentId: val === "all" ? undefined : parseInt(val) })}
            >
                <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments?.data?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Vacancy Filter */}
            <Select
                value={filters.vacancyId?.toString() || "all"}
                onValueChange={(val) => onFiltersChange({ ...filters, vacancyId: val === "all" ? undefined : parseInt(val) })}
            >
                <SelectTrigger className="w-[200px] bg-background">
                    <SelectValue placeholder="All Vacancies" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Vacancies</SelectItem>
                    {vacancies?.data?.map((vacancy) => (
                        <SelectItem key={vacancy.id} value={vacancy.id.toString()}>
                            {vacancy.title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Date Range Picker */}
            <div className={cn("grid gap-2")}>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-[260px] justify-start text-left font-normal bg-background",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "LLL dd, y")} -{" "}
                                        {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={handleDateChange}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2 h-9 px-3 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                    Clear
                </Button>
            )}
        </div>
    )
}
