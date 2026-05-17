import apiClient from './client'
import type {
    ApiResponse,
    ShortlistCriteria,
    ShortlistResult,
    CreateShortlistCriteriaInput
} from '@meru/shared'

// Set shortlisting criteria for a vacancy
export async function setShortlistCriteria(
    data: CreateShortlistCriteriaInput
): Promise<ApiResponse<ShortlistCriteria>> {
    const { data: response } = await apiClient.post<ApiResponse<ShortlistCriteria>>(
        '/shortlisting/criteria',
        data
    )
    return response
}

// Get shortlisting criteria for a vacancy
export async function getShortlistCriteria(
    vacancyId: number
): Promise<ApiResponse<ShortlistCriteria>> {
    const { data: response } = await apiClient.get<ApiResponse<ShortlistCriteria>>(
        `/shortlisting/${vacancyId}/criteria`
    )
    return response
}

// Run shortlisting process for a vacancy
export async function runShortlisting(
    vacancyId: number
): Promise<ApiResponse<ShortlistResult>> {
    const { data: response } = await apiClient.post<ApiResponse<ShortlistResult>>(
        `/shortlisting/${vacancyId}/run`
    )
    return response
}
