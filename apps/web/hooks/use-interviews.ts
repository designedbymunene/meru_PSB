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

export function useInterviewAdmin(id: number) {
    return useQuery({
        queryKey: QUERY_KEYS.INTERVIEW(id),
        queryFn: () => interviewsApi.getInterviewAdmin(id),
        enabled: !!id,
    })
}

export function useVacancyPanel(vacancyId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.VACANCY_PANEL(vacancyId),
        queryFn: () => interviewsApi.getVacancyPanel(vacancyId),
        enabled: !!vacancyId,
    })
}

export function useDefaultPanel(vacancyId: number) {
    return useQuery({
        queryKey: ['vacancy-default-panel', vacancyId],
        queryFn: () => interviewsApi.getDefaultPanel(vacancyId),
        enabled: !!vacancyId,
    })
}

export function useInterviewCriteria(vacancyId: number) {
    return useQuery({
        queryKey: ['vacancy-interview-criteria', vacancyId],
        queryFn: () => interviewsApi.getInterviewCriteria(vacancyId),
        enabled: !!vacancyId,
    })
}

// Mutations

export function useSetInterviewCriteria() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ vacancyId, criteria }: { vacancyId: number; criteria: { name: string, maxScore: number, description?: string }[] }) =>
            interviewsApi.setInterviewCriteria(vacancyId, criteria),
        onSuccess: (_, variables) => {
            toast.success('Interview criteria updated successfully')
            queryClient.invalidateQueries({ queryKey: ['vacancy-interview-criteria', variables.vacancyId] })
        },
        onError: (error: unknown) => {
            toast.error('Failed to update criteria', {
                description: getErrorMessage(error, 'Could not update interview criteria'),
            })
        },
    })
}

export function useSetDefaultPanel() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ vacancyId, userIds }: { vacancyId: number; userIds: number[] }) =>
            interviewsApi.setDefaultPanel(vacancyId, userIds),
        onSuccess: (_, variables) => {
            toast.success('Default panel updated successfully')
            queryClient.invalidateQueries({ queryKey: ['vacancy-default-panel', variables.vacancyId] })
        },
        onError: (error: unknown) => {
            toast.error('Failed to update default panel', {
                description: getErrorMessage(error, 'Could not update default panel'),
            })
        },
    })
}

export function useBulkScheduleInterviews() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: {
            vacancyId: number,
            applicationIds: number[],
            startAt: string,
            durationMinutes: number,
            gapMinutes: number,
            venue: string,
            virtualLink?: string,
            panelMembers: number[]
        }) => interviewsApi.bulkScheduleInterviews(data),
        onSuccess: (_, variables) => {
            toast.success('Interviews scheduled successfully')
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.VACANCY_INTERVIEWS(variables.vacancyId)
            })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPLICATIONS })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INTERVIEW_RESULTS(variables.vacancyId) })
        },
        onError: (error: unknown) => {
            toast.error('Failed to bulk schedule', {
                description: getErrorMessage(error, 'Could not schedule interviews'),
            })
        },
    })
}

export function useUpdateInterviewStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            interviewsApi.updateInterviewStatus(id, status),
        onSuccess: (response, variables) => {
            toast.success('Interview status updated')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INTERVIEW(variables.id) })
            if (response.data) {
                queryClient.invalidateQueries({ 
                    queryKey: QUERY_KEYS.INTERVIEW_RESULTS(response.data.vacancyId) 
                })
            }
        },
        onError: (error: unknown) => {
            toast.error('Failed to update status', {
                description: getErrorMessage(error, 'Could not update interview status'),
            })
        },
    })
}

export function useRescheduleInterview() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: { scheduledAt: string; venue: string; virtualLink?: string } }) =>
            interviewsApi.rescheduleInterview(id, data),
        onSuccess: (response, variables) => {
            toast.success('Interview rescheduled successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INTERVIEW(variables.id) })
            if (response.data) {
                queryClient.invalidateQueries({ 
                    queryKey: QUERY_KEYS.INTERVIEW_RESULTS(response.data.vacancyId) 
                })
            }
        },
        onError: (error: unknown) => {
            toast.error('Failed to reschedule', {
                description: getErrorMessage(error, 'Could not reschedule interview'),
            })
        },
    })
}

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
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_APPLICATIONS })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPLICATION(variables.applicationId) })
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
