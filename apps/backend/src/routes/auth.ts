import { Hono } from 'hono'
import { and, desc, eq, gt, isNull } from 'drizzle-orm'
import { db, passwordResetSessions, users, revokedTokens, applicantProfiles } from '../db'
import { validate } from '../middleware/validation'
import { authRateLimiter } from '../middleware/rateLimiter'
import {
    registerSchema,
    loginSchema,
    login2faSchema,
    forgotPasswordRequestSchema,
    refreshTokenSchema,
    resetPasswordSchema
} from '@meru/shared'
import {
    hashPassword,
    generatePasswordResetOtp,
    hashPasswordResetOtp,
    verifyPassword,
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    verifyPasswordResetOtp
} from '../utils/auth'
import { sendPasswordResetOtpEmail, sendTwoFactorOtpEmail } from '../utils/mailer'
import { activeSessions } from '../db/schema'
import {
    ConflictError,
    UnauthorizedError,
    successResponse
} from '../utils/errors'

export const authRouter = new Hono()

// POST /api/auth/register - Register new user
authRouter.post('/register', authRateLimiter, validate(registerSchema), async (c) => {
    const requestId = Math.random().toString(36).substring(7)
    console.log(`[Auth] [${requestId}] Registration attempt started`)
    
    const data = c.get('validatedData' as never) as {
        email: string
        phoneNumber: string
        password: string
        fullName: string
        nationalId: string
        role?: string
    }

    try {
        // Hash password
        console.log(`[Auth] [${requestId}] Hashing password for: ${data.email}`)
        const hashedPassword = await hashPassword(data.password)

        // Create user and profile in a transaction
        console.log(`[Auth] [${requestId}] Executing database transaction`)
        
        const { newUser, profile } = await db.transaction(async (tx) => {
            // 1. Create user
            console.log(`[Auth] [${requestId}] [Tx] Inserting user`)
            const [u] = await tx
                .insert(users)
                .values({
                    email: data.email.toLowerCase(),
                    phoneNumber: data.phoneNumber,
                    password: hashedPassword,
                    fullName: data.fullName,
                    role: data.role || 'applicant'
                })
                .returning()

            // 2. Create applicant profile if role is applicant
            let p = null
            if (u.role === 'applicant') {
                console.log(`[Auth] [${requestId}] [Tx] Inserting applicant profile`)
                const [createdProfile] = await tx
                    .insert(applicantProfiles)
                    .values({
                        userId: u.id,
                        fullName: u.fullName,
                        idNumber: data.nationalId,
                        email: u.email,
                        phoneNumber: u.phoneNumber
                    })
                    .returning()
                p = createdProfile
            }

            return { newUser: u, profile: p }
        })

        console.log(`[Auth] [${requestId}] Registration successful. User: ${newUser.id}, Profile: ${profile?.id || 'none'}`)

        // Generate tokens
        const tokenPayload = {
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role,
            tokenVersion: newUser.tokenVersion ?? 0
        }

        const accessToken = generateAccessToken(tokenPayload)
        const refreshToken = generateRefreshToken(tokenPayload)

        console.log(`[Auth] [${requestId}] Tokens generated, sending success response`)

        return successResponse(
            c,
            {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    phoneNumber: newUser.phoneNumber,
                    fullName: newUser.fullName,
                    role: newUser.role
                },
                accessToken,
                refreshToken
            },
            'Registration successful',
            201
        )
    } catch (error: any) {
        console.error(`[Auth] [${requestId}] Registration failed:`, error.message)
        
        // Check for PostgreSQL unique constraint violation (code 23505)
        if (error.code === '23505') {
            if (error.detail?.includes('email')) {
                throw new ConflictError('User with this email already exists')
            }
            if (error.detail?.includes('phone_number')) {
                throw new ConflictError('Phone number already registered')
            }
            if (error.detail?.includes('id_number')) {
                throw new ConflictError('National ID already registered')
            }
            throw new ConflictError('User already exists')
        }
        throw error
    }
})

// POST /api/auth/login - Login user
authRouter.post('/login', authRateLimiter, validate(loginSchema), async (c) => {
    const data = c.get('validatedData' as never) as {
        email: string
        password: string
        deviceId?: string
        deviceName?: string
        os?: string
    }

    // Find user
    const user = await db.query.users.findFirst({
        where: eq(users.email, data.email.toLowerCase())
    })

    if (!user) {
        throw new UnauthorizedError('Invalid email or password')
    }

    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.password)

    if (!isValidPassword) {
        throw new UnauthorizedError('Invalid email or password')
    }

    // Check for 2FA
    if (user.twoFactorEnabled) {
        const otp = generatePasswordResetOtp() // Reuse same generator
        const otpHash = await hashPasswordResetOtp(otp)
        
        // Use passwordResetSessions for 2FA too, or create new table. 
        // Let's use it for now as it has expiry and userId.
        await db.delete(passwordResetSessions).where(eq(passwordResetSessions.userId, user.id))
        await db.insert(passwordResetSessions).values({
            userId: user.id,
            otpHash,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        })

        await sendTwoFactorOtpEmail({
            to: user.email,
            fullName: user.fullName,
            otp
        })

        return successResponse(c, { twoFactorRequired: true }, 'Verification code sent to your email')
    }

    // Generate tokens
    const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion ?? 0
    }

    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    // Record session
    await db.insert(activeSessions).values({
        userId: user.id,
        tokenVersion: user.tokenVersion ?? 0,
        deviceId: data.deviceId,
        deviceName: data.deviceName,
        os: data.os,
        ipAddress: c.req.header('x-forwarded-for') || '127.0.0.1',
        userAgent: c.req.header('user-agent'),
        isCurrent: true
    })

    return successResponse(c, {
        user: {
            id: user.id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            fullName: user.fullName,
            role: user.role
        },
        accessToken,
        refreshToken
    })
})

// POST /api/auth/login/2fa - Verify 2FA and complete login
authRouter.post('/login/2fa', authRateLimiter, validate(login2faSchema), async (c) => {
    const data = c.get('validatedData' as never) as {
        email: string
        otp: string
        deviceId?: string
        deviceName?: string
        os?: string
    }

    const user = await db.query.users.findFirst({
        where: eq(users.email, data.email.toLowerCase())
    })

    if (!user) throw new UnauthorizedError('Invalid request')

    const [session] = await db.select().from(passwordResetSessions)
        .where(and(
            eq(passwordResetSessions.userId, user.id),
            isNull(passwordResetSessions.usedAt),
            gt(passwordResetSessions.expiresAt, new Date())
        ))
        .orderBy(desc(passwordResetSessions.createdAt))

    if (!session) {
        throw new UnauthorizedError('Verification code expired or invalid')
    }

    const isValid = await verifyPasswordResetOtp(data.otp, session.otpHash)
    if (!isValid) {
        throw new UnauthorizedError('Invalid verification code')
    }

    // Mark session as used
    await db.update(passwordResetSessions)
        .set({ usedAt: new Date() })
        .where(eq(passwordResetSessions.id, session.id))

    // Generate tokens
    const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion ?? 0
    }

    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    // Record session
    await db.insert(activeSessions).values({
        userId: user.id,
        tokenVersion: user.tokenVersion ?? 0,
        deviceId: data.deviceId,
        deviceName: data.deviceName,
        os: data.os,
        ipAddress: c.req.header('x-forwarded-for') || '127.0.0.1',
        userAgent: c.req.header('user-agent'),
        isCurrent: true
    })

    return successResponse(c, {
        user: {
            id: user.id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            fullName: user.fullName,
            role: user.role
        },
        accessToken,
        refreshToken
    })
})

// POST /api/auth/logout - Logout user and revoke refresh token
authRouter.post('/logout', validate(refreshTokenSchema), async (c) => {
    const data = c.get('validatedData' as never) as { refreshToken: string }

    try {
        const decoded = verifyRefreshToken(data.refreshToken)

        // Store revoked token with its expiry
        await db.insert(revokedTokens).values({
            token: data.refreshToken,
            expiresAt: decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }).onConflictDoNothing()

        // Also remove from active sessions if we can match it (ideally we'd have the sessionId in the token or something)
        // For now, let's just mark the current session as not current if we had a way to identify it.
        // Actually, if we have the userId from decoded token, we can do some cleanup.
        await db.delete(activeSessions).where(eq(activeSessions.userId, decoded.userId)) 
        // Note: The above might be too aggressive if they have multiple sessions. 
        // Ideally we should only delete the session associated with THIS token.

        return successResponse(c, null, 'Logged out successfully')
    } catch (error) {
        // Even if token is invalid/expired, we consider it a successful logout
        return successResponse(c, null, 'Logged out successfully')
    }
})

// POST /api/auth/refresh - Refresh access token
authRouter.post('/refresh', validate(refreshTokenSchema), async (c) => {
    const data = c.get('validatedData' as never) as { refreshToken: string }

    try {
        // Check if token is revoked
        const isRevoked = await db.query.revokedTokens.findFirst({
            where: eq(revokedTokens.token, data.refreshToken)
        })

        if (isRevoked) {
            throw new UnauthorizedError('Invalid or expired refresh token')
        }

        const decoded = verifyRefreshToken(data.refreshToken)

        const user = await db.query.users.findFirst({
            where: eq(users.id, decoded.userId)
        })

        if (!user || (user.tokenVersion ?? 0) !== decoded.tokenVersion) {
            throw new UnauthorizedError('Invalid or expired refresh token')
        }

        // Generate new access token
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            tokenVersion: user.tokenVersion ?? 0
        })

        return successResponse(c, { accessToken })
    } catch (error) {
        if (error instanceof UnauthorizedError) throw error
        throw new UnauthorizedError('Invalid or expired refresh token')
    }
})

// POST /api/auth/forgot-password/request - Request a password reset code
authRouter.post('/forgot-password/request', authRateLimiter, validate(forgotPasswordRequestSchema), async (c) => {
    const data = c.get('validatedData' as never) as {
        email: string
    }

    // Find user
    const user = await db.query.users.findFirst({
        where: eq(users.email, data.email.toLowerCase())
    })

    if (user) {
        console.log(`[Auth] User found for password reset: ${user.email}`)
        const otp = generatePasswordResetOtp()
        const otpHash = await hashPasswordResetOtp(otp)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

        await db.delete(passwordResetSessions).where(eq(passwordResetSessions.userId, user.id))

        const [session] = await db
            .insert(passwordResetSessions)
            .values({
                userId: user.id,
                otpHash,
                expiresAt,
                attemptCount: 0
            })
            .returning()

        try {
            await sendPasswordResetOtpEmail({
                to: user.email,
                fullName: user.fullName,
                otp
            })
        } catch (error: any) {
            console.error(`[Auth] Failed to send password reset email: ${error.message}`)
            await db.delete(passwordResetSessions).where(eq(passwordResetSessions.id, session.id))
            throw error
        }
    } else {
        console.log(`[Auth] Password reset requested for non-existent email: ${data.email.toLowerCase()}`)
    }

    return successResponse(c, null, 'If the account exists, a reset code has been sent')
})

// POST /api/auth/reset-password - Confirm password reset with OTP
authRouter.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), async (c) => {
    const data = c.get('validatedData' as never) as {
        email: string
        otp: string
        newPassword: string
    }

    const user = await db.query.users.findFirst({
        where: eq(users.email, data.email.toLowerCase())
    })

    if (!user) {
        throw new UnauthorizedError('Invalid or expired reset code')
    }

    const [session] = await db
        .select()
        .from(passwordResetSessions)
        .where(
            and(
                eq(passwordResetSessions.userId, user.id),
                isNull(passwordResetSessions.usedAt),
                gt(passwordResetSessions.expiresAt, new Date())
            )
        )
        .orderBy(desc(passwordResetSessions.createdAt))
        .limit(1)

    if (!session) {
        throw new UnauthorizedError('Invalid or expired reset code')
    }

    const isValidCode = await verifyPasswordResetOtp(data.otp, session.otpHash)

    if (!isValidCode) {
        const nextAttemptCount = session.attemptCount + 1
        await db
            .update(passwordResetSessions)
            .set({
                attemptCount: nextAttemptCount,
                usedAt: nextAttemptCount >= 5 ? new Date() : session.usedAt
            })
            .where(eq(passwordResetSessions.id, session.id))

        throw new UnauthorizedError('Invalid or expired reset code')
    }

    // Update password and invalidate existing tokens
    const hashedPassword = await hashPassword(data.newPassword)

    await db.transaction(async (tx) => {
        await tx
            .update(users)
            .set({
                password: hashedPassword,
                tokenVersion: (user.tokenVersion ?? 0) + 1
            })
            .where(eq(users.id, user.id))

        await tx
            .update(passwordResetSessions)
            .set({
                usedAt: new Date(),
                attemptCount: session.attemptCount + 1
            })
            .where(eq(passwordResetSessions.id, session.id))
    })

    return successResponse(c, null, 'Password reset successful')
})
