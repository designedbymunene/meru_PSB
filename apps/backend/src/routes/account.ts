import { Hono } from 'hono'
import { db } from '../db'
import { users, activeSessions } from '../db/schema'
import { eq, and, ne } from 'drizzle-orm'
import { authenticate } from '../middleware/auth'
import { successResponse, ValidationError, UnauthorizedError, NotFoundError } from '../utils/errors'
import { hashPassword, verifyPassword } from '../utils/auth'
import { validate } from '../middleware/validation'
import { changePasswordSchema } from '@meru/shared'

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
