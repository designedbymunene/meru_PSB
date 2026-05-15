'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as accountApi from '@/lib/api/account'
import { toast } from 'sonner'

export function useSecuritySettings() {
    return useQuery({
        queryKey: ['security-settings'],
        queryFn: () => accountApi.getSecuritySettings(),
    })
}

export function useActiveSessions() {
    return useQuery({
        queryKey: ['active-sessions'],
        queryFn: () => accountApi.getActiveSessions(),
    })
}

export function useToggle2FA() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (enabled: boolean) => accountApi.toggle2FA(enabled),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['security-settings'] })
            toast.success(response.message || 'Two-factor authentication updated')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update 2FA settings')
        }
    })
}

export function useRevokeSession() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id?: number) => accountApi.revokeSession(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['active-sessions'] })
            queryClient.invalidateQueries({ queryKey: ['security-settings'] })
            toast.success(response.message || 'Session revoked successfully')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to revoke session')
        }
    })
}

export function useUpdatePassword() {
    return useMutation({
        mutationFn: (passwords: any) => accountApi.updatePassword(passwords),
        onSuccess: (response) => {
            toast.success(response.message || 'Password updated successfully')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update password')
        }
    })
}
