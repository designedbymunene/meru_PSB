import { rateLimiter } from 'hono-rate-limiter'
import { TooManyRequestsError } from '../utils/errors'
import { logger } from '../utils/logger'

const isProduction = process.env.NODE_ENV === 'production'

const getClientIp = (c: { req: { header: (name: string) => string | undefined } }) => {
    const forwardedFor = c.req.header('x-forwarded-for')
    if (forwardedFor) {
        const [firstIp] = forwardedFor.split(',').map((value) => value.trim()).filter(Boolean)
        if (firstIp) return firstIp
    }

    return (
        c.req.header('x-real-ip') ||
        c.req.header('cf-connecting-ip') ||
        'anonymous'
    )
}

// No-op middleware for development - bypasses rate limiting
const noOpMiddleware = async (_c: any, next: any) => {
    await next()
}

const authLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // Limit each IP to 10 requests per windowMs
    standardHeaders: 'draft-7', // Use standard RateLimit headers
    keyGenerator: (c) => {
        return getClientIp(c)
    },
    handler: (c) => {
        logger.warn({ ip: getClientIp(c), path: c.req.path }, '[RateLimit] Limit exceeded on auth endpoint')
        throw new TooManyRequestsError('Too many requests, please try again later')
    }
})

const publicLimiter = rateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 60, // 60 requests per minute
    standardHeaders: 'draft-7',
    keyGenerator: (c) => getClientIp(c),
    handler: (c) => {
        logger.warn({ ip: getClientIp(c), path: c.req.path }, '[RateLimit] Limit exceeded on public endpoint')
        throw new TooManyRequestsError('Too many requests, please try again later')
    }
})

export const authRateLimiter = isProduction ? authLimiter : noOpMiddleware
export const publicRateLimiter = isProduction ? publicLimiter : noOpMiddleware
