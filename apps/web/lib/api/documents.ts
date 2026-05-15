import apiClient from './client'
import type { ApiResponse } from '@/types'

export interface ApplicantDocument {
    id: number
    userId: number
    documentType: string
    originalName: string
    filename: string
    filePath: string
    fileSize: number
    mimeType: string
    status: string
    rejectionReason?: string
    createdAt: string
}

export async function getMyDocuments(): Promise<ApiResponse<ApplicantDocument[]>> {
    const { data } = await apiClient.get<ApiResponse<ApplicantDocument[]>>(
        '/account/documents'
    )
    return data
}

export async function uploadDocument(
    file: File,
    documentType: string
): Promise<ApiResponse<ApplicantDocument>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', documentType)

    const { data } = await apiClient.post<ApiResponse<ApplicantDocument>>(
        '/account/documents/upload',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    )
    return data
}

export async function deleteDocument(id: number): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/account/documents/${id}`)
    return data
}
