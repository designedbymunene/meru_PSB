import { db } from '../db'
import { auditLogs } from '../db/schema/audit-logs'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import type { NewAuditLog } from '../db/schema/audit-logs'

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
            console.log('[AuditService] Recording action:', {
                action: params.action,
                targetType: params.targetType,
                targetId: params.targetId,
                adminId: params.adminId
            })

            // Verify that the adminId exists in the users table
            const [adminUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, params.adminId))

            if (!adminUser) {
                console.error('[AuditService] Invalid adminId - user does not exist:', params.adminId)
                console.log('[AuditService] Skipping audit log creation to avoid foreign key constraint violation')
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

            console.log('[AuditService] Successfully recorded log:', log.id)
            return log
        } catch (error) {
            console.error('[AuditService] Failed to record log:', error)
            // We don't throw here to avoid failing the main action if logging fails
            return null
        }
    }
}
