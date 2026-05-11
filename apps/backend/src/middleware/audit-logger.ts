import { Context, Next } from 'hono'
import { AuditService } from '../services/audit-service'

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
                await AuditService.logAction({
                    adminId: user.userId,
                    action,
                    targetType,
                    targetId: 0, // General action, or we could try to extract ID from params
                    newState: { 
                        method: c.req.method,
                        url: c.req.url,
                        queryParams: c.req.query()
                    },
                    ipAddress: c.req.header('x-forwarded-for') || c.req.header('remote-addr'),
                    userAgent: c.req.header('user-agent')
                })
            } catch (error) {
                console.error('Audit logging failed:', error)
            }
        }
    }
}
