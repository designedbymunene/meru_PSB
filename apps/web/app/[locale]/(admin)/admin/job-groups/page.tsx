import { getJobGroupsServer } from "@/lib/api/job-groups-server"
import { JobGroupsClient } from "./job-groups-client"

export const dynamic = 'force-dynamic'

export default async function JobGroupsPage() {
    const initialData = await getJobGroupsServer().catch((err) => {
        console.error("Failed to fetch job groups on server:", err)
        return { success: false, data: [] }
    })

    return <JobGroupsClient initialData={initialData} />
}
