'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { AxiosError } from '@meru/shared'
import * as authApi from '@/lib/api/auth'
import { useAuthContext } from '@/providers'
import { QUERY_KEYS } from '@/lib/constants'
import type { LoginCredentials, RegisterData } from '@/types'

// Helper function to extract error message from API response
function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) {
        const axiosError = error as AxiosError<{ error?: { message?: string } }>
        return axiosError.response?.data?.error?.message || fallback
    }
    return fallback
}

export function useLogin() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const { setUser } = useAuthContext()

    return useMutation({
        mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
        onSuccess: (response) => {
            const { user, accessToken, refreshToken } = response.data

            // Store tokens
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)

            // Update auth context
            setUser(user)

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })

            toast.success('Login successful', {
                description: `Welcome back, ${user.fullName}!`,
            })

            // Redirect based on role
            if (user.role === 'admin') {
                router.push('/admin')
            } else {
                router.push('/dashboard')
            }
        },
        onError: (error: unknown) => {
            toast.error('Login failed', {
                description: getErrorMessage(error, 'Invalid email or password'),
            })
        },
    })
}

export function useRegister() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const { setUser } = useAuthContext()

    return useMutation({
        mutationFn: (userData: RegisterData) => authApi.register(userData),
        onSuccess: (response) => {
            const { user, accessToken, refreshToken } = response.data

            // Store tokens
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)

            // Update auth context
            setUser(user)

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })

            toast.success('Registration successful', {
                description: 'Your account has been created!',
            })
        },
        onError: (error: unknown) => {
            toast.error('Registration failed', {
                description: getErrorMessage(error, 'Could not create account'),
            })
        },
    })
}

export function useResetPassword() {
    const router = useRouter()

    return useMutation({
        mutationFn: ({ email, newPassword }: { email: string; newPassword: string }) =>
            authApi.resetPassword(email, newPassword),
        onSuccess: () => {
            toast.success('Password reset successful', {
                description: 'You can now login with your new password',
            })
            router.push('/login')
        },
        onError: (error: unknown) => {
            toast.error('Password reset failed', {
                description: getErrorMessage(error, 'Could not reset password'),
            })
        },
    })
}

export function useLogout() {
    const queryClient = useQueryClient()
    const { logout } = useAuthContext()

    return () => {
        // Clear all queries
        queryClient.clear()

        // Logout (clears tokens and redirects)
        logout()

        toast.success('Logged out successfully')
    }
}

// Re-export auth context hook
export { useAuthContext } from '@/providers'
