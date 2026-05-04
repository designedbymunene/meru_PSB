import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/dashboard']

// Routes that require admin role
const adminRoutes = ['/admin']

// Routes that are only for unauthenticated users
const authRoutes = ['/login', '/register', '/forgot-password']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check for access token in cookies (can't access localStorage in middleware)
    const accessToken = request.cookies.get('accessToken')?.value

    // For auth routes, redirect to dashboard if already logged in
    if (authRoutes.some((route) => pathname.startsWith(route))) {
        if (accessToken) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        return NextResponse.next()
    }

    // For protected routes, redirect to login if not authenticated
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
        if (!accessToken) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('callbackUrl', pathname)
            return NextResponse.redirect(loginUrl)
        }
        return NextResponse.next()
    }

    // For admin routes, check both auth and role (role check happens client-side)
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
        if (!accessToken) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('callbackUrl', pathname)
            return NextResponse.redirect(loginUrl)
        }
        // Note: Role-based access is checked client-side since we can't decode JWT here
        return NextResponse.next()
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes
         */
        '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
    ],
}
