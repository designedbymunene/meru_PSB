import { Hono } from 'hono'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { ReportingService, ReportFilters } from '../services/reporting-service'
import { successResponse } from '../utils/errors'
import { safeParseIntOptional } from '../utils/safe-parse'

export const reportsRouter = new Hono()

const getFilters = (c: any): ReportFilters => {
    return {
        vacancyId: safeParseIntOptional(c.req.query('vacancyId')),
        departmentId: safeParseIntOptional(c.req.query('departmentId')),
        startDate: c.req.query('startDate'),
        endDate: c.req.query('endDate')
    }
}


/**
 * GET /api/reports/diversity
 * Fetches aggregated diversity metrics.
 */
reportsRouter.get('/diversity', authenticate, requireAdmin, async (c) => {
    const filters = getFilters(c)
    const report = await ReportingService.getDiversityReport(filters)
    return successResponse(c, report)
})

/**
 * GET /api/reports/kpis
 * Fetches recruitment KPIs.
 */
reportsRouter.get('/kpis', authenticate, requireAdmin, async (c) => {
    const filters = getFilters(c)
    const report = await ReportingService.getKPIReport(filters)
    return successResponse(c, report)
})

/**
 * GET /api/reports/funnel
 * Fetches applicant funnel data.
 */
reportsRouter.get('/funnel', authenticate, requireAdmin, async (c) => {
    const filters = getFilters(c)
    const report = await ReportingService.getFunnelReport(filters)
    return successResponse(c, report)
})

/**
 * GET /api/reports/vacancy-performance
 * Fetches performance metrics for vacancies.
 */
reportsRouter.get('/vacancy-performance', authenticate, requireAdmin, async (c) => {
    const filters = getFilters(c)
    const report = await ReportingService.getVacancyPerformance(filters)
    return successResponse(c, report)
})

/**
 * GET /api/reports/conversion-trends
 * Fetches conversion trends over time.
 */
reportsRouter.get('/conversion-trends', authenticate, requireAdmin, async (c) => {
    const filters = getFilters(c)
    const report = await ReportingService.getConversionTrends(filters)
    return successResponse(c, report)
})

/**
 * GET /api/reports/applications-over-time
 * Fetches application volume over time.
 */
reportsRouter.get('/applications-over-time', authenticate, requireAdmin, async (c) => {
    const filters = getFilters(c)
    const report = await ReportingService.getApplicationsTimeReport(filters)
    return successResponse(c, report)
})
