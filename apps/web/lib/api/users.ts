import apiClient from './client'
import type { ApiResponse, User } from '@meru/shared'

// Get all users (for panel member selection)
export async function getUsers(): Promise<ApiResponse<User[]>> {
    const { data } = await apiClient.get<ApiResponse<any>>('/users')
    
    // The backend returns a paginated structure: { data: { data: User[], pagination: ... } }
    // We need to unwrap the inner data array so that components calling map/filter don't crash.
    if (data && data.data && Array.isArray((data.data as any).data)) {
        return { ...data, data: (data.data as any).data } as ApiResponse<User[]>
    }
    
    return data as ApiResponse<User[]>
}

export async function deleteUser(userId: number): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/users/${userId}`)
    return data
}

export async function generateTempPassword(userId: number): Promise<ApiResponse<{ tempPassword: string }>> {
    const { data } = await apiClient.post<ApiResponse<{ tempPassword: string }>>(`/users/${userId}/temp-password`)
    return data
}
