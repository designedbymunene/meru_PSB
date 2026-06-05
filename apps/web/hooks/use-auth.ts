'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { AxiosError } from '@meru/shared'
import * as authApi from '@/lib/api/auth'
import { useAuthContext } from '@/providers'
import { QUERY_KEYS } from '@/lib/constants'
import type { LoginCredentials, RegisterData } from '@/types'
import { trackFormError } from '@/lib/analytics'

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

            // Store tokens in localStorage
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)

            // Update auth context
            setUser(user)

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })

            toast.success('Login successful', {
                description: `Welcome back, ${user.fullName}!`,
            })

            // Redirect based on role with locale prefix
            if (user.role === 'admin') {
                router.push('/en/admin')
            } else {
                router.push('/en/dashboard')
            }
        },
        onError: (error: unknown) => {
            trackFormError('login-form', error instanceof Error ? error.message : 'Unknown error')
            
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

            // Store tokens in localStorage
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)

            // Update auth context
            setUser(user)

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })

            toast.success('Registration successful', {
                description: 'Your account has been created!',
            })

            // Redirect to dashboard with locale prefix
            router.push('/en/dashboard')
        },
        onError: (error: unknown) => {
            trackFormError('register-form', error instanceof Error ? error.message : 'Unknown error')
            
            toast.error('Registration failed', {
                description: getErrorMessage(error, 'Could not create account'),
            })
        },
    })
}

export function useRequestPasswordReset() {
    return useMutation({
        mutationFn: (email: string) => authApi.requestPasswordReset(email),
        onSuccess: (response) => {
            toast.success('Reset code sent', {
                description: response.message || 'If an account exists, a reset code has been sent',
            })
        },
        onError: (error: unknown) => {
            toast.error('Failed to request reset', {
                description: getErrorMessage(error, 'Could not request password reset'),
            })
        },
    })
}

export function useResetPassword() {
    const router = useRouter()

    return useMutation({
        mutationFn: ({ email, otp, newPassword }: { email: string; otp: string; newPassword: string }) =>
            authApi.resetPassword(email, otp, newPassword),
        onSuccess: () => {
            toast.success('Password reset successful', {
                description: 'You can now login with your new password',
            })
            router.push('/en/login')
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

    return async () => {
        // Clear all queries first
        queryClient.clear()

        try {
            // Call backend logout to clear httpOnly cookies and invalidate token
            await authApi.logout()
        } catch (error) {
            console.error('Backend logout failed:', error)
        }

        // Logout (clears tokens and state)
        logout()

        // Show success message
        toast.success('Logged out successfully')

        // Force a full page reload to ensure all state is cleared
        // Using a small timeout to allow the toast to be queued
        setTimeout(() => {
            window.location.href = '/en/login'
        }, 100)
    }
}

// Re-export auth context hook
export { useAuthContext } from '@/providers'
