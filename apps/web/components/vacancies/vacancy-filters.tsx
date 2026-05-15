'use client'

import { useQueryState } from 'nuqs'
import { SearchIcon, FilterIcon, X } from 'lucide-react'
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

export function VacancyFilters() {
    const [search, setSearch] = useQueryState('search', { defaultValue: '', shallow: false, throttleMs: 500 })
    const [status, setStatus] = useQueryState('status', { defaultValue: 'open', shallow: false })
    const [departmentId, setDepartmentId] = useQueryState('departmentId', { shallow: false })
    const [jobGroupId, setJobGroupId] = useQueryState('jobGroupId', { shallow: false })

    const { data: departmentsData } = useDepartments()
    const { data: jobGroupsData } = useJobGroups()

    const departments = departmentsData?.data || []
    const jobGroups = jobGroupsData?.data || []

    const activeFilterCount = [departmentId, jobGroupId].filter(Boolean).length
    const hasFilters = activeFilterCount > 0 || search !== '' || status !== 'open'

    const clearFilters = () => {
        setSearch('')
        setStatus('open')
        setDepartmentId(null)
        setJobGroupId(null)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1 group">
                    <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by job title or keyword..."
                        className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 focus-visible:ring-primary/20 transition-all"
                        value={search || ''}
                        onChange={(e) => setSearch(e.target.value || null)}
                    />
                </div>
                
                <div className="flex gap-3">
                    <Select
                        value={status || 'open'}
                        onValueChange={(val) => setStatus(val === 'all' ? null : val)}
                    >
                        <SelectTrigger className="w-[140px] h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="open">Open Positions</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="all">All Status</SelectItem>
                        </SelectContent>
                    </Select>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 gap-2 px-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                <FilterIcon className="h-4 w-4 text-slate-500" />
                                <span className="text-sm font-medium">Filters</span>
                                {activeFilterCount > 0 && (
                                    <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                        {activeFilterCount}
                                    </Badge>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-md border-l-slate-200 dark:border-l-slate-800">
                            <SheetHeader className="pb-6 border-b border-slate-100 dark:border-slate-800">
                                <SheetTitle className="text-xl font-semibold">Filter Vacancies</SheetTitle>
                                <SheetDescription className="text-sm">
                                    Refine job listings by department, job group, and more.
                                </SheetDescription>
                            </SheetHeader>
                            
                            <div className="py-8 space-y-8">
                                <div className="space-y-3">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Department</Label>
                                    <Select
                                        value={departmentId || 'all'}
                                        onValueChange={(val) => setDepartmentId(val === 'all' ? null : val)}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-800">
                                            <SelectValue placeholder="All Departments" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl max-h-[300px]">
                                            <SelectItem value="all">All Departments</SelectItem>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={String(dept.id)}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Job Group</Label>
                                    <Select
                                        value={jobGroupId || 'all'}
                                        onValueChange={(val) => setJobGroupId(val === 'all' ? null : val)}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-800">
                                            <SelectValue placeholder="All Job Groups" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl max-h-[300px]">
                                            <SelectItem value="all">All Job Groups</SelectItem>
                                            {jobGroups.map((jg) => (
                                                <SelectItem key={jg.id} value={String(jg.id)}>
                                                    {jg.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl font-medium"
                                    onClick={clearFilters}
                                >
                                    Reset
                                </Button>
                                <Button
                                    className="flex-[2] h-12 rounded-xl font-medium"
                                    onClick={() => {
                                        // The filters are already applied to query state
                                        // We just close the sheet
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

            {hasFilters && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mr-2">Active:</span>
                    {search && (
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none px-2 py-1 rounded-lg flex items-center gap-1.5 font-medium">
                            Search: {search}
                            <X className="h-3 w-3 cursor-pointer hover:text-primary transition-colors" onClick={() => setSearch('')} />
                        </Badge>
                    )}
                    {status !== 'open' && (
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none px-2 py-1 rounded-lg flex items-center gap-1.5 font-medium">
                            Status: {status}
                            <X className="h-3 w-3 cursor-pointer hover:text-primary transition-colors" onClick={() => setStatus('open')} />
                        </Badge>
                    )}
                    {departmentId && (
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none px-2 py-1 rounded-lg flex items-center gap-1.5 font-medium">
                            Dept: {departments.find(d => String(d.id) === departmentId)?.name || departmentId}
                            <X className="h-3 w-3 cursor-pointer hover:text-primary transition-colors" onClick={() => setDepartmentId(null)} />
                        </Badge>
                    )}
                    {jobGroupId && (
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none px-2 py-1 rounded-lg flex items-center gap-1.5 font-medium">
                            Group: {jobGroups.find(j => String(j.id) === jobGroupId)?.name || jobGroupId}
                            <X className="h-3 w-3 cursor-pointer hover:text-primary transition-colors" onClick={() => setJobGroupId(null)} />
                        </Badge>
                    )}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[10px] font-bold uppercase tracking-widest h-7 px-2 text-slate-400 hover:text-primary hover:bg-transparent"
                        onClick={clearFilters}
                    >
                        Clear All
                    </Button>
                </div>
            )}
        </div>
    )
}
