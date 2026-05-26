"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "@/i18n/routing"
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
import { Badge } from "@/components/ui/badge"
import { UnifiedCard } from "@/components/shared/cards/unified-card"
import { VacancyWithRelations, CreateVacancyData } from "@/types"
import { Loader2, Plus, Trash2, ChevronRight, ChevronLeft, Eye, FileEdit, CheckCircle2, BriefcaseIcon, CalendarIcon, BuildingIcon, MapPinIcon } from "lucide-react"
import { formatNumber, cn } from "@/lib/utils"
import { useState } from "react"

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
    const [step, setStep] = useState(1)
    const [isPreview, setIsPreview] = useState(false)
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

    const steps = [
        { id: 1, title: "Basic Info", description: "General position details" },
        { id: 2, title: "Organization", description: "Department & grading" },
        { id: 3, title: "Requirements", description: "Qualifications & skills" },
        { id: 4, title: "Responsibilities", description: "Key duties & expectations" },
    ]

    const nextStep = async () => {
        let fieldsToValidate: any[] = []
        if (step === 1) fieldsToValidate = ['title', 'description', 'openPositions', 'closingDate', 'status']
        if (step === 2) fieldsToValidate = ['departmentId', 'jobGroupId']
        if (step === 3) fieldsToValidate = ['jobRequirements']

        const isValid = await form.trigger(fieldsToValidate as any)
        if (isValid) setStep(prev => Math.min(prev + 1, 4))
    }

    const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

    const currentValues = form.getValues()
    const selectedDept = departmentsData?.data.find(d => d.id === currentValues.departmentId)
    const selectedJobGroup = jobGroupsData?.data.find(j => j.id === currentValues.jobGroupId)

    return (
        <Form {...form}>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                {/* Top Navigation Bar */}
                <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
                    <div className="max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
                                    <ChevronLeft className="h-4 w-4" />
                                    Back
                                </Button>
                                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                                <div>
                                    <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                        {mode === "create" ? "New Vacancy" : "Edit Vacancy"}
                                    </h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {currentValues.title || "Draft vacancy"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsPreview(false)}
                                        className={cn(
                                            "h-8 px-4 rounded-lg gap-2 transition-all",
                                            !isPreview ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        <FileEdit className="h-3.5 w-3.5" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Editor</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsPreview(true)}
                                        className={cn(
                                            "h-8 px-4 rounded-lg gap-2 transition-all",
                                            isPreview ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Preview</span>
                                    </Button>
                                </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-[1800px] mx-auto p-4 md:p-6 lg:py-8">
                    <div className="grid gap-6 lg:grid-cols-4">

                        {/* Left Column - Stepper (1/4 width) */}
                        {!isPreview && (
                            <div className="lg:col-span-1">
                                <UnifiedCard
                                    title={steps.find(s => s.id === step)?.title || "Form Progress"}
                                    subtitle={steps.find(s => s.id === step)?.description || "Complete all sections"}
                                    contentClassName="pt-6"
                                >
                                    <div className="space-y-2">
                                        {steps.map((s) => (
                                            <div key={s.id}>
                                                <button
                                                    onClick={() => {
                                                        // Only allow going back to completed steps or current step
                                                        if (s.id <= step || (s.id < step)) {
                                                            setStep(s.id)
                                                        }
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 text-left",
                                                        step === s.id
                                                            ? "bg-primary/5 border-primary shadow-sm" :
                                                        step > s.id
                                                            ? "bg-emerald-50/50 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50"
                                                            : "bg-transparent border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-80"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                                                        step === s.id ? "bg-primary text-primary-foreground" :
                                                        step > s.id ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                                                    )}>
                                                        {step > s.id ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.id}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold uppercase tracking-wider truncate">{s.title}</p>
                                                        <p className="text-[10px] text-muted-foreground font-medium truncate">{s.description}</p>
                                                    </div>
                                                </button>
                                                {s.id < 4 && (
                                                    <div className="flex justify-center py-1">
                                                        <div className={cn(
                                                            "h-4 w-px",
                                                            step > s.id ? "bg-emerald-300 dark:bg-emerald-700" : "bg-slate-200 dark:bg-slate-800"
                                                        )} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </UnifiedCard>
                            </div>
                        )}

                        {/* Right Column - Main Content (3/4 width) */}
                        <div className={cn(
                            "space-y-6",
                            isPreview ? "lg:col-span-4" : "lg:col-span-3"
                        )}>
                            {isPreview ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <UnifiedCard
                                        title={currentValues.title || "Job Title Preview"}
                                        subtitle={selectedDept?.name ? `${selectedDept.name}${selectedJobGroup ? ` • ${selectedJobGroup.name}` : ''}` : undefined}
                                        contentClassName="pt-6"
                                    >
                                        <div className="space-y-6">
                                            {/* Quick Stats */}
                                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                                                        <BuildingIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Department</div>
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                                                            {selectedDept?.name || 'TBD'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
                                                        <BriefcaseIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Job Group</div>
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                                                            {selectedJobGroup?.name || 'TBD'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                                                        <CalendarIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Closing Date</div>
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                                                            {currentValues.closingDate ? currentValues.closingDate.toLocaleDateString() : 'Not set'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                                                        <BriefcaseIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Open Positions</div>
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                                                            {currentValues.openPositions} Slots
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-bold">Description</h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                                                    {currentValues.description || "No description provided yet..."}
                                                </p>
                                            </div>

                                            {/* Requirements and Responsibilities */}
                                            <div className="grid gap-8 sm:grid-cols-2">
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-bold">Requirements</h3>
                                                    <ul className="space-y-3">
                                                        {currentValues.jobRequirements.map((r, i) => (
                                                            <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                                                                <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-[10px]">
                                                                    {i + 1}
                                                                </div>
                                                                {r.value || "Requirement..."}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-bold">Responsibilities</h3>
                                                    <ul className="space-y-3">
                                                        {currentValues.jobResponsibilities.map((r, i) => (
                                                            <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                                                {r.value || "Responsibility..."}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </UnifiedCard>
                                </div>
                            ) : (
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    {/* Step 1: Basic Information */}
                                    {step === 1 && (
                                        <UnifiedCard
                                            title="Basic Information"
                                            subtitle="General details about the position"
                                            contentClassName="pt-6"
                                        >
                                            <div className="space-y-6">
                                                <div className="grid gap-6 md:grid-cols-2">
                                                    <FormField
                                                        control={form.control}
                                                        name="title"
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-2 md:col-span-1">
                                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Job Title</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="e.g. Senior Accountant" {...field} className="h-12 rounded-xl border-slate-200 focus:ring-primary/20" />
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
                                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Open Positions</FormLabel>
                                                                <FormControl>
                                                                    <Input type="number" min={1} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} className="h-12 rounded-xl border-slate-200 focus:ring-primary/20" />
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
                                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Closing Date</FormLabel>
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
                                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-auto min-h-12 py-3 rounded-xl border-slate-200 focus:ring-primary/20">
                                                                            <SelectValue placeholder="Select status" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent className="rounded-xl">
                                                                        <SelectItem value="open">Open</SelectItem>
                                                                        <SelectItem value="closed">Closed</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                                    <FormField
                                                        control={form.control}
                                                        name="description"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</FormLabel>
                                                                <FormControl>
                                                                    <Textarea
                                                                        className="min-h-[120px] resize-y rounded-2xl border-slate-200 p-4 focus:ring-primary/20"
                                                                        placeholder="Provide a detailed job description..."
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </UnifiedCard>
                                    )}

                                    {/* Step 2: Organization */}
                                    {step === 2 && (
                                        <UnifiedCard
                                            title="Organization & Grading"
                                            subtitle="Assign the vacancy to a department and job group"
                                            contentClassName="pt-6"
                                        >
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="departmentId"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Department</FormLabel>
                                                            <Select
                                                                onValueChange={(val) => field.onChange(Number(val))}
                                                                value={field.value?.toString()}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger className="h-auto min-h-12 py-3 rounded-xl border-slate-200 focus:ring-primary/20">
                                                                        <SelectValue placeholder={isLoadingDepartments ? "Loading..." : "Select Department"} />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="rounded-xl">
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
                                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Job Group</FormLabel>
                                                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-auto min-h-12 py-3 rounded-xl border-slate-200 focus:ring-primary/20">
                                                                        <SelectValue placeholder={isLoadingJobGroups ? "Loading..." : "Select Job Group"} />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="rounded-xl">
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
                                            </div>
                                        </UnifiedCard>
                                    )}

                                    {/* Step 3: Requirements */}
                                    {step === 3 && (
                                        <UnifiedCard
                                            title="Requirements"
                                            subtitle="Qualifications and skills needed"
                                            contentClassName="pt-6"
                                        >
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-sm font-bold">Requirements</h4>
                                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Add all required qualifications and skills</p>
                                                    </div>
                                                    <Button type="button" variant="outline" size="sm" onClick={() => appendReq({ value: "" })} className="rounded-xl h-9 border-primary/20 text-primary hover:bg-primary/5">
                                                        <Plus className="mr-2 h-4 w-4" /> Add Requirement
                                                    </Button>
                                                </div>
                                                <div className="grid gap-3">
                                                    {reqFields.map((field, index) => (
                                                        <div key={field.id} className="flex gap-2 group animate-in slide-in-from-left-2 duration-300">
                                                            <FormField
                                                                control={form.control}
                                                                name={`jobRequirements.${index}.value`}
                                                                render={({ field }) => (
                                                                    <FormItem className="flex-1">
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 w-4">
                                                                                    {index + 1}
                                                                                </span>
                                                                                <Input placeholder={`Requirement ${index + 1}`} {...field} className="pl-10 h-11 rounded-xl border-slate-200 focus-visible:ring-primary/20" />
                                                                            </div>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeReq(index)} disabled={reqFields.length === 1} className="h-11 w-11 rounded-xl text-slate-400 hover:text-destructive hover:bg-destructive/5 transition-all">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </UnifiedCard>
                                    )}

                                    {/* Step 4: Responsibilities */}
                                    {step === 4 && (
                                        <UnifiedCard
                                            title="Responsibilities"
                                            subtitle="Key duties and expectations"
                                            contentClassName="pt-6"
                                        >
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-sm font-bold">Responsibilities</h4>
                                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">List the key duties for this role</p>
                                                    </div>
                                                    <Button type="button" variant="outline" size="sm" onClick={() => appendResp({ value: "" })} className="rounded-xl h-9 border-primary/20 text-primary hover:bg-primary/5">
                                                        <Plus className="mr-2 h-4 w-4" /> Add Responsibility
                                                    </Button>
                                                </div>
                                                <div className="grid gap-3">
                                                    {respFields.map((field, index) => (
                                                        <div key={field.id} className="flex gap-2 group animate-in slide-in-from-left-2 duration-300">
                                                            <FormField
                                                                control={form.control}
                                                                name={`jobResponsibilities.${index}.value`}
                                                                render={({ field }) => (
                                                                    <FormItem className="flex-1">
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 w-4">
                                                                                    {index + 1}
                                                                                </span>
                                                                                <Input placeholder={`Responsibility ${index + 1}`} {...field} className="pl-10 h-11 rounded-xl border-slate-200 focus-visible:ring-primary/20" />
                                                                            </div>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeResp(index)} disabled={respFields.length === 1} className="h-11 w-11 rounded-xl text-slate-400 hover:text-destructive hover:bg-destructive/5 transition-all">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </UnifiedCard>
                                    )}

                                    {/* Navigation Footer */}
                                    <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100 dark:border-slate-800">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={step === 1 ? () => router.back() : prevStep}
                                            className="text-slate-500 hover:text-slate-900 font-bold uppercase tracking-widest text-xs"
                                        >
                                            {step === 1 ? "Discard Changes" : "Previous Step"}
                                        </Button>

                                        <div className="flex gap-4">
                                            {step < 4 ? (
                                                <Button
                                                    type="button"
                                                    onClick={nextStep}
                                                    className="rounded-2xl px-10 h-12 shadow-lg shadow-primary/20 font-bold group"
                                                >
                                                    Next Step
                                                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="rounded-2xl px-12 h-12 shadow-xl shadow-primary/25 font-bold animate-pulse hover:animate-none"
                                                >
                                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    {mode === "create" ? "Publish Vacancy" : "Save Changes"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Form>
    )
}
