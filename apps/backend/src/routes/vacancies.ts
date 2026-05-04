import { Hono } from 'hono'
import { db, vacancies, vacancyDocuments, applications, departments, jobGroups, users } from '../db'
import { eq, desc, and, inArray } from 'drizzle-orm'
import { authenticate, optionalAuthenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { validate } from '../middleware/validation'
import { createVacancySchema, updateVacancySchema } from '@meru/shared'
import { NotFoundError, successResponse } from '../utils/errors'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export const vacanciesRouter = new Hono()

// GET /api/vacancies - Get all vacancies (public)
vacanciesRouter.get('/', async (c) => {
    const status = c.req.query('status')
    const departmentId = c.req.query('departmentId')
    const jobGroupId = c.req.query('jobGroupId')

    const conditions = []
    if (status && (status === 'open' || status === 'closed')) {
        conditions.push(eq(vacancies.status, status))
    }
    if (departmentId) {
        conditions.push(eq(vacancies.departmentId, parseInt(departmentId)))
    }
    if (jobGroupId) {
        conditions.push(eq(vacancies.jobGroupId, parseInt(jobGroupId)))
    }

    // Use a simpler query approach to avoid lateral join issues with Drizzle 0.45.1
    const vacancyList = await db
        .select()
        .from(vacancies)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(vacancies.createdAt))

    if (vacancyList.length === 0) {
        return successResponse(c, [])
    }

    // Get unique IDs for related data
    const departmentIds = [...new Set(vacancyList.map(v => v.departmentId).filter(Boolean))] as number[]
    const jobGroupIds = [...new Set(vacancyList.map(v => v.jobGroupId))]
    const creatorIds = [...new Set(vacancyList.map(v => v.createdBy))]

    // Fetch related data in parallel
    const [departmentList, jobGroupList, creatorList] = await Promise.all([
        departmentIds.length > 0
            ? db.select().from(departments).where(inArray(departments.id, departmentIds))
            : Promise.resolve([]),
        db.select().from(jobGroups).where(inArray(jobGroups.id, jobGroupIds)),
        db.select({
            id: users.id,
            phoneNumber: users.phoneNumber,
            fullName: users.fullName,
            email: users.email
        }).from(users).where(inArray(users.id, creatorIds))
    ])

    // Create lookup maps
    const departmentMap = new Map(departmentList.map(d => [d.id, d]))
    const jobGroupMap = new Map(jobGroupList.map(jg => [jg.id, jg]))
    const creatorMap = new Map(creatorList.map(u => [u.id, u]))

    // Combine results
    const allVacancies = vacancyList.map(vacancy => ({
        ...vacancy,
        department: vacancy.departmentId ? departmentMap.get(vacancy.departmentId) ?? null : null,
        jobGroup: jobGroupMap.get(vacancy.jobGroupId) ?? null,
        creator: creatorMap.get(vacancy.createdBy) ?? null
    }))

    return successResponse(c, allVacancies)
})

// GET /api/vacancies/:id - Get single vacancy (public)
vacanciesRouter.get('/:id', optionalAuthenticate, async (c) => {
    const id = parseInt(c.req.param('id'))
    const user = c.get('user')

    const vacancy = await db.query.vacancies.findFirst({
        where: eq(vacancies.id, id),
        with: {
            creator: {
                columns: {
                    id: true,
                    phoneNumber: true,
                    fullName: true,
                    email: true
                }
            },
            department: true,
            jobGroup: true,
            documents: {
                columns: {
                    id: true,
                    filename: true,
                    originalName: true,
                    fileSize: true,
                    mimeType: true,
                    createdAt: true
                }
            }
        }
    })

    if (!vacancy) {
        throw new NotFoundError('Vacancy')
    }

    // Check if current user has applied
    let hasApplied = false
    if (user) {
        const application = await db.query.applications.findFirst({
            where: and(
                eq(applications.applicantId, user.userId),
                eq(applications.vacancyId, id)
            )
        })
        hasApplied = !!application
    }

    return successResponse(c, { ...vacancy, hasApplied })
})

// POST /api/vacancies - Create vacancy (admin only)
vacanciesRouter.post(
    '/',
    authenticate,
    requireAdmin,
    validate(createVacancySchema),
    async (c) => {
        const user = c.get('user')
        const data = c.get('validatedData' as never) as {
            advertisementNumber: string
            title: string
            description: string
            departmentId: number
            jobGroupId: number
            closingDate: string
            openPositions?: number
            jobRequirements?: string[]
            jobResponsibilities?: string[]
            status?: string
        }

        // Generate advertisement number if not provided
        let advertisementNumber = data.advertisementNumber
        if (!advertisementNumber) {
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
            const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase()
            advertisementNumber = `VAC-${dateStr}-${randomSuffix}`
        }

        const [newVacancy] = await db
            .insert(vacancies)
            .values({
                advertisementNumber: advertisementNumber,
                title: data.title,
                description: data.description,
                departmentId: data.departmentId,
                jobGroupId: data.jobGroupId,
                closingDate: data.closingDate,
                openPositions: data.openPositions || 1,
                jobRequirements: data.jobRequirements || [],
                jobResponsibilities: data.jobResponsibilities || [],
                status: data.status || 'open',
                createdBy: user.userId
            })
            .returning()

        return successResponse(c, newVacancy, 'Vacancy created successfully', 201)
    }
)

// PUT /api/vacancies/:id - Update vacancy (admin only)
vacanciesRouter.put(
    '/:id',
    authenticate,
    requireAdmin,
    validate(updateVacancySchema),
    async (c) => {
        const id = parseInt(c.req.param('id'))
        const data = c.get('validatedData' as never) as Partial<{
            advertisementNumber: string
            title: string
            description: string
            departmentId: number
            jobGroupId: number
            closingDate: string
            openPositions: number
            jobRequirements: string[]
            jobResponsibilities: string[]
            status: string
        }>

        const [updatedVacancy] = await db
            .update(vacancies)
            .set(data)
            .where(eq(vacancies.id, id))
            .returning()

        if (!updatedVacancy) {
            throw new NotFoundError('Vacancy')
        }

        return successResponse(c, updatedVacancy, 'Vacancy updated successfully')
    }
)

// DELETE /api/vacancies/:id - Delete vacancy (admin only)
vacanciesRouter.delete('/:id', authenticate, requireAdmin, async (c) => {
    const id = parseInt(c.req.param('id'))

    const [deletedVacancy] = await db
        .delete(vacancies)
        .where(eq(vacancies.id, id))
        .returning()

    if (!deletedVacancy) {
        throw new NotFoundError('Vacancy')
    }

    // Delete associated documents and files
    const docs = await db.query.vacancyDocuments.findMany({
        where: eq(vacancyDocuments.vacancyId, id)
    })

    for (const doc of docs) {
        try {
            fs.unlinkSync(doc.filePath)
        } catch (err) {
            console.error(`Failed to delete file: ${doc.filePath}`, err)
        }
    }

    await db.delete(vacancyDocuments).where(eq(vacancyDocuments.vacancyId, id))

    return successResponse(c, null, 'Vacancy deleted successfully')
})

// POST /api/vacancies/:id/pdf - Upload PDF for vacancy (admin only)
vacanciesRouter.post('/:id/pdf', authenticate, requireAdmin, async (c) => {
    const id = parseInt(c.req.param('id'))
    const user = c.get('user')

    const vacancy = await db.query.vacancies.findFirst({
        where: eq(vacancies.id, id)
    })

    if (!vacancy) {
        throw new NotFoundError('Vacancy')
    }

    const formData = await c.req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
        return c.json({ error: 'No file provided' }, 400)
    }

    if (file.type !== 'application/pdf') {
        return c.json({ error: 'Only PDF files are allowed' }, 400)
    }

    const buffer = await file.arrayBuffer()
    const uploadDir = path.join(process.cwd(), 'uploads/vacancies', id.toString())

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.name)
    const filename = `doc-${uniqueSuffix}${ext}`
    const filePath = path.join(uploadDir, filename)

    fs.writeFileSync(filePath, Buffer.from(buffer))

    const [newDocument] = await db
        .insert(vacancyDocuments)
        .values({
            vacancyId: id,
            filename: filename,
            originalName: file.name,
            filePath: filePath,
            fileSize: buffer.byteLength,
            mimeType: file.type,
            uploadedBy: user.userId
        })
        .returning()

    return successResponse(c, newDocument, 'PDF uploaded successfully', 201)
})

// GET /api/vacancies/:id/pdfs - Get all PDFs for vacancy
vacanciesRouter.get('/:id/pdfs', async (c) => {
    const id = parseInt(c.req.param('id'))

    const vacancy = await db.query.vacancies.findFirst({
        where: eq(vacancies.id, id)
    })

    if (!vacancy) {
        throw new NotFoundError('Vacancy')
    }

    const docs = await db.query.vacancyDocuments.findMany({
        where: eq(vacancyDocuments.vacancyId, id),
        orderBy: desc(vacancyDocuments.createdAt)
    })

    return successResponse(c, docs)
})

// DELETE /api/vacancies/:id/pdf/:pdfId - Delete PDF (admin only)
vacanciesRouter.delete('/:id/pdf/:pdfId', authenticate, requireAdmin, async (c) => {
    const id = parseInt(c.req.param('id'))
    const pdfId = parseInt(c.req.param('pdfId'))

    const doc = await db.query.vacancyDocuments.findFirst({
        where: eq(vacancyDocuments.id, pdfId)
    })

    if (!doc || doc.vacancyId !== id) {
        throw new NotFoundError('PDF Document')
    }

    try {
        fs.unlinkSync(doc.filePath)
    } catch (err) {
        console.error(`Failed to delete file: ${doc.filePath}`, err)
    }

    await db.delete(vacancyDocuments).where(eq(vacancyDocuments.id, pdfId))

    return successResponse(c, null, 'PDF deleted successfully')
})

