'use client'

import { Clock, MapPin, Briefcase, ArrowRight, Sparkles, Building2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { format } from 'date-fns'

interface RecommendedVacancy {
    id: string
    title: string
    description: string
    status: string
    badge: string
    jobGroup: {
        code: string | null
    }
    department: {
        name: string | null
    } | null
    vacancyCount: number
    deadline: string
}

interface RecommendedVacanciesProps {
    vacancies: RecommendedVacancy[]
}

export function RecommendedVacancies({ vacancies }: RecommendedVacanciesProps) {
    if (!vacancies || vacancies.length === 0) {
        return null
    }

    // Limit to 3 items for a clean row
    const displayVacancies = vacancies.slice(0, 3)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                        <Sparkles className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Recommended for You</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-primary font-medium text-base h-auto p-0 hover:no-underline" asChild>
                    <Link href="/vacancies" className="flex items-center gap-1">
                        View all vacancies <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayVacancies.map((vacancy) => {
                    const cleanId = vacancy.id.replace('vac_', '')
                    let parsedDeadline = new Date()
                    try {
                        parsedDeadline = new Date(vacancy.deadline)
                    } catch (e) {
                        // ignore
                    }

                    return (
                        <Card 
                            key={vacancy.id} 
                            className="group flex flex-col justify-between border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                        >
                            <CardContent className="p-6 flex flex-col h-full justify-between gap-5">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <Badge 
                                            variant="secondary" 
                                            className="bg-primary/5 text-primary dark:bg-primary/10 border-none text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5"
                                        >
                                            {vacancy.jobGroup.code ? `Job Group ${vacancy.jobGroup.code}` : 'Public Service'}
                                        </Badge>
                                        <Badge 
                                            variant="outline" 
                                            className="border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/10 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5"
                                        >
                                            {vacancy.badge}
                                        </Badge>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                                        {vacancy.title}
                                    </h3>

                                    <div className="space-y-2 text-slate-500 dark:text-slate-400 text-xs font-medium pt-1">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                            <span className="truncate">{vacancy.department?.name || 'County Department'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                            <span>
                                                {vacancy.vacancyCount} {vacancy.vacancyCount === 1 ? 'position' : 'positions'} open
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
                                            <Clock className="h-3.5 w-3.5 shrink-0" />
                                            <span>Closes {format(parsedDeadline, 'MMM dd, yyyy')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full border-slate-200 dark:border-slate-800 group-hover:border-primary group-hover:bg-primary group-hover:text-white rounded-xl transition-all h-9 text-xs font-semibold"
                                        asChild
                                    >
                                        <Link href={`/vacancies/${cleanId}`}>
                                            View Details
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
