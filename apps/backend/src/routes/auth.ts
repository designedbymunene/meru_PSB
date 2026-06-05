import { Hono } from 'hono'
import { validate } from '../middleware/validation'
import { authRateLimiter } from '../middleware/rateLimiter'
import {
    registerSchema,
    loginSchema,
    login2faSchema,
    forgotPasswordRequestSchema,
    refreshTokenSchema,
    resetPasswordSchema,
    otpLoginRequestSchema,
    otpLoginVerifySchema
} from '@meru/shared'
import type { RegisterInput } from '@meru/shared'
import { AuthService } from '../services/auth-service'
import {
    ValidationError,
    successResponse,
    NotFoundError,
    UnauthorizedError
} from '../utils/errors'
import { db, users, applicantProfiles, loginOtpSessions } from '../db'
import { eq, and, isNull, gt, desc } from 'drizzle-orm'
import { generatePasswordResetOtp, hashPasswordResetOtp, verifyPasswordResetOtp } from '../utils/auth'
import { sendAccountDeletionOtpEmail } from '../utils/mailer'
import { logger } from '../utils/logger'

export const authRouter = new Hono()

// POST /api/auth/register - Register new user
authRouter.post('/register', authRateLimiter, validate(registerSchema), async (c) => {
    const requestId = c.get('requestId')
    const data = c.get('validatedData') as RegisterInput

    const result = await AuthService.register(data, requestId)

    return successResponse(
        c,
        result,
        'Registration successful',
        201
    )
})

// POST /api/auth/login - Login user
authRouter.post('/login', authRateLimiter, validate(loginSchema), async (c) => {
    const requestId = c.get('requestId')
    const data = c.get('validatedData') as any

    const ipAddress = c.req.header('x-forwarded-for') || '127.0.0.1'
    const userAgent = c.req.header('user-agent')

    const result = await AuthService.login({
        ...data,
        ipAddress,
        userAgent
    }, requestId)

    if ('twoFactorRequired' in result) {
        return successResponse(c, { twoFactorRequired: true }, result.message)
    }

    return successResponse(c, result)
})

// POST /api/auth/login/2fa - Verify 2FA and complete login
authRouter.post('/login/2fa', authRateLimiter, validate(login2faSchema), async (c) => {
    const requestId = c.get('requestId')
    const data = c.get('validatedData') as any

    const ipAddress = c.req.header('x-forwarded-for') || '127.0.0.1'
    const userAgent = c.req.header('user-agent')

    const result = await AuthService.login2fa({
        ...data,
        ipAddress,
        userAgent
    }, requestId)

    return successResponse(c, result)
})

// POST /api/auth/logout - Logout user and revoke refresh token
authRouter.post('/logout', validate(refreshTokenSchema), async (c) => {
    const data = c.get('validatedData') as { refreshToken: string }
    await AuthService.logout(data.refreshToken)
    return successResponse(c, null, 'Logged out successfully')
})

// POST /api/auth/refresh - Refresh access token
authRouter.post('/refresh', validate(refreshTokenSchema), async (c) => {
    const data = c.get('validatedData') as { refreshToken: string }
    const result = await AuthService.refresh(data.refreshToken)
    return successResponse(c, result)
})

// POST /api/auth/forgot-password/request - Request a password reset code
authRouter.post('/forgot-password/request', authRateLimiter, validate(forgotPasswordRequestSchema), async (c) => {
    const requestId = c.get('requestId')
    const data = c.get('validatedData') as { email: string }

    await AuthService.requestForgotPassword(data.email, requestId)

    return successResponse(c, null, 'If the account exists, a reset code has been sent')
})

// POST /api/auth/reset-password - Confirm password reset with OTP
authRouter.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), async (c) => {
    const requestId = c.get('requestId')
    const data = c.get('validatedData') as any

    await AuthService.resetPassword(data, requestId)

    return successResponse(c, null, 'Password reset successful')
})

// POST /api/auth/otp/request - Request a login OTP (passwordless)
authRouter.post('/otp/request', authRateLimiter, validate(otpLoginRequestSchema), async (c) => {
    const requestId = c.get('requestId')
    const data = c.get('validatedData') as { email: string }

    await AuthService.requestOtp(data.email, requestId)

    return successResponse(c, null, 'Verification code sent to your email')
})

// POST /api/auth/otp/verify - Verify login OTP and login
authRouter.post('/otp/verify', authRateLimiter, validate(otpLoginVerifySchema), async (c) => {
    const requestId = c.get('requestId')
    const data = c.get('validatedData') as any

    const ipAddress = c.req.header('x-forwarded-for') || '127.0.0.1'
    const userAgent = c.req.header('user-agent')

    const result = await AuthService.verifyOtp({
        ...data,
        ipAddress,
        userAgent
    }, requestId)

    return successResponse(c, result, 'Login successful')
})

// POST /api/auth/unlock - Unlock account with token
authRouter.post('/unlock', authRateLimiter, async (c) => {
    const requestId = c.get('requestId')
    const body = await c.req.json()
    const email = body?.email
    const token = body?.token

    if (!email || typeof email !== 'string') {
        throw new ValidationError('A valid email is required')
    }
    if (!token || typeof token !== 'string') {
        throw new ValidationError('A valid unlock token is required')
    }

    await AuthService.unlock(email, token, requestId)

    return successResponse(c, null, 'Account unlocked successfully. You can now log in.')
})

// POST /api/auth/delete-request - Request account deletion OTP
authRouter.post('/delete-request', authRateLimiter, async (c) => {
    const { email, nationalId } = await c.req.json()
    const requestId = c.get('requestId')

    if (!email || !nationalId) {
        throw new ValidationError('Email and National ID are required')
    }

    // Find user by email
    const user = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase())
    })

    if (!user) {
        throw new NotFoundError('No account found with this email address')
    }

    // Find profile by userId and check nationalId
    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.userId, user.id)
    })

    if (!profile || profile.idNumber.trim().toLowerCase() !== nationalId.trim().toLowerCase()) {
        throw new ValidationError('The National ID / Passport Number does not match our records for this email address')
    }

    // Generate and send OTP using loginOtpSessions
    const otp = generatePasswordResetOtp()
    const otpHash = await hashPasswordResetOtp(otp)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete existing OTP sessions first
    await db.delete(loginOtpSessions).where(eq(loginOtpSessions.userId, user.id))
    
    await db.insert(loginOtpSessions).values({
        userId: user.id,
        otpHash,
        expiresAt,
        attemptCount: 0
    })

    try {
        await sendAccountDeletionOtpEmail({
            to: user.email,
            fullName: user.fullName,
            otp
        })
    } catch (error: any) {
        logger.error({ err: error, userId: user.id, requestId }, '[AuthRouter] Failed to send account deletion OTP email')
        if (process.env.NODE_ENV !== 'production') throw error
    }

    return successResponse(c, null, 'A verification code has been sent to your registered email address.')
})

// POST /api/auth/delete-confirm - Verify OTP and delete account
authRouter.post('/delete-confirm', authRateLimiter, async (c) => {
    const { email, otp } = await c.req.json()
    const requestId = c.get('requestId')

    if (!email || !otp) {
        throw new ValidationError('Email and verification code are required')
    }

    const user = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase())
    })

    if (!user) {
        throw new NotFoundError('User not found')
    }

    // Find active OTP session
    const [session] = await db
        .select()
        .from(loginOtpSessions)
        .where(and(
            eq(loginOtpSessions.userId, user.id),
            isNull(loginOtpSessions.usedAt),
            gt(loginOtpSessions.expiresAt, new Date())
        ))
        .orderBy(desc(loginOtpSessions.createdAt))
        .limit(1)

    if (!session) {
        throw new ValidationError('Verification code expired or invalid. Please request a new one.')
    }

    const isValid = await verifyPasswordResetOtp(otp, session.otpHash)

    if (!isValid) {
        // Increment attempts
        const nextAttemptCount = session.attemptCount + 1
        const update: { attemptCount: number; usedAt?: Date } = { attemptCount: nextAttemptCount }
        if (nextAttemptCount >= 5) {
            update.usedAt = new Date()
        }
        await db.update(loginOtpSessions).set(update).where(eq(loginOtpSessions.id, session.id))

        throw new ValidationError('Invalid verification code. Please try again.')
    }

    // Mark session used
    await db.update(loginOtpSessions).set({ usedAt: new Date() }).where(eq(loginOtpSessions.id, session.id))

    // Perform deletion!
    await AuthService.deleteUserAccount(user.id, requestId)

    return successResponse(c, null, 'Your account and all associated personal data have been permanently deleted.')
})
