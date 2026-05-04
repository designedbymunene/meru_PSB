"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useCreateVacancy, useUpdateVacancy } from "@/hooks/use-vacancies"
import { useDepartments } from "@/hooks/use-departments"
import { useJobGroups } from "@/hooks/use-job-groups"
import { DatePicker } from "@/components/shared/date-picker"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
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
import { Separator } from "@/components/ui/separator"
import { VacancyWithRelations, CreateVacancyData } from "@/types"
import { Loader2, Plus, Trash2 } from "lucide-react"

const vacancySchema = z.object({
    // advertisementNumber is auto-generated on backend
    title: z.string().min(1, "Title is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),

    departmentId: z.number().min(1, "Department is required"),
    jobGroupId: z.number().min(1, "Job Group is required"),
    closingDate: z.date(),
    openPositions: z.number().min(1, "Must have at least 1 position"),
    status: z.enum(["open", "closed"]),
    jobRequirements: z.array(z.object({ value: z.string().min(1, "Requirement cannot be empty") })),
    jobResponsibilities: z.array(z.object({ value: z.string().min(1, "Responsibility cannot be empty") })),
})

type VacancyFormValues = z.infer<typeof vacancySchema>

interface VacancyFormProps {
    initialData?: VacancyWithRelations
    mode: "create" | "edit"
}

export function VacancyForm({ initialData, mode }: VacancyFormProps) {
    const router = useRouter()
    const createVacancy = useCreateVacancy()
    const updateVacancy = useUpdateVacancy()

    // Use defined hooks for reference data

    const { data: jobGroupsData, isLoading: isLoadingJobGroups } = useJobGroups()

    const defaultValues: Partial<VacancyFormValues> = initialData
        ? {
            ...initialData,
            departmentId: initialData.departmentId || 0,
            closingDate: new Date(initialData.closingDate),
            // Ensure arrays are initialized
            jobRequirements: initialData.jobRequirements?.map(r => ({ value: r })) || [],
            jobResponsibilities: initialData.jobResponsibilities?.map(r => ({ value: r })) || [],
        }
        : {
            // advertisementNumber: "",
            title: "",
            description: "",

            departmentId: 0,
            jobGroupId: 0,
            openPositions: 1,
            status: "open",
            jobRequirements: [{ value: "" }],
            jobResponsibilities: [{ value: "" }],
        }

    const form = useForm<VacancyFormValues>({
        resolver: zodResolver(vacancySchema),
        defaultValues,
    })

    // Watch ministryId to filter departments
    const { data: departmentsData, isLoading: isLoadingDepartments } = useDepartments()

    // Field arrays for dynamic lists
    const { fields: reqFields, append: appendReq, remove: removeReq } = useFieldArray({
        control: form.control,
        name: "jobRequirements",
    })

    const { fields: respFields, append: appendResp, remove: removeResp } = useFieldArray({
        control: form.control,
        name: "jobResponsibilities",
    })

    const onSubmit = (data: VacancyFormValues) => {
        const formattedData: CreateVacancyData = {
            ...data,
            closingDate: data.closingDate.toISOString(),
            jobRequirements: data.jobRequirements.map(r => r.value).filter(r => r.trim() !== ""),
            jobResponsibilities: data.jobResponsibilities.map(r => r.value).filter(r => r.trim() !== ""),
        }

        if (mode === "create") {
            createVacancy.mutate(formattedData)
        } else if (initialData) {
            updateVacancy.mutate({ id: initialData.id, data: formattedData })
        }
    }

    const isSubmitting = createVacancy.isPending || updateVacancy.isPending

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">

                    {/* Basic Information */}
                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            {/* Advertisement Number is auto-generated */}
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Senior Accountant" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="openPositions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Open Positions</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="closingDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Closing Date</FormLabel>
                                        <DatePicker
                                            date={field.value}
                                            onChange={field.onChange}
                                            disabled={(date) => date < new Date() && date.toDateString() !== new Date().toDateString()}
                                        />
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
                                                <SelectItem value="open">Open</SelectItem>
                                                <SelectItem value="closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Department & Ministry */}
                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle>Organization</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">

                            <FormField
                                control={form.control}
                                name="departmentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(Number(val))}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={isLoadingDepartments ? "Loading..." : "Select Department"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {departmentsData?.data.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="jobGroupId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Group</FormLabel>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={isLoadingJobGroups ? "Loading..." : "Select Job Group"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {jobGroupsData?.data.map((jg) => (
                                                    <SelectItem key={jg.id} value={jg.id.toString()}>
                                                        {jg.name} ({jg.salaryMin} - {jg.salaryMax})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Details */}
                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle>Job Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea className="min-h-[100px]" placeholder="Brief job description..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium">Requirements</h4>
                                    <Button type="button" variant="outline" size="sm" onClick={() => appendReq({ value: "" })}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Requirement
                                    </Button>
                                </div>
                                {reqFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2">
                                        <FormField
                                            control={form.control}
                                            name={`jobRequirements.${index}.value`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input placeholder={`Requirement ${index + 1}`} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeReq(index)} disabled={reqFields.length === 1}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                {form.formState.errors.jobRequirements && (
                                    <p className="text-sm font-medium text-destructive">{form.formState.errors.jobRequirements.message}</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium">Responsibilities</h4>
                                    <Button type="button" variant="outline" size="sm" onClick={() => appendResp({ value: "" })}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Responsibility
                                    </Button>
                                </div>
                                {respFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2">
                                        <FormField
                                            control={form.control}
                                            name={`jobResponsibilities.${index}.value`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input placeholder={`Responsibility ${index + 1}`} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeResp(index)} disabled={respFields.length === 1}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                {form.formState.errors.jobResponsibilities && (
                                    <p className="text-sm font-medium text-destructive">{form.formState.errors.jobResponsibilities.message}</p>
                                )}
                            </div>

                        </CardContent>
                    </Card>
                </div >

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {mode === "create" ? "Create Vacancy" : "Save Changes"}
                    </Button>
                </div>
            </form >
        </Form >
    )
}
