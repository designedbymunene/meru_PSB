'use client'

import { useResolutions } from '@/hooks/use-board'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

export function ResolutionHistory() {
    const { data: resolutionsData, isLoading } = useResolutions()
    const resolutions = resolutionsData?.data || []

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Resolution History</CardTitle>
                    <CardDescription>Recently recorded board decisions</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Resolution History</CardTitle>
                <CardDescription>Overview of recent board recruitment decisions</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Vacancy</TableHead>
                            <TableHead>Resolution Summary</TableHead>
                            <TableHead>Approver</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resolutions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                    No resolutions recorded yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            resolutions.map((res) => (
                                <TableRow key={res.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {format(new Date(res.createdAt), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {res.vacancy?.title}
                                        <div className="text-xs text-muted-foreground">
                                            {res.vacancy?.advertisementNumber}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-md">
                                        <p className="line-clamp-2 text-sm">{res.resolutionText}</p>
                                    </TableCell>
                                    <TableCell>
                                        {res.approver?.fullName}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={res.status === 'approved' ? 'default' : 'secondary'}>
                                            {res.status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
