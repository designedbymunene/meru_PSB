import { z } from 'zod'
import type { Context, Next } from 'hono'
import { ValidationError } from '../utils/errors'

export const validate = <T extends z.ZodSchema>(schema: T) => {
    return async (c: Context, next: Next) => {
        try {
            const body = await c.req.json()
            const validated = schema.parse(body)
            c.set('validatedData' as never, validated as never)
            await next()
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new ValidationError('Validation failed', error.errors)
            }
            throw new ValidationError('Invalid request body')
        }
    }
}
