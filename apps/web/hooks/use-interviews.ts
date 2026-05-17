'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as interviewsApi from '@/lib/api/interviews'
import { QUERY_KEYS } from '@/lib/constants'
import type { ScheduleInterviewInput, SubmitInterviewScoreInput } from '@meru/shared'
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

export function useMyInterviews() {
    return useQuery({
        queryKey: QUERY_KEYS.MY_INTERVIEWS,
        queryFn: () => interviewsApi.getMyInterviews(),
    })
}

export function useInterviewResults(vacancyId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.INTERVIEW_RESULTS(vacancyId),
        queryFn: () => interviewsApi.getInterviewResults(vacancyId),
        enabled: !!vacancyId,
    })
}

// Mutations

export function useScheduleInterview() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: ScheduleInterviewInput) =>
            interviewsApi.scheduleInterview(data),
        onSuccess: (_, variables) => {
            toast.success('Interview scheduled successfully')
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.VACANCY_INTERVIEWS(variables.vacancyId)
            })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPLICATIONS })
        },
        onError: (error: unknown) => {
            toast.error('Failed to schedule interview', {
                description: getErrorMessage(error, 'Could not schedule interview'),
            })
        },
    })
}

export function useSubmitInterviewScore() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ interviewId, data }: { interviewId: number; data: SubmitInterviewScoreInput }) =>
            interviewsApi.submitInterviewScore(interviewId, data),
        onSuccess: (_, variables) => {
            toast.success('Score submitted successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_INTERVIEWS })
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.INTERVIEW(variables.interviewId)
            })
        },
        onError: (error: unknown) => {
            toast.error('Failed to submit score', {
                description: getErrorMessage(error, 'Could not submit interview score'),
            })
        },
    })
}
