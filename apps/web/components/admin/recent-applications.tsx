"use client"

import { useAllApplications } from "@/hooks/use-applications"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface RecentApplicationsProps {
    className?: string
}

export function RecentApplications({ className }: RecentApplicationsProps) {
    const { data, isLoading, error } = useAllApplications()
    const applications = data?.data || []
    const recentApplications = applications.slice(0, 5)

    if (isLoading) {
        return <RecentApplicationsSkeleton className={className} />
    }

    return (
        <Card className={cn("border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800/60 pb-4">
                <div>
                    <CardTitle className="text-xl">Recent Applications</CardTitle>
                    <CardDescription className="font-medium">Latest submissions from applicants</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-9 rounded-xl font-bold text-xs uppercase tracking-wider text-primary hover:bg-primary/5">
                    <Link href="/admin/applications">
                        View All
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-6">
                    {recentApplications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-full mb-4">
                                <Users className="h-8 w-8 text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-400">No recent applications found</p>
                        </div>
                    ) : (
                        recentApplications.map((app) => (
                            <div key={app.id} className="flex items-center group">
                                <Avatar className="h-11 w-11 border-2 border-white dark:border-slate-950 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">
                                        {app.applicant?.fullName?.substring(0, 2).toUpperCase() || "AP"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="ml-4 flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                                        {app.applicant?.fullName}
                                    </p>
                                    <p className="text-xs font-medium text-slate-500 truncate">
                                        Applied for <span className="text-slate-700 dark:text-slate-300">{app.vacancy?.title}</span>
                                    </p>
                                </div>
                                <div className="ml-4 flex flex-col items-end gap-1.5">
                                    <Badge 
                                        variant="outline"
                                        className={cn(
                                            "text-[10px] font-black uppercase px-2 py-0.5 rounded-full border-none",
                                            app.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            app.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            app.status === 'shortlisted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                        )}
                                    >
                                        {app.status}
                                    </Badge>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                        {app.appliedAt && formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function RecentApplicationsSkeleton({ className }: { className?: string }) {
    return (
        <Card className={cn("border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden", className)}>
            <CardHeader className="border-b border-slate-50 dark:border-slate-800/60 pb-4">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-4 w-64 rounded-md mt-2" />
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center">
                            <Skeleton className="h-11 w-11 rounded-full" />
                            <div className="ml-4 space-y-2 flex-1">
                                <Skeleton className="h-4 w-[150px] rounded" />
                                <Skeleton className="h-3 w-[200px] rounded" />
                            </div>
                            <div className="ml-4 flex flex-col items-end gap-2">
                                <Skeleton className="h-5 w-20 rounded-full" />
                                <Skeleton className="h-3 w-16 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
