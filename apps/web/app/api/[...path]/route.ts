import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const INTERNAL_BACKEND_URL = process.env.INTERNAL_BACKEND_URL || 'http://localhost:4000'

async function handleProxy(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const { path } = await context.params
    const pathStr = path.join('/')
    const searchParams = request.nextUrl.search
    const targetUrl = `${INTERNAL_BACKEND_URL}/api/${pathStr}${searchParams}`

    const method = request.method
    const headers = new Headers()

    // 1. Copy incoming headers (filtering host, connection etc to avoid conflicts)
    const headersToSkip = ['host', 'connection', 'content-length']
    request.headers.forEach((value, key) => {
        if (!headersToSkip.includes(key.toLowerCase())) {
            headers.set(key, value)
        }
    })

    // 2. Inject authorization token from HttpOnly cookie if present
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value
    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`)
    }

    // 3. Handle auth endpoints specifically: /auth/login, /auth/register, /auth/login/2fa, /auth/logout
    const isLogin = pathStr === 'auth/login'
    const isLogin2fa = pathStr === 'auth/login/2fa'
    const isRegister = pathStr === 'auth/register'
    const isLogout = pathStr === 'auth/logout'

    let body: any = undefined
    if (method !== 'GET' && method !== 'HEAD') {
        if (isLogout) {
            const refreshToken = cookieStore.get('refreshToken')?.value || ''
            body = JSON.stringify({ refreshToken })
            headers.set('Content-Type', 'application/json')
        } else {
            // Buffer the request body so we can retry the request on token refresh without stream errors
            const arrayBuffer = await request.arrayBuffer()
            body = Buffer.from(arrayBuffer)
        }
    }

    try {
        let response = await fetch(targetUrl, {
            method,
            headers,
            body,
            // @ts-ignore
            duplex: 'half'
        })

        // 4. Handle token refresh if backend returns 401 Unauthorized
        if (response.status === 401 && !isLogin && !isRegister && !isLogin2fa && !isLogout) {
            const refreshToken = cookieStore.get('refreshToken')?.value
            if (refreshToken) {
                // Attempt to refresh token server-to-server
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
                        // Set the new access token cookie
                        cookieStore.set('accessToken', newAccessToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'lax',
                            path: '/',
                            maxAge: 7 * 24 * 60 * 60 // 7 days
                        })

                        // Retry the original request with the new access token
                        headers.set('Authorization', `Bearer ${newAccessToken}`)
                        response = await fetch(targetUrl, {
                            method,
                            headers,
                            body,
                            // @ts-ignore
                            duplex: 'half'
                        })
                    }
                } else {
                    // Refresh token invalid or expired: clear cookies
                    cookieStore.delete('accessToken')
                    cookieStore.delete('refreshToken')
                    cookieStore.delete('userRole')
                    cookieStore.delete('viewAsApplicant')
                    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
                }
            }
        }

        // 5. Intercept response for Auth endpoints to set/clear cookies
        if (response.ok) {
            if (isLogin || isRegister || isLogin2fa) {
                const responseData = await response.json()
                const { user, accessToken: newAccess, refreshToken: newRefresh } = responseData.data || {}

                if (newAccess && newRefresh) {
                    // Set secure HttpOnly cookies
                    cookieStore.set('accessToken', newAccess, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        path: '/',
                        maxAge: 7 * 24 * 60 * 60 // 7 days
                    })
                    cookieStore.set('refreshToken', newRefresh, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        path: '/',
                        maxAge: 30 * 24 * 60 * 60 // 30 days
                    })
                    cookieStore.set('userRole', user.role, {
                        httpOnly: false, // Accessible to client-side JS / middleware
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        path: '/',
                        maxAge: 7 * 24 * 60 * 60 // 7 days
                    })

                    // Remove tokens from JSON body sent to browser
                    delete responseData.data.accessToken
                    delete responseData.data.refreshToken

                    return NextResponse.json(responseData)
                }
            } else if (isLogout) {
                // Clear cookies on successful logout
                cookieStore.delete('accessToken')
                cookieStore.delete('refreshToken')
                cookieStore.delete('userRole')
                cookieStore.delete('viewAsApplicant')
            }
        }

        // For standard JSON endpoints
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json()
            return NextResponse.json(data, { status: response.status })
        }

        // For files, downloads or other raw streams
        const blob = await response.blob()
        const resHeaders = new Headers()
        response.headers.forEach((val, key) => {
            if (key.toLowerCase() !== 'content-encoding') {
                resHeaders.set(key, val)
            }
        })
        return new NextResponse(blob, {
            status: response.status,
            headers: resHeaders
        })

    } catch (error) {
        console.error('BFF Proxy error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export {
    handleProxy as GET,
    handleProxy as POST,
    handleProxy as PUT,
    handleProxy as DELETE,
    handleProxy as PATCH
}
