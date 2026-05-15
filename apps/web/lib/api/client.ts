import { createApiClient } from '@meru/shared'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')

function deleteCookie(name: string) {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

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
            // Also update cookie for middleware
            const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
            document.cookie = `accessToken=${accessToken}; expires=${expires}; path=/`
        }
    },
    onLogout: async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            deleteCookie('accessToken')
            window.location.href = '/login'
        }
    },
    isDebug: process.env.NODE_ENV === 'development'
})

export default apiClient
