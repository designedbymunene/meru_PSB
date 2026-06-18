import { Hono } from 'hono'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { db, users } from '../db'
import { successResponse, ForbiddenError, NotFoundError } from '../utils/errors'
import { eq, ne, sql } from 'drizzle-orm'
import { buildPagination, parsePagination } from '../utils/pagination'
import { AuthService } from '../services/auth-service'
import { hashPassword } from '../utils/auth'
import { randomBytes } from 'crypto'

export const usersRouter = new Hono()

/**
 * GET /api/users
 * Get all users (for panel member selection).
 * Restricted to admins.
 */
usersRouter.get('/', authenticate, requireAdmin, async (c) => {
    const { page, limit, offset } = parsePagination(c.req.query('page'), c.req.query('limit'))
    const whereClause = ne(users.role, 'applicant')

    const [allUsers, totalResult] = await Promise.all([
        db.select({
            id: users.id,
            email: users.email,
            fullName: users.fullName,
            role: users.role,
            createdAt: users.createdAt
        }).from(users).where(whereClause).orderBy(users.fullName).limit(limit).offset(offset),
        db.select({ count: sql<number>`count(*)::int` }).from(users).where(whereClause)
    ])

    return successResponse(c, {
        data: allUsers,
        pagination: buildPagination(totalResult[0]?.count ?? 0, page, limit)
    }, 'Users retrieved successfully')
})

/**
 * DELETE /api/users/:id
 * Delete a user account and all associated data.
 * Restricted to admins. Cannot delete self.
 */
usersRouter.delete('/:id', authenticate, requireAdmin, async (c) => {
    const userId = parseInt(c.req.param('id'))
    const authUser = c.get('user')
    const requestId = c.get('requestId')

    if (isNaN(userId)) {
        throw new NotFoundError('User')
    }

    if (userId === authUser.userId) {
        throw new ForbiddenError('You cannot delete your own account')
    }

    await AuthService.deleteUserAccount(userId, requestId)

    return successResponse(c, null, 'User deleted successfully')
})

/**
 * POST /api/users/:id/temp-password
 * Generate a temporary password for a user.
 * Restricted to admins.
 */
usersRouter.post('/:id/temp-password', authenticate, requireAdmin, async (c) => {
    const userId = parseInt(c.req.param('id'))
    
    if (isNaN(userId)) {
        throw new NotFoundError('User')
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    if (!user) {
        throw new NotFoundError('User')
    }

    const tempPassword = randomBytes(4).toString('hex')
    const hashedPassword = await hashPassword(tempPassword)

    await db.update(users).set({
        password: hashedPassword,
        tokenVersion: (user.tokenVersion ?? 0) + 1,
        failedLoginAttempts: 0,
        isLocked: false,
        lockoutUntil: null
    }).where(eq(users.id, userId))

    return successResponse(c, { tempPassword }, 'Temporary password generated successfully')
})
