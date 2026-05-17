import { Hono } from 'hono'
import { db, venueTags } from '../db'
import { eq, desc } from 'drizzle-orm'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { validate } from '../middleware/validation'
import { createVenueTagSchema, updateVenueTagSchema } from '@meru/shared'
import { NotFoundError, successResponse } from '../utils/errors'

export const venueTagsRouter = new Hono()

// GET /api/venue-tags - Get all venue tags
venueTagsRouter.get('/', async (c) => {
    const allTags = await db.select().from(venueTags).orderBy(desc(venueTags.createdAt))
    return successResponse(c, allTags)
})

// GET /api/venue-tags/:id - Get single venue tag
venueTagsRouter.get('/:id', async (c) => {
    const id = parseInt(c.req.param('id') || '0')

    const tag = await db.query.venueTags.findFirst({
        where: eq(venueTags.id, id)
    })

    if (!tag) {
        throw new NotFoundError('Venue Tag')
    }

    return successResponse(c, tag)
})

// POST /api/venue-tags - Create venue tag (admin only)
venueTagsRouter.post(
    '/',
    authenticate,
    requireAdmin,
    validate(createVenueTagSchema),
    async (c) => {
        const data = c.get('validatedData' as never) as {
            name: string
            color: string
        }

        const [newTag] = await db
            .insert(venueTags)
            .values({
                name: data.name,
                color: data.color || 'blue'
            })
            .returning()

        return successResponse(c, newTag, 'Venue Tag created successfully', 201)
    }
)

// PUT /api/venue-tags/:id - Update venue tag (admin only)
venueTagsRouter.put(
    '/:id',
    authenticate,
    requireAdmin,
    validate(updateVenueTagSchema),
    async (c) => {
        const id = parseInt(c.req.param('id') || '0')
        const data = c.get('validatedData' as never) as Partial<{
            name: string
            color: string
        }>

        const [updatedTag] = await db
            .update(venueTags)
            .set(data)
            .where(eq(venueTags.id, id))
            .returning()

        if (!updatedTag) {
            throw new NotFoundError('Venue Tag')
        }

        return successResponse(c, updatedTag, 'Venue Tag updated successfully')
    }
)

// DELETE /api/venue-tags/:id - Delete venue tag (admin only)
venueTagsRouter.delete('/:id', authenticate, requireAdmin, async (c) => {
    const id = parseInt(c.req.param('id') || '0')

    const [deletedTag] = await db
        .delete(venueTags)
        .where(eq(venueTags.id, id))
        .returning()

    if (!deletedTag) {
        throw new NotFoundError('Venue Tag')
    }

    return successResponse(c, null, 'Venue Tag deleted successfully')
})
