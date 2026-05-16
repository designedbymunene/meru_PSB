import { db } from '../db'
import { eq, and, inArray } from 'drizzle-orm'
import { applications, auditLogs } from '../db/schema'

export class ReportingService {
    /**
     * Aggregates diversity data from applications (optionally filtered by vacancy).
     */
    static async getDiversityReport(vacancyId?: number) {
        const query = db.select({
            profileSnapshot: applications.profileSnapshot
        }).from(applications)

        if (vacancyId) {
            query.where(eq(applications.vacancyId, vacancyId))
        }

        const apps = await query

        // Fetch all ethnicities for mapping IDs to names
        const allEthnicities = await db.query.ethnicities.findMany()
        const ethnicityMap = Object.fromEntries(allEthnicities.map(e => [e.id.toString(), e.name]))

        const report = {
            gender: {} as Record<string, number>,
            ethnicity: {} as Record<string, number>,
            disability: {
                pwd: 0,
                non_pwd: 0
            }
        }

        apps.forEach(app => {
            const profile = app.profileSnapshot as any
            if (profile) {
                // Gender
                const gender = profile.gender || 'Unknown'
                report.gender[gender] = (report.gender[gender] || 0) + 1

                // Ethnicity
                const eId = profile.ethnicityId?.toString()
                const ethnicityName = eId ? (ethnicityMap[eId] || 'Other') : 'Unknown'
                report.ethnicity[ethnicityName] = (report.ethnicity[ethnicityName] || 0) + 1

                // Disability
                if (profile.impairment) {
                    report.disability.pwd++
                } else {
                    report.disability.non_pwd++
                }
            }
        })

        return report
    }

    /**
     * Calculates KPIs like time-to-shortlist and time-to-interview.
     */
    static async getKPIReport() {
        // Fetch all vacancies
        const allVacancies = await db.query.vacancies.findMany()
        
        const results = []

        for (const vacancy of allVacancies) {
            const closingDate = new Date(vacancy.closingDate)
            
            // Get all applications for this vacancy
            const apps = await db.query.applications.findMany({
                where: eq(applications.vacancyId, vacancy.id)
            })

            if (apps.length === 0) {
                results.push({
                    vacancyId: vacancy.id,
                    title: vacancy.title,
                    avgTimeToShortlist: null,
                    avgTimeToInterview: null,
                    avgRating: null,
                    applicationCount: 0
                })
                continue
            }

            const appIds = apps.map(a => a.id)

            // Get status changes for these applications from audit logs
            const logs = await db.query.auditLogs.findMany({
                where: and(
                    eq(auditLogs.targetType, 'APPLICATION'),
                    inArray(auditLogs.targetId, appIds),
                    inArray(auditLogs.action, ['STATUS_UPDATE', 'INTERVIEW_SCHEDULED'])
                )
            })

            // Also check for bulk shortlisting for this vacancy
            const bulkShortlistLog = await db.query.auditLogs.findFirst({
                where: and(
                    eq(auditLogs.targetType, 'vacancy'),
                    eq(auditLogs.targetId, vacancy.id),
                    eq(auditLogs.action, 'BULK_SHORTLIST_RUN')
                ),
                orderBy: (al, { asc }) => [asc(al.createdAt)]
            })

            let totalTimeToShortlist = 0
            let shortlistCount = 0
            let totalTimeToInterview = 0
            let interviewCount = 0
            let totalRating = 0
            let ratedCount = 0

            apps.forEach(app => {
                if (app.rating) {
                    totalRating += app.rating
                    ratedCount++
                }

                const appLogs = logs.filter(l => l.targetId === app.id)
                
                // Sort logs by creation date
                appLogs.sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())

                let shortlistedDate: Date | null = null

                // 1. Check individual status update to shortlisted
                const shortlistedLog = appLogs.find(l => (l.newState as any)?.status === 'shortlisted')
                if (shortlistedLog) {
                    shortlistedDate = new Date(shortlistedLog.createdAt!)
                } 
                // 2. Or check if it was part of a bulk run
                else if (app.status === 'shortlisted' || app.status === 'interviewing' || app.status === 'accepted') {
                    if (bulkShortlistLog) {
                        shortlistedDate = new Date(bulkShortlistLog.createdAt!)
                    }
                }

                if (shortlistedDate) {
                    // Time from closing date to shortlist status update
                    const diffDays = (shortlistedDate.getTime() - closingDate.getTime()) / (1000 * 3600 * 24)
                    totalTimeToShortlist += Math.max(0, diffDays)
                    shortlistCount++

                    // Now check for interview
                    const interviewingLog = appLogs.find(l => 
                        (l.newState as any)?.status === 'interviewing' || l.action === 'INTERVIEW_SCHEDULED'
                    )
                    
                    if (interviewingLog) {
                        const interviewDate = new Date(interviewingLog.createdAt!)
                        // Time from shortlist status update to interviewing status update
                        const diffDaysInterview = (interviewDate.getTime() - shortlistedDate.getTime()) / (1000 * 3600 * 24)
                        totalTimeToInterview += Math.max(0, diffDaysInterview)
                        interviewCount++
                    }
                }
            })

            results.push({
                vacancyId: vacancy.id,
                title: vacancy.title,
                avgTimeToShortlist: shortlistCount > 0 ? totalTimeToShortlist / shortlistCount : null,
                avgTimeToInterview: interviewCount > 0 ? totalTimeToInterview / interviewCount : null,
                avgRating: ratedCount > 0 ? totalRating / ratedCount : null,
                applicationCount: apps.length
            })
        }

        return results
    }
}
