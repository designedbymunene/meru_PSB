import { rateLimiter } from 'hono-rate-limiter'
import { TooManyRequestsError } from '../utils/errors'

export const authRateLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // Limit each IP to 10 requests per windowMs
    standardHeaders: 'draft-7', // Use standard RateLimit headers
    keyGenerator: (c) => {
        // Use X-Forwarded-For if available, otherwise fallback to a generic key
        // Note: In production, ensure your proxy sets this header correctly
        return c.req.header('x-forwarded-for') || 'anonymous'
    },
    handler: (c) => {
        console.warn(`[RateLimit] Triggered for IP: ${c.req.header('x-forwarded-for') || 'anonymous'} on path: ${c.req.path}`)
        throw new TooManyRequestsError('Too many requests, please try again later')
    }
})

export const publicRateLimiter = rateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 60, // 60 requests per minute
    standardHeaders: 'draft-7',
    keyGenerator: (c) => c.req.header('x-forwarded-for') || 'anonymous',
    handler: (c) => {
        console.warn(`[RateLimit] Triggered for IP: ${c.req.header('x-forwarded-for') || 'anonymous'} on path: ${c.req.path}`)
        throw new TooManyRequestsError('Too many requests, please try again later')
    }
})
