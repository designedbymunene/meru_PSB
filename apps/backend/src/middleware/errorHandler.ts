import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { AppError } from '../utils/errors'
import { ZodError } from 'zod'
import { logger } from '../utils/logger'

export const errorHandler = (err: Error, c: Context) => {
    const requestId = c.get('requestId') || c.req.header('x-request-id') || 'unknown'
    const isProduction = process.env.NODE_ENV === 'production'
    
    logger.error({
        requestId,
        err: {
            message: err.message,
            stack: err.stack,
            cause: (err as any).cause,
        },
        path: c.req.path,
        method: c.req.method,
        query: isProduction ? undefined : c.req.query(),
        userAgent: c.req.header('user-agent'),
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
    }, `[Error] ${err.message}`)


    // Handle AppError
    if (err instanceof AppError) {
        return c.json(
            {
                success: false,
                error: {
                    code: err.code,
                    message: err.message,
                    details: err.details
                }
            },
            err.statusCode as any
        )
    }

    // Handle Hono HTTPException
    if (err instanceof HTTPException) {
        return c.json(
            {
                success: false,
                error: {
                    code: 'HTTP_ERROR',
                    message: err.message
                }
            },
            err.status
        )
    }

    // Handle Zod errors
    if (err instanceof ZodError) {
        return c.json(
            {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Validation failed',
                    details: err.errors
                }
            },
            400
        )
    }

    // Default error
    return c.json(
        {
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'An unexpected error occurred'
            }
        },
        500
    )
}
