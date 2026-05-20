import apiClient from './client'
import type {
    ApiResponse,
    Interview,
    InterviewWithRelations,
    InterviewResults,
    ScheduleInterviewInput,
    SubmitInterviewScoreInput
} from '@meru/shared'

// Schedule an interview
export async function scheduleInterview(
    data: ScheduleInterviewInput
): Promise<ApiResponse<Interview>> {
    const { data: response } = await apiClient.post<ApiResponse<Interview>>(
        '/interviews/schedule',
        data
    )
    return response
}

// Submit interview score
export async function submitInterviewScore(
    interviewId: number,
    data: SubmitInterviewScoreInput
): Promise<ApiResponse<Interview>> {
    const { data: response } = await apiClient.post<ApiResponse<Interview>>(
        `/interviews/${interviewId}/score`,
        data
    )
    return response
}

// Get interview results for a vacancy
export async function getInterviewResults(
    vacancyId: number
): Promise<ApiResponse<InterviewResults>> {
    const { data: response } = await apiClient.get<ApiResponse<InterviewResults>>(
        `/interviews/${vacancyId}/results`
    )
    return response
}

// Admin: Get interview by ID
export async function getInterviewAdmin(
    id: number
): Promise<ApiResponse<InterviewWithRelations>> {
    const { data: response } = await apiClient.get<ApiResponse<InterviewWithRelations>>(
        `/interviews/admin/${id}`
    )
    return response
}

// Admin: Update interview status
export async function updateInterviewStatus(
    id: number,
    status: string
): Promise<ApiResponse<Interview>> {
    const { data: response } = await apiClient.patch<ApiResponse<Interview>>(
        `/interviews/admin/${id}/status`,
        { status }
    )
    return response
}

// Admin: Reschedule interview
export async function rescheduleInterview(
    id: number,
    data: { scheduledAt: string; venue: string; virtualLink?: string }
): Promise<ApiResponse<Interview>> {
    const { data: response } = await apiClient.patch<ApiResponse<Interview>>(
        `/interviews/admin/${id}/reschedule`,
        data
    )
    return response
}

// Admin: Get vacancy panel data
export async function getVacancyPanel(
    vacancyId: number
): Promise<ApiResponse<any[]>> {
    const { data: response } = await apiClient.get<ApiResponse<any[]>>(
        `/interviews/admin/${vacancyId}/panel`
    )
    return response
}

// Admin: Bulk schedule interviews
export async function bulkScheduleInterviews(
    data: {
        vacancyId: number,
        applicationIds: number[],
        startAt: string,
        durationMinutes: number,
        gapMinutes: number,
        venue: string,
        virtualLink?: string,
        panelMembers: number[]
    }
): Promise<ApiResponse<Interview[]>> {
    const { data: response } = await apiClient.post<ApiResponse<Interview[]>>(
        '/interviews/bulk-schedule',
        data
    )
    return response
}

// Admin: Get vacancy default panel members
export async function getDefaultPanel(
    vacancyId: number
): Promise<ApiResponse<any[]>> {
    const { data: response } = await apiClient.get<ApiResponse<any[]>>(
        `/interviews/admin/${vacancyId}/default-panel`
    )
    return response
}

// Admin: Set vacancy default panel members
export async function setDefaultPanel(
    vacancyId: number,
    userIds: number[]
): Promise<ApiResponse<any>> {
    const { data: response } = await apiClient.post<ApiResponse<any>>(
        `/interviews/admin/${vacancyId}/default-panel`,
        { userIds }
    )
    return response
}

// Admin: Get vacancy interview criteria
export async function getInterviewCriteria(
    vacancyId: number
): Promise<ApiResponse<any[]>> {
    const { data: response } = await apiClient.get<ApiResponse<any[]>>(
        `/interviews/admin/${vacancyId}/criteria`
    )
    return response
}

// Admin: Set vacancy interview criteria
export async function setInterviewCriteria(
    vacancyId: number,
    criteria: { name: string, maxScore: number, description?: string }[]
): Promise<ApiResponse<any>> {
    const { data: response } = await apiClient.post<ApiResponse<any>>(
        `/interviews/admin/${vacancyId}/criteria`,
        { criteria }
    )
    return response
}

// Get my interviews (for panel members)
export async function getMyInterviews(): Promise<ApiResponse<InterviewWithRelations[]>> {
    const { data: response } = await apiClient.get<ApiResponse<InterviewWithRelations[]>>(
        '/interviews/my-interviews'
    )
    return response
}
