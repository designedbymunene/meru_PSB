import apiClient from './client'
import type { ApiResponse } from '@/types'

export interface DashboardData {
    quickStats: {
        applied: number
        shortlisted: number
        interviews: number
        saved: number
    }
    ongoingActivity: {
        id: string
        status: string
        progress: number
        nextStep: string
        vacancy: {
            title: string
            refNumber: string
            department: {
                name: string | null
            } | null
        }
    } | null
    recommended: Array<{
        id: string
        title: string
        description: string
        status: string
        badge: string
        jobGroup: {
            code: string | null
        }
        department: {
            name: string | null
        } | null
        vacancyCount: number
        deadline: string
    }>
}

export async function getDashboardData(): Promise<ApiResponse<DashboardData>> {
    const { data } = await apiClient.get<ApiResponse<DashboardData>>('/dashboard')
    return data
}
