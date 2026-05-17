import apiClient from './client'
import type { ApiResponse, BoardResolution, BoardResolutionInput } from '@meru/shared'

export async function generateBoardPack(vacancyId: number): Promise<Blob> {
    const { data } = await apiClient.get(`/board/pack/${vacancyId}`, {
        responseType: 'blob'
    })
    return data
}

export async function recordResolution(input: BoardResolutionInput): Promise<ApiResponse<BoardResolution>> {
    const { data } = await apiClient.post<ApiResponse<BoardResolution>>('/board/resolution', input)
    return data
}

export async function fetchResolutions(): Promise<ApiResponse<BoardResolution[]>> {
    const { data } = await apiClient.get<ApiResponse<BoardResolution[]>>('/board/resolutions')
    return data
}
