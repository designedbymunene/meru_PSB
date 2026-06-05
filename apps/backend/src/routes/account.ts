import { Hono } from 'hono'
import { getUploadConfig } from '../utils/env'
import { logger } from '../utils/logger'
import { db } from '../db'
import { users, activeSessions, auditLogs } from '../db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { authenticate } from '../middleware/auth'
import { successResponse, ValidationError, NotFoundError } from '../utils/errors'
import { hashPassword, verifyPassword } from '../utils/auth'
import { validate } from '../middleware/validation'
import { changePasswordSchema } from '@meru/shared'
import { applicantDocuments } from '../db/schema'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { AuditService } from '../services/audit-service'
import { AuthService } from '../services/auth-service'
import { buildPagination, parsePagination } from '../utils/pagination'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOADS_DIR = path.join(__dirname, '../../uploads/applicant-documents')


export const accountRouter = new Hono()

// GET /api/account/security - Get security settings
accountRouter.get('/security', authenticate, async (c) => {
    const user = c.get('user')
    
    const [dbUser] = await db.select().from(users).where(eq(users.id, user.userId))
    
    if (!dbUser) {
        throw new NotFoundError('User not found')
    }

    const [{ count: activeSessionCount }] = await db.select({ count: sql<number>`count(*)::int` })
        .from(activeSessions)
        .where(eq(activeSessions.userId, user.userId))
    const [currentSession] = await db.select({
        deviceName: activeSessions.deviceName
    }).from(activeSessions)
        .where(and(
            eq(activeSessions.userId, user.userId),
            eq(activeSessions.isCurrent, true)
        ))
        .limit(1)
    
    return successResponse(c, {
        twoFactorEnabled: dbUser.twoFactorEnabled,
        passwordLastChanged: dbUser.updatedAt ? dbUser.updatedAt.toISOString() : 'Never',
        activeSessions: activeSessionCount,
        currentDevice: currentSession?.deviceName || 'Unknown Device'
    })
})

// PUT /api/account/password - Update password
accountRouter.put('/password', authenticate, validate(changePasswordSchema), async (c) => {
    const user = c.get('user')
    const data = c.get('validatedData') as { currentPassword: string; newPassword: string }
    
    const [dbUser] = await db.select().from(users).where(eq(users.id, user.userId))
    if (!dbUser) throw new NotFoundError('User not found')

    // Verify current password
    const isValid = await verifyPassword(data.currentPassword, dbUser.password)
    if (!isValid) {
        throw new ValidationError('Invalid current password')
    }

    // Hash new password
    const hashedPassword = await hashPassword(data.newPassword)

    // Update password and bump token version to invalidate sessions if desired
    // (Wait, do we want to logout all other devices on password change? Usually yes.)
    await db.transaction(async (tx) => {
        await tx.update(users)
            .set({
                password: hashedPassword,
                tokenVersion: dbUser.tokenVersion + 1,
                updatedAt: new Date()
            })
            .where(eq(users.id, user.userId))

        // Invalidate all sessions except the current one
        await tx.delete(activeSessions)
            .where(and(
                eq(activeSessions.userId, user.userId),
                eq(activeSessions.isCurrent, false)
            ))
    })

    // Log the password change
    await AuditService.logAction({
        adminId: user.userId,
        action: 'PASSWORD_CHANGE',
        targetType: 'USER',
        targetId: user.userId,
        previousState: { passwordLastChanged: dbUser.updatedAt },
        newState: { passwordLastChanged: new Date() },
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || undefined,
        userAgent: c.req.header('user-agent')
    })

    return successResponse(c, null, 'Password updated successfully')
})

// POST /api/account/2fa/toggle - Toggle 2FA
accountRouter.post('/2fa/toggle', authenticate, async (c) => {
    const user = c.get('user')
    const { enabled } = await c.req.json()

    const [dbUser] = await db.select().from(users).where(eq(users.id, user.userId))
    if (!dbUser) throw new NotFoundError('User not found')

    await db.update(users)
        .set({ twoFactorEnabled: enabled, updatedAt: new Date() })
        .where(eq(users.id, user.userId))

    // Log the 2FA toggle
    await AuditService.logAction({
        adminId: user.userId,
        action: enabled ? '2FA_ENABLED' : '2FA_DISABLED',
        targetType: 'USER',
        targetId: user.userId,
        previousState: { twoFactorEnabled: dbUser.twoFactorEnabled },
        newState: { twoFactorEnabled: enabled },
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || undefined,
        userAgent: c.req.header('user-agent')
    })

    return successResponse(c, { enabled }, `Two-factor authentication ${enabled ? 'enabled' : 'disabled'}`)
})

// GET /api/account/sessions - List active sessions
accountRouter.get('/sessions', authenticate, async (c) => {
    const user = c.get('user')
    const { page, limit, offset } = parsePagination(c.req.query('page'), c.req.query('limit'))

    const [sessions, totalResult] = await Promise.all([
        db.select().from(activeSessions)
            .where(eq(activeSessions.userId, user.userId))
            .orderBy(activeSessions.lastActive)
            .limit(limit)
            .offset(offset),
        db.select({ count: sql<number>`count(*)::int` })
            .from(activeSessions)
            .where(eq(activeSessions.userId, user.userId))
    ])

    return successResponse(c, {
        data: sessions,
        pagination: buildPagination(totalResult[0]?.count ?? 0, page, limit)
    })
})

// DELETE /api/account/sessions/:id - Revoke specific session
accountRouter.delete('/sessions/:id', authenticate, async (c) => {
    const user = c.get('user')
    const sessionId = parseInt(c.req.param('id') || '0')

    const [session] = await db.select().from(activeSessions)
        .where(eq(activeSessions.id, sessionId))

    await db.delete(activeSessions)
        .where(and(
            eq(activeSessions.id, sessionId),
            eq(activeSessions.userId, user.userId),
            eq(activeSessions.isCurrent, false) // Can't revoke current session this way, use logout
        ))

    // Log the session revocation
    await AuditService.logAction({
        adminId: user.userId,
        action: 'SESSION_REVOKED',
        targetType: 'SESSION',
        targetId: sessionId,
        previousState: session ? { deviceName: session.deviceName, os: session.os } : undefined,
        newState: { status: 'revoked' },
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || undefined,
        userAgent: c.req.header('user-agent')
    })

    return successResponse(c, null, 'Session revoked')
})

// DELETE /api/account/sessions - Revoke all other sessions
accountRouter.delete('/sessions', authenticate, async (c) => {
    const user = c.get('user')

    const sessions = await db.select().from(activeSessions)
        .where(and(
            eq(activeSessions.userId, user.userId),
            eq(activeSessions.isCurrent, false)
        ))

    await db.delete(activeSessions)
        .where(and(
            eq(activeSessions.userId, user.userId),
            eq(activeSessions.isCurrent, false)
        ))

    // Log each session revocation
    for (const session of sessions) {
        await AuditService.logAction({
            adminId: user.userId,
            action: 'SESSION_REVOKED',
            targetType: 'SESSION',
            targetId: session.id,
            previousState: { deviceName: session.deviceName, os: session.os },
            newState: { status: 'revoked' },
            ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || undefined,
            userAgent: c.req.header('user-agent')
        })
    }

    return successResponse(c, null, 'All other sessions revoked')
})

// GET /api/account/documents - List user's documents
accountRouter.get('/documents', authenticate, async (c) => {
    const user = c.get('user')
    const { page, limit, offset } = parsePagination(c.req.query('page'), c.req.query('limit'))

    const [docs, totalResult] = await Promise.all([
        db.select().from(applicantDocuments)
            .where(eq(applicantDocuments.userId, user.userId))
            .orderBy(applicantDocuments.createdAt)
            .limit(limit)
            .offset(offset),
        db.select({ count: sql<number>`count(*)::int` })
            .from(applicantDocuments)
            .where(eq(applicantDocuments.userId, user.userId))
    ])

    return successResponse(c, {
        data: docs,
        pagination: buildPagination(totalResult[0]?.count ?? 0, page, limit)
    })
})

// GET /api/account/documents/:id/view - View/Download a document
accountRouter.get('/documents/:id/view', authenticate, async (c) => {
    const user = c.get('user')
    const docId = parseInt(c.req.param('id') || '0')
    
    const conditions = [eq(applicantDocuments.id, docId)]
    if (user.role !== 'admin') {
        conditions.push(eq(applicantDocuments.userId, user.userId))
    }

    const [doc] = await db.select().from(applicantDocuments)
        .where(and(...conditions))
        
    if (!doc) {
        throw new NotFoundError('Document not found')
    }

    const absolutePath = path.join(__dirname, '../../uploads', doc.filePath)
    
    try {
        const fileBuffer = await fs.readFile(absolutePath)
        return c.body(fileBuffer, 200, {
            'Content-Type': doc.mimeType,
            'Content-Disposition': `inline; filename="${doc.originalName}"`,
        })
    } catch (err) {
        logger.error({ err, path: absolutePath }, 'Failed to read file')
        throw new NotFoundError('File not found on server')
    }
})

// POST /api/account/documents/upload - Upload a document
accountRouter.post('/documents/upload', authenticate, async (c) => {
    const user = c.get('user')
    const body = await c.req.parseBody()
    
    const file = body['file'] as any
    const documentType = body['documentType'] as string
    
    if (!file || !documentType) {
        throw new ValidationError('File and document type are required')
    }

    if (typeof documentType !== 'string' || documentType.trim().length === 0 || documentType.length > 100) {
        throw new ValidationError('Invalid document type. It must be between 1 and 100 characters.')
    }

    // Validate that it is a file object
    if (!file.name || typeof file.size !== 'number' || typeof file.arrayBuffer !== 'function') {
        throw new ValidationError('Invalid file uploaded')
    }

    // Validate file size limit
    const uploadConfig = getUploadConfig()
    if (file.size > uploadConfig.MAX_FILE_SIZE) {
        throw new ValidationError(`File size exceeds the maximum limit of ${uploadConfig.MAX_FILE_SIZE / 1024 / 1024}MB`)
    }

    const originalName = file.name
    const mimeType = file.type
    const extension = path.extname(originalName).toLowerCase()

    // Whitelist file extensions and MIME types
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx']
    const allowedMimeTypes = [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedExtensions.includes(extension) || !allowedMimeTypes.includes(mimeType)) {
        throw new ValidationError('Invalid file type. Only PDF, PNG, JPG, and DOC/DOCX files are allowed.')
    }

    // Create uploads directory if it doesn't exist
    try {
        await fs.access(UPLOADS_DIR)
    } catch {
        await fs.mkdir(UPLOADS_DIR, { recursive: true })
    }

    const filename = `${user.userId}-${Date.now()}${extension}`
    const filePath = path.join(UPLOADS_DIR, filename)

    // Save file to disk
    const arrayBuffer = await file.arrayBuffer()
    await fs.writeFile(filePath, Buffer.from(arrayBuffer))

    // Save record to database
    const [doc] = await db.insert(applicantDocuments).values({
        userId: user.userId,
        documentType,
        originalName,
        filename,
        filePath: `applicant-documents/${filename}`,
        fileSize: file.size,
        mimeType,
        status: 'uploaded'
    }).returning()

    // Log the document upload
    await AuditService.logAction({
        adminId: user.userId,
        action: 'DOCUMENT_UPLOADED',
        targetType: 'DOCUMENT',
        targetId: doc.id,
        previousState: undefined,
        newState: { documentType, originalName, fileSize: file.size },
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || undefined,
        userAgent: c.req.header('user-agent')
    })

    return successResponse(c, doc, 'Document uploaded successfully')
})


// DELETE /api/account/documents/:id - Delete a document
accountRouter.delete('/documents/:id', authenticate, async (c) => {
    const user = c.get('user')
    const docId = parseInt(c.req.param('id') || '0')
    
    const [doc] = await db.select().from(applicantDocuments)
        .where(and(
            eq(applicantDocuments.id, docId),
            eq(applicantDocuments.userId, user.userId)
        ))
        
    if (!doc) {
        throw new NotFoundError('Document not found')
    }

    // Delete from disk
    const absolutePath = path.join(__dirname, '../../uploads', doc.filePath)
    try {
        await fs.unlink(absolutePath)
    } catch (err) {
        logger.error({ err, path: absolutePath }, 'Failed to delete file from disk')
    }

    // Delete from database
    await db.delete(applicantDocuments)
        .where(eq(applicantDocuments.id, docId))

    // Log the document deletion
    await AuditService.logAction({
        adminId: user.userId,
        action: 'DOCUMENT_DELETED',
        targetType: 'DOCUMENT',
        targetId: docId,
        previousState: { documentType: doc.documentType, originalName: doc.originalName },
        newState: { status: 'deleted' },
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || undefined,
        userAgent: c.req.header('user-agent')
    })

    return successResponse(c, null, 'Document deleted')
})


// POST /api/account/push-token - Save push notification token
accountRouter.post('/push-token', authenticate, async (c) => {
    const user = c.get('user')
    const { pushToken } = await c.req.json()

    if (!pushToken) {
        throw new ValidationError('Push token is required')
    }

    await db.update(users)
        .set({ pushToken, updatedAt: new Date() })
        .where(eq(users.id, user.userId))

    return successResponse(c, null, 'Push token saved successfully')
})

// GET /api/account/audit-logs - Get user's audit logs
accountRouter.get('/audit-logs', authenticate, async (c) => {
    const user = c.get('user')

    try {
        const url = new URL(c.req.url)
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
        const action = url.searchParams.get('action')
        const offset = (page - 1) * limit

        logger.debug({ userId: user.userId, page, limit, action }, '[AuditLogs] Fetching logs for user')

        // Build query conditions
        const conditions = [
            eq(auditLogs.adminId, user.userId)
        ]

        // Filter by action type if provided
        if (action) {
            conditions.push(eq(auditLogs.action, action))
        }

        // Get total count for pagination
        const [{ count }] = await db.select({ count: sql<number>`count(*)::int` })
            .from(auditLogs)
            .where(and(...conditions))

        logger.debug({ count }, '[AuditLogs] Total logs count')

        // Fetch audit logs with pagination
        const logs = await db.select({
            id: auditLogs.id,
            action: auditLogs.action,
            targetType: auditLogs.targetType,
            targetId: auditLogs.targetId,
            previousState: auditLogs.previousState,
            newState: auditLogs.newState,
            ipAddress: auditLogs.ipAddress,
            userAgent: auditLogs.userAgent,
            createdAt: auditLogs.createdAt
        })
            .from(auditLogs)
            .where(and(...conditions))
            .orderBy(desc(auditLogs.createdAt))
            .limit(limit)
            .offset(offset)

        logger.debug({ count: logs.length }, '[AuditLogs] Retrieved logs')

        return successResponse(c, {
            logs,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit),
                hasNext: page * limit < count,
                hasPrev: page > 1
            }
        })
    } catch (error) {
        logger.error({ err: error, userId: user.userId }, '[AuditLogs] Error fetching logs')
        throw error
    }
})

// GET /api/account/avatar/:filename - Public retrieval of avatar (no auth required)
accountRouter.get('/avatar/:filename', async (c) => {
    const filename = c.req.param('filename')
    
    // Security: prevent directory traversal by validating filename
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw new ValidationError('Invalid filename')
    }
    
    const AVATARS_DIR = path.join(__dirname, '../../uploads/avatars')
    const absolutePath = path.join(AVATARS_DIR, filename)
    
    try {
        const fileBuffer = await fs.readFile(absolutePath)
        const ext = path.extname(filename).toLowerCase()
        let mimeType = 'image/png'
        if (ext === '.jpg' || ext === '.jpeg') {
            mimeType = 'image/jpeg'
        }
        
        return c.body(fileBuffer, 200, {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=31536000', // Cache for a year
        })
    } catch (err) {
        logger.error({ err, path: absolutePath }, 'Failed to read avatar file')
        throw new NotFoundError('Avatar not found')
    }
})

// POST /api/account/avatar - Upload/Update avatar image (auth required)
accountRouter.post('/avatar', authenticate, async (c) => {
    const user = c.get('user')
    const body = await c.req.parseBody()
    
    const file = body['avatar'] as any
    if (!file) {
        throw new ValidationError('Avatar file is required')
    }
    
    // Validate file object structure
    if (!file.name || typeof file.size !== 'number' || typeof file.arrayBuffer !== 'function') {
        throw new ValidationError('Invalid file uploaded')
    }
    
    // Limit to 5MB
    const maxAvatarSize = 5 * 1024 * 1024
    if (file.size > maxAvatarSize) {
        throw new ValidationError('Avatar file size exceeds the 5MB limit')
    }
    
    const originalName = file.name
    const mimeType = file.type
    const extension = path.extname(originalName).toLowerCase()
    
    const allowedExtensions = ['.png', '.jpg', '.jpeg']
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg']
    
    if (!allowedExtensions.includes(extension) || !allowedMimeTypes.includes(mimeType)) {
        throw new ValidationError('Invalid file type. Only PNG, JPG, and JPEG images are allowed.')
    }
    
    const AVATARS_DIR = path.join(__dirname, '../../uploads/avatars')
    
    // Create avatars directory if it doesn't exist
    try {
        await fs.access(AVATARS_DIR)
    } catch {
        await fs.mkdir(AVATARS_DIR, { recursive: true })
    }
    
    // Look up current user to delete old avatar if exists
    const [dbUser] = await db.select().from(users).where(eq(users.id, user.userId))
    if (dbUser && dbUser.avatar) {
        const oldFilename = dbUser.avatar.split('/').pop()
        if (oldFilename) {
            const oldFilePath = path.join(AVATARS_DIR, oldFilename)
            try {
                await fs.unlink(oldFilePath)
            } catch (err) {
                // Ignore errors if file doesn't exist
                logger.warn({ err, oldFilePath }, 'Could not delete old avatar file')
            }
        }
    }
    
    const filename = `${user.userId}-${Date.now()}${extension}`
    const filePath = path.join(AVATARS_DIR, filename)
    
    // Save file to disk
    const arrayBuffer = await file.arrayBuffer()
    await fs.writeFile(filePath, Buffer.from(arrayBuffer))
    
    // Update user avatar in database
    const avatarUrl = `/api/account/avatar/${filename}`
    
    await db.update(users)
        .set({ avatar: avatarUrl, updatedAt: new Date() })
        .where(eq(users.id, user.userId))
        
    // Log audit action
    await AuditService.logAction({
        adminId: user.userId,
        action: 'AVATAR_UPDATED',
        targetType: 'USER',
        targetId: user.userId,
        previousState: dbUser ? { avatar: dbUser.avatar } : undefined,
        newState: { avatar: avatarUrl },
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || undefined,
        userAgent: c.req.header('user-agent')
    })
    
    return successResponse(c, { avatar: avatarUrl }, 'Avatar updated successfully')
})

// DELETE /api/account/avatar - Delete user avatar (auth required)
accountRouter.delete('/avatar', authenticate, async (c) => {
    const user = c.get('user')
    const AVATARS_DIR = path.join(__dirname, '../../uploads/avatars')
    
    const [dbUser] = await db.select().from(users).where(eq(users.id, user.userId))
    if (!dbUser) {
        throw new NotFoundError('User not found')
    }
    
    if (dbUser.avatar) {
        const filename = dbUser.avatar.split('/').pop()
        if (filename) {
            const filePath = path.join(AVATARS_DIR, filename)
            try {
                await fs.unlink(filePath)
            } catch (err) {
                logger.warn({ err, filePath }, 'Could not delete avatar file on disk')
            }
        }
        
        await db.update(users)
            .set({ avatar: null, updatedAt: new Date() })
            .where(eq(users.id, user.userId))
            
        await AuditService.logAction({
            adminId: user.userId,
            action: 'AVATAR_DELETED',
            targetType: 'USER',
            targetId: user.userId,
            previousState: { avatar: dbUser.avatar },
            newState: { avatar: null },
            ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || undefined,
            userAgent: c.req.header('user-agent')
        })
    }
    
    return successResponse(c, null, 'Avatar removed successfully')
})

// DELETE /api/account - Delete authenticated user's own account
accountRouter.delete('/', authenticate, async (c) => {
    const user = c.get('user')
    const requestId = c.get('requestId')
    
    await AuthService.deleteUserAccount(user.userId, requestId)
    
    return successResponse(c, null, 'Your account and all associated personal data have been permanently deleted')
})


