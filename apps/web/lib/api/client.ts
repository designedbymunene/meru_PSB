import { createApiClient } from '@meru/shared'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')

export const apiClient = createApiClient({
    baseURL: `${API_URL}/api`,
    getAccessToken: async () => {
        if (typeof window === 'undefined') return null
        return localStorage.getItem('accessToken')
    },
    getRefreshToken: async () => {
        if (typeof window === 'undefined') return null
        return localStorage.getItem('refreshToken')
    },
    onTokenRefresh: async (accessToken) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken)
        }
    },
    onLogout: async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
        }
    },
    isDebug: process.env.NODE_ENV === 'development'
})

export default apiClient
