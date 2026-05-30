'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as applicationApi from '@/lib/api/applications'
import { QUERY_KEYS } from '@/lib/constants'
import type {
    ApplicationFilters,
    CreateApplicationData,
    ReviewApplicationData,
    BulkStatusUpdateData
} from '@/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { AxiosError } from '@meru/shared'
import { trackApplicationSubmitted, trackFormError } from '@/lib/analytics'

// Helper function to extract error message from API response
function getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as AxiosError<{ error?: { message?: string } }>
        return axiosError.response?.data?.error?.message || fallback
    }
    return (error as Error).message || fallback
}

// --- Queries ---

export function useMyApplications(filters?: ApplicationFilters) {
    return useQuery({
        queryKey: [...QUERY_KEYS.MY_APPLICATIONS, filters],
        queryFn: () => applicationApi.getMyApplications(filters),
    })
}

export function useApplication(id: number) {
    return useQuery({
        queryKey: QUERY_KEYS.APPLICATION(id),
        queryFn: () => applicationApi.getApplication(id),
        enabled: !!id,
    })
}

// Admin query
export function useAllApplications(filters?: ApplicationFilters) {
    return useQuery({
        queryKey: [...QUERY_KEYS.APPLICATIONS, filters],
        queryFn: () => applicationApi.getAdminApplications(filters),
    })
}

// Alias for useAllApplications for consistency
export const useApplications = useAllApplications

export function useApplicationStats() {
    return useQuery({
        queryKey: ['application-stats'],
        queryFn: () => applicationApi.getApplicationStats(),
    })
}

// --- Mutations ---

export function useCreateApplication() {
    const router = useRouter()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ data }: { data: CreateApplicationData }) =>
            applicationApi.createApplication({ data }),
        onSuccess: (response) => {
            // Track application submission
            trackApplicationSubmitted(response.data.vacancyId)

            toast.success('Application submitted successfully', {
                description: 'Good luck with your job application!',
            })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_APPLICATIONS })
            // Maybe invalidate vacancies if we track "applied" status there
            router.push('/dashboard/applications')
        },
        onError: (error: unknown) => {
            // Track form errors
            trackFormError('application-form', error instanceof Error ? error.message : 'Unknown error')

            toast.error('Submission failed', {
                description: getErrorMessage(error, 'Could not submit application'),
            })
        },

    })
}

export function useReviewApplication() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ReviewApplicationData }) =>
            applicationApi.reviewApplication(id, data),
        onSuccess: (_, variables) => {
            toast.success('Application reviewed')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPLICATION(variables.id) })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPLICATIONS })
        },
        onError: (error: Error) => {
            toast.error('Review failed', {
                description: error.message,
            })
        },
    })
}

export function useBulkUpdateStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: BulkStatusUpdateData) => applicationApi.bulkUpdateStatus(data),
        onSuccess: () => {
            toast.success('Applications updated')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPLICATIONS })
        },
        onError: (error: Error) => {
            toast.error('Update failed', {
                description: error.message,
            })
        },
    })
}

export function useExportApplications() {
    return useMutation({
        mutationFn: (filters?: ApplicationFilters) => applicationApi.exportApplications(filters),
        onSuccess: (data) => {
            const url = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `applicants_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
            window.URL.revokeObjectURL(url);
            toast.success('Export downloaded successfully');
        },
        onError: (error: Error) => {
            toast.error('Export failed', {
                description: error.message,
            })
        },
    })
}
