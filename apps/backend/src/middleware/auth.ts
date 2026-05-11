import type { Context, Next } from 'hono'
import { eq } from 'drizzle-orm'
import { db, users } from '../db'
import { verifyAccessToken } from '../utils/auth'
import { UnauthorizedError } from '../utils/errors'

declare module 'hono' {
    interface ContextVariableMap {
        user: {
            userId: number
            email: string
            role: 'applicant' | 'admin'
        }
        validatedData: any
    }
}

export const authenticate = async (c: Context, next: Next) => {
    try {
        const authHeader = c.req.header('Authorization')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided')
        }

        const token = authHeader.substring(7) // Remove 'Bearer '

        const decoded = verifyAccessToken(token)
        const user = await db.query.users.findFirst({
            where: eq(users.id, decoded.userId)
        })

        if (!user || (user.tokenVersion ?? 0) !== decoded.tokenVersion) {
            throw new UnauthorizedError('Invalid or expired token')
        }

        // Set user in context
        c.set('user', {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role as 'applicant' | 'admin'
        })

        await next()
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            throw error
        }
        throw new UnauthorizedError('Invalid or expired token')
    }
}
export const optionalAuthenticate = async (c: Context, next: Next) => {
    try {
        const authHeader = c.req.header('Authorization')

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7)
            const decoded = verifyAccessToken(token)
            const user = await db.query.users.findFirst({
                where: eq(users.id, decoded.userId)
            })

            if (!user || (user.tokenVersion ?? 0) !== decoded.tokenVersion) {
                await next()
                return
            }

            c.set('user', {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role as 'applicant' | 'admin'
            })
        }
        await next()
    } catch (error) {
        // If token is invalid, we just proceed without setting user
        await next()
    }
}
