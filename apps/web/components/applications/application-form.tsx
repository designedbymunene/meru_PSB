'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { useCreateApplication } from '@/hooks/use-applications'
import { Loader2 } from 'lucide-react'

// Validation Schema
const applicationSchema = z.object({})

type ApplicationFormValues = z.infer<typeof applicationSchema>

interface ApplicationFormProps {
    vacancyId: number
    vacancyTitle: string
}

export function ApplicationForm({ vacancyId, vacancyTitle }: ApplicationFormProps) {
    const { mutate: createApplication, isPending } = useCreateApplication()

    const form = useForm<ApplicationFormValues>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {},
    })

    function onSubmit(values: ApplicationFormValues) {
        createApplication({
            data: {
                vacancyId,
            },
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4 text-center">
                    <p className="text-muted-foreground">
                        Your complete profile will be submitted for this application.
                        Please ensure your profile is up-to-date before applying.
                    </p>
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm & Apply for {vacancyTitle}
                </Button>
            </form>
        </Form>
    )
}
