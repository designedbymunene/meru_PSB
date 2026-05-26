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
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check for stored user on mount
        const storedUser = localStorage.getItem('user')

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser)
                setUserState(parsedUser)
            } catch {
                localStorage.removeItem('user')
                deleteCookie('userRole')
            }
        } else {
            // If we don't have a user, ensure the role cookie is cleared to prevent middleware loops
            deleteCookie('userRole')
        }
        setIsLoading(false)
    }, [])

    const setUser = (newUser: User | null) => {
        setUserState(newUser)
        if (newUser) {
            localStorage.setItem('user', JSON.stringify(newUser))
            // The BFF proxy already sets accessToken, refreshToken, and userRole cookies on successful login/register.
            // Just ensure viewAsApplicant is cleared.
            deleteCookie('viewAsApplicant')
        } else {
            localStorage.removeItem('user')
            deleteCookie('userRole')
        }
    }

    const logout = () => {
        localStorage.removeItem('user')
        deleteCookie('userRole')
        deleteCookie('viewAsApplicant')
        setUserState(null)
        
        // Trigger server-side logout to revoke cookies
        fetch('/api/auth/logout', { method: 'POST' })
            .catch(() => {})
            .finally(() => {
                window.location.href = '/login'
            })
    }

    const switchView = (target: 'admin' | 'applicant') => {
        if (target === 'applicant') {
            setCookie('viewAsApplicant', 'true')
            window.location.href = '/dashboard'
        } else {
            deleteCookie('viewAsApplicant')
            window.location.href = '/admin'
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
