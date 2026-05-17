import { Hono } from 'hono'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { db, users } from '../db'
import { successResponse } from '../utils/errors'
import { ne } from 'drizzle-orm'

export const usersRouter = new Hono()

/**
 * GET /api/users
 * Get all users (for panel member selection).
 * Restricted to admins.
 */
usersRouter.get('/', authenticate, requireAdmin, async (c) => {
    const allUsers = await db.select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        createdAt: users.createdAt,
    }).from(users).where(ne(users.role, 'applicant'))

    return successResponse(c, allUsers, 'Users retrieved successfully')
})
