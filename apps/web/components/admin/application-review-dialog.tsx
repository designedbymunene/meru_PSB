"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useReviewApplication } from "@/hooks/use-applications"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const reviewSchema = z.object({
    status: z.enum(["accepted", "rejected"]),
    notes: z.string().min(1, "Review notes are required").max(500, "Notes are too long"),
})

type ReviewFormValues = z.infer<typeof reviewSchema>

interface ApplicationReviewDialogProps {
    applicationId: number
    currentStatus: string
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function ApplicationReviewDialog({
    applicationId,
    currentStatus,
    trigger,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: ApplicationReviewDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen

    const reviewApplication = useReviewApplication()

    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            status: "accepted", // Default to accepted or potentially undefined
            notes: "",
        },
    })

    // Reset form when dialog opens
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            form.reset()
        }
        onOpenChange?.(newOpen)
    }

    const onSubmit = (data: ReviewFormValues) => {
        reviewApplication.mutate(
            { id: applicationId, data },
            {
                onSuccess: () => {
                    handleOpenChange(false)
                },
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Review Application</DialogTitle>
                    <DialogDescription>
                        Update the status of this application. This action will notify the applicant.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="accepted">Accept</SelectItem>
                                            <SelectItem value="rejected">Reject</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Review Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add comments about this decision..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={reviewApplication.isPending}>
                                {reviewApplication.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Submit Review
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
