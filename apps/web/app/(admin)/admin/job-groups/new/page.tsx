"use client"

import { JobGroupForm } from "@/components/admin/job-group-form"

export default function CreateJobGroupPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Create Job Group</h2>
            </div>
            <JobGroupForm mode="create" />
        </div>
    )
}
