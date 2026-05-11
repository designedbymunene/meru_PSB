import { db } from '../db'
import { auditLogs, type NewAuditLog } from '../db/schema/audit-logs'

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
            await db.insert(auditLogs).values({
                adminId: params.adminId,
                action: params.action,
                targetType: params.targetType,
                targetId: params.targetId,
                previousState: params.previousState,
                newState: params.newState,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent
            })
        } catch (error) {
            console.error('[AuditService] Failed to record log:', error)
            // We don't throw here to avoid failing the main action if logging fails
        }
    }
}
