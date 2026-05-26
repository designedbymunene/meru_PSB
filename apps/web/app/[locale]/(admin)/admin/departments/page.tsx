import { getDepartmentsServer } from "@/lib/api/departments-server"
import { DepartmentsClient } from "./departments-client"

export const dynamic = 'force-dynamic'

export default async function DepartmentsPage() {
    const initialData = await getDepartmentsServer().catch((err) => {
        console.error("Failed to fetch departments on server:", err)
        return { success: false, data: [] }
    })

    return <DepartmentsClient initialData={initialData} />
}
