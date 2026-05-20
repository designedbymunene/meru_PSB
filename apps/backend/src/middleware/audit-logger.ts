import { Context, Next } from 'hono'
import { AuditService } from '../services/audit-service'
import { logger } from '../utils/logger'

/**
 * Higher-order function to create a middleware that logs specific admin actions.
 * @param action The action name to log (e.g., 'VIEW_SENSITIVE_DATA', 'EXPORT_DATA')
 * @param targetType The type of entity being accessed
 */
export const auditLog = (action: string, targetType: string) => {
    return async (c: Context, next: Next) => {
        const user = c.get('user')
        
        // We log after the action is successful
        await next()
        
        if (c.res.status >= 200 && c.res.status < 300) {
            try {
                let targetId = 0
                // Try to extract a numeric targetId from request params
                const params = c.req.param()
                for (const value of Object.values(params)) {
                    const parsed = parseInt(value, 10)
                    if (!isNaN(parsed) && parsed > 0) {
                        targetId = parsed
                        break
                    }
                }

                await AuditService.logAction({
                    adminId: user.userId,
                    action,
                    targetType,
                    targetId,
                    newState: { 
                        method: c.req.method,
                        url: c.req.url,
                        queryParams: c.req.query()
                    },
                    ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || undefined,
                    userAgent: c.req.header('user-agent')
                })
            } catch (error) {
                logger.error({ err: error }, 'Audit logging failed')
            }
        }
    }
}

