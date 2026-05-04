import type { Context, Next } from 'hono'
import { ForbiddenError } from '../utils/errors'

export const requireAdmin = async (c: Context, next: Next) => {
    const user = c.get('user')

    if (!user || user.role !== 'admin') {
        throw new ForbiddenError('Admin access required')
    }

    await next()
}
