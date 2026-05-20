import { db } from '../db'
import { eq, and, inArray } from 'drizzle-orm'
import { applications, shortlistCriteria, vacancies } from '../db/schema'
import { ValidationError } from '../utils/errors'
import { AuditService } from './audit-service'
import { ApplicationNotificationService } from './application-notification-service'

type ShortlistWeights = {
    education?: number
    experience?: number
    memberships?: number
    qualifications?: number
    skills?: number
    certifications?: number
    professionalMemberships?: number
}

function toNumber(value: unknown) {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

const QUALIFICATION_LEVEL_SCORES: Array<[RegExp, number]> = [
    [/ph\.?d|doctor/i, 100],
    [/master|mba|msc|ma/i, 90],
    [/post.?grad/i, 80],
    [/bachelor|degree|bsc|ba|bed|bcom|llb/i, 70],
    [/diploma/i, 55],
    [/certificate/i, 40],
    [/kcse|secondary|high school/i, 20],
]

function scoreQualificationLevel(level: unknown) {
    const value = String(level || '').trim()
    if (!value) return 0

    for (const [pattern, score] of QUALIFICATION_LEVEL_SCORES) {
        if (pattern.test(value)) return score
    }

    return 0
}

function normalizeWeights(weights: ShortlistWeights) {
    const education = (weights.education ?? 0) + (weights.qualifications ?? 0)
    const experience = (weights.experience ?? 0) + (weights.skills ?? 0)
    const memberships =
        (weights.memberships ?? 0) +
        (weights.certifications ?? 0) +
        (weights.professionalMemberships ?? 0)

    const total = education + experience + memberships

    if (total <= 0) {
        return { education: 0, experience: 0, memberships: 0, total }
    }

    return {
        education,
        experience,
        memberships,
        total,
    }
}

function parseShortlistWeights(value: unknown): ShortlistWeights {
    if (!value || typeof value !== 'object') return {}

    const weights = value as Record<string, unknown>
    return {
        education: toNumber(weights.education),
        experience: toNumber(weights.experience),
        memberships: toNumber(weights.memberships),
        qualifications: toNumber(weights.qualifications),
        skills: toNumber(weights.skills),
        certifications: toNumber(weights.certifications),
        professionalMemberships: toNumber(weights.professionalMemberships),
    }
}

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
        const vacancy = await db.query.vacancies.findFirst({
            where: eq(vacancies.id, vacancyId)
        })

        if (!vacancy) {
            throw new ValidationError('Vacancy not found.')
        }

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

        const selectedSlots = Math.max(0, vacancy.openPositions || 0)
        const scoredApps = apps
            .map(app => ({
                app,
                score: this.calculateScore(app.profileSnapshot, parseShortlistWeights(criteria.weights)),
            }))
            .sort((left, right) => {
                if (right.score !== left.score) return right.score - left.score
                const leftAppliedAt = left.app.appliedAt ? new Date(left.app.appliedAt).getTime() : 0
                const rightAppliedAt = right.app.appliedAt ? new Date(right.app.appliedAt).getTime() : 0
                return leftAppliedAt - rightAppliedAt
            })

        const thresholdQualified = scoredApps.filter(({ score }) => score >= criteria.minScore)
        const shortlistedApps = thresholdQualified.slice(0, selectedSlots)

        if (shortlistedApps.length < selectedSlots) {
            const shortlistedIds = new Set(shortlistedApps.map(({ app }) => app.id))
            for (const candidate of scoredApps) {
                if (shortlistedApps.length >= selectedSlots) break
                if (shortlistedIds.has(candidate.app.id)) continue
                shortlistedApps.push(candidate)
                shortlistedIds.add(candidate.app.id)
            }
        }

        const shortlistedIdSet = new Set(shortlistedApps.map(({ app }) => app.id))
        let shortlistedCount = 0
        const fallbackCount = shortlistedApps.filter(({ score }) => score < criteria.minScore).length
        const updates = []

        for (const { app, score } of scoredApps) {
            const isShortlisted = shortlistedIdSet.has(app.id)
            const newStatus = isShortlisted ? 'shortlisted' : 'reviewed'
            
            if (isShortlisted) {
                shortlistedCount++
            }

            const statusNote = isShortlisted && score < criteria.minScore
                ? `Automated shortlisting score: ${score}/${criteria.minScore} (ranked shortlist fallback)`
                : `Automated shortlisting score: ${score}/${criteria.minScore}`

            updates.push(
                db.update(applications)
                    .set({ 
                        status: newStatus, 
                        notes: (app.notes ? app.notes + '\n' : '') + statusNote,
                        updatedAt: new Date() 
                    })
                    .where(eq(applications.id, app.id))
            )
        }

        // Execute all updates
        if (updates.length > 0) {
            await Promise.all(updates)
        }

        if (shortlistedApps.length > 0) {
            await Promise.all(
                shortlistedApps.map(({ app }) =>
                    ApplicationNotificationService.notifyApplicationStatusChange({
                        applicantId: app.applicantId,
                        applicationId: app.id,
                        vacancyId: app.vacancyId,
                        status: 'shortlisted',
                    })
                )
            )
        }

        await AuditService.logAction({
            adminId,
            action: 'BULK_SHORTLIST_RUN',
            targetType: 'vacancy',
            targetId: vacancyId,
            newState: { processed: apps.length, shortlisted: shortlistedCount, fallbackShortlisted: fallbackCount }
        })

        return { processed: apps.length, shortlisted: shortlistedCount, fallbackShortlisted: fallbackCount }
    }

    /**
     * Scoring engine logic.
     */
    private static calculateScore(profile: any, weights: ShortlistWeights) {
        if (!profile || !weights) return 0
        const normalizedWeights = normalizeWeights(weights)
        if (normalizedWeights.total === 0) return 0

        let educationScore = 0
        const qualifications = Array.isArray(profile.qualifications) ? profile.qualifications : []
        for (const qual of qualifications) {
            educationScore = Math.max(educationScore, scoreQualificationLevel(qual?.level))
        }

        let experienceScore = 0
        const employmentHistory = Array.isArray(profile.employmentHistory) ? profile.employmentHistory : []
        if (employmentHistory.length > 0) {
            let totalDays = 0
            for (const job of employmentHistory) {
                if (!job?.startDate) continue
                const start = new Date(job.startDate)
                const end = job.endDate ? new Date(job.endDate) : new Date()

                if (isNaN(start.getTime()) || isNaN(end.getTime())) continue

                totalDays += Math.max(0, (end.getTime() - start.getTime()) / (1000 * 3600 * 24))
            }

            const years = totalDays / 365.25
            experienceScore = Math.min(Math.round((years / 10) * 100), 100)
        }

        const professionalMemberships = Array.isArray(profile.professionalMemberships) ? profile.professionalMemberships : []
        const professionalDetails = Array.isArray(profile.professionalDetails) ? profile.professionalDetails : []
        const membershipCount = professionalMemberships.length + professionalDetails.length
        const membershipsScore = Math.min(membershipCount * 25, 100)

        const weightedScore =
            educationScore * normalizedWeights.education +
            experienceScore * normalizedWeights.experience +
            membershipsScore * normalizedWeights.memberships

        return Math.round(weightedScore / normalizedWeights.total)
    }
}
