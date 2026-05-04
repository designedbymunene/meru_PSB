'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as jobGroupApi from '@/lib/api/job-groups'
import { QUERY_KEYS } from '@/lib/constants'
import type { CreateJobGroupData } from '@/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function useJobGroups() {
    return useQuery({
        queryKey: QUERY_KEYS.JOB_GROUPS,
        queryFn: () => jobGroupApi.getJobGroups(),
    })
}

export function useCreateJobGroup() {
    const queryClient = useQueryClient()
    const router = useRouter()

    return useMutation({
        mutationFn: (data: CreateJobGroupData) => jobGroupApi.createJobGroup(data),
        onSuccess: () => {
            toast.success('Job Group created successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOB_GROUPS })
            router.push('/admin/job-groups')
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
    const router = useRouter()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreateJobGroupData> }) =>
            jobGroupApi.updateJobGroup(id, data),
        onSuccess: () => {
            toast.success('Job Group updated successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOB_GROUPS })
            router.push('/admin/job-groups')
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
