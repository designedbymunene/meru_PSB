import { Hono } from 'hono'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { db, users } from '../db'
import { successResponse } from '../utils/errors'
import { ne, sql } from 'drizzle-orm'
import { buildPagination, parsePagination } from '../utils/pagination'

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
