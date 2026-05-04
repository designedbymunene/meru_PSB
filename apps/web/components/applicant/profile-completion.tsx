'use client'

import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import type { ApplicantProfileWithRelations } from '@/types'

interface ProfileCompletionProps {
    profile: ApplicantProfileWithRelations | null | undefined
    compact?: boolean
}

interface CompletionItem {
    label: string
    completed: boolean
    required: boolean
}

export function ProfileCompletion({ profile, compact = false }: ProfileCompletionProps) {
    const items = calculateCompletion(profile)
    const { percentage, completedCount, totalCount, requiredMissing } = items

    if (compact) {
        return (
            <div className="flex items-center gap-3">
                <Progress value={percentage} className="flex-1 h-2" />
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {percentage}% complete
                </span>
            </div>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Profile Completion</CardTitle>
                    <span className="text-2xl font-bold text-primary">{percentage}%</span>
                </div>
                <CardDescription>
                    {completedCount} of {totalCount} sections complete
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Progress value={percentage} className="h-2" />

                {requiredMissing.length > 0 && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                            <p className="font-medium text-amber-800 dark:text-amber-200">
                                Required information missing
                            </p>
                            <p className="text-amber-700 dark:text-amber-300">
                                Complete: {requiredMissing.join(', ')}
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                    {items.list.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                        >
                            {item.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                            ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={item.completed ? 'text-muted-foreground' : 'font-medium'}>
                                {item.label}
                                {item.required && !item.completed && (
                                    <span className="text-amber-600 dark:text-amber-500 ml-1">*</span>
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

function calculateCompletion(profile: ApplicantProfileWithRelations | null | undefined) {
    const list: CompletionItem[] = [
        {
            label: 'Personal Info',
            completed: Boolean(profile?.applicantName && profile?.idNumber && profile?.gender && profile?.birthYear),
            required: true,
        },
        {
            label: 'Contact Details',
            completed: Boolean(profile?.phone && profile?.email),
            required: true,
        },
        {
            label: 'Location',
            completed: Boolean(profile?.homeCounty),
            required: false,
        },
        {
            label: 'Qualifications',
            completed: (profile?.qualifications?.length ?? 0) > 0,
            required: true,
        },
        {
            label: 'Professional Details',
            completed: (profile?.professionalDetails?.length ?? 0) > 0,
            required: false,
        },
        {
            label: 'Training Courses',
            completed: (profile?.trainingCourses?.length ?? 0) > 0,
            required: false,
        },
        {
            label: 'Memberships',
            completed: (profile?.professionalMemberships?.length ?? 0) > 0,
            required: false,
        },
        {
            label: 'Employment History',
            completed: (profile?.employmentHistory?.length ?? 0) > 0,
            required: false,
        },
    ]

    const completedCount = list.filter(item => item.completed).length
    const totalCount = list.length
    const percentage = Math.round((completedCount / totalCount) * 100)
    const requiredMissing = list
        .filter(item => item.required && !item.completed)
        .map(item => item.label)

    return { list, completedCount, totalCount, percentage, requiredMissing }
}
