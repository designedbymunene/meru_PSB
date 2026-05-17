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

// Get my interviews (for panel members)
export async function getMyInterviews(): Promise<ApiResponse<InterviewWithRelations[]>> {
    const { data: response } = await apiClient.get<ApiResponse<InterviewWithRelations[]>>(
        '/interviews/my-interviews'
    )
    return response
}
