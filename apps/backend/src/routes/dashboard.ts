import { Hono } from 'hono'
import { eq, desc } from 'drizzle-orm'
import { authenticate } from '../middleware/auth'
import { db, applications, vacancies } from '../db'
import { successResponse } from '../utils/errors'
import { buildDashboardData } from '../utils/dashboard'

export const dashboardRouter = new Hono()

// GET /api/dashboard - Get applicant dashboard data
dashboardRouter.get('/', authenticate, async (c) => {
    const user = c.get('user')

    const [userApplications, recommendedVacancies] = await Promise.all([
        db.query.applications.findMany({
            where: eq(applications.applicantId, user.userId),
            with: {
                vacancy: {
                    with: {
                        department: true,
                        jobGroup: true
                    }
                }
            },
            orderBy: desc(applications.appliedAt)
        }),
        db.query.vacancies.findMany({
            where: eq(vacancies.status, 'open'),
            with: {
                department: true,
                jobGroup: true
            },
            orderBy: desc(vacancies.createdAt)
        })
    ])

    const appliedVacancyIds = new Set(userApplications.map(application => application.vacancyId))
    const dashboardData = buildDashboardData(
        userApplications,
        recommendedVacancies.filter(vacancy => !appliedVacancyIds.has(vacancy.id))
    )

    return successResponse(c, dashboardData)
})