"use client"

import { useAllApplications } from "@/hooks/use-applications"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"

interface RecentApplicationsProps {
    className?: string
}

export function RecentApplications({ className }: RecentApplicationsProps) {
    // Fetch applications
    // In a real app, we might want to pass a limit or sort param to the API
    const { data, isLoading, error } = useAllApplications()

    // Use the data array if available, otherwise empty array
    // Assuming the API returns the list in data.data or similar structure
    // Based on the hook type, useAllApplications returns Query result where data is whatever getApplications returns.
    // getApplications returns Promise<ApiResponse<ApplicationWithRelations[]>>
    // So data would be ApiResponse<ApplicationWithRelations[]>
    // applications would be data.data
    const applications = data?.data || []

    // Slice to get top 5
    const recentApplications = applications.slice(0, 5)

    if (isLoading) {
        return <RecentApplicationsSkeleton className={className} />
    }

    if (error) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>Error loading applications</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Applications</CardTitle>
                <Button asChild variant="ghost" size="sm" className="gap-1">
                    <Link href="/admin/applications">
                        View All
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {recentApplications.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No applications found.</p>
                    ) : (
                        recentApplications.map((app) => (
                            <div key={app.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>
                                        {app.applicant?.fullName?.substring(0, 2).toUpperCase() || "AP"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{app.applicant?.fullName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Applied for {app.vacancy?.title}
                                    </p>
                                </div>
                                <div className="ml-auto flex flex-col items-end gap-1">
                                    <Badge variant={
                                        app.status === 'accepted' ? 'default' :
                                            app.status === 'rejected' ? 'destructive' : 'secondary'
                                    }>
                                        {app.status}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
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
        <Card className={className}>
            <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <div className="ml-4 space-y-2">
                                <Skeleton className="h-4 w-[150px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
