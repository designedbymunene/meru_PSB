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
    successResponse
} from '../utils/errors'

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
