"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useScheduleInterview, useRescheduleInterview } from "@/hooks/use-interviews"
import { useUsers } from "@/hooks/use-users"
import { type Interview } from "@meru/shared"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format, startOfDay, set } from "date-fns"
import { cn } from "@/lib/utils"

const interviewSchema = z.object({
    vacancyId: z.number().min(1, "Vacancy is required"),
    applicationId: z.number().min(1, "Application is required"),
    interviewDate: z.date().min(startOfDay(new Date()), "Date cannot be in the past"),
    interviewTime: z.string().min(1, "Time is required"),
    mode: z.enum(["physical", "virtual"]),
    venue: z.string().optional().or(z.literal("")),
    virtualLink: z.string().optional().or(z.literal("")),
    panelMembers: z.array(z.number()).default([]),
}).superRefine((data, ctx) => {
    if (data.mode === "physical" && (!data.venue || data.venue.trim().length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Venue is required for physical interviews",
            path: ["venue"],
        })
    }
    if (data.mode === "virtual" && (!data.virtualLink || data.virtualLink.trim().length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Virtual meeting link is required for virtual interviews",
            path: ["virtualLink"],
        })
    } else if (data.mode === "virtual" && data.virtualLink && !data.virtualLink.startsWith("http://") && !data.virtualLink.startsWith("https://")) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please enter a valid URL starting with http:// or https://",
            path: ["virtualLink"],
        })
    }
})

type InterviewFormValues = z.infer<typeof interviewSchema>

interface ScheduleInterviewDialogProps {
    applicationId: number
    vacancyId: number
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    existingInterview?: Interview
}

export function ScheduleInterviewDialog({
    applicationId,
    vacancyId,
    trigger,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    existingInterview,
}: ScheduleInterviewDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen

    const scheduleInterview = useScheduleInterview()
    const rescheduleInterview = useRescheduleInterview()

    const form = useForm<any>({
        resolver: zodResolver(interviewSchema),
        defaultValues: {
            vacancyId,
            applicationId,
            interviewDate: existingInterview ? new Date(existingInterview.scheduledAt) : new Date(),
            interviewTime: existingInterview ? format(new Date(existingInterview.scheduledAt), "HH:mm") : format(new Date(), "HH:mm"),
            mode: existingInterview?.virtualLink ? "virtual" : "physical",
            venue: existingInterview?.venue || "",
            virtualLink: existingInterview?.virtualLink || "",
            panelMembers: [],
        },
    })

    const onSubmit = (data: InterviewFormValues) => {
        // Combine date and time
        const [hours, minutes] = data.interviewTime.split(":").map(Number)
        const scheduledAt = set(data.interviewDate, {
            hours,
            minutes,
            seconds: 0,
            milliseconds: 0,
        })

        const finalVenue = data.mode === "virtual" ? (data.venue?.trim() || "Online / Virtual") : (data.venue?.trim() || "")

        if (existingInterview) {
            rescheduleInterview.mutate(
                {
                    id: existingInterview.id,
                    data: {
                        scheduledAt: scheduledAt.toISOString(),
                        venue: finalVenue,
                        virtualLink: data.mode === "virtual" ? data.virtualLink : "",
                    }
                },
                {
                    onSuccess: () => {
                        onOpenChange?.(false)
                    },
                }
            )
        } else {
            scheduleInterview.mutate(
                {
                    vacancyId: data.vacancyId,
                    applicationId: data.applicationId,
                    scheduledAt: scheduledAt.toISOString(),
                    venue: finalVenue,
                    virtualLink: data.mode === "virtual" ? data.virtualLink : "",
                    panelMembers: data.panelMembers,
                },
                {
                    onSuccess: () => {
                        onOpenChange?.(false)
                        form.reset()
                    },
                }
            )
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            form.reset()
        }
        onOpenChange?.(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{existingInterview ? "Update Schedule" : "Schedule Interview"}</DialogTitle>
                    <DialogDescription>
                        {existingInterview ? "Update the interview schedule details." : "Schedule an interview for this application."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="interviewDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Interview Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < startOfDay(new Date())}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="interviewTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Interview Time</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="mode"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel>Interview Mode</FormLabel>
                                    <FormControl>
                                        <Tabs
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            className="w-full"
                                        >
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="physical" className="font-semibold">
                                                    🏢 Physical Venue
                                                </TabsTrigger>
                                                <TabsTrigger value="virtual" className="font-semibold">
                                                    💻 Virtual / Online
                                                </TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {form.watch("mode") === "physical" ? (
                            <FormField
                                control={form.control}
                                name="venue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Venue / Location</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Physical boardroom or meeting place (e.g. Boardroom A, 3rd Floor)"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="virtualLink"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Virtual Meeting Link</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="https://zoom.us/j/... or https://teams.microsoft.com/..."
                                                    {...field}
                                                    value={field.value || ""}
                                                    onChange={(e) => field.onChange(e.target.value || "")}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="venue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Platform / Notes (Optional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g. Zoom Video Call, Microsoft Teams"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}



                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={scheduleInterview.isPending || rescheduleInterview.isPending}>
                                {(scheduleInterview.isPending || rescheduleInterview.isPending) && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {existingInterview ? "Update Schedule" : "Schedule Interview"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
