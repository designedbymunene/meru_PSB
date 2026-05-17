"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSubmitInterviewScore } from "@/hooks/use-interviews"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, AlertTriangle, User, Briefcase, Calendar } from "lucide-react"
import { format } from "date-fns"

const scoreSchema = z.object({
    score: z.number().min(0, "Score must be at least 0").max(100, "Score must not exceed 100"),
    comments: z.string().min(10, "Comments must be at least 10 characters"),
    conflictOfInterest: z.boolean().default(false),
    declarationNotes: z.string().optional(),
})

type ScoreFormValues = z.infer<typeof scoreSchema>

interface SubmitScoreDialogProps {
    interview: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SubmitScoreDialog({
    interview,
    open,
    onOpenChange,
}: SubmitScoreDialogProps) {
    const submitScore = useSubmitInterviewScore()

    const form = useForm<ScoreFormValues>({
        resolver: zodResolver(scoreSchema),
        defaultValues: {
            score: 50,
            comments: "",
            conflictOfInterest: false,
            declarationNotes: "",
        },
    })

    // Reset form when interview changes or dialog opens
    useEffect(() => {
        if (open && interview) {
            form.reset({
                score: 50,
                comments: "",
                conflictOfInterest: false,
                declarationNotes: "",
            })
        }
    }, [open, interview, form])

    const onSubmit = (data: ScoreFormValues) => {
        submitScore.mutate(
            {
                interviewId: interview.id,
                data: {
                    score: data.score,
                    comments: data.comments,
                    conflictOfInterest: data.conflictOfInterest,
                    declarationNotes: data.declarationNotes,
                },
            },
            {
                onSuccess: () => {
                    onOpenChange(false)
                    form.reset()
                },
            }
        )
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            form.reset()
        }
        onOpenChange(newOpen)
    }

    if (!interview) return null

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-3xl border-none">
                <div className="bg-primary/5 p-6 pb-0">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Submit Assessment</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Provide your professional evaluation for this candidate.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-6 flex flex-col gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Candidate</p>
                                <p className="font-bold text-slate-900 dark:text-white">
                                    {interview.application?.applicant?.fullName || "Unknown Applicant"}
                                </p>
                            </div>
                        </div>
                        
                        <Separator className="opacity-50" />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Briefcase className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-600 dark:text-slate-400 truncate">
                                    {interview.vacancy?.title || "Unknown Vacancy"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm justify-end">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-600 dark:text-slate-400">
                                    {format(new Date(interview.scheduledAt), "MMM dd, yyyy")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-0">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="score"
                                render={({ field }) => (
                                    <FormItem className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-base font-bold">Overall Score</FormLabel>
                                            <Badge variant="secondary" className="text-lg px-3 py-1 font-mono bg-primary/10 text-primary border-none">
                                                {field.value}/100
                                            </Badge>
                                        </div>
                                        <FormControl>
                                            <div className="px-2">
                                                <Slider
                                                    value={[field.value]}
                                                    onValueChange={([value]) => field.onChange(value)}
                                                    max={100}
                                                    step={1}
                                                    className="py-4"
                                                />
                                                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                    <span>Poor</span>
                                                    <span>Average</span>
                                                    <span>Excellent</span>
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="comments"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-bold">Assessment Comments</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Provide detailed feedback on technical skills, cultural fit, and overall performance..."
                                                className="min-h-[140px] rounded-2xl resize-none bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-all"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4 pt-2">
                                <FormField
                                    control={form.control}
                                    name="conflictOfInterest"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className="mt-1"
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="font-bold cursor-pointer">
                                                    Conflict of Interest
                                                </FormLabel>
                                                <p className="text-xs text-slate-500">
                                                    I declare any personal or professional relationship with this candidate.
                                                </p>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {form.watch("conflictOfInterest") && (
                                    <FormField
                                        control={form.control}
                                        name="declarationNotes"
                                        render={({ field }) => (
                                            <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                                    <FormLabel className="text-amber-600 font-bold">Declaration Details</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Please describe the nature of your relationship with the candidate..."
                                                        className="min-h-[80px] rounded-2xl border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-900/10 focus:ring-amber-500"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            <DialogFooter className="gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => handleOpenChange(false)}
                                    disabled={submitScore.isPending}
                                    className="rounded-xl h-12 px-6"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={submitScore.isPending}
                                    className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20"
                                >
                                    {submitScore.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Submit Assessment
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
