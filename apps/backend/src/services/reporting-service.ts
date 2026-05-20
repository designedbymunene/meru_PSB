import { db } from '../db'
import { eq, and, inArray, gte, lte, SQL, count, desc, sql } from 'drizzle-orm'
import { applications, auditLogs, vacancies, departments } from '../db/schema'

export interface ReportFilters {
    vacancyId?: number
    departmentId?: number
    startDate?: string
    endDate?: string
}

export class ReportingService {
    /**
     * Helper to apply filters to a query
     */
    private static applyFilters(filters: ReportFilters = {}) {
        const conditions: SQL[] = []

        if (filters.vacancyId) {
            conditions.push(eq(applications.vacancyId, filters.vacancyId))
        }

        if (filters.startDate) {
            conditions.push(gte(applications.createdAt, new Date(filters.startDate)))
        }

        if (filters.endDate) {
            conditions.push(lte(applications.createdAt, new Date(filters.endDate)))
        }

        return conditions
    }

    /**
     * Aggregates diversity data from applications using database aggregations.
     */
    static async getDiversityReport(filters: ReportFilters = {}) {
        const conditions = this.applyFilters(filters)
        
        const baseQuery = db.select({
            gender: sql<string>`${applications.profileSnapshot}->>'gender'`,
            ethnicityId: sql<string>`${applications.profileSnapshot}->>'ethnicityId'`,
            homeCountyId: sql<string>`${applications.profileSnapshot}->>'homeCountyId'`,
            homeSubCountyId: sql<string>`${applications.profileSnapshot}->>'homeSubCountyId'`,
            wardId: sql<string>`${applications.profileSnapshot}->>'wardId'`,
            impairment: sql<boolean>`(${applications.profileSnapshot}->>'impairment')::boolean`,
            count: sql<number>`count(*)::int`
        })
        .from(applications)

        if (filters.departmentId) {
            baseQuery.innerJoin(vacancies, eq(applications.vacancyId, vacancies.id))
            conditions.push(eq(vacancies.departmentId, filters.departmentId))
        }

        const stats = await baseQuery.where(and(...conditions))
            .groupBy(
                sql`${applications.profileSnapshot}->>'gender'`,
                sql`${applications.profileSnapshot}->>'ethnicityId'`,
                sql`${applications.profileSnapshot}->>'homeCountyId'`,
                sql`${applications.profileSnapshot}->>'homeSubCountyId'`,
                sql`${applications.profileSnapshot}->>'wardId'`,
                sql`(${applications.profileSnapshot}->>'impairment')::boolean`
            )

        // Fetch all ethnicities, counties, sub-counties and wards for mapping
        const [allEthnicities, allCounties, allSubCounties, allWards] = await Promise.all([
            db.query.ethnicities.findMany(),
            db.query.counties.findMany(),
            db.query.constituencies.findMany(),
            db.query.wards.findMany()
        ])
        
        const ethnicityMap = Object.fromEntries(allEthnicities.map(e => [e.id.toString(), e.name])) as Record<string, string>
        const countyMap = Object.fromEntries(allCounties.map(c => [c.id.toString(), c.name])) as Record<string, string>
        const subCountyMap = Object.fromEntries(allSubCounties.map(s => [s.id.toString(), s.name])) as Record<string, string>
        const wardMap = Object.fromEntries(allWards.map(w => [w.id.toString(), w.name])) as Record<string, string>

        // Identify Meru county ID
        const meruCounty = allCounties.find(c => c.name.toLowerCase().includes('meru'))
        const meruCountyIdStr = meruCounty?.id.toString() || ''

        const report = {
            period: { 
                start: filters.startDate || '', 
                end: filters.endDate || '' 
            },
            gender: { Male: 0, Female: 0, Other: 0, PreferNotToSay: 0 },
            ethnicity: {} as Record<string, number>,
            disability: { hasImpairment: 0, noImpairment: 0, preferNotToSay: 0 },
            counties: {} as Record<string, number>,
            meruSubCounties: {} as Record<string, number>,
            meruWards: {} as Record<string, number>,
            totalApplicants: 0
        }

        stats.forEach(row => {
            report.totalApplicants += row.count

            // Gender
            const gender = row.gender
            if (gender === 'Male') report.gender.Male += row.count
            else if (gender === 'Female') report.gender.Female += row.count
            else if (gender === 'Other') report.gender.Other += row.count
            else report.gender.PreferNotToSay += row.count

            // Ethnicity
            const eId = row.ethnicityId
            const ethnicityName = eId ? (ethnicityMap[eId] || 'Other') : 'Unknown'
            report.ethnicity[ethnicityName] = (report.ethnicity[ethnicityName] || 0) + row.count

            // County
            const cId = row.homeCountyId
            const countyName = cId ? (countyMap[cId] || 'Other') : 'Unknown'
            report.counties[countyName] = (report.counties[countyName] || 0) + row.count

            // Meru sub-counties and wards distribution
            if (cId && cId === meruCountyIdStr) {
                const scId = row.homeSubCountyId
                const subCountyName = scId ? (subCountyMap[scId] || 'Other') : 'Unknown'
                report.meruSubCounties[subCountyName] = (report.meruSubCounties[subCountyName] || 0) + row.count

                const wId = row.wardId
                const wardName = wId ? (wardMap[wId] || 'Other') : 'Unknown'
                report.meruWards[wardName] = (report.meruWards[wardName] || 0) + row.count
            }

            // Disability
            if (row.impairment === true) {
                report.disability.hasImpairment += row.count
            } else if (row.impairment === false) {
                report.disability.noImpairment += row.count
            } else {
                report.disability.preferNotToSay += row.count
            }
        })

        // If range not provided, use current date
        if (!report.period.start) report.period.start = new Date().toISOString()
        if (!report.period.end) report.period.end = new Date().toISOString()

        return report
    }

    /**
     * Calculates KPIs like time-to-shortlist and time-to-interview.
     */
    static async getKPIReport(filters: ReportFilters = {}) {
        const conditions = this.applyFilters(filters)
        
        let vacanciesQuery = db.select().from(vacancies)
        if (filters.departmentId) {
            vacanciesQuery.where(eq(vacancies.departmentId, filters.departmentId))
        }
        const allVacancies = await vacanciesQuery

        let appsQuery = db.select().from(applications)
        if (filters.departmentId) {
            appsQuery.innerJoin(vacancies, eq(applications.vacancyId, vacancies.id))
                     .where(and(...conditions, eq(vacancies.departmentId, filters.departmentId)))
        } else {
            appsQuery.where(and(...conditions))
        }
        
        const appsResult = await appsQuery
        const allApplications = filters.departmentId 
            ? (appsResult as any[]).map(r => r.applications) 
            : appsResult as any[]
        
        const shortlistTimes: number[] = []
        const interviewTimes: number[] = []
        let totalRating = 0
        let ratedCount = 0

        const vacancyIds: number[] = allVacancies.map(v => v.id as number)
        const appIds: number[] = allApplications.map(a => a.id as number)

        const allApplicationLogs = appIds.length > 0 ? await db.query.auditLogs.findMany({
            where: and(
                eq(auditLogs.targetType, 'APPLICATION'),
                inArray(auditLogs.targetId, appIds),
                inArray(auditLogs.action, ['STATUS_UPDATE', 'INTERVIEW_SCHEDULED'])
            )
        }) : []

        const allBulkShortlistLogs = vacancyIds.length > 0 ? await db.query.auditLogs.findMany({
            where: and(
                eq(auditLogs.targetType, 'vacancy'),
                inArray(auditLogs.targetId, vacancyIds),
                eq(auditLogs.action, 'BULK_SHORTLIST_RUN')
            ),
            orderBy: (al, { asc }) => [asc(al.createdAt)]
        }) : []

        for (const vacancy of allVacancies) {
            const closingDate = new Date(vacancy.closingDate as string)
            const vacancyApps = allApplications.filter(a => a.vacancyId === vacancy.id)

            if (vacancyApps.length === 0) continue

            const vacancyAppIds = vacancyApps.map(a => a.id)
            const logs = allApplicationLogs.filter(l => vacancyAppIds.includes(l.targetId))
            const bulkShortlistLog = allBulkShortlistLogs.find(l => l.targetId === vacancy.id)

            vacancyApps.forEach(app => {
                if (app.rating) {
                    totalRating += app.rating as number
                    ratedCount++
                }

                const appLogs = logs.filter(l => l.targetId === app.id)
                appLogs.sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())

                let shortlistedDate: Date | null = null
                const shortlistedLog = appLogs.find(l => (l.newState as any)?.status === 'shortlisted')
                
                if (shortlistedLog) {
                    shortlistedDate = new Date(shortlistedLog.createdAt!)
                } else if (app.status === 'shortlisted' || app.status === 'interviewing' || app.status === 'accepted') {
                    if (bulkShortlistLog) {
                        shortlistedDate = new Date(bulkShortlistLog.createdAt!)
                    }
                }

                if (shortlistedDate) {
                    const diffDays = (shortlistedDate.getTime() - closingDate.getTime()) / (1000 * 3600 * 24)
                    shortlistTimes.push(Math.max(0, diffDays))

                    const interviewingLog = appLogs.find(l => 
                        (l.newState as any)?.status === 'interviewing' || l.action === 'INTERVIEW_SCHEDULED'
                    )
                    
                    if (interviewingLog) {
                        const interviewDate = new Date(interviewingLog.createdAt!)
                        const diffDaysInterview = (interviewDate.getTime() - shortlistedDate.getTime()) / (1000 * 3600 * 24)
                        interviewTimes.push(Math.max(0, diffDaysInterview))
                    }
                }
            })
        }

        const getStats = (times: number[]) => {
            if (times.length === 0) return { avg: 0, min: 0, max: 0 }
            const sum = times.reduce((a, b) => a + b, 0)
            return {
                avg: sum / times.length,
                min: Math.min(...times),
                max: Math.max(...times)
            }
        }

        const shortlistStats = getStats(shortlistTimes)
        const interviewStats = getStats(interviewTimes)

        return {
            period: {
                start: filters.startDate || (allVacancies.length > 0 ? new Date(Math.min(...allVacancies.map(v => v.createdAt ? new Date(v.createdAt as any).getTime() : Date.now()))).toISOString() : new Date().toISOString()),
                end: filters.endDate || new Date().toISOString()
            },
            timeToShortlist: shortlistStats,
            timeToInterview: interviewStats,
            totalVacancies: allVacancies.length,
            totalApplications: allApplications.length,
            averageRating: ratedCount > 0 ? totalRating / ratedCount : 0,
            recruitmentVelocity: [
                { stage: 'Application to Shortlist', avgDays: Math.round(shortlistStats.avg) },
                { stage: 'Shortlist to Interview', avgDays: Math.round(interviewStats.avg) }
            ]
        }
    }

    /**
     * Gets performance metrics for top vacancies
     */
    static async getVacancyPerformance(filters: ReportFilters = {}) {
        const conditions = this.applyFilters(filters)

        const topVacancies = await db.select({
            id: vacancies.id,
            title: vacancies.title,
            departmentName: departments.name,
            applicationsCount: count(applications.id)
        })
        .from(vacancies)
        .leftJoin(applications, eq(vacancies.id, applications.vacancyId))
        .leftJoin(departments, eq(vacancies.departmentId, departments.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(vacancies.id, departments.name)
        .orderBy(desc(count(applications.id)))
        .limit(10)

        // For each top vacancy, get stage counts
        const results = await Promise.all(topVacancies.map(async (v) => {
            const apps = await db.select({
                status: applications.status
            })
            .from(applications)
            .where(eq(applications.vacancyId, v.id))

            return {
                id: v.id,
                title: v.title,
                department: v.departmentName || 'Unknown',
                applicationsCount: v.applicationsCount,
                shortlistedCount: apps.filter(a => ['shortlisted', 'interviewing', 'accepted'].includes(a.status)).length,
                interviewedCount: apps.filter(a => ['interviewing', 'accepted'].includes(a.status)).length,
                acceptedCount: apps.filter(a => a.status === 'accepted').length
            }
        }))

        return results
    }

    /**
     * Gets applicant funnel data (pipeline drop-offs) using database aggregations.
     */
    static async getFunnelReport(filters: ReportFilters = {}) {
        const conditions = this.applyFilters(filters)
        
        const baseQuery = db.select({
            status: applications.status,
            count: sql<number>`count(*)::int`
        }).from(applications)

        if (filters.departmentId) {
            baseQuery.innerJoin(vacancies, eq(applications.vacancyId, vacancies.id))
            conditions.push(eq(vacancies.departmentId, filters.departmentId))
        }

        const stats = await baseQuery.where(and(...conditions)).groupBy(applications.status)
        
        const counts = {
            total: 0,
            reviewed: 0,
            shortlisted: 0,
            interviewed: 0,
            accepted: 0
        }

        stats.forEach(row => {
            counts.total += row.count
            if (row.status !== 'pending') counts.reviewed += row.count
            if (['shortlisted', 'interviewing', 'accepted', 'rejected'].includes(row.status)) counts.shortlisted += row.count
            if (['interviewing', 'accepted', 'rejected'].includes(row.status)) counts.interviewed += row.count
            if (row.status === 'accepted') counts.accepted += row.count
        })

        return [
            { name: 'Applied', value: counts.total, fill: 'var(--chart-1)' },
            { name: 'Reviewed', value: counts.reviewed, fill: 'var(--chart-2)' },
            { name: 'Shortlisted', value: counts.shortlisted, fill: 'var(--chart-3)' },
            { name: 'Interviewed', value: counts.interviewed, fill: 'var(--chart-4)' },
            { name: 'Accepted', value: counts.accepted, fill: 'var(--chart-5)' }
        ]
    }

    /**
     * Gets conversion trends over time using database aggregations.
     */
    static async getConversionTrends(filters: ReportFilters = {}) {
        const conditions = this.applyFilters(filters)
        
        const baseQuery = db.select({
            date: sql<string>`DATE(${applications.createdAt})`,
            status: applications.status,
            count: sql<number>`count(*)::int`
        }).from(applications)

        if (filters.departmentId) {
            baseQuery.innerJoin(vacancies, eq(applications.vacancyId, vacancies.id))
            conditions.push(eq(vacancies.departmentId, filters.departmentId))
        }

        const stats = await baseQuery.where(and(...conditions))
            .groupBy(sql`DATE(${applications.createdAt})`, applications.status)
        
        const grouping: Record<string, any> = {}
        stats.forEach(row => {
            const date = row.date
            if (!grouping[date]) {
                grouping[date] = { total: 0, shortlisted: 0, interviewed: 0, accepted: 0 }
            }
            grouping[date].total += row.count
            if (['shortlisted', 'interviewing', 'accepted'].includes(row.status)) grouping[date].shortlisted += row.count
            if (['interviewing', 'accepted'].includes(row.status)) grouping[date].interviewed += row.count
            if (row.status === 'accepted') grouping[date].accepted += row.count
        })

        return Object.entries(grouping)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, counts]) => ({
                date,
                applicationToShortlist: counts.total > 0 ? (counts.shortlisted / counts.total) * 100 : 0,
                shortlistToInterview: counts.shortlisted > 0 ? (counts.interviewed / counts.shortlisted) * 100 : 0,
                interviewToAcceptance: counts.interviewed > 0 ? (counts.accepted / counts.interviewed) * 100 : 0
            }))
    }

    /**
     * Gets application volume over time (time-series) using database aggregations.
     */
    static async getApplicationsTimeReport(filters: ReportFilters = {}) {
        const conditions = this.applyFilters(filters)
        
        const baseQuery = db.select({
            date: sql<string>`DATE(${applications.createdAt})`,
            count: sql<number>`count(*)::int`
        }).from(applications)

        if (filters.departmentId) {
            baseQuery.innerJoin(vacancies, eq(applications.vacancyId, vacancies.id))
            conditions.push(eq(vacancies.departmentId, filters.departmentId))
        }

        const stats = await baseQuery.where(and(...conditions))
            .groupBy(sql`DATE(${applications.createdAt})`)
            .orderBy(sql`DATE(${applications.createdAt})`)

        return stats.map(row => ({
            date: row.date,
            count: row.count
        }))
    }
}
