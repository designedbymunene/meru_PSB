import { Hono } from 'hono'
import { db } from '../db'
import { users, activeSessions } from '../db/schema'
import { eq, and, ne } from 'drizzle-orm'
import { authenticate } from '../middleware/auth'
import { successResponse, ValidationError, UnauthorizedError, NotFoundError } from '../utils/errors'
import { hashPassword, verifyPassword } from '../utils/auth'
import { validate } from '../middleware/validation'
import { changePasswordSchema } from '@meru/shared'
import { applicantDocuments } from '../db/schema'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'

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

    return successResponse(c, null, 'Password updated successfully')
})

// POST /api/account/2fa/toggle - Toggle 2FA
accountRouter.post('/2fa/toggle', authenticate, async (c) => {
    const user = c.get('user')
    const { enabled } = await c.req.json()
    
    await db.update(users)
        .set({ twoFactorEnabled: enabled, updatedAt: new Date() })
        .where(eq(users.id, user.userId))
        
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
    
    await db.delete(activeSessions)
        .where(and(
            eq(activeSessions.id, sessionId),
            eq(activeSessions.userId, user.userId),
            eq(activeSessions.isCurrent, false) // Can't revoke current session this way, use logout
        ))
        
    return successResponse(c, null, 'Session revoked')
})

// DELETE /api/account/sessions - Revoke all other sessions
accountRouter.delete('/sessions', authenticate, async (c) => {
    const user = c.get('user')
    
    await db.delete(activeSessions)
        .where(and(
            eq(activeSessions.userId, user.userId),
            eq(activeSessions.isCurrent, false)
        ))
        
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


