import apiClient from './client'
import type { ApiResponse } from '@/types'

export interface SecuritySettings {
    twoFactorEnabled: boolean
    passwordLastChanged: string
    activeSessions: number
    currentDevice: string
}

export interface ActiveSession {
    id: number
    userId: number
    deviceName: string | null
    deviceType: string | null
    os: string | null
    browser: string | null
    ipAddress: string | null
    lastActive: string
    isCurrent: boolean
    createdAt: string
}

export async function getSecuritySettings(): Promise<ApiResponse<SecuritySettings>> {
    const { data } = await apiClient.get<ApiResponse<SecuritySettings>>('/account/security')
    return data
}

export async function getActiveSessions(): Promise<ApiResponse<ActiveSession[]>> {
    const { data } = await apiClient.get<ApiResponse<ActiveSession[]>>('/account/sessions')
    return data
}

export async function toggle2FA(enabled: boolean): Promise<ApiResponse<{ enabled: boolean }>> {
    const { data } = await apiClient.post<ApiResponse<{ enabled: boolean }>>('/account/2fa/toggle', { enabled })
    return data
}

export async function revokeSession(id?: number): Promise<ApiResponse<null>> {
    const url = id ? `/account/sessions/${id}` : '/account/sessions'
    const { data } = await apiClient.delete<ApiResponse<null>>(url)
    return data
}

export async function updatePassword(passwords: any): Promise<ApiResponse<null>> {
    const { data } = await apiClient.put<ApiResponse<null>>('/account/password', passwords)
    return data
}
