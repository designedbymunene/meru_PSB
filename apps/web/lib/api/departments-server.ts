import serverApiClient from './server-client'
import type { ApiResponse, Department } from '@/types'

export async function getDepartmentsServer(): Promise<ApiResponse<Department[]>> {
    const { data } = await serverApiClient.get<ApiResponse<Department[]>>('/departments')
    return data
}
