import apiClient from './client'
import type { ApiResponse, BoardResolution, BoardResolutionInput, BoardResolutionWithRelations } from '@meru/shared'

export async function recordResolution(input: BoardResolutionInput): Promise<ApiResponse<BoardResolution>> {
    const { data } = await apiClient.post<ApiResponse<BoardResolution>>('/board/resolution', input)
    return data
}

export async function fetchResolutions(): Promise<ApiResponse<BoardResolutionWithRelations[]>> {
    const { data } = await apiClient.get<ApiResponse<BoardResolutionWithRelations[]>>('/board/resolutions')
    return data
}
