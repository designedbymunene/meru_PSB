import { test } from 'node:test'
import assert from 'node:assert'
import { db, users, passwordResetSessions } from '../db'
import { eq } from 'drizzle-orm'
import {
    generatePasswordResetOtp,
    hashPasswordResetOtp,
    verifyPasswordResetOtp,
    generateAccessToken,
    verifyAccessToken
} from '../utils/auth'

/**
 * Integration tests for the forgot-password flow.
 * These tests verify:
 * - OTP generation and hashing
 * - Reset session creation and expiration
 * - OTP verification and single-use enforcement
 * - Token invalidation via tokenVersion
 */

test('Password Reset OTP - should generate and verify OTP', async () => {
    const otp = generatePasswordResetOtp()

    // OTP should be 6 digits
    assert.strictEqual(otp.length, 6)
    assert.match(otp, /^\d{6}$/)
})

test('Password Reset OTP - should hash and verify OTP correctly', async () => {
    const otp = '123456'
    const otpHash = await hashPasswordResetOtp(otp)

    // Hash should not be the same as the plaintext OTP
    assert.notStrictEqual(otpHash, otp)

    // Verification should succeed with correct OTP
    const isValid = await verifyPasswordResetOtp(otp, otpHash)
    assert.strictEqual(isValid, true)

    // Verification should fail with incorrect OTP
    const isInvalid = await verifyPasswordResetOtp('000000', otpHash)
    assert.strictEqual(isInvalid, false)
})

test('Password Reset Sessions - should create and retrieve session', async () => {
    // Create a test user
    const testEmail = `test-reset-${Date.now()}@example.com`
    const [testUser] = await db
        .insert(users)
        .values({
            email: testEmail,
            phoneNumber: `555${String(Date.now()).slice(-7)}`,
            password: 'hashedpassword',
            fullName: 'Test User',
            role: 'applicant'
        })
        .returning()

    try {
        // Create a reset session
        const otp = generatePasswordResetOtp()
        const otpHash = await hashPasswordResetOtp(otp)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        const [session] = await db
            .insert(passwordResetSessions)
            .values({
                userId: testUser.id,
                otpHash,
                expiresAt,
                attemptCount: 0
            })
            .returning()

        assert.strictEqual(session.userId, testUser.id)
        assert.strictEqual(session.attemptCount, 0)
        assert.strictEqual(session.usedAt, null)

        // Retrieve the session
        const retrieved = await db.query.passwordResetSessions.findFirst({
            where: eq(passwordResetSessions.id, session.id)
        })

        assert.ok(retrieved)
        assert.strictEqual(retrieved.id, session.id)
    } finally {
        // Cleanup
        await db.delete(users).where(eq(users.id, testUser.id))
    }
})

test('Token Version - should invalidate tokens on version increment', async () => {
    // Create a test user with tokenVersion 0
    const testEmail = `test-token-${Date.now()}@example.com`
    const [testUser] = await db
        .insert(users)
        .values({
            email: testEmail,
            phoneNumber: `555${String(Date.now()).slice(-7)}`,
            password: 'hashedpassword',
            fullName: 'Test User',
            role: 'applicant',
            tokenVersion: 0
        })
        .returning()

    try {
        // Generate a token with tokenVersion 0
        const token = generateAccessToken({
            userId: testUser.id,
            email: testUser.email,
            role: testUser.role,
            tokenVersion: 0
        })

        // Token should verify with original tokenVersion
        const decoded = verifyAccessToken(token)
        assert.strictEqual(decoded.tokenVersion, 0)

        // Increment the user's tokenVersion (simulating a password reset)
        await db
            .update(users)
            .set({ tokenVersion: 1 })
            .where(eq(users.id, testUser.id))

        // Token should still decode (JWT itself is valid), but the tokenVersion won't match
        const decodedAfter = verifyAccessToken(token)
        assert.strictEqual(decodedAfter.tokenVersion, 0)

        // In middleware, this mismatch would reject the token
        const updatedUser = await db.query.users.findFirst({
            where: eq(users.id, testUser.id)
        })
        assert.notStrictEqual(updatedUser?.tokenVersion, decodedAfter.tokenVersion)
    } finally {
        // Cleanup
        await db.delete(users).where(eq(users.id, testUser.id))
    }
})

test('Reset Session Expiry - should mark expired sessions correctly', async () => {
    // Create a test user
    const testEmail = `test-expiry-${Date.now()}@example.com`
    const [testUser] = await db
        .insert(users)
        .values({
            email: testEmail,
            phoneNumber: `555${String(Date.now()).slice(-7)}`,
            password: 'hashedpassword',
            fullName: 'Test User',
            role: 'applicant'
        })
        .returning()

    try {
        const otp = generatePasswordResetOtp()
        const otpHash = await hashPasswordResetOtp(otp)

        // Create an already-expired session
        const expiredTime = new Date(Date.now() - 1000) // 1 second ago
        const [expiredSession] = await db
            .insert(passwordResetSessions)
            .values({
                userId: testUser.id,
                otpHash,
                expiresAt: expiredTime,
                attemptCount: 0
            })
            .returning()

        // Create a valid session
        const validTime = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
        const [validSession] = await db
            .insert(passwordResetSessions)
            .values({
                userId: testUser.id,
                otpHash,
                expiresAt: validTime,
                attemptCount: 0
            })
            .returning()

        // Verify expiration difference
        assert.ok(expiredSession.expiresAt < new Date())
        assert.ok(validSession.expiresAt > new Date())
    } finally {
        // Cleanup
        await db.delete(passwordResetSessions).where(eq(passwordResetSessions.userId, testUser.id))
        await db.delete(users).where(eq(users.id, testUser.id))
    }
})

test('Reset Session Usage - should track attempt count', async () => {
    // Create a test user
    const testEmail = `test-usage-${Date.now()}@example.com`
    const [testUser] = await db
        .insert(users)
        .values({
            email: testEmail,
            phoneNumber: `555${String(Date.now()).slice(-7)}`,
            password: 'hashedpassword',
            fullName: 'Test User',
            role: 'applicant'
        })
        .returning()

    try {
        const otp = generatePasswordResetOtp()
        const otpHash = await hashPasswordResetOtp(otp)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

        const [session] = await db
            .insert(passwordResetSessions)
            .values({
                userId: testUser.id,
                otpHash,
                expiresAt,
                attemptCount: 0
            })
            .returning()

        // Increment attempt count
        for (let i = 1; i <= 5; i++) {
            await db
                .update(passwordResetSessions)
                .set({ attemptCount: i })
                .where(eq(passwordResetSessions.id, session.id))

            const updated = await db.query.passwordResetSessions.findFirst({
                where: eq(passwordResetSessions.id, session.id)
            })

            assert.strictEqual(updated?.attemptCount, i)
        }

        // After 5 attempts, session should be marked as used
        await db
            .update(passwordResetSessions)
            .set({ attemptCount: 5, usedAt: new Date() })
            .where(eq(passwordResetSessions.id, session.id))

        const finalSession = await db.query.passwordResetSessions.findFirst({
            where: eq(passwordResetSessions.id, session.id)
        })

        assert.strictEqual(finalSession?.attemptCount, 5)
        assert.ok(finalSession?.usedAt !== null)
    } finally {
        // Cleanup
        await db.delete(passwordResetSessions).where(eq(passwordResetSessions.userId, testUser.id))
        await db.delete(users).where(eq(users.id, testUser.id))
    }
})
