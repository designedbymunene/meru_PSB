import { Hono } from 'hono'
import { db, jobGroups } from '../db'
import { eq, desc } from 'drizzle-orm'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { validate } from '../middleware/validation'
import { createJobGroupSchema, updateJobGroupSchema } from '@meru/shared'
import { NotFoundError, successResponse } from '../utils/errors'
import { AuditService } from '../services/audit-service'

export const jobGroupsRouter = new Hono()

// GET /api/job-groups - Get all job groups
jobGroupsRouter.get('/', async (c) => {
    const status = c.req.query('status')

    let query = db.select().from(jobGroups).$dynamic()

    if (status && (status === 'active' || status === 'inactive')) {
        query = query.where(eq(jobGroups.status, status))
    }

    const allJobGroups = await query.orderBy(desc(jobGroups.createdAt))

    return successResponse(c, allJobGroups)
})

// GET /api/job-groups/:id - Get single job group
jobGroupsRouter.get('/:id', async (c) => {
    const id = parseInt(c.req.param('id') || '0')

    const jobGroup = await db.query.jobGroups.findFirst({
        where: eq(jobGroups.id, id)
    })

    if (!jobGroup) {
        throw new NotFoundError('Job Group')
    }

    return successResponse(c, jobGroup)
})

// POST /api/job-groups - Create job group (admin only)
jobGroupsRouter.post(
    '/',
    authenticate,
    requireAdmin,
    validate(createJobGroupSchema),
    async (c) => {
        const user = c.get('user')
        const data = c.get('validatedData' as never) as {
            name: string
            description?: string
            salaryMin: string
            salaryMax: string
            status?: string
        }

        const [newJobGroup] = await db
            .insert(jobGroups)
            .values({
                name: data.name,
                description: data.description || null,
                salaryMin: data.salaryMin,
                salaryMax: data.salaryMax,
                status: data.status || 'active'
            })
            .returning()

        await AuditService.logAction({
            adminId: user.userId,
            action: 'CREATE_JOB_GROUP',
            targetType: 'JOB_GROUP',
            targetId: newJobGroup.id,
            newState: newJobGroup,
            ipAddress: c.req.header('x-forwarded-for') || c.req.header('remote-addr'),
            userAgent: c.req.header('user-agent')
        })

        return successResponse(c, newJobGroup, 'Job Group created successfully', 201)
    }
)

// PUT /api/job-groups/:id - Update job group (admin only)
jobGroupsRouter.put(
    '/:id',
    authenticate,
    requireAdmin,
    validate(updateJobGroupSchema),
    async (c) => {
        const id = parseInt(c.req.param('id') || '0')
        const user = c.get('user')
        const data = c.get('validatedData' as never) as Partial<{
            name: string
            description: string
            salaryMin: string
            salaryMax: string
            status: string
        }>

        const previousState = await db.query.jobGroups.findFirst({
            where: eq(jobGroups.id, id)
        })

        if (!previousState) {
            throw new NotFoundError('Job Group')
        }

        const [updatedJobGroup] = await db
            .update(jobGroups)
            .set(data)
            .where(eq(jobGroups.id, id))
            .returning()

        await AuditService.logAction({
            adminId: user.userId,
            action: 'UPDATE_JOB_GROUP',
            targetType: 'JOB_GROUP',
            targetId: id,
            previousState,
            newState: updatedJobGroup,
            ipAddress: c.req.header('x-forwarded-for') || c.req.header('remote-addr'),
            userAgent: c.req.header('user-agent')
        })

        return successResponse(c, updatedJobGroup, 'Job Group updated successfully')
    }
)

// DELETE /api/job-groups/:id - Delete job group (admin only)
jobGroupsRouter.delete('/:id', authenticate, requireAdmin, async (c) => {
    const id = parseInt(c.req.param('id') || '0')
    const user = c.get('user')

    const previousState = await db.query.jobGroups.findFirst({
        where: eq(jobGroups.id, id)
    })

    if (!previousState) {
        throw new NotFoundError('Job Group')
    }

    const [deletedJobGroup] = await db
        .delete(jobGroups)
        .where(eq(jobGroups.id, id))
        .returning()

    await AuditService.logAction({
        adminId: user.userId,
        action: 'DELETE_JOB_GROUP',
        targetType: 'JOB_GROUP',
        targetId: id,
        previousState,
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('remote-addr'),
        userAgent: c.req.header('user-agent')
    })

    return successResponse(c, null, 'Job Group deleted successfully')
})
