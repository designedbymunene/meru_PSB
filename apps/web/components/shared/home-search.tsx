'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function HomeSearch() {
    const router = useRouter()
    const [search, setSearch] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (search.trim()) {
            params.set('search', search.trim())
        }
        router.push(`/vacancies?${params.toString()}`)
    }

    return (
        <form onSubmit={handleSubmit} className="flex w-full max-w-2xl gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search jobs by title, keyword, or department..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-12 pl-10 pr-4 text-base text-foreground bg-white border-0 shadow-lg"
                />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8 shadow-lg">
                Search Jobs
            </Button>
        </form>
    )
}
