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

// import { useJobGroups } from '@/hooks/use-job-groups' // To be implemented

export function VacancyFilters() {
    const [search, setSearch] = useQueryState('search', { defaultValue: '' })
    const [status, setStatus] = useQueryState('status', { defaultValue: 'open' })
    const [departmentId, setDepartmentId] = useQueryState('departmentId', { defaultValue: '' })

    // Placeholder hooks until implemented

    // const { data: jobGroups } = useJobGroups()

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search vacancies..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value || null)}
                />
            </div>
            <div className="flex gap-2">
                <Select
                    value={status}
                    onValueChange={(val) => setStatus(val === 'all' ? null : val)}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                </Select>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <FilterIcon className="h-4 w-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Filters</SheetTitle>
                            <SheetDescription>
                                Narrow down job opportunities
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6 space-y-6">

                            <div className="space-y-2">
                                <Label>Job Group</Label>
                                <Select disabled>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Job Group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* To be populated */}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    setDepartmentId(null)
                                    setStatus('open')
                                    setSearch(null)
                                }}
                            >
                                Reset Filters
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    )
}
