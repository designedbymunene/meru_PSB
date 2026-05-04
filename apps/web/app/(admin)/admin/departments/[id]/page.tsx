"use client"

import { DepartmentForm } from "@/components/admin/department-form"
import { useDepartments } from "@/hooks/use-departments"
import { Skeleton } from "@/components/ui/skeleton"
import { use } from "react"

export default function EditDepartmentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data, isLoading } = useDepartments()

    // Similar simplified fetching logic
    const department = data?.data.find(d => d.id === parseInt(id, 10))

    if (isLoading) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-[200px] w-full" />
            </div>
        )
    }

    if (!department) {
        return <div className="p-8">Department not found</div>
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Edit Department</h2>
            </div>
            <DepartmentForm mode="edit" initialData={department} />
        </div>
    )
}
