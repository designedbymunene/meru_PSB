'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useBoardResolution } from '@/hooks/use-board'
import { useInterviewResults } from '@/hooks/use-interviews'
import { VacancyWithRelations } from '@/types'
import { Combobox } from '@/components/ui/combobox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Trophy, FileText, LayoutGrid } from 'lucide-react'

const resolutionSchema = z.object({
    vacancyId: z.string().min(1, 'Please select a vacancy'),
    resolutionText: z.string().min(10, 'Resolution must be at least 10 characters'),
})

const RESOLUTION_TEMPLATES = [
    {
        name: 'Standard Appointment',
        text: (vacancyName: string) => `The Board, having sat on ${new Date().toLocaleDateString()}, reviewed the interview results for the position of ${vacancyName}. It was resolved that the top-ranked candidate(s) be appointed to the position based on their performance and merit.`
    },
    {
        name: 'No Appointment (Re-advert)',
        text: (vacancyName: string) => `Upon reviewing the interview results for ${vacancyName}, the Board noted that none of the candidates met the minimum threshold for appointment. It was resolved that the position be re-advertised at a later date.`
    },
    {
        name: 'Reserved/Internal Only',
        text: (vacancyName: string) => `The Board resolved that the position of ${vacancyName} be filled through internal promotion following the successful interview process and verification of eligibility.`
    }
]

export function BoardResolutionForm({ vacancies }: { vacancies: VacancyWithRelations[] }) {
    const form = useForm<z.infer<typeof resolutionSchema>>({
        resolver: zodResolver(resolutionSchema),
    })
    const recordResolution = useBoardResolution()
    const selectedVacancyId = form.watch('vacancyId')
    
    const { data: interviewResultsData } = useInterviewResults(
        selectedVacancyId ? parseInt(selectedVacancyId) : 0
    )
    const interviewResults = interviewResultsData?.data || []
    
    const vacancyOptions = vacancies.map((v) => ({
        label: v.title,
        value: v.id.toString(),
    }))

    const applyTemplate = (templateFn: (name: string) => string) => {
        const vacancy = vacancies.find(v => v.id.toString() === selectedVacancyId)
        form.setValue('resolutionText', templateFn(vacancy?.title || 'the position'))
    }

    return (
        <Card className="col-span-full xl:col-span-1">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Record Board Resolution</CardTitle>
                </div>
                <CardDescription>Document board decisions for recruitment rounds</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit((data) => recordResolution.mutate({ vacancyId: parseInt(data.vacancyId), resolutionText: data.resolutionText }))} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="vacancyId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vacancy</FormLabel>
                                            <FormControl>
                                                <Combobox
                                                    options={vacancyOptions}
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    placeholder="Search vacancy..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <FormLabel>Templates</FormLabel>
                                    <div className="flex flex-wrap gap-2">
                                        {RESOLUTION_TEMPLATES.map((t) => (
                                            <Button
                                                key={t.name}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={!selectedVacancyId}
                                                onClick={() => applyTemplate(t.text)}
                                            >
                                                {t.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="resolutionText"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Resolution Text</FormLabel>
                                            <FormControl>
                                                <Textarea rows={6} placeholder="Enter the board resolution..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={recordResolution.isPending} className="w-full">
                                    {recordResolution.isPending ? 'Recording...' : 'Record Final Resolution'}
                                </Button>
                            </form>
                        </Form>
                    </div>

                    {/* Quick Glance Panel */}
                    <div className="rounded-lg border bg-muted/30 p-4">
                        <div className="mb-4 flex items-center gap-2 font-semibold">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span>Interview Rankings Preview</span>
                        </div>
                        {selectedVacancyId ? (
                            <ScrollArea className="h-[300px]">
                                {interviewResults.length > 0 ? (
                                    <div className="space-y-3">
                                        {interviewResults.map((res, index) => (
                                            <div key={index} className="flex items-center justify-between rounded-md bg-background p-2 text-sm shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                                                        {index + 1}
                                                    </span>
                                                    <span>{res.applicantName}</span>
                                                </div>
                                                <Badge variant="secondary">{res.averageScore.toFixed(1)}%</Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                        No interview results found for this vacancy.
                                    </div>
                                )}
                            </ScrollArea>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                                <LayoutGrid className="h-8 w-8 opacity-20" />
                                <p>Select a vacancy to see <br /> top-ranked candidates</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
