'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as boardApi from '@/lib/api/board'
import { toast } from 'sonner'

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
