import { Hono } from 'hono'
import { db } from '../db'
import { users, activeSessions, auditLogs } from '../db/schema'
import { eq, and, ne, desc, sql, or } from 'drizzle-orm'
import { authenticate } from '../middleware/auth'
import { successResponse, ValidationError, UnauthorizedError, NotFoundError } from '../utils/errors'
import { hashPassword, verifyPassword } from '../utils/auth'
import { validate } from '../middleware/validation'
import { changePasswordSchema } from '@meru/shared'
import { applicantDocuments } from '../db/schema'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { AuditService } from '../services/audit-service'

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

    const sessions = await db.select().from(activeSessions).where(eq(activeSessions.userId, user.userId))
    
    return successResponse(c, {
        twoFactorEnabled: dbUser.twoFactorEnabled,
        passwordLastChanged: dbUser.updatedAt ? dbUser.updatedAt.toISOString() : 'Never',
        activeSessions: sessions.length,
        currentDevice: sessions.find(s => s.isCurrent)?.deviceName || 'Unknown Device'
    })
})

// PUT /api/account/password - Update password
accountRouter.put('/password', authenticate, validate(changePasswordSchema), async (c) => {
    const user = c.get('user')
    const data = await c.req.json()
    
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
    
    const sessions = await db.select().from(activeSessions)
        .where(eq(activeSessions.userId, user.userId))
        .orderBy(activeSessions.lastActive)
        
    return successResponse(c, sessions)
})

// DELETE /api/account/sessions/:id - Revoke specific session
accountRouter.delete('/sessions/:id', authenticate, async (c) => {
    const user = c.get('user')
    const sessionId = parseInt(c.req.param('id'))

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
        previousState: session ? { deviceName: session.deviceName, deviceType: session.deviceType } : undefined,
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
            previousState: { deviceName: session.deviceName, deviceType: session.deviceType },
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
    
    const docs = await db.select().from(applicantDocuments)
        .where(eq(applicantDocuments.userId, user.userId))
        .orderBy(applicantDocuments.createdAt)
        
    return successResponse(c, docs)
})

// GET /api/account/documents/:id/view - View/Download a document
accountRouter.get('/documents/:id/view', authenticate, async (c) => {
    const user = c.get('user')
    const docId = parseInt(c.req.param('id'))
    
    const [doc] = await db.select().from(applicantDocuments)
        .where(and(
            eq(applicantDocuments.id, docId),
            user.role === 'admin' ? undefined : eq(applicantDocuments.userId, user.userId)
        ))
        
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
        console.error(`Failed to read file: ${absolutePath}`, err)
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

    // Create uploads directory if it doesn't exist
    try {
        await fs.access(UPLOADS_DIR)
    } catch {
        await fs.mkdir(UPLOADS_DIR, { recursive: true })
    }

    const originalName = file.name
    const mimeType = file.type
    const fileSize = file.size
    const extension = path.extname(originalName)
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
        fileSize,
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
        newState: { documentType, originalName, fileSize },
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || undefined,
        userAgent: c.req.header('user-agent')
    })

    return successResponse(c, doc, 'Document uploaded successfully')
})

// DELETE /api/account/documents/:id - Delete a document
accountRouter.delete('/documents/:id', authenticate, async (c) => {
    const user = c.get('user')
    const docId = parseInt(c.req.param('id'))
    
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
        console.error(`Failed to delete file: ${absolutePath}`, err)
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

// POST /api/account/test-audit - Test audit logging
accountRouter.post('/test-audit', authenticate, async (c) => {
    const user = c.get('user')

    console.log('[TEST] Creating test audit log for user:', user.userId)

    const log = await AuditService.logAction({
        adminId: user.userId,
        action: 'TEST_ACTION',
        targetType: 'TEST',
        targetId: 1,
        previousState: { test: 'before' },
        newState: { test: 'after' },
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || undefined,
        userAgent: c.req.header('user-agent')
    })

    console.log('[TEST] Audit log created:', log)

    return successResponse(c, { log }, 'Test audit log created')
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

        console.log('[AuditLogs] Fetching logs for user:', user.userId, 'page:', page, 'limit:', limit, 'action:', action)

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

        console.log('[AuditLogs] Total logs:', count)

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

        console.log('[AuditLogs] Retrieved logs:', logs.length)

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
        console.error('[AuditLogs] Error fetching logs:', error)
        throw error
    }
})


