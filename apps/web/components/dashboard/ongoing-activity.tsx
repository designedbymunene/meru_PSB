'use client'

import { Briefcase, ChevronRight } from 'lucide-react'
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
            <Card className="border border-dashed bg-slate-50/50 dark:bg-slate-900/50">
                <CardContent className="p-8 text-center">
                    <p className="text-slate-900 dark:text-slate-100 font-bold text-sm">
                        No ongoing application activity yet
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
                        When you submit an application, progress updates will appear here.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-slate-900 dark:bg-slate-950 text-white border-none shadow-xl overflow-hidden relative">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 min-w-0 mr-4">
                        <Badge variant="secondary" className="bg-white/10 text-white border-none text-[9px] font-black uppercase tracking-wider mb-2 hover:bg-white/20">
                            {activity.status}
                        </Badge>
                        <h3 className="text-lg font-bold truncate leading-tight">{activity.vacancy.title}</h3>
                        <p className="text-white/50 text-xs mt-1 truncate">
                            {activity.vacancy.department?.name || 'Department'} • {activity.vacancy.refNumber}
                        </p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-6 w-6 text-white" />
                    </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                            <span className="text-sm font-semibold text-white/90">{activity.nextStep}</span>
                        </div>
                        <span className="text-sm font-bold">{activity.progress}%</span>
                    </div>
                    <Progress value={activity.progress} className="h-2 bg-white/10" />
                </div>

                <div className="mt-6 flex justify-center">
                    <Button variant="link" className="text-white/70 hover:text-white text-xs font-bold gap-2 p-0 h-auto" asChild>
                        <Link href={`/dashboard/applications/${activity.id.replace('app_', '')}`}>
                            Track Application <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
