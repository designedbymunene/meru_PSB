import { Hono } from 'hono'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { ReportingService, ReportFilters } from '../services/reporting-service'
import { successResponse } from '../utils/errors'
import { safeParseIntOptional } from '../utils/safe-parse'
import { auditLog } from '../middleware/audit-logger'

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
reportsRouter.get('/diversity', authenticate, requireAdmin, auditLog('VIEW_REPORT', 'DIVERSITY'), async (c) => {
    const filters = getFilters(c)
    const report = await ReportingService.getDiversityReport(filters)
    return successResponse(c, report)
})

/**
 * GET /api/reports/kpis
 * Fetches recruitment KPIs.
 */
reportsRouter.get('/kpis', authenticate, requireAdmin, auditLog('VIEW_REPORT', 'KPI'), async (c) => {
    const filters = getFilters(c)
    const report = await ReportingService.getKPIReport(filters)
    return successResponse(c, report)
})

/**
 * GET /api/reports/funnel
 * Fetches applicant funnel data.
 */
reportsRouter.get('/funnel', authenticate, requireAdmin, auditLog('VIEW_REPORT', 'FUNNEL'), async (c) => {
    const filters = getFilters(c)
    const report = await ReportingService.getFunnelReport(filters)
    return successResponse(c, report)
})

/**
 * GET /api/reports/vacancy-performance
 * Fetches performance metrics for vacancies.
 */
reportsRouter.get('/vacancy-performance', authenticate, requireAdmin, auditLog('VIEW_REPORT', 'VACANCY_PERFORMANCE'), async (c) => {
    const filters = getFilters(c)
    const report = await ReportingService.getVacancyPerformance(filters)
    return successResponse(c, report)
})

/**
 * GET /api/reports/conversion-trends
 * Fetches conversion trends over time.
 */
reportsRouter.get('/conversion-trends', authenticate, requireAdmin, auditLog('VIEW_REPORT', 'CONVERSION_TRENDS'), async (c) => {
    const filters = getFilters(c)
    const report = await ReportingService.getConversionTrends(filters)
    return successResponse(c, report)
})

/**
 * GET /api/reports/applications-over-time
 * Fetches application volume over time.
 */
reportsRouter.get('/applications-over-time', authenticate, requireAdmin, auditLog('VIEW_REPORT', 'APPLICATIONS_OVER_TIME'), async (c) => {
    const filters = getFilters(c)
    const report = await ReportingService.getApplicationsTimeReport(filters)
    return successResponse(c, report)
})
