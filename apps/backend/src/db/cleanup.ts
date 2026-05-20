import dotenv from 'dotenv'
import { db, passwordResetSessions, loginOtpSessions, revokedTokens } from './index'
import { lt } from 'drizzle-orm'

dotenv.config()

/**
 * Clean up expired password reset sessions from the database.
 * This removes all sessions that have expired (expiresAt < now).
 * Typically run as a maintenance task, either manually or via an external scheduler.
 */
export const cleanupExpiredPasswordResetSessions = async (): Promise<void> => {
    const now = new Date()
    const [passwordResetResult, loginOtpResult, revokedTokenResult] = await Promise.all([
       db.delete(passwordResetSessions)
           .where(lt(passwordResetSessions.expiresAt, now))
           .returning(),
       db.delete(loginOtpSessions)
           .where(lt(loginOtpSessions.expiresAt, now))
           .returning(),
       db.delete(revokedTokens)
           .where(lt(revokedTokens.expiresAt, now))
           .returning()
    ])

    console.log(`Deleted ${passwordResetResult.length} expired password reset sessions.`)
    console.log(`Deleted ${loginOtpResult.length} expired login OTP sessions.`)
    console.log(`Deleted ${revokedTokenResult.length} expired revoked tokens.`)
}

// Run cleanup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        await cleanupExpiredPasswordResetSessions()
        console.log('Cleanup completed successfully.')
        process.exit(0)
    } catch (error) {
        console.error('Cleanup failed:', error)
        process.exit(1)
    }
}

export default cleanupExpiredPasswordResetSessions
