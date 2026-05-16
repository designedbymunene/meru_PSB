"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import { formatNumber } from "@/lib/utils"

const vacancySchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    departmentId: z.number().min(1, "Department is required"),
    jobGroupId: z.number().min(1, "Job Group is required"),
    closingDate: z.date().refine(date => date >= new Date(new Date().setHours(0,0,0,0)), {
        message: "Closing date cannot be in the past"
    }),
    openPositions: z.number().min(1, "Must have at least 1 position"),
    status: z.enum(["open", "closed"]),
    jobRequirements: z.array(z.object({ value: z.string().min(1, "Requirement cannot be empty") })).min(1, "At least one requirement is required"),
    jobResponsibilities: z.array(z.object({ value: z.string().min(1, "Responsibility cannot be empty") })).min(1, "At least one responsibility is required"),
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

    const { data: jobGroupsData, isLoading: isLoadingJobGroups } = useJobGroups()
    const { data: departmentsData, isLoading: isLoadingDepartments } = useDepartments()

    const defaultValues: Partial<VacancyFormValues> = initialData
        ? {
            ...initialData,
            departmentId: initialData.departmentId || 0,
            closingDate: new Date(initialData.closingDate),
            jobRequirements: initialData.jobRequirements?.map(r => ({ value: r })) || [{ value: "" }],
            jobResponsibilities: initialData.jobResponsibilities?.map(r => ({ value: r })) || [{ value: "" }],
        }
        : {
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto">
                <div className="grid gap-6">
                    {/* Basic Information */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Basic Information</CardTitle>
                            <FormDescription>General details about the position</FormDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 md:col-span-1">
                                        <FormLabel>Job Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Senior Accountant" {...field} className="h-11" />
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
                                            <Input type="number" min={1} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} className="h-11" />
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
                                        <FormLabel className="mb-2">Closing Date</FormLabel>
                                        <DatePicker
                                            date={field.value}
                                            onChange={field.onChange}
                                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
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
                                                <SelectTrigger className="h-11">
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

                    {/* Organization */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Organization & Grading</CardTitle>
                            <FormDescription>Assign the vacancy to a department and job group</FormDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
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
                                                <SelectTrigger className="h-11">
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
                                                <SelectTrigger className="h-11">
                                                    <SelectValue placeholder={isLoadingJobGroups ? "Loading..." : "Select Job Group"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {jobGroupsData?.data.map((jg) => (
                                                    <SelectItem key={jg.id} value={jg.id.toString()}>
                                                        {jg.name} ({formatNumber(jg.salaryMin)} - {formatNumber(jg.salaryMax)})
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
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Job Details</CardTitle>
                            <FormDescription>Describe the role and list expectations</FormDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                className="min-h-[150px] resize-y" 
                                                placeholder="Provide a detailed job description..." 
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-semibold">Requirements</h4>
                                        <p className="text-xs text-muted-foreground">Qualifications and skills needed</p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={() => appendReq({ value: "" })} className="rounded-lg h-9">
                                        <Plus className="mr-2 h-4 w-4" /> Add
                                    </Button>
                                </div>
                                <div className="grid gap-3">
                                    {reqFields.map((field, index) => (
                                        <div key={field.id} className="flex gap-2 group">
                                            <FormField
                                                control={form.control}
                                                name={`jobRequirements.${index}.value`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300 dark:text-slate-700 w-4">
                                                                    {index + 1}.
                                                                </span>
                                                                <Input placeholder={`Requirement ${index + 1}`} {...field} className="pl-8 h-10 border-slate-200 focus-visible:ring-primary/20" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeReq(index)} disabled={reqFields.length === 1} className="h-10 w-10 text-slate-400 hover:text-destructive transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                {form.formState.errors.jobRequirements && (
                                    <p className="text-sm font-medium text-destructive">{form.formState.errors.jobRequirements.message}</p>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-semibold">Responsibilities</h4>
                                        <p className="text-xs text-muted-foreground">Key duties for this role</p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={() => appendResp({ value: "" })} className="rounded-lg h-9">
                                        <Plus className="mr-2 h-4 w-4" /> Add
                                    </Button>
                                </div>
                                <div className="grid gap-3">
                                    {respFields.map((field, index) => (
                                        <div key={field.id} className="flex gap-2 group">
                                            <FormField
                                                control={form.control}
                                                name={`jobResponsibilities.${index}.value`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300 dark:text-slate-700 w-4">
                                                                    {index + 1}.
                                                                </span>
                                                                <Input placeholder={`Responsibility ${index + 1}`} {...field} className="pl-8 h-10 border-slate-200 focus-visible:ring-primary/20" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeResp(index)} disabled={respFields.length === 1} className="h-10 w-10 text-slate-400 hover:text-destructive transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                {form.formState.errors.jobResponsibilities && (
                                    <p className="text-sm font-medium text-destructive">{form.formState.errors.jobResponsibilities.message}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div >

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-900">
                    <Button type="button" variant="ghost" onClick={() => router.back()} className="text-slate-500 hover:text-slate-900">
                        Discard changes
                    </Button>
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl px-6">Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="rounded-xl px-8 shadow-md">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === "create" ? "Create Vacancy" : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </form >
        </Form >
    )
}
