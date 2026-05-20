import { Hono } from 'hono'
import { db, downloadCategories, downloadFiles } from '../db'
import { eq, desc, and, asc, sql } from 'drizzle-orm'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { validate } from '../middleware/validation'
import {
    createDownloadCategorySchema,
    updateDownloadCategorySchema
} from '@meru/shared'
import { NotFoundError, successResponse, ValidationError } from '../utils/errors'
import { logger } from '../utils/logger'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOADS_DIR = path.join(__dirname, '../../uploads/downloads')

async function saveDownloadFile(file: any): Promise<{ filename: string, formattedSize: string }> {
    try {
        await fs.access(UPLOADS_DIR)
    } catch {
        await fs.mkdir(UPLOADS_DIR, { recursive: true })
    }

    const originalName = file.name
    const fileSize = file.size
    const extension = path.extname(originalName)
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`
    const filePath = path.join(UPLOADS_DIR, filename)

    const arrayBuffer = await file.arrayBuffer()
    await fs.writeFile(filePath, Buffer.from(arrayBuffer))

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(fileSize) / Math.log(k))
    const formattedSize = parseFloat((fileSize / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]

    return { filename, formattedSize }
}

export const downloadsRouter = new Hono()


// ============ CATEGORIES ============

// GET /api/downloads/categories - Get all categories
downloadsRouter.get('/categories', async (c) => {
    const isActive = c.req.query('active')

    let query = db.select().from(downloadCategories).$dynamic()

    if (isActive === 'true') {
        query = query.where(eq(downloadCategories.isActive, true))
    }

    const categories = await query.orderBy(asc(downloadCategories.order), desc(downloadCategories.createdAt))

    return successResponse(c, categories)
})

// GET /api/downloads/categories/:id - Get single category with files
downloadsRouter.get('/categories/:id', async (c) => {
    const id = parseInt(c.req.param('id') || '0')

    const category = await db.query.downloadCategories.findFirst({
        where: eq(downloadCategories.id, id),
        with: {
            files: {
                where: eq(downloadFiles.isActive, true),
                orderBy: [asc(downloadFiles.order), desc(downloadFiles.createdAt)]
            }
        }
    })

    if (!category) {
        throw new NotFoundError('Download category')
    }

    return successResponse(c, category)
})

// POST /api/downloads/categories - Create category (admin only)
downloadsRouter.post(
    '/categories',
    authenticate,
    requireAdmin,
    validate(createDownloadCategorySchema),
    async (c) => {
        const data = c.get('validatedData' as never) as {
            title: string
            description: string
            icon?: string
            order?: number
            isActive?: boolean
        }

        const [newCategory] = await db
            .insert(downloadCategories)
            .values({
                title: data.title,
                description: data.description,
                icon: data.icon || 'FileText',
                order: data.order || 0,
                isActive: data.isActive !== undefined ? data.isActive : true
            })
            .returning()

        return successResponse(c, newCategory, 'Download category created successfully', 201)
    }
)

// PUT /api/downloads/categories/:id - Update category (admin only)
downloadsRouter.put(
    '/categories/:id',
    authenticate,
    requireAdmin,
    validate(updateDownloadCategorySchema),
    async (c) => {
        const id = parseInt(c.req.param('id') || '0')
        const data = c.get('validatedData' as never) as Partial<{
            title: string
            description: string
            icon: string
            order: number
            isActive: boolean
        }>

        const [updatedCategory] = await db
            .update(downloadCategories)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(downloadCategories.id, id))
            .returning()

        if (!updatedCategory) {
            throw new NotFoundError('Download category')
        }

        return successResponse(c, updatedCategory, 'Download category updated successfully')
    }
)

// DELETE /api/downloads/categories/:id - Delete category (admin only)
downloadsRouter.delete('/categories/:id', authenticate, requireAdmin, async (c) => {
    const id = parseInt(c.req.param('id') || '0')

    // Find all files in this category first to avoid orphan files on disk
    const files = await db.select().from(downloadFiles).where(eq(downloadFiles.categoryId, id))

    const [deletedCategory] = await db
        .delete(downloadCategories)
        .where(eq(downloadCategories.id, id))
        .returning()

    if (!deletedCategory) {
        throw new NotFoundError('Download category')
    }

    // Delete physical files from disk
    for (const file of files) {
        if (file.url) {
            const filePath = path.join(UPLOADS_DIR, file.url)
            try {
                await fs.unlink(filePath)
            } catch (err) {
                logger.error({ err, filePath }, '[Downloads] Failed to delete orphaned file from disk')
            }
        }
    }

    return successResponse(c, null, 'Download category deleted successfully')
})

// ============ FILES ============

// GET /api/downloads/files - Get all files (optionally by category)
downloadsRouter.get('/files', async (c) => {
    const categoryId = c.req.query('categoryId')
    const isActive = c.req.query('active')

    let query = db.select().from(downloadFiles).$dynamic()

    const conditions = []
    if (categoryId) {
        conditions.push(eq(downloadFiles.categoryId, parseInt(categoryId)))
    }
    if (isActive === 'true') {
        conditions.push(eq(downloadFiles.isActive, true))
    }
    if (conditions.length > 0) {
        query = query.where(and(...conditions))
    }

    const files = await query.orderBy(asc(downloadFiles.order), desc(downloadFiles.createdAt))

    return successResponse(c, files)
})

// GET /api/downloads/files/:id - Get single file
downloadsRouter.get('/files/:id', async (c) => {
    const id = parseInt(c.req.param('id') || '0')

    const file = await db.query.downloadFiles.findFirst({
        where: eq(downloadFiles.id, id),
        with: {
            category: true
        }
    })

    if (!file) {
        throw new NotFoundError('Download file')
    }

    // Increment download count atomically
    await db
        .update(downloadFiles)
        .set({ downloadCount: sql`COALESCE(${downloadFiles.downloadCount}, 0) + 1` })
        .where(eq(downloadFiles.id, id))

    return successResponse(c, { ...file, downloadCount: (file.downloadCount || 0) + 1 })
})

// GET /api/downloads/files/:id/download - Download a file
downloadsRouter.get('/files/:id/download', async (c) => {
    const id = parseInt(c.req.param('id') || '0')

    const file = await db.query.downloadFiles.findFirst({
        where: eq(downloadFiles.id, id)
    })

    if (!file) {
        throw new NotFoundError('Download file')
    }

    // Increment download count atomically
    await db
        .update(downloadFiles)
        .set({ downloadCount: sql`COALESCE(${downloadFiles.downloadCount}, 0) + 1` })
        .where(eq(downloadFiles.id, id))

    const absolutePath = path.join(UPLOADS_DIR, file.url)
    
    try {
        const fileBuffer = await fs.readFile(absolutePath)
        return c.body(fileBuffer, 200, {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${file.name}"`,
        })
    } catch (err) {
        logger.error({ err, path: absolutePath }, 'Failed to read file')
        throw new NotFoundError('File not found on server')
    }
})

// POST /api/downloads/files - Create file (admin only)
downloadsRouter.post(
    '/files',
    authenticate,
    requireAdmin,
    async (c) => {
        const body = await c.req.parseBody()
        const file = body['file'] as any
        
        if (!file) {
            throw new ValidationError('File is required')
        }

        const data = {
            categoryId: parseInt(body['categoryId'] as string),
            name: body['name'] as string,
            description: body['description'] as string,
            order: parseInt((body['order'] as string) || '0'),
            isActive: body['isActive'] === 'true'
        }

        if (isNaN(data.categoryId) || !data.name || !data.description) {
            throw new ValidationError('Missing required fields')
        }

        // Verify category exists
        const category = await db.query.downloadCategories.findFirst({
            where: eq(downloadCategories.id, data.categoryId)
        })

        if (!category) {
            throw new NotFoundError('Download category')
        }

        const { filename, formattedSize } = await saveDownloadFile(file)

        const [newFile] = await db
            .insert(downloadFiles)
            .values({
                categoryId: data.categoryId,
                name: data.name,
                description: data.description,
                url: filename,
                fileSize: formattedSize,
                updatedDate: new Date().toISOString().split('T')[0],
                order: data.order,
                isActive: data.isActive,
                downloadCount: 0
            })
            .returning()

        return successResponse(c, newFile, 'Download file created successfully', 201)
    }
)

// PUT /api/downloads/files/:id - Update file (admin only)
downloadsRouter.put(
    '/files/:id',
    authenticate,
    requireAdmin,
    async (c) => {
        const id = parseInt(c.req.param('id') || '0')
        const body = await c.req.parseBody()
        const file = body['file'] as any
        
        const data: any = {
            updatedAt: new Date()
        }

        if (body['categoryId']) data.categoryId = parseInt(body['categoryId'] as string)
        if (body['name']) data.name = body['name'] as string
        if (body['description']) data.description = body['description'] as string
        if (body['order']) data.order = parseInt(body['order'] as string)
        if (body['isActive']) data.isActive = body['isActive'] === 'true'

        // If category is being changed, verify it exists
        if (data.categoryId) {
            const category = await db.query.downloadCategories.findFirst({
                where: eq(downloadCategories.id, data.categoryId)
            })

            if (!category) {
                throw new NotFoundError('Download category')
            }
        }

        if (file) {
            const oldFile = await db.query.downloadFiles.findFirst({
                where: eq(downloadFiles.id, id)
            })

            const { filename, formattedSize } = await saveDownloadFile(file)
            data.fileSize = formattedSize
            data.url = filename
            data.updatedDate = new Date().toISOString().split('T')[0]
            
            if (oldFile?.url) {
                const oldFilePath = path.join(UPLOADS_DIR, oldFile.url)
                try {
                    await fs.unlink(oldFilePath)
                } catch (err) {
                    logger.error({ err, oldFilePath }, '[Downloads] Failed to delete old file from disk')
                }
            }
        }

        const [updatedFile] = await db
            .update(downloadFiles)
            .set(data)
            .where(eq(downloadFiles.id, id))
            .returning()

        if (!updatedFile) {
            throw new NotFoundError('Download file')
        }

        return successResponse(c, updatedFile, 'Download file updated successfully')
    }
)

// DELETE /api/downloads/files/:id - Delete file (admin only)
downloadsRouter.delete('/files/:id', authenticate, requireAdmin, async (c) => {
    const id = parseInt(c.req.param('id') || '0')

    const [deletedFile] = await db
        .delete(downloadFiles)
        .where(eq(downloadFiles.id, id))
        .returning()

    if (!deletedFile) {
        throw new NotFoundError('Download file')
    }

    // Delete physical file from disk
    if (deletedFile.url) {
        const filePath = path.join(UPLOADS_DIR, deletedFile.url)
        try {
            await fs.unlink(filePath)
        } catch (err) {
            // File may already be gone — log but don't fail
            logger.error({ err, filePath }, '[Downloads] Failed to delete file from disk')
        }
    }

    return successResponse(c, null, 'Download file deleted successfully')
})

// GET /api/downloads - Get all categories with files
downloadsRouter.get('/', async (c) => {
    const isActive = c.req.query('active')

    const categories = await db.query.downloadCategories.findMany({
        where: isActive === 'true' ? eq(downloadCategories.isActive, true) : undefined,
        with: {
            files: {
                where: isActive === 'true' ? eq(downloadFiles.isActive, true) : undefined,
                orderBy: [asc(downloadFiles.order), desc(downloadFiles.createdAt)]
            }
        },
        orderBy: [asc(downloadCategories.order), desc(downloadCategories.createdAt)]
    })

    return successResponse(c, categories)
})
