import apiClient from './client'
import type {
    ApiResponse,
    Vacancy,
    VacancyWithRelations,
    VacancyFilters,
    VacancyDocument,
    CreateVacancyData,
    UpdateVacancyData
} from '@/types'

// List vacancies with filters
export async function getVacancies(
    filters?: VacancyFilters
): Promise<ApiResponse<VacancyWithRelations[]>> {
    const { data } = await apiClient.get<ApiResponse<any>>(
        '/vacancies',
        { params: filters }
    )
    
    // Normalize paginated response if necessary
    if (data.data && !Array.isArray(data.data) && Array.isArray(data.data.data)) {
        return {
            ...data,
            data: data.data.data
        }
    }
    
    return data
}

// Get vacancy stats
export async function getVacancyStats(): Promise<ApiResponse<{ totalVacancies: number; openVacancies: number; closedVacancies: number; totalOpenPositions: number; }>> {
    const { data } = await apiClient.get<ApiResponse<{ totalVacancies: number; openVacancies: number; closedVacancies: number; totalOpenPositions: number; }>>(
        '/vacancies/stats'
    )
    return data
}

// Get single vacancy details
export async function getVacancy(
    id: number | string
): Promise<ApiResponse<VacancyWithRelations>> {
    const { data } = await apiClient.get<ApiResponse<VacancyWithRelations>>(
        `/vacancies/${id}`
    )
    return data
}

// List PDF documents for a vacancy
export async function getVacancyPdfs(
    id: number | string
): Promise<ApiResponse<VacancyDocument[]>> {
    const { data } = await apiClient.get<ApiResponse<VacancyDocument[]>>(
        `/vacancies/${id}/pdfs`
    )
    return data
}

// Create vacancy
export async function createVacancy(
    data: CreateVacancyData
): Promise<ApiResponse<Vacancy>> {
    const { data: response } = await apiClient.post<ApiResponse<Vacancy>>(
        '/vacancies',
        data
    )
    return response
}

// Update vacancy
export async function updateVacancy(
    id: number | string,
    data: UpdateVacancyData
): Promise<ApiResponse<Vacancy>> {
    const { data: response } = await apiClient.put<ApiResponse<Vacancy>>(
        `/vacancies/${id}`,
        data
    )
    return response
}

// Delete vacancy
export async function deleteVacancy(
    id: number | string
): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/vacancies/${id}`)
    return data
}

// Upload PDF for vacancy
export async function uploadVacancyPdf(
    id: number | string,
    file: File
): Promise<ApiResponse<VacancyDocument>> {
    const formData = new FormData()
    formData.append('document', file)

    const { data } = await apiClient.post<ApiResponse<VacancyDocument>>(
        `/vacancies/${id}/pdf`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    )
    return data
}

// Delete PDF from vacancy
export async function deleteVacancyPdf(
    id: number | string,
    pdfId: number | string
): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
        `/vacancies/${id}/pdf/${pdfId}`
    )
    return data
}
