import serverApiClient from './server-client'
import type { ApiResponse, ApplicantProfileWithRelations, ApplicantDocument } from '@/types'

export async function getMyProfileServer(): Promise<ApiResponse<ApplicantProfileWithRelations>> {
    const { data } = await serverApiClient.get<ApiResponse<ApplicantProfileWithRelations>>(
        '/applicant-profiles/me'
    )
    return data
}

export async function getMyRefereesServer(): Promise<ApiResponse<any[]>> {
    const { data } = await serverApiClient.get<ApiResponse<any[]>>(
        '/applicant-profiles/me/referees'
    )
    return data
}

export async function getMyDocumentsServer(): Promise<ApiResponse<ApplicantDocument[]>> {
    const { data } = await serverApiClient.get<ApiResponse<ApplicantDocument[]>>(
        '/account/documents'
    )
    return data
}
