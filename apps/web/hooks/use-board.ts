'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as boardApi from '@/lib/api/board'
import { toast } from 'sonner'

export function useBoardPack() {
    return useMutation({
        mutationFn: (vacancyId: number) => boardApi.generateBoardPack(vacancyId),
        onSuccess: (blob, vacancyId) => {
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `board-pack-${vacancyId}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            toast.success('Board pack downloaded successfully')
        },
        onError: (error: Error) => {
            toast.error('Failed to generate board pack', {
                description: error.message,
            })
        },
    })
}

export function useBoardResolution() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: boardApi.recordResolution,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board-resolutions'] })
            toast.success('Resolution recorded successfully')
        },
        onError: (error: Error) => {
            toast.error('Failed to record resolution', {
                description: error.message,
            })
        },
    })
}

export function useResolutions() {
    return useQuery({
        queryKey: ['board-resolutions'],
        queryFn: () => boardApi.fetchResolutions(),
    })
}
