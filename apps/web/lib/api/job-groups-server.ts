import serverApiClient from './server-client'
import type { ApiResponse, JobGroup } from '@/types'

export async function getJobGroupsServer(): Promise<ApiResponse<JobGroup[]>> {
    const { data } = await serverApiClient.get<ApiResponse<JobGroup[]>>('/job-groups')
    return data
}
