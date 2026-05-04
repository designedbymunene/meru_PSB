import apiClient from './client'
import type { ApiResponse, Department, CreateDepartmentData } from '@/types'

export async function getDepartments(): Promise<ApiResponse<Department[]>> {
    const { data } = await apiClient.get<ApiResponse<Department[]>>('/departments')
    return data
}

export async function getDepartmentsByMinistry(ministryId: number): Promise<ApiResponse<Department[]>> {
    const { data } = await apiClient.get<ApiResponse<Department[]>>(`/departments?ministryId=${ministryId}`)
    return data
}

export async function createDepartment(data: CreateDepartmentData): Promise<ApiResponse<Department>> {
    const { data: response } = await apiClient.post<ApiResponse<Department>>('/departments', data)
    return response
}

export async function updateDepartment(id: number, data: Partial<CreateDepartmentData>): Promise<ApiResponse<Department>> {
    const { data: response } = await apiClient.put<ApiResponse<Department>>(`/departments/${id}`, data)
    return response
}

export async function deleteDepartment(id: number): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/departments/${id}`)
    return data
}
