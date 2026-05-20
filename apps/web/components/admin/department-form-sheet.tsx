"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useCreateDepartment, useUpdateDepartment } from "@/hooks/use-departments"
import { useEffect } from "react"

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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Loader2 } from "lucide-react"
import { Department, CreateDepartmentData } from "@/types"

const departmentSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    status: z.enum(["active", "inactive"]),
})

type DepartmentFormValues = z.infer<typeof departmentSchema>

interface DepartmentFormSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    department?: Department | null
}

export function DepartmentFormSheet({ open, onOpenChange, department }: DepartmentFormSheetProps) {
    const createDepartment = useCreateDepartment()
    const updateDepartment = useUpdateDepartment()

    const defaultValues: Partial<DepartmentFormValues> = department
        ? {
            name: department.name,
            description: department.description || "",
            status: department.status,
        }
        : {
            name: "",
            description: "",
            status: "active",
        }

    const form = useForm<DepartmentFormValues>({
        resolver: zodResolver(departmentSchema),
        defaultValues,
    })

    useEffect(() => {
        if (department) {
            form.reset({
                name: department.name,
                description: department.description || "",
                status: department.status,
            })
        } else {
            form.reset({
                name: "",
                description: "",
                status: "active",
            })
        }
    }, [department, form])

    const onSubmit = (data: DepartmentFormValues) => {
        const formattedData: CreateDepartmentData = {
            ...data,
            description: data.description || undefined
        }

        if (department) {
            updateDepartment.mutate({ id: department.id, data: formattedData })
        } else {
            createDepartment.mutate(formattedData)
        }
        onOpenChange(false)
    }

    const isSubmitting = createDepartment.isPending || updateDepartment.isPending

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full border-l border-slate-200 dark:border-l-slate-800 bg-white dark:bg-slate-950">
                <SheetHeader className="p-6 border-b border-slate-100 dark:border-slate-800 text-left">
                    <SheetTitle className="text-2xl font-bold tracking-tight">
                        {department ? "Edit Department" : "Create Department"}
                    </SheetTitle>
                    <SheetDescription className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        {department
                            ? "Update the department details below."
                            : "Fill in the details to create a new department."}
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-xs font-semibold text-slate-600">Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Accounting Services" className="h-12 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-xs font-semibold text-slate-600">Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Brief description..."
                                                className="resize-none rounded-xl"
                                                rows={3}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-xs font-semibold text-slate-600">Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 rounded-xl">
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
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex gap-3 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] mt-auto">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-13 rounded-2xl font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-[2] h-13 rounded-2xl font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {department ? "Save Changes" : "Create Department"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
