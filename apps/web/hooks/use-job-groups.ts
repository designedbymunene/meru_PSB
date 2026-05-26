'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as jobGroupApi from '@/lib/api/job-groups'
import { QUERY_KEYS } from '@/lib/constants'
import type { CreateJobGroupData, ApiResponse, JobGroup } from '@/types'
import { toast } from 'sonner'

export function useJobGroups(initialData?: ApiResponse<JobGroup[]>) {
    return useQuery({
        queryKey: QUERY_KEYS.JOB_GROUPS,
        queryFn: () => jobGroupApi.getJobGroups(),
        initialData,
    })
}

export function useCreateJobGroup() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateJobGroupData) => jobGroupApi.createJobGroup(data),
        onSuccess: () => {
            toast.success('Job Group created successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOB_GROUPS })
        },
        onError: (error: Error) => {
            toast.error('Failed to create job group', {
                description: error.message,
            })
        },
    })
}

export function useUpdateJobGroup() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreateJobGroupData> }) =>
            jobGroupApi.updateJobGroup(id, data),
        onSuccess: () => {
            toast.success('Job Group updated successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOB_GROUPS })
        },
        onError: (error: Error) => {
            toast.error('Failed to update job group', {
                description: error.message,
            })
        },
    })
}

export function useDeleteJobGroup() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => jobGroupApi.deleteJobGroup(id),
        onSuccess: () => {
            toast.success('Job Group deleted successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOB_GROUPS })
        },
        onError: (error: Error) => {
            toast.error('Failed to delete job group', {
                description: error.message,
            })
        },
    })
}
