'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { useCreateApplication } from '@/hooks/use-applications'
import { useMyProfile } from '@/hooks/use-applicant-profile'
import { 
    Loader2, 
    CheckCircle2, 
    UserIcon, 
    GraduationCapIcon, 
    BriefcaseIcon, 
    FileTextIcon,
    ShieldCheckIcon,
    AlertCircleIcon
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

// Validation Schema
const applicationSchema = z.object({
    confirmTruth: z.boolean().refine(val => val === true, {
        message: "You must confirm the accuracy of your information"
    })
})

type ApplicationFormValues = z.infer<typeof applicationSchema>

interface ApplicationFormProps {
    vacancyId: number
    vacancyTitle: string
}

export function ApplicationForm({ vacancyId, vacancyTitle }: ApplicationFormProps) {
    const { mutate: createApplication, isPending } = useCreateApplication()
    const { data: profileResponse, isLoading: isProfileLoading } = useMyProfile()
    const profile = profileResponse?.data

    const form = useForm<ApplicationFormValues>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
            confirmTruth: false
        },
    })

    function onSubmit(values: ApplicationFormValues) {
        createApplication({
            data: {
                vacancyId,
            },
        })
    }

    if (isProfileLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-medium">Preparing your application...</p>
            </div>
        )
    }

    const submissionSections = [
        { id: 'personal', label: 'Personal Information', icon: UserIcon, description: profile?.fullName },
        { id: 'qualifications', label: 'Academic Qualifications', icon: GraduationCapIcon, description: `${profile?.qualifications?.length || 0} entries` },
        { id: 'experience', label: 'Employment History', icon: BriefcaseIcon, description: `${profile?.employmentHistory?.length || 0} entries` },
        { id: 'professional', label: 'Professional Certifications', icon: ShieldCheckIcon, description: `${profile?.professionalDetails?.length || 0} entries` },
    ]

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
                <div className="space-y-4">
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <FileTextIcon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-semibold text-sm leading-none">Application Summary</h4>
                            <p className="text-xs text-muted-foreground leading-normal">
                                You are applying for <span className="text-foreground font-medium">"{vacancyTitle}"</span>. 
                                The following sections from your profile will be shared with the recruitment committee.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {submissionSections.map((section) => (
                            <div key={section.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                                <div className="bg-muted p-1.5 rounded-md">
                                    <section.icon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold truncate">{section.label}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{section.description || 'N/A'}</p>
                                </div>
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            </div>
                        ))}
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30 flex items-start gap-2.5">
                        <AlertCircleIcon className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-relaxed">
                            Once submitted, you will not be able to edit your application or profile for this specific vacancy. 
                            Please double-check all information.
                        </p>
                    </div>
                </div>

                <Separator className="opacity-50" />

                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="confirmTruth"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/20">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="text-[13px] font-medium leading-normal cursor-pointer">
                                        I confirm that the information provided in my profile is true, accurate, and complete to the best of my knowledge.
                                    </FormLabel>
                                    <FormMessage className="text-[10px]" />
                                </div>
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                            type="submit" 
                            className="flex-1 h-11" 
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Confirm & Submit Application
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}
