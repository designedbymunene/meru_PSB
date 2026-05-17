'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as shortlistingApi from '@/lib/api/shortlisting'
import { QUERY_KEYS } from '@/lib/constants'
import type { CreateShortlistCriteriaInput } from '@meru/shared'
import { toast } from 'sonner'
import type { AxiosError } from '@meru/shared'

function getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as AxiosError<{ error?: { message?: string } }>
        return axiosError.response?.data?.error?.message || fallback
    }
    return (error as Error).message || fallback
}

// Queries

export function useShortlistCriteria(vacancyId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.SHORTLIST_CRITERIA(vacancyId),
        queryFn: () => shortlistingApi.getShortlistCriteria(vacancyId),
        enabled: !!vacancyId,
        retry: false,
    })
}

export function useShortlistResults(vacancyId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.SHORTLIST_RESULTS(vacancyId),
        queryFn: () => shortlistingApi.runShortlisting(vacancyId),
        enabled: false,
    })
}

// Mutations

export function useSetShortlistCriteria() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateShortlistCriteriaInput) =>
            shortlistingApi.setShortlistCriteria(data),
        onSuccess: (_, variables) => {
            toast.success('Shortlisting criteria saved successfully')
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.SHORTLIST_CRITERIA(variables.vacancyId)
            })
        },
        onError: (error: unknown) => {
            toast.error('Failed to save criteria', {
                description: getErrorMessage(error, 'Could not save shortlisting criteria'),
            })
        },
    })
}

export function useRunShortlisting() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (vacancyId: number) =>
            shortlistingApi.runShortlisting(vacancyId),
        onSuccess: (data) => {
            const processed = data.data?.processed || 0
            const shortlisted = data.data?.shortlisted || 0
            toast.success('Shortlisting completed', {
                description: `${processed} applications processed, ${shortlisted} shortlisted`,
            })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPLICATIONS })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHORTLIST_RESULTS(data.data?.vacancyId || 0) })
        },
        onError: (error: unknown) => {
            toast.error('Shortlisting failed', {
                description: getErrorMessage(error, 'Could not complete shortlisting process'),
            })
        },
    })
}
