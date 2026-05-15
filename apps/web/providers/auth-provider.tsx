'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@/types'

interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    setUser: (user: User | null) => void
    logout: () => void
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
        const accessToken = localStorage.getItem('accessToken')

        if (storedUser && accessToken) {
            try {
                const parsedUser = JSON.parse(storedUser)
                setUserState(parsedUser)
                // Sync token to cookie for middleware
                setCookie('accessToken', accessToken)
            } catch {
                localStorage.removeItem('user')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                deleteCookie('accessToken')
            }
        } else {
            // If we don't have both, ensure cookie is also cleared to prevent middleware loops
            deleteCookie('accessToken')
        }
        setIsLoading(false)
    }, [])

    const setUser = (newUser: User | null) => {
        setUserState(newUser)
        if (newUser) {
            localStorage.setItem('user', JSON.stringify(newUser))
            // Sync token to cookie
            const token = localStorage.getItem('accessToken')
            if (token) {
                setCookie('accessToken', token)
            }
        } else {
            localStorage.removeItem('user')
            deleteCookie('accessToken')
        }
    }

    const logout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        deleteCookie('accessToken')
        setUserState(null)
        window.location.href = '/login'
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                setUser,
                logout,
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
