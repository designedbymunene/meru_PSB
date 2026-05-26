import { Hono } from 'hono'
import { authenticate, optionalAuthenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { validate } from '../middleware/validation'
import { createVacancySchema, updateVacancySchema } from '@meru/shared'
import { successResponse, NotFoundError } from '../utils/errors'
import { VacancyService } from '../services/vacancy-service'
import { publicRateLimiter } from '../middleware/rateLimiter'
import { AuditService } from '../services/audit-service'

export const vacanciesRouter = new Hono()

// ============ STATS ENDPOINT ============

// GET /api/vacancies/stats - Get vacancy statistics (Admin only)
vacanciesRouter.get('/stats', authenticate, requireAdmin, async (c) => {
    const requestId = c.get('requestId')
    const stats = await VacancyService.getStats(requestId)
    return successResponse(c, stats)
})

// GET /api/vacancies - Get all vacancies (public)
vacanciesRouter.get('/', publicRateLimiter, async (c) => {
    const requestId = c.get('requestId')
    const status = c.req.query('status')
    const departmentId = c.req.query('departmentId')
    const jobGroupId = c.req.query('jobGroupId')
    const search = c.req.query('search')
    const page = parseInt(c.req.query('page') || '1')
    const limit = Math.min(parseInt(c.req.query('limit') || '10'), 100)

    const result = await VacancyService.list({
        status,
        departmentId,
        jobGroupId,
        search,
        page,
        limit
    }, requestId)

    return successResponse(c, result)
})

// GET /api/vacancies/:id - Get single vacancy (public)
vacanciesRouter.get('/:id', publicRateLimiter, optionalAuthenticate, async (c) => {
    const requestId = c.get('requestId')
    const id = parseInt(c.req.param('id') || '0')
    const user = c.get('user')

    const result = await VacancyService.get(id, user?.userId, requestId)
    return successResponse(c, result)
})

// POST /api/vacancies - Create vacancy (admin only)
vacanciesRouter.post(
    '/',
    authenticate,
    requireAdmin,
    validate(createVacancySchema),
    async (c) => {
        const requestId = c.get('requestId')
        const user = c.get('user')
        const data = c.get('validatedData') as any

        const newVacancy = await VacancyService.create(data, user.userId, requestId)

        await AuditService.logAction({
            adminId: user.userId,
            action: 'CREATE_VACANCY',
            targetType: 'VACANCY',
            targetId: newVacancy.id,
            newState: newVacancy,
            ipAddress: c.req.header('x-forwarded-for') || c.req.header('remote-addr'),
            userAgent: c.req.header('user-agent')
        })

        const { createdAt, updatedAt, creator, ...responseVacancy } = newVacancy as any
        return successResponse(c, responseVacancy, 'Vacancy created successfully', 201)
    }
)

// PUT /api/vacancies/:id - Update vacancy (admin only)
vacanciesRouter.put(
    '/:id',
    authenticate,
    requireAdmin,
    validate(updateVacancySchema),
    async (c) => {
        const requestId = c.get('requestId')
        const id = parseInt(c.req.param('id') || '0')
        const user = c.get('user')
        const data = c.get('validatedData') as any

        const previousState = await VacancyService.get(id, user.userId, requestId)

        const updatedVacancy = await VacancyService.update(id, data, requestId)

        await AuditService.logAction({
            adminId: user.userId,
            action: 'UPDATE_VACANCY',
            targetType: 'VACANCY',
            targetId: id,
            previousState,
            newState: updatedVacancy,
            ipAddress: c.req.header('x-forwarded-for') || c.req.header('remote-addr'),
            userAgent: c.req.header('user-agent')
        })

        const { createdAt, updatedAt, creator, ...responseVacancy } = updatedVacancy as any
        return successResponse(c, responseVacancy, 'Vacancy updated successfully')
    }
)

// DELETE /api/vacancies/:id - Delete vacancy (admin only)
vacanciesRouter.delete('/:id', authenticate, requireAdmin, async (c) => {
    const requestId = c.get('requestId')
    const id = parseInt(c.req.param('id') || '0')
    const user = c.get('user')

    const previousState = await VacancyService.get(id, user.userId, requestId)

    await VacancyService.delete(id, requestId)

    await AuditService.logAction({
        adminId: user.userId,
        action: 'DELETE_VACANCY',
        targetType: 'VACANCY',
        targetId: id,
        previousState,
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('remote-addr'),
        userAgent: c.req.header('user-agent')
    })

    return successResponse(c, null, 'Vacancy deleted successfully')
})

// POST /api/vacancies/:id/pdf - Upload PDF for vacancy (admin only)
vacanciesRouter.post('/:id/pdf', authenticate, requireAdmin, async (c) => {
    const requestId = c.get('requestId')
    const id = parseInt(c.req.param('id') || '0')
    const user = c.get('user')

    const formData = await c.req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
        return c.json({ error: 'No file provided' }, 400)
    }

    if (file.type !== 'application/pdf') {
        return c.json({ error: 'Only PDF files are allowed' }, 400)
    }

    const buffer = await file.arrayBuffer()
    const newDocument = await VacancyService.uploadPdf({
        vacancyId: id,
        fileName: file.name,
        fileType: file.type,
        buffer,
        userId: user.userId
    }, requestId)

    return successResponse(c, newDocument, 'PDF uploaded successfully', 201)
})

// GET /api/vacancies/:id/pdfs - Get all PDFs for vacancy
vacanciesRouter.get('/:id/pdfs', publicRateLimiter, async (c) => {
    const requestId = c.get('requestId')
    const id = parseInt(c.req.param('id') || '0')

    const docs = await VacancyService.listPdfs(id, requestId)
    return successResponse(c, docs)
})

// DELETE /api/vacancies/:id/pdf/:pdfId - Delete PDF (admin only)
vacanciesRouter.delete('/:id/pdf/:pdfId', authenticate, requireAdmin, async (c) => {
    const requestId = c.get('requestId')
    const id = parseInt(c.req.param('id') || '0')
    const pdfId = parseInt(c.req.param('pdfId') || '0')

    await VacancyService.deletePdf(id, pdfId, requestId)
    return successResponse(c, null, 'PDF deleted successfully')
})
