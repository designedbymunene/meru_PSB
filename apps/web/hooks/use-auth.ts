'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
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
    const searchParams = useSearchParams()
    const queryClient = useQueryClient()
    const { setUser } = useAuthContext()

    return useMutation({
        mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
        onSuccess: (response) => {
            const { user } = response.data

            // Update auth context
            setUser(user)

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })

            toast.success('Login successful', {
                description: `Welcome back, ${user.fullName}!`,
            })

            // Redirect based on callbackUrl or role using a hard redirect to avoid Next.js client-side route caching
            // Use setTimeout to ensure cookies are properly set before redirecting
            setTimeout(() => {
                const locale = window.location.pathname.split('/')[1]
                const localePrefix = ['en', 'sw'].includes(locale) ? `/${locale}` : ''

                const callbackUrl = searchParams.get('callbackUrl')
                const targetUrl = callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')
                    ? callbackUrl
                    : (user.role === 'admin' ? '/admin' : '/dashboard')

                window.location.href = `${localePrefix}${targetUrl}`
            }, 100)
        },
        onError: (error: unknown) => {
            toast.error('Login failed', {
                description: getErrorMessage(error, 'Invalid email or password'),
            })
        },
    })
}

export function useRegister() {
    const searchParams = useSearchParams()
    const queryClient = useQueryClient()
    const { setUser } = useAuthContext()

    return useMutation({
        mutationFn: (userData: RegisterData) => authApi.register(userData),
        onSuccess: (response) => {
            const { user } = response.data

            // Update auth context
            setUser(user)

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })

            toast.success('Registration successful', {
                description: 'Your account has been created!',
            })

            // Redirect based on callbackUrl or default to dashboard using a hard redirect to avoid Next.js client-side route caching
            // Use setTimeout to ensure cookies are properly set before redirecting
            setTimeout(() => {
                const locale = window.location.pathname.split('/')[1]
                const localePrefix = ['en', 'sw'].includes(locale) ? `/${locale}` : ''

                const callbackUrl = searchParams.get('callbackUrl')
                const targetUrl = callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')
                    ? callbackUrl
                    : '/dashboard'

                window.location.href = `${localePrefix}${targetUrl}`
            }, 100)
        },
        onError: (error: unknown) => {
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
