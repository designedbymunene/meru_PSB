import type { Context } from 'hono'

// Custom error class
export class AppError extends Error {
    constructor(
        public statusCode: number,
        public code: string,
        message: string,
        public details?: unknown
    ) {
        super(message)
        this.name = 'AppError'
    }
}

// Specific error types
export class ValidationError extends AppError {
    constructor(message: string, details?: unknown) {
        super(400, 'VALIDATION_ERROR', message, details)
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(404, 'NOT_FOUND', `${resource} not found`)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(401, 'UNAUTHORIZED', message)
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden - Insufficient permissions') {
        super(403, 'FORBIDDEN', message)
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(409, 'CONFLICT', message)
    }
}

export class TooManyRequestsError extends AppError {
    constructor(message = 'Too many requests, please try again later') {
        super(429, 'TOO_MANY_REQUESTS', message)
    }
}

// Success response helper
export const successResponse = <T>(
    c: Context,
    data: T,
    message?: string,
    status = 200
) => {
    return c.json(
        {
            success: true,
            message,
            data
        },
        status as any
    )
}

// Error response helper
export const errorResponse = (
    c: Context,
    error: string,
    code?: string,
    details?: unknown,
    status = 500
) => {
    return c.json(
        {
            success: false,
            error: {
                code: code || 'INTERNAL_ERROR',
                message: error,
                details
            }
        },
        status as any
    )
}
