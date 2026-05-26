import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

const INTERNAL_BACKEND_URL = process.env.INTERNAL_BACKEND_URL || 'http://localhost:4000'

function decodeJwt(token: string): any {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null
        const payload = parts[1]
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        )
        return JSON.parse(jsonPayload)
    } catch {
        return null
    }
}

// Routes that require authentication
const protectedRoutes = ['/dashboard']

// Routes that require admin role
const adminRoutes = ['/admin']

// Routes that are only for unauthenticated users
const authRoutes = ['/login', '/register', '/forgot-password']

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if the pathname has a locale prefix
    const pathnameHasLocale = routing.locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    // Get the pathname without locale for route matching
    let pathnameWithoutLocale = pathname
    if (pathnameHasLocale) {
        const parts = pathname.split('/')
        pathnameWithoutLocale = '/' + parts.slice(2).join('/')
    }

    // Check for access token and role in cookies
    let accessToken = request.cookies.get('accessToken')?.value
    const refreshToken = request.cookies.get('refreshToken')?.value
    let userRole = request.cookies.get('userRole')?.value
    const viewAsApplicant = request.cookies.get('viewAsApplicant')?.value

    // Auto-refresh access token if expired but refresh token exists
    if (!accessToken && refreshToken) {
        try {
            const refreshRes = await fetch(`${INTERNAL_BACKEND_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            })

            if (refreshRes.ok) {
                const refreshData = await refreshRes.json()
                const newAccessToken = refreshData.data?.accessToken

                if (newAccessToken) {
                    const decoded = decodeJwt(newAccessToken)
                    if (decoded && decoded.role) {
                        // Redirect to the exact same URL to retry with new cookies
                        const redirectResponse = NextResponse.redirect(request.url)
                        redirectResponse.cookies.set('accessToken', newAccessToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'lax',
                            path: '/',
                            maxAge: 7 * 24 * 60 * 60 // 7 days
                        })
                        redirectResponse.cookies.set('userRole', decoded.role, {
                            httpOnly: false,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'lax',
                            path: '/',
                            maxAge: 7 * 24 * 60 * 60 // 7 days
                        })
                        return redirectResponse
                    }
                }
            }

            // If refresh fails, clear invalid session cookies
            const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
            redirectResponse.cookies.delete('accessToken')
            redirectResponse.cookies.delete('refreshToken')
            redirectResponse.cookies.delete('userRole')
            redirectResponse.cookies.delete('viewAsApplicant')
            return redirectResponse
        } catch (err) {
            console.error('Middleware token refresh error:', err)
        }
    }

    // For auth routes, redirect based on role if already logged in
    if (authRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
        if (accessToken) {
            if (userRole === 'admin') {
                return NextResponse.redirect(new URL('/admin', request.url))
            }
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // For protected routes (applicant side)
    if (protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
        if (!accessToken) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('callbackUrl', pathnameWithoutLocale)
            return NextResponse.redirect(loginUrl)
        }

        // If admin tries to access applicant side without "viewAsApplicant" flag, redirect to admin
        if (userRole === 'admin' && !viewAsApplicant) {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
    }

    // For admin routes
    if (adminRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
        if (!accessToken) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('callbackUrl', pathnameWithoutLocale)
            return NextResponse.redirect(loginUrl)
        }

        // Only admins can access admin routes
        if (userRole !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return intlMiddleware(request)
}

export const config = {
    matcher: [
        // Match all pathnames except for
        // - /api (API routes)
        // - /_next (Next.js internals)
        // - /_static (inside /public)
        // - all static files inside /public (e.g. /favicon.ico, /logo/merucountylogo.png)
        '/((?!api|_next|_static|_vercel|.*\\..*).*)',
    ],
}
