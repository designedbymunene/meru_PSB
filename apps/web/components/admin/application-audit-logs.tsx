'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, AlertCircle, Info } from "lucide-react"
import { format } from "date-fns"

interface ApplicationAuditLogsProps {
    logs: any[]
}

export function ApplicationAuditLogs({ logs }: ApplicationAuditLogsProps) {
    if (!logs || logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-3xl">
                <Info className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500 font-medium">No audit logs available for this application.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {logs.map((log, index) => {
                const adminName = log.admin?.fullName || "System"
                const status = log.newState?.status || "unknown"
                const notes = log.newState?.notes || log.previousState?.notes
                const timestamp = log.createdAt || log.timestamp

                return (
                    <div 
                        key={log.id} 
                        className="relative pl-8 pb-4 last:pb-0"
                    >
                        {/* Timeline Line */}
                        {index !== logs.length - 1 && (
                            <div className="absolute left-[11px] top-6 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
                        )}
                        
                        {/* Timeline Dot */}
                        <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full bg-white dark:bg-slate-900 border-2 border-primary flex items-center justify-center z-10">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 transition-all hover:border-primary/20">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        {adminName}
                                    </span>
                                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter py-0">
                                        {log.action.replace(/_/g, ' ')}
                                    </Badge>
                                </div>
                                <time className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {format(new Date(timestamp), "PPp")}
                                </time>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs text-slate-500">Status:</span>
                                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase">
                                    {status}
                                </Badge>
                            </div>

                            {notes && (
                                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed">
                                    "{notes}"
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
