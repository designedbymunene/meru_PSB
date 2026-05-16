import { Hono } from 'hono'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { ReportingService } from '../services/reporting-service'
import { successResponse } from '../utils/errors'

export const reportsRouter = new Hono()

/**
 * GET /api/reports/diversity
 * Fetches aggregated diversity metrics (gender, ethnicity, disability).
 * Optional vacancyId query parameter.
 * Restricted to admins.
 */
reportsRouter.get('/diversity', authenticate, requireAdmin, async (c) => {
    const vacancyId = c.req.query('vacancyId')
    const report = await ReportingService.getDiversityReport(vacancyId ? parseInt(vacancyId) : undefined)
    return successResponse(c, report)
})

/**
 * GET /api/reports/kpis
 * Fetches recruitment KPIs like time-to-shortlist and time-to-interview.
 * Restricted to admins.
 */
reportsRouter.get('/kpis', authenticate, requireAdmin, async (c) => {
    const report = await ReportingService.getKPIReport()
    return successResponse(c, report)
})
