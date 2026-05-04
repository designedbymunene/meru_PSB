import apiClient from './client'
import type { ApiResponse, JobGroup, CreateJobGroupData } from '@/types'

export async function getJobGroups(): Promise<ApiResponse<JobGroup[]>> {
    const { data } = await apiClient.get<ApiResponse<JobGroup[]>>('/job-groups')
    return data
}

export async function createJobGroup(data: CreateJobGroupData): Promise<ApiResponse<JobGroup>> {
    const { data: response } = await apiClient.post<ApiResponse<JobGroup>>('/job-groups', data)
    return response
}

export async function updateJobGroup(id: number, data: Partial<CreateJobGroupData>): Promise<ApiResponse<JobGroup>> {
    const { data: response } = await apiClient.put<ApiResponse<JobGroup>>(`/job-groups/${id}`, data)
    return response
}

export async function deleteJobGroup(id: number): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/job-groups/${id}`)
    return data
}
