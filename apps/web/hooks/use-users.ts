'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as usersApi from '@/lib/api/users'
import { toast } from 'sonner'

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: () => usersApi.getUsers(),
    })
}

export function useDeleteUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (userId: number) => usersApi.deleteUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            queryClient.invalidateQueries({ queryKey: ['applicant-profiles'] })
            toast.success('User deleted successfully')
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete user')
        }
    })
}

export function useGenerateTempPassword() {
    return useMutation({
        mutationFn: (userId: number) => usersApi.generateTempPassword(userId),
        onError: (error: any) => {
            toast.error(error.message || 'Failed to generate temporary password')
        }
    })
}
