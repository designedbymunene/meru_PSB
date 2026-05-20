import { Hono } from 'hono'
import { db, venues } from '../db'
import { eq, desc } from 'drizzle-orm'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { validate } from '../middleware/validation'
import { createVenueSchema, updateVenueSchema } from '@meru/shared'
import { NotFoundError, successResponse } from '../utils/errors'
import { buildPagination, parsePagination } from '../utils/pagination'
import { sql } from 'drizzle-orm'

export const venuesRouter = new Hono()

// GET /api/venues - Get all venues
venuesRouter.get('/', async (c) => {
    const { page, limit, offset } = parsePagination(c.req.query('page'), c.req.query('limit'))

    const [allVenues, totalResult] = await Promise.all([
        db.select().from(venues).orderBy(desc(venues.createdAt)).limit(limit).offset(offset),
        db.select({ count: sql<number>`count(*)::int` }).from(venues)
    ])

    return successResponse(c, {
        data: allVenues,
        pagination: buildPagination(totalResult[0]?.count ?? 0, page, limit)
    })
})

// GET /api/venues/:id - Get single venue
venuesRouter.get('/:id', async (c) => {
    const id = parseInt(c.req.param('id') || '0')

    const venue = await db.query.venues.findFirst({
        where: eq(venues.id, id)
    })

    if (!venue) {
        throw new NotFoundError('Venue')
    }

    return successResponse(c, venue)
})

// POST /api/venues - Create venue (admin only)
venuesRouter.post(
    '/',
    authenticate,
    requireAdmin,
    validate(createVenueSchema),
    async (c) => {
        const data = c.get('validatedData' as never) as {
            name: string
            location?: string
            tagIds: number[]
        }

        const [newVenue] = await db
            .insert(venues)
            .values({
                name: data.name,
                location: data.location || null,
                tagIds: data.tagIds || []
            })
            .returning()

        return successResponse(c, newVenue, 'Venue created successfully', 201)
    }
)

// PUT /api/venues/:id - Update venue (admin only)
venuesRouter.put(
    '/:id',
    authenticate,
    requireAdmin,
    validate(updateVenueSchema),
    async (c) => {
        const id = parseInt(c.req.param('id') || '0')
        const data = c.get('validatedData' as never) as Partial<{
            name: string
            location: string
            tagIds: number[]
        }>

        const [updatedVenue] = await db
            .update(venues)
            .set(data)
            .where(eq(venues.id, id))
            .returning()

        if (!updatedVenue) {
            throw new NotFoundError('Venue')
        }

        return successResponse(c, updatedVenue, 'Venue updated successfully')
    }
)

// DELETE /api/venues/:id - Delete venue (admin only)
venuesRouter.delete('/:id', authenticate, requireAdmin, async (c) => {
    const id = parseInt(c.req.param('id') || '0')

    const [deletedVenue] = await db
        .delete(venues)
        .where(eq(venues.id, id))
        .returning()

    if (!deletedVenue) {
        throw new NotFoundError('Venue')
    }

    return successResponse(c, null, 'Venue deleted successfully')
})
