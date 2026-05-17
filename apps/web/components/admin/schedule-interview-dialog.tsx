"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useScheduleInterview } from "@/hooks/use-interviews"
import { useUsers } from "@/hooks/use-users"
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
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const interviewSchema = z.object({
    vacancyId: z.number().min(1, "Vacancy is required"),
    applicationId: z.number().min(1, "Application is required"),
    scheduledAt: z.date().min(new Date(), "Date must be in the future"),
    virtualLink: z.string().url().optional().or(z.literal("")),
    panelMembers: z.array(z.number()).min(1, "At least one panel member is required"),
})

type InterviewFormValues = z.infer<typeof interviewSchema>

interface ScheduleInterviewDialogProps {
    applicationId: number
    vacancyId: number
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function ScheduleInterviewDialog({
    applicationId,
    vacancyId,
    trigger,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: ScheduleInterviewDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen

    const scheduleInterview = useScheduleInterview()
    const { data: users } = useUsers()

    const form = useForm<InterviewFormValues>({
        resolver: zodResolver(interviewSchema),
        defaultValues: {
            vacancyId,
            applicationId,
            scheduledAt: new Date(),
            virtualLink: "",
            panelMembers: [],
        },
    })

    const onSubmit = (data: InterviewFormValues) => {
        scheduleInterview.mutate(
            {
                ...data,
                scheduledAt: data.scheduledAt.toISOString(),
            },
            {
                onSuccess: () => {
                    onOpenChange?.(false)
                    form.reset()
                },
            }
        )
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
                    <DialogTitle>Schedule Interview</DialogTitle>
                    <DialogDescription>
                        Schedule an interview for this application. Select panel members and venue details.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="scheduledAt"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date & Time</FormLabel>
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
                                                        format(field.value, "PPP HH:mm")
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
                                                disabled={(date) => date < new Date()}
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
                            name="virtualLink"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Virtual Meeting Link (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://zoom.us/j/..."
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
                            name="panelMembers"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Panel Members</FormLabel>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {users?.data?.map((user) => (
                                            <div key={user.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`panel-${user.id}`}
                                                    checked={field.value.includes(user.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            field.onChange([...field.value, user.id])
                                                        } else {
                                                            field.onChange(field.value.filter((id) => id !== user.id))
                                                        }
                                                    }}
                                                />
                                                <label
                                                    htmlFor={`panel-${user.id}`}
                                                    className="text-sm cursor-pointer"
                                                >
                                                    {user.fullName} ({user.email})
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={scheduleInterview.isPending}>
                                {scheduleInterview.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Schedule Interview
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
