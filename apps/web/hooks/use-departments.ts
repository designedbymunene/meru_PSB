'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as departmentApi from '@/lib/api/departments'
import { QUERY_KEYS } from '@/lib/constants'
import type { CreateDepartmentData, ApiResponse, Department } from '@/types'
import { toast } from 'sonner'

export function useDepartments(initialData?: ApiResponse<Department[]>) {
    return useQuery({
        queryKey: QUERY_KEYS.DEPARTMENTS,
        queryFn: () => departmentApi.getDepartments(),
        initialData,
    })
}

export function useDepartmentsByMinistry(ministryId?: number) {
    return useQuery({
        queryKey: [...QUERY_KEYS.DEPARTMENTS, ministryId],
        queryFn: () => ministryId ? departmentApi.getDepartmentsByMinistry(ministryId) : Promise.resolve({ success: true, data: [] }),
        enabled: !!ministryId,
    })
}

export function useCreateDepartment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateDepartmentData) => departmentApi.createDepartment(data),
        onSuccess: () => {
            toast.success('Department created successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DEPARTMENTS })
        },
        onError: (error: Error) => {
            toast.error('Failed to create department', {
                description: error.message,
            })
        },
    })
}

export function useUpdateDepartment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreateDepartmentData> }) =>
            departmentApi.updateDepartment(id, data),
        onSuccess: () => {
            toast.success('Department updated successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DEPARTMENTS })
        },
        onError: (error: Error) => {
            toast.error('Failed to update department', {
                description: error.message,
            })
        },
    })
}

export function useDeleteDepartment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => departmentApi.deleteDepartment(id),
        onSuccess: () => {
            toast.success('Department deleted successfully')
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DEPARTMENTS })
        },
        onError: (error: Error) => {
            toast.error('Failed to delete department', {
                description: error.message,
            })
        },
    })
}
