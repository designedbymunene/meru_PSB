import { and, desc, eq, gt, isNull } from 'drizzle-orm'
import { db, passwordResetSessions, loginOtpSessions, users, revokedTokens, applicantProfiles } from '../db'
import { activeSessions } from '../db/schema'
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
import {
    sendPasswordResetOtpEmail,
    sendTwoFactorOtpEmail,
    sendLoginOtpEmail,
    sendUnlockAccountEmail,
    sendRegistrationSuccessEmail
} from '../utils/mailer'
import { getAppConfig } from '../utils/env'
import {
    ConflictError,
    UnauthorizedError,
    NotFoundError,
    ForbiddenError
} from '../utils/errors'
import { logger } from '../utils/logger'
import type { RegisterInput } from '@meru/shared'

const { FRONTEND_URL } = getAppConfig()

export class AuthService {
    private static async createLoginOtpSession(userId: number, otpHash: string, expiresAt: Date) {
        await db.delete(loginOtpSessions).where(eq(loginOtpSessions.userId, userId))

        const [session] = await db.insert(loginOtpSessions).values({
            userId,
            otpHash,
            expiresAt,
            attemptCount: 0
        }).returning()

        return session
    }

    private static async getActiveLoginOtpSession(userId: number) {
        const [session] = await db
            .select()
            .from(loginOtpSessions)
            .where(and(
                eq(loginOtpSessions.userId, userId),
                isNull(loginOtpSessions.usedAt),
                gt(loginOtpSessions.expiresAt, new Date())
            ))
            .orderBy(desc(loginOtpSessions.createdAt))
            .limit(1)

        return session
    }

    private static async markLoginOtpSessionUsed(sessionId: number) {
        await db.update(loginOtpSessions)
            .set({ usedAt: new Date() })
            .where(eq(loginOtpSessions.id, sessionId))
    }

    private static async failLoginOtpSessionAttempt(sessionId: number, attemptCount: number) {
        const update: { attemptCount: number; usedAt?: Date } = { attemptCount }
        if (attemptCount >= 5) {
            update.usedAt = new Date()
        }

        await db.update(loginOtpSessions)
            .set(update)
            .where(eq(loginOtpSessions.id, sessionId))
    }

    static async register(data: RegisterInput, requestId?: string) {
        logger.info({ requestId }, '[AuthService] Registration attempt started')
        const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim()

        try {
            logger.debug({ requestId }, '[AuthService] Hashing password for new registration')
            const hashedPassword = await hashPassword(data.password)

            logger.debug({ requestId }, '[AuthService] Executing database transaction')
            const { newUser, profile } = await db.transaction(async (tx) => {
                // 1. Create user
                logger.debug({ requestId }, '[AuthService] [Tx] Inserting user')
                const [u] = await tx
                    .insert(users)
                    .values({
                        email: data.email.toLowerCase(),
                        phoneNumber: data.phoneNumber,
                        password: hashedPassword,
                        fullName,
                        role: 'applicant' // Always force applicant role on registration
                    })
                    .returning()

                // 2. Create applicant profile if role is applicant
                let p = null
                if (u.role === 'applicant') {
                    logger.debug({ requestId }, '[AuthService] [Tx] Inserting applicant profile')
                    const [createdProfile] = await tx
                        .insert(applicantProfiles)
                        .values({
                            userId: u.id,
                            fullName,
                            idNumber: data.nationalId,
                            email: u.email,
                            phoneNumber: u.phoneNumber
                        })
                        .returning()
                    p = createdProfile
                }

                return { newUser: u, profile: p }
            })

            logger.info({ requestId, userId: newUser.id, profileId: profile?.id }, '[AuthService] Registration successful')

            const tokenPayload = {
                userId: newUser.id,
                email: newUser.email,
                role: newUser.role,
                tokenVersion: newUser.tokenVersion ?? 0
            }

            const accessToken = generateAccessToken(tokenPayload)
            const refreshToken = generateRefreshToken(tokenPayload)

            void sendRegistrationSuccessEmail({
                to: newUser.email,
                fullName: newUser.fullName,
                profileUrl: `${FRONTEND_URL}/dashboard?showProfileModal=true`
            }).catch((error) => {
                logger.error({ requestId, err: error }, '[AuthService] Registration success email failed')
            })

            return {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    phoneNumber: newUser.phoneNumber,
                    fullName: newUser.fullName,
                    role: newUser.role
                },
                accessToken,
                refreshToken
            }
        } catch (error: any) {
            logger.error({ requestId, err: error }, '[AuthService] Registration failed')

            const dbError = error.cause || error
            if (dbError.code === '23505') {
                if (dbError.detail?.includes('email')) {
                    throw new ConflictError('User with this email already exists')
                }
                if (dbError.detail?.includes('phone_number')) {
                    throw new ConflictError('Phone number already registered')
                }
                if (dbError.detail?.includes('id_number')) {
                    throw new ConflictError('National ID already registered')
                }
                throw new ConflictError('User already exists')
            }
            throw error
        }
    }

    static async login(data: {
        email: string
        password: string
        deviceId?: string
        deviceName?: string
        os?: string
        ipAddress: string
        userAgent?: string
    }, requestId?: string) {
        logger.info({ requestId }, '[AuthService] Login attempt started')

        const [user] = await db.select().from(users).where(eq(users.email, data.email.toLowerCase())).limit(1)

        if (!user) {
            throw new UnauthorizedError('Invalid email or password')
        }

        if (user.isLocked) {
            if (user.lockoutUntil && user.lockoutUntil > new Date()) {
                throw new ForbiddenError('Account is locked. Please check your email to unlock or try again later.')
            } else if (user.lockoutUntil && user.lockoutUntil <= new Date()) {
                await db.update(users)
                    .set({ isLocked: false, failedLoginAttempts: 0, lockoutUntil: null })
                    .where(eq(users.id, user.id))
            }
        }

        const isValidPassword = await verifyPassword(data.password, user.password)

        if (!isValidPassword) {
            const nextFailedAttempts = (user.failedLoginAttempts ?? 0) + 1
            const isNowLocked = nextFailedAttempts >= 5
            const lockoutUntil = isNowLocked ? new Date(Date.now() + 30 * 60 * 1000) : null

            await db.update(users)
                .set({ 
                    failedLoginAttempts: nextFailedAttempts,
                    isLocked: isNowLocked,
                    lockoutUntil
                })
                .where(eq(users.id, user.id))

            if (isNowLocked) {
                const otp = generatePasswordResetOtp()
                const otpHash = await hashPasswordResetOtp(otp)
                
                await db.delete(passwordResetSessions).where(eq(passwordResetSessions.userId, user.id))
                await db.insert(passwordResetSessions).values({
                    userId: user.id,
                    otpHash,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                })

                const unlockUrl = `${FRONTEND_URL}/auth/unlock?token=${otp}`
                
                await sendUnlockAccountEmail({
                    to: user.email,
                    fullName: user.fullName,
                    unlockUrl
                })

                throw new ForbiddenError('Account locked due to too many failed attempts. An unlock link has been sent to your email.')
            }

            throw new UnauthorizedError('Invalid email or password')
        }

        await db.update(users)
            .set({ failedLoginAttempts: 0, isLocked: false, lockoutUntil: null })
            .where(eq(users.id, user.id))

        if (user.twoFactorEnabled) {
            const otp = generatePasswordResetOtp()
            const otpHash = await hashPasswordResetOtp(otp)

            await this.createLoginOtpSession(user.id, otpHash, new Date(Date.now() + 5 * 60 * 1000))

            await sendTwoFactorOtpEmail({
                to: user.email,
                fullName: user.fullName,
                otp
            })

            return { twoFactorRequired: true as const, message: 'Verification code sent to your email' }
        }

        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            tokenVersion: user.tokenVersion ?? 0
        }

        const accessToken = generateAccessToken(tokenPayload)
        const refreshToken = generateRefreshToken(tokenPayload)

        await db.insert(activeSessions).values({
            userId: user.id,
            tokenVersion: user.tokenVersion ?? 0,
            deviceId: data.deviceId ?? null,
            deviceName: data.deviceName ?? null,
            os: data.os ?? null,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent ?? null,
            isCurrent: true
        })

        return {
            user: {
                id: user.id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                fullName: user.fullName,
                role: user.role
            },
            accessToken,
            refreshToken
        }
    }

    static async login2fa(data: {
        email: string
        otp: string
        deviceId?: string
        deviceName?: string
        os?: string
        ipAddress: string
        userAgent?: string
    }, requestId?: string) {
        logger.info({ requestId }, '[AuthService] 2FA verification started')

        const user = await db.query.users.findFirst({
            where: eq(users.email, data.email.toLowerCase())
        })

        if (!user) throw new UnauthorizedError('Invalid request')

        const session = await this.getActiveLoginOtpSession(user.id)

        if (!session) {
            throw new UnauthorizedError('Verification code expired or invalid')
        }

        const isValid = await verifyPasswordResetOtp(data.otp, session.otpHash)
        if (!isValid) {
            throw new UnauthorizedError('Invalid verification code')
        }

        await this.markLoginOtpSessionUsed(session.id)

        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            tokenVersion: user.tokenVersion ?? 0
        }

        const accessToken = generateAccessToken(tokenPayload)
        const refreshToken = generateRefreshToken(tokenPayload)

        await db.insert(activeSessions).values({
            userId: user.id,
            tokenVersion: user.tokenVersion ?? 0,
            deviceId: data.deviceId ?? null,
            deviceName: data.deviceName ?? null,
            os: data.os ?? null,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent ?? null,
            isCurrent: true
        })

        return {
            user: {
                id: user.id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                fullName: user.fullName,
                role: user.role
            },
            accessToken,
            refreshToken
        }
    }

    static async logout(refreshToken: string) {
        try {
            const decoded = verifyRefreshToken(refreshToken)

            await db.insert(revokedTokens).values({
                token: refreshToken,
                expiresAt: decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }).onConflictDoNothing()
        } catch (error) {
            // Even if token is invalid/expired, we consider it a successful logout
        }
    }

    static async refresh(refreshToken: string) {
        const isRevoked = await db.query.revokedTokens.findFirst({
            where: eq(revokedTokens.token, refreshToken)
        })

        if (isRevoked) {
            throw new UnauthorizedError('Invalid or expired refresh token')
        }

        const decoded = verifyRefreshToken(refreshToken)

        const user = await db.query.users.findFirst({
            where: eq(users.id, decoded.userId)
        })

        if (!user || (user.tokenVersion ?? 0) !== decoded.tokenVersion) {
            throw new UnauthorizedError('Invalid or expired refresh token')
        }

        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            tokenVersion: user.tokenVersion ?? 0
        })

        return { accessToken }
    }

    static async requestForgotPassword(email: string, requestId?: string) {
        const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)

        if (user) {
            logger.info({ userId: user.id, requestId }, '[AuthService] Password reset requested')
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
                logger.error({ err: error, userId: user.id, requestId }, '[AuthService] Failed to send password reset email')
                await db.delete(passwordResetSessions).where(eq(passwordResetSessions.id, session.id))
                throw error
            }
        } else {
            logger.warn({ requestId }, '[AuthService] Password reset requested for non-existent email')
        }
    }

    static async resetPassword(data: { email: string; otp: string; newPassword: string }, requestId?: string) {
        logger.info({ requestId }, '[AuthService] Resetting password')
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
    }

    static async requestOtp(email: string, requestId?: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email.toLowerCase())
        })

        if (!user) {
            return
        }

        const otp = generatePasswordResetOtp()
        const otpHash = await hashPasswordResetOtp(otp)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

        await this.createLoginOtpSession(user.id, otpHash, expiresAt)

        try {
            await sendLoginOtpEmail({
                to: user.email,
                fullName: user.fullName,
                otp
            })
        } catch (error: any) {
            logger.error({ err: error, userId: user.id, requestId }, '[AuthService] Failed to send login OTP email')
            if (process.env.NODE_ENV !== 'production') throw error
        }
    }

    static async verifyOtp(data: {
        email: string
        otp: string
        deviceId?: string
        deviceName?: string
        os?: string
        ipAddress: string
        userAgent?: string
    }, requestId?: string) {
        logger.info({ requestId }, '[AuthService] Verifying login OTP')
        const user = await db.query.users.findFirst({
            where: eq(users.email, data.email.toLowerCase())
        })

        if (!user) {
            throw new UnauthorizedError('Invalid verification code')
        }

        const session = await this.getActiveLoginOtpSession(user.id)

        if (!session) {
            throw new UnauthorizedError('Verification code expired or invalid')
        }

        const isValid = await verifyPasswordResetOtp(data.otp, session.otpHash)

        if (!isValid) {
            const nextAttemptCount = session.attemptCount + 1
            await this.failLoginOtpSessionAttempt(session.id, nextAttemptCount)

            throw new UnauthorizedError('Invalid verification code')
        }

        await this.markLoginOtpSessionUsed(session.id)

        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            tokenVersion: user.tokenVersion ?? 0
        }

        const accessToken = generateAccessToken(tokenPayload)
        const refreshToken = generateRefreshToken(tokenPayload)

        await db.insert(activeSessions).values({
            userId: user.id,
            tokenVersion: user.tokenVersion ?? 0,
            deviceId: data.deviceId ?? null,
            deviceName: data.deviceName ?? null,
            os: data.os ?? null,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent ?? null,
            isCurrent: true
        })

        return {
            user: {
                id: user.id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                fullName: user.fullName,
                role: user.role
            },
            accessToken,
            refreshToken
        }
    }

    static async unlock(email: string, token: string, requestId?: string) {
        logger.info({ requestId }, '[AuthService] Unlocking account')
        const user = await db.query.users.findFirst({
            where: eq(users.email, email.toLowerCase())
        })

        if (!user) {
            throw new NotFoundError('User')
        }

        const [session] = await db
            .select()
            .from(passwordResetSessions)
            .where(and(
                eq(passwordResetSessions.userId, user.id),
                isNull(passwordResetSessions.usedAt),
                gt(passwordResetSessions.expiresAt, new Date())
            ))
            .orderBy(desc(passwordResetSessions.createdAt))
            .limit(1)

        if (!session) {
            throw new UnauthorizedError('Invalid or expired unlock link')
        }

        const isValid = await verifyPasswordResetOtp(token, session.otpHash)

        if (!isValid) {
            throw new UnauthorizedError('Invalid or expired unlock link')
        }

        await db.transaction(async (tx) => {
            await tx.update(users)
                .set({ 
                    isLocked: false, 
                    failedLoginAttempts: 0, 
                    lockoutUntil: null 
                })
                .where(eq(users.id, user.id))

            await tx.update(passwordResetSessions)
                .set({ usedAt: new Date() })
                .where(eq(passwordResetSessions.id, session.id))
        })
    }
}
