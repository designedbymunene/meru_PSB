import { Hono } from 'hono'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { successResponse, ValidationError } from '../utils/errors'
import { ShortlistService } from '../services/shortlist-service'
import { AuditService } from '../services/audit-service'

export const shortlistingRouter = new Hono()

/**
 * POST /api/shortlisting/criteria
 * Sets or updates shortlisting criteria for a vacancy.
 * Admin only.
 */
shortlistingRouter.post('/criteria', authenticate, requireAdmin, async (c) => {
    const user = c.get('user')
    const body = await c.req.json()
    
    if (!body.vacancyId || !body.weights || body.minScore === undefined) {
        throw new ValidationError('Missing required fields: vacancyId, weights, minScore')
    }

    const previousState = await ShortlistService.getCriteria(parseInt(body.vacancyId))

    const criteria = await ShortlistService.setCriteria({
        vacancyId: parseInt(body.vacancyId),
        weights: body.weights,
        minScore: parseInt(body.minScore),
        configuredBy: user.userId
    })

    await AuditService.logAction({
        adminId: user.userId,
        action: previousState ? 'UPDATE_SHORTLIST_CRITERIA' : 'CREATE_SHORTLIST_CRITERIA',
        targetType: 'VACANCY',
        targetId: parseInt(body.vacancyId),
        previousState,
        newState: criteria,
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('remote-addr'),
        userAgent: c.req.header('user-agent')
    })

    return successResponse(c, criteria, 'Shortlisting criteria saved successfully')
})

/**
 * GET /api/shortlisting/:vacancyId/criteria
 * Fetches shortlisting criteria for a specific vacancy.
 * Admin only.
 */
shortlistingRouter.get('/:vacancyId/criteria', authenticate, requireAdmin, async (c) => {
    const vacancyId = parseInt(c.req.param('vacancyId') || '0')
    if (isNaN(vacancyId)) {
        throw new ValidationError('Invalid vacancyId')
    }

    const criteria = await ShortlistService.getCriteria(vacancyId)
    return successResponse(c, criteria)
})

/**
 * POST /api/shortlisting/:vacancyId/run
 * Triggers the automated shortlisting process for a vacancy.
 * Admin only.
 */
shortlistingRouter.post('/:vacancyId/run', authenticate, requireAdmin, async (c) => {
    const user = c.get('user')
    const vacancyId = parseInt(c.req.param('vacancyId') || '0')
    
    if (isNaN(vacancyId)) {
        throw new ValidationError('Invalid vacancyId')
    }

    const result = await ShortlistService.runShortlisting(vacancyId, user.userId)
    
    return successResponse(
        c, 
        result, 
        `Processed ${result.processed} applications. ${result.shortlisted} applications were shortlisted.`
    )
})
