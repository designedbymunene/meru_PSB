import { db } from '../db'
import { eq, and, inArray } from 'drizzle-orm'
import { applications, shortlistCriteria } from '../db/schema'
import { ValidationError } from '../utils/errors'
import { AuditService } from './audit-service'

export class ShortlistService {
    /**
     * Sets or updates shortlisting criteria for a vacancy.
     */
    static async setCriteria(data: { vacancyId: number, weights: any, minScore: number, configuredBy: number }) {
        const { vacancyId, weights, minScore, configuredBy } = data

        const existing = await db.query.shortlistCriteria.findFirst({
            where: eq(shortlistCriteria.vacancyId, vacancyId)
        })

        if (existing) {
            const [updated] = await db
                .update(shortlistCriteria)
                .set({ weights, minScore, configuredBy, updatedAt: new Date() })
                .where(eq(shortlistCriteria.vacancyId, vacancyId))
                .returning()
            return updated
        } else {
            const [created] = await db
                .insert(shortlistCriteria)
                .values({ vacancyId, weights, minScore, configuredBy })
                .returning()
            return created
        }
    }

    /**
     * Gets criteria for a vacancy.
     */
    static async getCriteria(vacancyId: number) {
        return await db.query.shortlistCriteria.findFirst({
            where: eq(shortlistCriteria.vacancyId, vacancyId)
        })
    }

    /**
     * Runs the automated shortlisting process for a vacancy.
     */
    static async runShortlisting(vacancyId: number, adminId: number) {
        const criteria = await this.getCriteria(vacancyId)
        if (!criteria) {
            throw new ValidationError('Shortlisting criteria not set for this vacancy.')
        }

        const apps = await db.query.applications.findMany({
            where: and(
                eq(applications.vacancyId, vacancyId),
                inArray(applications.status, ['pending', 'reviewed'])
            )
        })

        if (apps.length === 0) {
            return { processed: 0, shortlisted: 0 }
        }

        let shortlistedCount = 0
        const updates = []

        for (const app of apps) {
            const score = this.calculateScore(app.profileSnapshot, criteria.weights)
            const isShortlisted = score >= criteria.minScore
            const newStatus = isShortlisted ? 'shortlisted' : 'reviewed'
            
            if (isShortlisted) {
                shortlistedCount++
            }

            updates.push(
                db.update(applications)
                    .set({ 
                        status: newStatus, 
                        notes: (app.notes ? app.notes + '\n' : '') + `Automated shortlisting score: ${score}/${criteria.minScore}`,
                        updatedAt: new Date() 
                    })
                    .where(eq(applications.id, app.id))
            )
        }

        // Execute all updates
        if (updates.length > 0) {
            await Promise.all(updates)
        }

        await AuditService.logAction({
            adminId,
            action: 'BULK_SHORTLIST_RUN',
            targetType: 'vacancy',
            targetId: vacancyId,
            newState: { processed: apps.length, shortlisted: shortlistedCount }
        })

        return { processed: apps.length, shortlisted: shortlistedCount }
    }

    /**
     * Scoring engine logic.
     */
    private static calculateScore(profile: any, weights: any) {
        if (!profile || !weights) return 0
        let score = 0

        // 1. Education Level Scoring
        if (weights.educationLevel && profile.qualifications && Array.isArray(profile.qualifications)) {
            let maxEduPoints = 0
            for (const qual of profile.qualifications) {
                const points = weights.educationLevel[qual.level] || 0
                if (points > maxEduPoints) maxEduPoints = points
            }
            score += maxEduPoints
        }

        // 2. Experience Years Scoring
        if (weights.experienceYears && profile.employmentHistory && Array.isArray(profile.employmentHistory)) {
            let totalDays = 0
            for (const job of profile.employmentHistory) {
                if (!job.startDate) continue
                const start = new Date(job.startDate)
                const end = job.endDate ? new Date(job.endDate) : new Date()
                
                if (isNaN(start.getTime())) continue
                
                totalDays += (end.getTime() - start.getTime()) / (1000 * 3600 * 24)
            }
            const years = totalDays / 365.25
            
            const pointsPerYear = weights.experienceYears.pointsPerYear || 0
            const maxPoints = weights.experienceYears.maxPoints || Infinity
            
            const expPoints = Math.min(years * pointsPerYear, maxPoints)
            score += Math.round(expPoints)
        }

        // 3. Professional Memberships Scoring
        if (weights.professionalMemberships && profile.professionalMemberships && Array.isArray(profile.professionalMemberships)) {
            const pointsPerMembership = weights.professionalMemberships.pointsPerMembership || 0
            const membershipPoints = profile.professionalMemberships.length * pointsPerMembership
            score += membershipPoints
        }

        return score
    }
}
