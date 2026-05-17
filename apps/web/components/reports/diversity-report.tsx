'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DiversityReport } from '@/types'
import { Progress } from '@/components/ui/progress'
import { format } from 'date-fns'

export function DiversityReportCard({ data }: { data: DiversityReport }) {
    const total = data.totalApplicants
    const startDate = data.period.start ? new Date(data.period.start) : null
    const endDate = data.period.end ? new Date(data.period.end) : null

    const formattedPeriod = startDate && endDate 
        ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
        : 'No data period'

    const genderData = [
        { label: 'Male', value: data.gender.Male, color: 'bg-blue-500' },
        { label: 'Female', value: data.gender.Female, color: 'bg-pink-500' },
        { label: 'Other', value: data.gender.Other, color: 'bg-purple-500' },
        { label: 'Prefer not to say', value: data.gender.PreferNotToSay, color: 'bg-gray-500' },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Diversity Report</CardTitle>
                <CardDescription>
                    {formattedPeriod} • {total} applicants
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="font-semibold mb-3">Gender Distribution</h4>
                    <div className="space-y-2">
                        {genderData.map((item) => {
                            const percent = total > 0 ? (item.value / total) * 100 : 0
                            return (
                                <div key={item.label} className="flex items-center gap-2">
                                    <span className="w-32 text-sm">{item.label}</span>
                                    <Progress value={percent} className="flex-1" />
                                    <span className="w-12 text-sm text-right">{item.value}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-3">Ethnicity Distribution</h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        {Object.entries(data.ethnicity).sort((a, b) => b[1] - a[1]).map(([label, value]) => {
                            const percent = total > 0 ? (value / total) * 100 : 0
                            return (
                                <div key={label} className="flex items-center gap-2">
                                    <span className="w-32 text-sm truncate" title={label}>{label}</span>
                                    <Progress value={percent} className="flex-1" />
                                    <span className="w-12 text-sm text-right">{value}</span>
                                </div>
                            )
                        })}
                        {Object.keys(data.ethnicity).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No ethnicity data available</p>
                        )}
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-3">Disability Status</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{data.disability.hasImpairment}</div>
                            <div className="text-xs text-muted-foreground">With Impairment</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{data.disability.noImpairment}</div>
                            <div className="text-xs text-muted-foreground">No Impairment</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{data.disability.preferNotToSay}</div>
                            <div className="text-xs text-muted-foreground">Declined</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
