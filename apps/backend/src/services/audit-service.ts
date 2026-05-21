import { db } from '../db'
import { auditLogs } from '../db/schema/audit-logs'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { logger } from '../utils/logger'

export class AuditService {
    /**
     * Records an administrative action.
     */
    static async logAction(params: {
        adminId: number;
        action: string;
        targetType: string;
        targetId: number;
        previousState?: any;
        newState?: any;
        ipAddress?: string;
        userAgent?: string;
        database?: any;
    }) {
        const { adminId, action, targetType, targetId, previousState, newState, ipAddress, userAgent, database = db } = params
        try {
            logger.debug({
                action,
                targetType,
                targetId,
                adminId
            }, '[AuditService] Recording action')

            // Verify that the adminId exists in the users table
            const [adminUser] = await database.select({ id: users.id }).from(users).where(eq(users.id, adminId))

            if (!adminUser) {
                logger.error({ adminId }, '[AuditService] Invalid adminId - user does not exist. Skipping audit log.')
                return null
            }

            const [log] = await database.insert(auditLogs).values({
                adminId,
                action,
                targetType,
                targetId,
                previousState,
                newState,
                ipAddress,
                userAgent
            }).returning()

            logger.info({ logId: log.id }, '[AuditService] Successfully recorded log')
            return log
        } catch (error) {
            logger.error({ err: error }, '[AuditService] Failed to record log')
            // We don't throw here to avoid failing the main action if logging fails
            return null
        }
    }
}

