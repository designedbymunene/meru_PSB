import serverApiClient from './server-client'
import type {
    ApiResponse,
    VacancyWithRelations,
    VacancyFilters,
    VacancyDocument
} from '@/types'

// List vacancies with filters on the server
export async function getVacanciesServer(
    filters?: VacancyFilters
): Promise<ApiResponse<VacancyWithRelations[]>> {
    const { data } = await serverApiClient.get<ApiResponse<any>>(
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

// Get single vacancy details on the server
export async function getVacancyServer(
    id: number | string
): Promise<ApiResponse<VacancyWithRelations>> {
    const { data } = await serverApiClient.get<ApiResponse<VacancyWithRelations>>(
        `/vacancies/${id}`
    )
    return data
}

// List PDF documents for a vacancy on the server
export async function getVacancyPdfsServer(
    id: number | string
): Promise<ApiResponse<VacancyDocument[]>> {
    const { data } = await serverApiClient.get<ApiResponse<VacancyDocument[]>>(
        `/vacancies/${id}/pdfs`
    )
    return data
}
