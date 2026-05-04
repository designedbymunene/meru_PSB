"use client"

import { JobGroupForm } from "@/components/admin/job-group-form"
import { useJobGroups } from "@/hooks/use-job-groups"
import { Skeleton } from "@/components/ui/skeleton"
import { use } from "react"

export default function EditJobGroupPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data, isLoading } = useJobGroups()

    const jobGroup = data?.data.find(jg => jg.id === parseInt(id, 10))

    if (isLoading) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-[200px] w-full" />
            </div>
        )
    }

    if (!jobGroup) {
        return <div className="p-8">Job Group not found</div>
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Edit Job Group</h2>
            </div>
            <JobGroupForm mode="edit" initialData={jobGroup} />
        </div>
    )
}
