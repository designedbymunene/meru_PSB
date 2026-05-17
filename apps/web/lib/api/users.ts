import apiClient from './client'
import type { ApiResponse, User } from '@meru/shared'

// Get all users (for panel member selection)
export async function getUsers(): Promise<ApiResponse<User[]>> {
    const { data } = await apiClient.get<ApiResponse<User[]>>('/users')
    return data
}
