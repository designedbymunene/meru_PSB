'use client'

import { useQueryState } from 'nuqs'
import { SearchIcon, FilterIcon } from 'lucide-react'
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

export function VacancyFilters() {
    const [search, setSearch] = useQueryState('search', { defaultValue: '' })
    const [status, setStatus] = useQueryState('status', { defaultValue: 'open' })
    const [departmentId, setDepartmentId] = useQueryState('departmentId', { defaultValue: '' })
    const [jobGroupId, setJobGroupId] = useQueryState('jobGroupId', { defaultValue: '' })

    const { data: departmentsData } = useDepartments()
    const { data: jobGroupsData } = useJobGroups()

    const departments = departmentsData?.data || []
    const jobGroups = jobGroupsData?.data || []

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search vacancies..."
                    className="pl-9"
                    value={search || ''}
                    onChange={(e) => setSearch(e.target.value || null)}
                />
            </div>
            <div className="flex gap-2">
                <Select
                    value={status || 'all'}
                    onValueChange={(val) => setStatus(val === 'all' ? null : val)}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="all">All Status</SelectItem>
                    </SelectContent>
                </Select>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="relative">
                            <FilterIcon className="h-4 w-4" />
                            {(departmentId || jobGroupId) && (
                                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Advanced Filters</SheetTitle>
                            <SheetDescription>
                                Narrow down job opportunities by department or job group.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6 space-y-6">
                            <div className="space-y-2">
                                <Label>Department</Label>
                                <Select
                                    value={departmentId || 'all'}
                                    onValueChange={(val) => setDepartmentId(val === 'all' ? null : val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Departments" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Departments</SelectItem>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={String(dept.id)}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Job Group</Label>
                                <Select
                                    value={jobGroupId || 'all'}
                                    onValueChange={(val) => setJobGroupId(val === 'all' ? null : val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Job Groups" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Job Groups</SelectItem>
                                        {jobGroups.map((jg) => (
                                            <SelectItem key={jg.id} value={String(jg.id)}>
                                                {jg.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    setDepartmentId(null)
                                    setJobGroupId(null)
                                    setStatus('open')
                                    setSearch(null)
                                }}
                            >
                                Reset All Filters
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    )
}
