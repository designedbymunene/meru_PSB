import apiClient from './client'

export type ApiResponse<T> = {
    success: boolean
    data: T
    message?: string
}

export type DownloadCategory = {
    id: number
    title: string
    description: string
    icon: string
    order: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export type DownloadFile = {
    id: number
    categoryId: number
    name: string
    description: string
    url: string
    fileSize: string
    updatedDate: string
    order: number
    isActive: boolean
    downloadCount: number
    createdAt: string
    updatedAt: string
}

export type CategoryWithFiles = DownloadCategory & {
    files: DownloadFile[]
}

// ============ CATEGORIES ============

export async function getDownloadCategories(activeOnly?: boolean): Promise<ApiResponse<DownloadCategory[]>> {
    const url = activeOnly ? '/downloads/categories?active=true' : '/downloads/categories'
    const { data } = await apiClient.get<ApiResponse<DownloadCategory[]>>(url)
    return data
}

export async function getDownloadCategory(id: number): Promise<ApiResponse<CategoryWithFiles>> {
    const { data } = await apiClient.get<ApiResponse<CategoryWithFiles>>(`/downloads/categories/${id}`)
    return data
}

export async function createDownloadCategory(data: {
    title: string
    description: string
    icon?: string
    order?: number
    isActive?: boolean
}): Promise<ApiResponse<DownloadCategory>> {
    const { data: response } = await apiClient.post<ApiResponse<DownloadCategory>>('/downloads/categories', data)
    return response
}

export async function updateDownloadCategory(id: number, data: Partial<{
    title: string
    description: string
    icon: string
    order: number
    isActive: boolean
}>): Promise<ApiResponse<DownloadCategory>> {
    const { data: response } = await apiClient.put<ApiResponse<DownloadCategory>>(`/downloads/categories/${id}`, data)
    return response
}

export async function deleteDownloadCategory(id: number): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/downloads/categories/${id}`)
    return data
}

// ============ FILES ============

export async function getDownloadFiles(categoryId?: number, activeOnly?: boolean): Promise<ApiResponse<DownloadFile[]>> {
    const params = new URLSearchParams()
    if (categoryId) params.append('categoryId', categoryId.toString())
    if (activeOnly) params.append('active', 'true')

    const url = `/downloads/files?${params.toString()}`
    const { data } = await apiClient.get<ApiResponse<DownloadFile[]>>(url)
    return data
}

export async function getDownloadFile(id: number): Promise<ApiResponse<DownloadFile & { category: DownloadCategory }>> {
    const { data } = await apiClient.get<ApiResponse<DownloadFile & { category: DownloadCategory }>>(`/downloads/files/${id}`)
    return data
}

export async function createDownloadFile(
    file: File,
    data: {
        categoryId: number
        name: string
        description: string
        order?: number
        isActive?: boolean
    }
): Promise<ApiResponse<DownloadFile>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('categoryId', data.categoryId.toString())
    formData.append('name', data.name)
    formData.append('description', data.description)
    if (data.order !== undefined) formData.append('order', data.order.toString())
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString())

    const { data: response } = await apiClient.post<ApiResponse<DownloadFile>>(
        '/downloads/files', 
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' }
        }
    )
    return response
}

export async function updateDownloadFile(
    id: number,
    data: Partial<{
        categoryId: number
        name: string
        description: string
        order: number
        isActive: boolean
    }>,
    file?: File
): Promise<ApiResponse<DownloadFile>> {
    const formData = new FormData()
    if (file) formData.append('file', file)
    if (data.categoryId !== undefined) formData.append('categoryId', data.categoryId.toString())
    if (data.name !== undefined) formData.append('name', data.name)
    if (data.description !== undefined) formData.append('description', data.description)
    if (data.order !== undefined) formData.append('order', data.order.toString())
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString())

    const { data: response } = await apiClient.put<ApiResponse<DownloadFile>>(
        `/downloads/files/${id}`, 
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' }
        }
    )
    return response
}

export async function deleteDownloadFile(id: number): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/downloads/files/${id}`)
    return data
}

// ============ ALL DOWNLOADS ============

export async function getDownloads(activeOnly?: boolean): Promise<ApiResponse<CategoryWithFiles[]>> {
    const url = activeOnly ? '/downloads?active=true' : '/downloads'
    const { data } = await apiClient.get<ApiResponse<CategoryWithFiles[]>>(url)
    return data
}
