"use client"

import { DepartmentForm } from "@/components/admin/department-form"

export default function CreateDepartmentPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Create Department</h2>
            </div>
            <DepartmentForm mode="create" />
        </div>
    )
}
