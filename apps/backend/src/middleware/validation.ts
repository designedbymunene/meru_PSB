import { z } from 'zod'
import type { Context, Next } from 'hono'
import { ValidationError } from '../utils/errors'

/**
 * Middleware to validate request body using a Zod schema.
 * Stores the validated data in the Hono context for use in route handlers.
 */
export const validate = <T extends z.ZodSchema>(schema: T) => {
    return async (c: Context, next: Next) => {
        try {
            const body = await c.req.json()
            const validated = schema.parse(body)
            
            // Set the validated data in context
            c.set('validatedData' as any, validated)
            
            await next()
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new ValidationError('Validation failed', error.errors)
            }
            throw new ValidationError('Invalid request body')
        }
    }
}
