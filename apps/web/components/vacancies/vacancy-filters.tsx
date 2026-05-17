'use client'

import { useQueryState } from 'nuqs'
import { SearchIcon, FilterIcon, X, Building2, Layers, Clock, RotateCcw, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useDepartments } from '@/hooks/use-departments'
import { useJobGroups } from '@/hooks/use-job-groups'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export function VacancyFilters() {
    const [search, setSearch] = useQueryState('search', { defaultValue: '', shallow: false })
    const [status, setStatus] = useQueryState('status', { shallow: false })
    const [departmentId, setDepartmentId] = useQueryState('departmentId', { shallow: false })
    const [jobGroupId, setJobGroupId] = useQueryState('jobGroupId', { shallow: false })

    const { data: departmentsData } = useDepartments()
    const { data: jobGroupsData } = useJobGroups()

    const departments = departmentsData?.data || []
    const jobGroups = jobGroupsData?.data || []

    const activeFilterCount = [departmentId, jobGroupId].filter(Boolean).length
    const hasAnyFilters = activeFilterCount > 0 || (search !== '' && search !== null) || (status !== null && status !== 'open')

    const clearFilters = () => {
        setSearch('')
        setStatus('open')
        setDepartmentId(null)
        setJobGroupId(null)
    }

    const statusOptions = [
        { label: 'Open', value: 'open', icon: CheckCircle2 },
        { label: 'Closed', value: 'closed', icon: X },
        { label: 'All', value: 'all', icon: Clock },
    ]

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1 group">
                    <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by job title or keyword..."
                        className="pl-10 h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 focus-visible:ring-primary/20 transition-all shadow-sm"
                        value={search || ''}
                        onChange={(e) => setSearch(e.target.value || null)}
                    />
                </div>
                
                <div className="flex gap-3">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 gap-2 px-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                                <FilterIcon className="h-4 w-4 text-slate-500" />
                                <span className="text-sm font-semibold">Filters</span>
                                {activeFilterCount > 0 && (
                                    <Badge className="ml-1 h-5 min-w-5 p-0 flex items-center justify-center rounded-full text-[10px] bg-primary">
                                        {activeFilterCount}
                                    </Badge>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-md border-l-slate-200 dark:border-l-slate-800 p-0 flex flex-col">
                            <SheetHeader className="p-6 border-b border-slate-100 dark:border-slate-800 text-left">
                                <div className="flex items-center justify-between pr-8">
                                    <SheetTitle className="text-2xl font-bold tracking-tight">Filter Vacancies</SheetTitle>
                                    {hasAnyFilters && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={clearFilters}
                                            className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10 text-xs font-bold uppercase tracking-wider"
                                        >
                                            Reset All
                                        </Button>
                                    )}
                                </div>
                                <SheetDescription className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                    Refine job listings to find your perfect match.
                                </SheetDescription>
                            </SheetHeader>
                            
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* Status Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        <Label className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Vacancy Status</Label>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {statusOptions.map((opt) => {
                                            const isSelected = (status || 'all') === opt.value
                                            return (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => setStatus(opt.value)}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all duration-200",
                                                        isSelected 
                                                            ? "bg-primary/5 border-primary text-primary shadow-sm shadow-primary/10" 
                                                            : "bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700"
                                                    )}
                                                >
                                                    <opt.icon className={cn("h-4 w-4", isSelected ? "text-primary" : "text-slate-400")} />
                                                    <span className="text-xs font-bold">{opt.label}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <Separator className="bg-slate-100 dark:bg-slate-800" />

                                {/* Department Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-slate-400" />
                                        <Label className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Department</Label>
                                    </div>
                                    <Select
                                        value={departmentId || 'all'}
                                        onValueChange={(val) => setDepartmentId(val === 'all' ? null : val)}
                                    >
                                        <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 focus:ring-primary/20 transition-all font-medium">
                                            <SelectValue placeholder="All Departments" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl max-h-[300px]">
                                            <SelectItem value="all" className="font-semibold">All Departments</SelectItem>
                                            <Separator className="my-1" />
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={String(dept.id)}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Job Group Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Layers className="h-4 w-4 text-slate-400" />
                                        <Label className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Job Group</Label>
                                    </div>
                                    <Select
                                        value={jobGroupId || 'all'}
                                        onValueChange={(val) => setJobGroupId(val === 'all' ? null : val)}
                                    >
                                        <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 focus:ring-primary/20 transition-all font-medium">
                                            <SelectValue placeholder="All Job Groups" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl max-h-[300px]">
                                            <SelectItem value="all" className="font-semibold">All Job Groups</SelectItem>
                                            <Separator className="my-1" />
                                            {jobGroups.map((jg) => (
                                                <SelectItem key={jg.id} value={String(jg.id)}>
                                                    {jg.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex gap-3 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-13 rounded-2xl font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                                    onClick={clearFilters}
                                >
                                    <RotateCcw className="h-4 w-4 mr-2 text-slate-500" />
                                    Reset
                                </Button>
                                <Button
                                    className="flex-[2] h-13 rounded-2xl font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all"
                                    onClick={() => {
                                        const closeButton = document.querySelector('[data-radix-collection-item]') as HTMLElement;
                                        if (closeButton) closeButton.click();
                                    }}
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </div>
    )
}
