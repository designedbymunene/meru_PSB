import { Hono } from 'hono'
import { db, departments } from '../db'
import { eq, desc } from 'drizzle-orm'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { validate } from '../middleware/validation'
import { createDepartmentSchema, updateDepartmentSchema } from '@meru/shared'
import { NotFoundError, successResponse } from '../utils/errors'
import { AuditService } from '../services/audit-service'

export const departmentsRouter = new Hono()

// GET /api/departments - Get all departments
departmentsRouter.get('/', async (c) => {
    const status = c.req.query('status')

    let query = db.select().from(departments).$dynamic()

    if (status && (status === 'active' || status === 'inactive')) {
        query = query.where(eq(departments.status, status))
    }

    const allDepartments = await query.orderBy(desc(departments.createdAt))

    return successResponse(c, allDepartments)
})

// GET /api/departments/:id - Get single department
departmentsRouter.get('/:id', async (c) => {
    const id = parseInt(c.req.param('id') || '0')

    const department = await db.query.departments.findFirst({
        where: eq(departments.id, id)
    })

    if (!department) {
        throw new NotFoundError('Department')
    }

    return successResponse(c, department)
})

// POST /api/departments - Create department (admin only)
departmentsRouter.post(
    '/',
    authenticate,
    requireAdmin,
    validate(createDepartmentSchema),
    async (c) => {
        const user = c.get('user')
        const data = c.get('validatedData' as never) as {
            name: string
            description?: string
            status?: string
        }

        const [newDepartment] = await db
            .insert(departments)
            .values({
                name: data.name,
                description: data.description || null,
                status: data.status || 'active'
            })
            .returning()

        await AuditService.logAction({
            adminId: user.userId,
            action: 'CREATE_DEPARTMENT',
            targetType: 'DEPARTMENT',
            targetId: newDepartment.id,
            newState: newDepartment,
            ipAddress: c.req.header('x-forwarded-for') || c.req.header('remote-addr'),
            userAgent: c.req.header('user-agent')
        })

        return successResponse(c, newDepartment, 'Department created successfully', 201)
    }
)

// PUT /api/departments/:id - Update department (admin only)
departmentsRouter.put(
    '/:id',
    authenticate,
    requireAdmin,
    validate(updateDepartmentSchema),
    async (c) => {
        const id = parseInt(c.req.param('id') || '0')
        const user = c.get('user')
        const data = c.get('validatedData' as never) as Partial<{
            name: string
            description: string
            status: string
        }>

        const previousState = await db.query.departments.findFirst({
            where: eq(departments.id, id)
        })

        if (!previousState) {
            throw new NotFoundError('Department')
        }

        const [updatedDepartment] = await db
            .update(departments)
            .set(data)
            .where(eq(departments.id, id))
            .returning()

        await AuditService.logAction({
            adminId: user.userId,
            action: 'UPDATE_DEPARTMENT',
            targetType: 'DEPARTMENT',
            targetId: id,
            previousState,
            newState: updatedDepartment,
            ipAddress: c.req.header('x-forwarded-for') || c.req.header('remote-addr'),
            userAgent: c.req.header('user-agent')
        })

        return successResponse(c, updatedDepartment, 'Department updated successfully')
    }
)

// DELETE /api/departments/:id - Delete department (admin only)
departmentsRouter.delete('/:id', authenticate, requireAdmin, async (c) => {
    const id = parseInt(c.req.param('id') || '0')
    const user = c.get('user')

    const previousState = await db.query.departments.findFirst({
        where: eq(departments.id, id)
    })

    if (!previousState) {
        throw new NotFoundError('Department')
    }

    const [deletedDepartment] = await db
        .delete(departments)
        .where(eq(departments.id, id))
        .returning()

    await AuditService.logAction({
        adminId: user.userId,
        action: 'DELETE_DEPARTMENT',
        targetType: 'DEPARTMENT',
        targetId: id,
        previousState,
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('remote-addr'),
        userAgent: c.req.header('user-agent')
    })

    return successResponse(c, null, 'Department deleted successfully')
})
