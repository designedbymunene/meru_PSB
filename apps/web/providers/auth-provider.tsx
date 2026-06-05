'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@/types'

interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    setUser: (user: User | null) => void
    logout: () => void
    switchView: (target: 'admin' | 'applicant') => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper to get/set cookies (for middleware support)
function setCookie(name: string, value: string, days = 7) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
    document.cookie = `${name}=${value}; expires=${expires}; path=/`
}

function deleteCookie(name: string) {
    // Delete cookie with multiple path and domain variations to ensure it's removed
    const paths = ['/', '/en', '/sw']
    const domains = [window.location.hostname, `.${window.location.hostname}`]

    paths.forEach(path => {
        domains.forEach(domain => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`
        })
        // Also try without domain
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`
    })
    // Finally, try with just root path and no domain
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check for stored user on mount
        const storedUser = localStorage.getItem('user')
        const accessToken = localStorage.getItem('accessToken')

        if (storedUser && accessToken) {
            try {
                const parsedUser = JSON.parse(storedUser)
                setUserState(parsedUser)
                // Sync token and role to cookie for middleware
                setCookie('accessToken', accessToken)
                setCookie('userRole', parsedUser.role)
            } catch {
                localStorage.removeItem('user')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                deleteCookie('accessToken')
                deleteCookie('userRole')
            }
        } else {
            // If we don't have both, ensure cookie is also cleared to prevent middleware loops
            deleteCookie('accessToken')
            deleteCookie('userRole')
        }
        setIsLoading(false)
    }, [])

    const setUser = (newUser: User | null) => {
        setUserState(newUser)
        if (newUser) {
            localStorage.setItem('user', JSON.stringify(newUser))
            // Sync token and role to cookie
            const token = localStorage.getItem('accessToken')
            if (token) {
                setCookie('accessToken', token)
                setCookie('userRole', newUser.role)
                // Clear view as applicant flag on new login
                deleteCookie('viewAsApplicant')
            }
        } else {
            localStorage.removeItem('user')
            deleteCookie('accessToken')
            deleteCookie('userRole')
        }
    }

    const logout = () => {
        // Clear localStorage
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')

        // Clear cookies
        deleteCookie('accessToken')
        deleteCookie('refreshToken')
        deleteCookie('userRole')
        deleteCookie('viewAsApplicant')

        // Clear state
        setUserState(null)

        // Note: The caller is responsible for redirecting to the login page
    }

    const switchView = (target: 'admin' | 'applicant') => {
        if (target === 'applicant') {
            setCookie('viewAsApplicant', 'true')
            window.location.href = '/en/dashboard'
        } else {
            deleteCookie('viewAsApplicant')
            window.location.href = '/en/admin'
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                setUser,
                logout,
                switchView,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuthContext must be used within AuthProvider')
    }
    return context
}
