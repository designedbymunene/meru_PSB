import { createApiClient } from '@meru/shared'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')

function deleteCookie(name: string) {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export const apiClient = createApiClient({
    baseURL: `${API_URL}/api`,
    getAccessToken: async () => null,
    getRefreshToken: async () => null,
    onTokenRefresh: async () => {},
    onLogout: async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user')
            deleteCookie('userRole')
            deleteCookie('viewAsApplicant')
            await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
            window.location.href = '/login'
        }
    },
    isDebug: process.env.NODE_ENV === 'development'
})

export default apiClient
