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
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{department ? "Edit Department" : "Create Department"}</SheetTitle>
                    <SheetDescription>
                        {department
                            ? "Update the department details below."
                            : "Fill in the details to create a new department."}
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Accounting Services" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Brief description..."
                                            className="resize-none"
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

                        <SheetFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {department ? "Save Changes" : "Create Department"}
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
