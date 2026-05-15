'use client'

import { useQueryState } from 'nuqs'
import { SearchIcon, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export function ApplicationFilters() {
    const [search, setSearch] = useQueryState('search', { defaultValue: '', shallow: false, throttleMs: 500 })
    const [status, setStatus] = useQueryState('status', { defaultValue: 'all', shallow: false })

    const hasFilters = search !== '' || (status !== 'all' && status !== null)

    const clearFilters = () => {
        setSearch('')
        setStatus('all')
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1 group">
                    <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search applications..."
                        className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 focus-visible:ring-primary/20 transition-all"
                        value={search || ''}
                        onChange={(e) => setSearch(e.target.value || null)}
                    />
                </div>
                
                <div className="flex gap-3">
                    <Select
                        value={status || 'all'}
                        onValueChange={(val) => setStatus(val === 'all' ? null : val)}
                    >
                        <SelectTrigger className="w-[180px] h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">All Applications</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {hasFilters && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mr-2">Active:</span>
                    {search && (
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none px-2 py-1 rounded-lg flex items-center gap-1.5 font-medium text-xs">
                            Search: {search}
                            <X className="h-3 w-3 cursor-pointer hover:text-primary transition-colors" onClick={() => setSearch('')} />
                        </Badge>
                    )}
                    {status && status !== 'all' && (
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none px-2 py-1 rounded-lg flex items-center gap-1.5 font-medium text-xs">
                            Status: {status}
                            <X className="h-3 w-3 cursor-pointer hover:text-primary transition-colors" onClick={() => setStatus('all')} />
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
