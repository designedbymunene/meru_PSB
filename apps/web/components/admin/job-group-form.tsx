"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useCreateJobGroup, useUpdateJobGroup } from "@/hooks/use-job-groups"
import { Button } from "@/components/ui/button"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { JobGroup, CreateJobGroupData } from "@/types"

const jobGroupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    salaryMin: z.string().min(1, "Minimum salary is required"),
    salaryMax: z.string().min(1, "Maximum salary is required"),
    description: z.string().optional(),
    status: z.enum(["active", "inactive"]),
})

type JobGroupFormValues = z.infer<typeof jobGroupSchema>

interface JobGroupFormProps {
    initialData?: JobGroup
    mode: "create" | "edit"
}

export function JobGroupForm({ initialData, mode }: JobGroupFormProps) {
    const router = useRouter()
    const createJobGroup = useCreateJobGroup()
    const updateJobGroup = useUpdateJobGroup()

    const defaultValues: Partial<JobGroupFormValues> = initialData
        ? {
            name: initialData.name,
            salaryMin: initialData.salaryMin,
            salaryMax: initialData.salaryMax,
            description: initialData.description || "",
            status: initialData.status,
        }
        : {
            name: "",
            salaryMin: "",
            salaryMax: "",
            description: "",
            status: "active",
        }

    const form = useForm<JobGroupFormValues>({
        resolver: zodResolver(jobGroupSchema),
        defaultValues,
    })

    const onSubmit = (data: JobGroupFormValues) => {
        const formattedData: CreateJobGroupData = {
            ...data,
            description: data.description || undefined
        }

        if (mode === "create") {
            createJobGroup.mutate(formattedData)
        } else if (initialData) {
            updateJobGroup.mutate({ id: initialData.id, data: formattedData })
        }
    }

    const isSubmitting = createJobGroup.isPending || updateJobGroup.isPending

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Job Group Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Group K" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="salaryMin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Min Salary</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 50000" type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="salaryMax"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Salary</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 80000" type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Brief description..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {mode === "create" ? "Create Job Group" : "Save Changes"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
