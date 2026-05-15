'use client'

import { Briefcase, ChevronRight, MapPin, Sparkles } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

interface OngoingActivityProps {
    activity: {
        id: string
        status: string
        progress: number
        nextStep: string
        vacancy: {
            title: string
            refNumber: string
            department: {
                name: string | null
            } | null
        }
    } | null
}

export function OngoingActivity({ activity }: OngoingActivityProps) {
    if (!activity) {
        return (
            <Card className="border border-dashed bg-slate-50/30 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm">
                <CardContent className="p-8 text-center flex flex-col items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Sparkles className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-slate-900 dark:text-slate-100 font-medium text-sm">
                        No active progress to track
                    </p>
                    <p className="text-slate-400 text-xs mt-2 max-w-[200px] mx-auto">
                        Submit an application to see live updates here.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden py-0 w-[320px] shrink-0">
            <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1 min-w-0 mr-4">
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 hover:bg-primary/10 transition-colors">
                            {activity.status}
                        </Badge>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate leading-snug">
                            {activity.vacancy.title}
                        </h3>
                        <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {activity.vacancy.department?.name || 'Department'}
                            </span>
                        </div>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-5 w-5 text-slate-400" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end text-xs">
                        <div className="space-y-1.5">
                            <p className="uppercase font-medium tracking-wider text-slate-400">Current Phase</p>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                                <span className="font-semibold text-slate-700 dark:text-slate-200">{activity.nextStep}</span>
                            </div>
                        </div>
                        <span className="font-bold text-primary text-sm">{activity.progress}%</span>
                    </div>
                    <Progress value={activity.progress} className="h-2 bg-slate-100 dark:bg-slate-800" />
                </div>

                <Button variant="outline" size="sm" className="w-full border-slate-200 dark:border-slate-800 text-sm font-medium h-10 gap-2 rounded-xl transition-all" asChild>
                    <Link href={`/dashboard/applications/${activity.id.replace('app_', '')}`}>
                        Track Progress <ChevronRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}
