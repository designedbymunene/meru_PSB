"use client"

import { useVacancy } from "@/hooks/use-vacancies"
import { Skeleton } from "@/components/ui/skeleton"
import { use } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Edit } from "lucide-react"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"

export default function VacancyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data, isLoading, error } = useVacancy(parseInt(id, 10))
    const vacancy = data?.data

    if (isLoading) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        )
    }

    if (error || !vacancy) {
        return <div className="p-8">Vacancy not found</div>
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between md:flex-row flex-col gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{vacancy.title}</h2>
                    <p className="text-muted-foreground">{vacancy.advertisementNumber}</p>
                </div>
                <Button asChild>
                    <Link href={`/admin/vacancies/${vacancy.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Vacancy
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap">{vacancy.description}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Requirements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5 space-y-1">
                                {vacancy.jobRequirements.map((req, i) => (
                                    <li key={i}>{req}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Responsibilities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5 space-y-1">
                                {vacancy.jobResponsibilities.map((resp, i) => (
                                    <li key={i}>{resp}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm">Status</h4>
                                <Badge variant={vacancy.status === 'open' ? 'default' : 'secondary'}>
                                    {vacancy.status}
                                </Badge>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-sm">Job Group</h4>
                                <p className="text-sm">{vacancy.jobGroup?.name || 'N/A'}</p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-sm">Department</h4>
                                <p className="text-sm">{vacancy.department?.name || 'N/A'}</p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-sm">Open Positions</h4>
                                <p className="text-sm">{vacancy.openPositions}</p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-sm">Closing Date</h4>
                                <p className="text-sm">{format(new Date(vacancy.closingDate), 'PPP')}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
