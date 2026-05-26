import { createApiClient } from '@meru/shared'
import { cookies } from 'next/headers'

const INTERNAL_BACKEND_URL = process.env.INTERNAL_BACKEND_URL || 'http://localhost:4000'

export const serverApiClient = createApiClient({
    baseURL: `${INTERNAL_BACKEND_URL}/api`,
    getAccessToken: async () => {
        try {
            const cookieStore = await cookies()
            return cookieStore.get('accessToken')?.value || null
        } catch {
            return null
        }
    },
    getRefreshToken: async () => {
        try {
            const cookieStore = await cookies()
            return cookieStore.get('refreshToken')?.value || null
        } catch {
            return null
        }
    },
    onTokenRefresh: async () => {
        // Token refresh is managed by the BFF proxy or server-side requests
    },
    onLogout: async () => {
        // No-op on server side
    },
    isDebug: process.env.NODE_ENV === 'development'
})

export default serverApiClient
