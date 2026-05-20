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
    }) {
        try {
            logger.debug({
                action: params.action,
                targetType: params.targetType,
                targetId: params.targetId,
                adminId: params.adminId
            }, '[AuditService] Recording action')

            // Verify that the adminId exists in the users table
            const [adminUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, params.adminId))

            if (!adminUser) {
                logger.error({ adminId: params.adminId }, '[AuditService] Invalid adminId - user does not exist. Skipping audit log.')
                return null
            }

            const [log] = await db.insert(auditLogs).values({
                adminId: params.adminId,
                action: params.action,
                targetType: params.targetType,
                targetId: params.targetId,
                previousState: params.previousState,
                newState: params.newState,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent
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

