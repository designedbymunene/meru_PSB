"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useReviewApplication } from "@/hooks/use-applications"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Tag, Calendar, CheckCircle2, AlertCircle } from "lucide-react"
import { ScheduleInterviewDialog } from "./schedule-interview-dialog"
import { MultiSelect, type Option } from "@/components/ui/multi-select"
import { APPLICATION_STATUS } from "@/lib/constants"

const PREFILLED_LABELS: Option[] = [
    { label: "Strong Technical Background", value: "Strong Technical Background" },
    { label: "Excellent Communication", value: "Excellent Communication" },
    { label: "Culture Fit", value: "Culture Fit" },
    { label: "Local Candidate", value: "Local Candidate" },
    { label: "Internal Candidate", value: "Internal Candidate" },
    { label: "Missing Documentation", value: "Missing Documentation" },
    { label: "Verification Pending", value: "Verification Pending" },
    { label: "Salary Mismatch", value: "Salary Mismatch" },
    { label: "Strong Portfolio", value: "Strong Portfolio" },
    { label: "Relevant Experience", value: "Relevant Experience" },
    { label: "Overqualified", value: "Overqualified" },
    { label: "Underqualified", value: "Underqualified" },
    { label: "High Potential", value: "High Potential" },
    { label: "Reference Check Required", value: "Reference Check Required" },
    { label: "Notice Period Concern", value: "Notice Period Concern" },
    { label: "Leadership Experience", value: "Leadership Experience" },
]

const reviewSchema = z.object({
    status: z.enum(["pending", "reviewed", "shortlisted", "interviewing", "interviewed", "accepted", "rejected"]),
    notes: z.string().min(1, "Review notes are required").max(1000, "Notes are too long"),
    tags: z.array(z.string()).optional(),
})

type ReviewFormValues = z.infer<typeof reviewSchema>

interface ApplicationReviewSheetProps {
    applicationId: number
    vacancyId?: number
    currentStatus: string
    targetStatus?: string
    currentTags?: string[]
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
    [APPLICATION_STATUS.PENDING]: [APPLICATION_STATUS.REVIEWED, APPLICATION_STATUS.REJECTED],
    [APPLICATION_STATUS.REVIEWED]: [APPLICATION_STATUS.SHORTLISTED, APPLICATION_STATUS.REJECTED],
    [APPLICATION_STATUS.SHORTLISTED]: [APPLICATION_STATUS.INTERVIEWING, APPLICATION_STATUS.INTERVIEWED, APPLICATION_STATUS.REJECTED],
    [APPLICATION_STATUS.INTERVIEWING]: [APPLICATION_STATUS.INTERVIEWED, APPLICATION_STATUS.ACCEPTED, APPLICATION_STATUS.REJECTED],
    [APPLICATION_STATUS.INTERVIEWED]: [APPLICATION_STATUS.ACCEPTED, APPLICATION_STATUS.REJECTED],
    [APPLICATION_STATUS.ACCEPTED]: [APPLICATION_STATUS.REJECTED],
    [APPLICATION_STATUS.REJECTED]: [APPLICATION_STATUS.REVIEWED], // Allow re-reviewing
}

const STATUS_LABELS: Record<string, string> = {
    [APPLICATION_STATUS.PENDING]: "Pending",
    [APPLICATION_STATUS.REVIEWED]: "Mark as Reviewed",
    [APPLICATION_STATUS.SHORTLISTED]: "Shortlist Candidate",
    [APPLICATION_STATUS.INTERVIEWING]: "Interview Scheduled",
    [APPLICATION_STATUS.INTERVIEWED]: "Mark as Interviewed",
    [APPLICATION_STATUS.ACCEPTED]: "Accept / Approve",
    [APPLICATION_STATUS.REJECTED]: "Mark as Not Successful",
}

export function ApplicationReviewSheet({
    applicationId,
    vacancyId,
    currentStatus,
    targetStatus,
    currentTags = [],
    trigger,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: ApplicationReviewSheetProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [lastStatus, setLastStatus] = useState<string>("")
    const [showScheduleDialog, setShowScheduleDialog] = useState(false)
    
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen

    const reviewApplication = useReviewApplication()

    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            status: (targetStatus || currentStatus || APPLICATION_STATUS.REVIEWED) as any,
            notes: "",
            tags: currentTags || [],
        },
    })

    // Update form when targetStatus changes while open
    useEffect(() => {
        if (open && targetStatus) {
            form.setValue("status", targetStatus as any)
        }
    }, [targetStatus, open, form])

    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            form.reset({
                status: (targetStatus || currentStatus || APPLICATION_STATUS.REVIEWED) as any,
                notes: "",
                tags: currentTags || [],
            })
            setShowSuccess(false)
        }
        onOpenChange?.(newOpen)
    }

    const onSubmit = (data: ReviewFormValues) => {
        reviewApplication.mutate(
            { id: applicationId, data: data as any },
            {
                onSuccess: () => {
                    setLastStatus(data.status)
                    setShowSuccess(true)
                    if (data.status !== APPLICATION_STATUS.SHORTLISTED && data.status !== APPLICATION_STATUS.INTERVIEWING) {
                        setTimeout(() => handleOpenChange(false), 2000)
                    }
                },
            }
        )
    }

    const nextOptions = STATUS_TRANSITIONS[currentStatus] || []

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
            <SheetContent className="sm:max-w-[500px] flex flex-col h-full p-0">
                <SheetHeader className="p-6 pb-4 border-b space-y-1">
                    <SheetTitle className="text-xl">Update Application Status</SheetTitle>
                    <SheetDescription className="text-xs">
                        Move this application to the next stage and record your decision notes.
                    </SheetDescription>
                </SheetHeader>

                {showSuccess ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-12 px-6">
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold">Review Submitted</h3>
                            <p className="text-muted-foreground">
                                Status updated to <span className="font-semibold text-foreground capitalize">{lastStatus}</span>
                            </p>
                        </div>

                        {(lastStatus === APPLICATION_STATUS.SHORTLISTED || lastStatus === APPLICATION_STATUS.INTERVIEWING) && vacancyId && (
                            <div className="w-full max-w-sm pt-6 space-y-3">
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 mb-4">
                                    <p className="text-sm text-center text-primary leading-relaxed">
                                        {lastStatus === APPLICATION_STATUS.SHORTLISTED 
                                            ? "This candidate is now shortlisted. Would you like to schedule an interview session now?"
                                            : "This candidate is now scheduled for interview. Would you like to set the session details now?"}
                                    </p>
                                </div>
                                <Button 
                                    className="w-full" 
                                    onClick={() => {
                                        setShowScheduleDialog(true)
                                        handleOpenChange(false)
                                    }}
                                >
                                    <Calendar className="mr-2 h-4 w-4" /> Schedule Interview
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    className="w-full"
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Finish & Close
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 py-4">
                        <Form {...form}>
                            <form id="review-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <div className="p-3 bg-muted/40 rounded-lg border flex items-center gap-3">
                                    <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Status:</p>
                                        <p className="text-sm font-semibold capitalize">{currentStatus}</p>
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-sm font-semibold">Target Status</FormLabel>
                                            <Select 
                                                onValueChange={field.onChange} 
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-10">
                                                        <SelectValue placeholder="Choose new status..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {nextOptions.map(status => (
                                                        <SelectItem key={status} value={status}>
                                                            {STATUS_LABELS[status] || status}
                                                        </SelectItem>
                                                    ))}
                                                    {/* Always allow staying at current status if just updating notes */}
                                                    <SelectItem value={currentStatus}>
                                                        Stay at {currentStatus} (Update Notes)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription className="text-[10px] leading-tight text-muted-foreground/70">
                                                Select the next logical step in the recruitment process.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                                                <Tag className="h-3.5 w-3.5" />
                                                Internal Labels
                                            </FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    options={PREFILLED_LABELS}
                                                    selected={field.value || []}
                                                    onChange={field.onChange}
                                                    placeholder="Add candidate labels..."
                                                />
                                            </FormControl>
                                            <FormDescription className="text-[10px] leading-tight text-muted-foreground/70">
                                                Categorize candidates using prefilled or custom labels.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-sm font-semibold">Decision Rationale</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Provide detailed feedback on why this decision was made..."
                                                    className="min-h-[120px] resize-none text-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-[10px] leading-tight text-muted-foreground/70">
                                                This note is mandatory and will be recorded in the audit trail.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    </div>
                )}

                {!showSuccess && (
                    <SheetFooter className="p-6 pt-4 border-t mt-auto flex-row gap-3 sm:justify-end">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => handleOpenChange(false)}
                            disabled={reviewApplication.isPending}
                            className="flex-1 sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button 
                            form="review-form" 
                            type="submit" 
                            disabled={reviewApplication.isPending}
                            className="flex-1 sm:flex-none px-8"
                        >
                            {reviewApplication.isPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                            ) : (
                                "Confirm Decision"
                            )}
                        </Button>
                    </SheetFooter>
                )}
            </SheetContent>
            
            {showScheduleDialog && vacancyId && (
                <ScheduleInterviewDialog
                    applicationId={applicationId}
                    vacancyId={vacancyId}
                    open={showScheduleDialog}
                    onOpenChange={setShowScheduleDialog}
                />
            )}
        </Sheet>
    )
}
