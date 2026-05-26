import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Routes that require authentication
const protectedRoutes = ['/dashboard']

// Routes that require admin role
const adminRoutes = ['/admin']

// Routes that are only for unauthenticated users (excluded from SSR/BFF)
const authRoutes = ['/login', '/register', '/forgot-password']

export function middleware(request: NextRequest) {
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
    const accessToken = request.cookies.get('accessToken')?.value
    const userRole = request.cookies.get('userRole')?.value
    const viewAsApplicant = request.cookies.get('viewAsApplicant')?.value

    // For auth routes, let them pass through without SSR/BFF - handle client-side only
    if (authRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
        // If already logged in, redirect based on role
        if (accessToken) {
            if (userRole === 'admin') {
                return NextResponse.redirect(new URL('/admin', request.url))
            }
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        // Skip all middleware processing for auth routes - let them be client-side only
        return intlMiddleware(request)
    }

    // For protected routes (applicant side)
    if (protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
        if (!accessToken) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('callbackUrl', pathname)
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
            loginUrl.searchParams.set('callbackUrl', pathname)
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
