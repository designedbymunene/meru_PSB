import { getMyProfileServer, getMyRefereesServer, getMyDocumentsServer } from "@/lib/api/applicant-profiles-server"
import { ProfileClient } from "./profile-client"

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const profileData = await getMyProfileServer().catch((err) => {
        console.error("Failed to fetch profile on server:", err)
        return null
    })

    const refereesData = await getMyRefereesServer().catch((err) => {
        console.error("Failed to fetch referees on server:", err)
        return { success: false, data: [] }
    })

    const documentsData = await getMyDocumentsServer().catch((err) => {
        console.error("Failed to fetch documents on server:", err)
        return { success: false, data: [] }
    })

    return (
        <ProfileClient 
            initialProfile={profileData || undefined}
            initialReferees={refereesData || undefined}
            initialDocuments={documentsData || undefined}
        />
    )
}
