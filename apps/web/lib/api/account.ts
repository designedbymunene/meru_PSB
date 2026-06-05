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
    const { data } = await apiClient.get<ApiResponse<any>>('/account/sessions')
    
    if (data && data.data && Array.isArray((data.data as any).data)) {
        return { ...data, data: (data.data as any).data } as ApiResponse<ActiveSession[]>
    }
    
    return data as ApiResponse<ActiveSession[]>
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

export interface AuditLog {
    id: number
    action: string
    targetType: string
    targetId: number
    previousState: any
    newState: any
    ipAddress: string | null
    userAgent: string | null
    createdAt: string
}

export interface AuditLogsResponse {
    logs: AuditLog[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
    }
}

export interface AuditLogsParams {
    page?: number
    limit?: number
    action?: string
}

export async function getAuditLogs(params?: AuditLogsParams): Promise<ApiResponse<AuditLogsResponse>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.action) searchParams.set('action', params.action)

    const queryString = searchParams.toString()
    const url = `/account/audit-logs${queryString ? `?${queryString}` : ''}`

    const { data } = await apiClient.get<ApiResponse<AuditLogsResponse>>(url)
    return data
}

export async function uploadAvatar(file: File): Promise<ApiResponse<{ avatar: string }>> {
    const formData = new FormData()
    formData.append('avatar', file)
    const { data } = await apiClient.post<ApiResponse<{ avatar: string }>>('/account/avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    return data
}

export async function deleteAvatar(): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete<ApiResponse<null>>('/account/avatar')
    return data
}
