"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "@/i18n/routing"
import { useCreateDepartment, useUpdateDepartment } from "@/hooks/use-departments"

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
import { Department, CreateDepartmentData } from "@/types"

const departmentSchema = z.object({
    name: z.string().min(1, "Name is required"),

    description: z.string().optional(),
    status: z.enum(["active", "inactive"]),
})

type DepartmentFormValues = z.infer<typeof departmentSchema>

interface DepartmentFormProps {
    initialData?: Department
    mode: "create" | "edit"
}

export function DepartmentForm({ initialData, mode }: DepartmentFormProps) {
    const router = useRouter()
    const createDepartment = useCreateDepartment()
    const updateDepartment = useUpdateDepartment()


    const defaultValues: Partial<DepartmentFormValues> = initialData
        ? {
            name: initialData.name,

            description: initialData.description || "",
            status: initialData.status,
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

    const onSubmit = (data: DepartmentFormValues) => {
        const formattedData: CreateDepartmentData = {
            ...data,
            description: data.description || undefined
        }

        if (mode === "create") {
            createDepartment.mutate(formattedData)
        } else if (initialData) {
            updateDepartment.mutate({ id: initialData.id, data: formattedData })
        }
    }

    const isSubmitting = createDepartment.isPending || updateDepartment.isPending

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Department Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                        {mode === "create" ? "Create Department" : "Save Changes"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
