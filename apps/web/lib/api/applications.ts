import apiClient from './client'
import type {
    ApiResponse,
    Application,
    ApplicationWithRelations,
    CreateApplicationData,
    ApplicationFilters,
    ReviewApplicationData,
    BulkStatusUpdateData,
} from '@/types'

// Create new application
// Note: We use FormData for file upload
export async function createApplication(
    { data }: { data: CreateApplicationData }
): Promise<ApiResponse<Application>> {
    const formData = new FormData()

    // Append standard fields
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, String(value))
        }
    })



    const { data: response } = await apiClient.post<ApiResponse<Application>>(
        '/applications',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    )
    return response
}

// Get all applications (Admin) or filtered list
export async function getApplications(
    filters?: ApplicationFilters
): Promise<ApiResponse<ApplicationWithRelations[]>> {
    const { data } = await apiClient.get<ApiResponse<ApplicationWithRelations[]>>(
        '/applications',
        { params: filters }
    )
    return data
}

// Get user's own applications
export async function getMyApplications(filters?: ApplicationFilters): Promise<ApiResponse<ApplicationWithRelations[]>> {
    const { data } = await apiClient.get<ApiResponse<ApplicationWithRelations[]>>(
        '/applications/me',
        { params: filters }
    )
    return data
}

// Get single application
export async function getApplication(
    id: number | string
): Promise<ApiResponse<ApplicationWithRelations>> {
    const { data } = await apiClient.get<ApiResponse<ApplicationWithRelations>>(
        `/applications/${id}`
    )
    return data
}

// Admin: Review application
export async function reviewApplication(
    id: number | string,
    reviewData: ReviewApplicationData
): Promise<ApiResponse<Application>> {
    const { data } = await apiClient.post<ApiResponse<Application>>(
        `/applications/${id}/review`,
        reviewData
    )
    return data
}

// Admin: Bulk update status
export async function bulkUpdateStatus(
    updateData: BulkStatusUpdateData
): Promise<ApiResponse<{ message: string; count: number }>> {
    const { data } = await apiClient.post<ApiResponse<{ message: string; count: number }>>(
        '/applications/bulk-status',
        updateData
    )
    return data
}

// Admin: Export applications CSV
export async function exportApplications(
    filters?: ApplicationFilters
): Promise<Blob> {
    const { data } = await apiClient.get<Blob>(
        '/applications/admin/export',
        {
            params: filters,
            responseType: 'blob'
        }
    )
    return data
}

