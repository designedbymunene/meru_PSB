import { db } from '../db'
import { eq, and } from 'drizzle-orm'
import { applications, vacancies } from '../db/schema'
import { ProfileService } from './profile-service'
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors'

export class ApplicationService {
    /**
     * Submits a new job application.
     * Performs validation, completeness checks, and captures a profile snapshot.
     */
    static async submitApplication(userId: number, vacancyId: number) {
        return await db.transaction(async (tx) => {
            // 1. Check if vacancy exists
            const vacancy = await tx.query.vacancies.findFirst({
                where: eq(vacancies.id, vacancyId)
            })

            if (!vacancy) {
                throw new NotFoundError('Vacancy not found')
            }

            // 2. Check deadline and status
            const now = new Date()
            const closingDate = new Date(vacancy.closingDate)
            closingDate.setHours(23, 59, 59, 999)

            if (vacancy.status === 'closed' || now > closingDate) {
                throw new ValidationError('This vacancy is no longer accepting applications.')
            }

            // 3. Check for duplicate application
            const existing = await tx.query.applications.findFirst({
                where: and(
                    eq(applications.applicantId, userId),
                    eq(applications.vacancyId, vacancyId)
                )
            })

            if (existing) {
                throw new ConflictError('You have already applied for this vacancy.')
            }

            // 4. Fetch full profile and check completeness
            const profile = await ProfileService.getFullProfile(userId)
            if (!profile) {
                throw new ValidationError('Please create your profile before applying.')
            }

            const completion = await ProfileService.getCompletionStats(userId)
            if (!completion || !completion.canApply) {
                throw new ValidationError(
                    'Complete the required profile sections before applying. Missing: ' +
                    (completion?.requiredMissing?.join(', ') || 'Required sections')
                )
            }

            // 5. Create application with snapshot
            const [newApplication] = await tx
                .insert(applications)
                .values({
                    applicantId: userId,
                    vacancyId,
                    status: 'pending',
                    profileSnapshot: profile // Drizzle handles JSONB serialization
                })
                .returning()

            return newApplication
        })
    }

    /**
     * Saves a draft application with partial data.
     */
    static async autoSaveApplication(userId: number, vacancyId: number, lastStep?: number, partialData?: any) {
        // Check if application already exists
        const existing = await db.query.applications.findFirst({
            where: and(
                eq(applications.applicantId, userId),
                eq(applications.vacancyId, vacancyId)
            )
        })

        if (existing) {
            if (existing.status !== 'draft' && existing.status !== 'pending') {
                throw new ConflictError('Cannot auto-save a completed application')
            }

            const [updated] = await db
                .update(applications)
                .set({
                    lastStep,
                    partialData,
                    updatedAt: new Date()
                })
                .where(eq(applications.id, existing.id))
                .returning()

            return updated
        } else {
            const [inserted] = await db
                .insert(applications)
                .values({
                    applicantId: userId,
                    vacancyId,
                    status: 'draft',
                    lastStep,
                    partialData
                })
                .returning()

            return inserted
        }
    }
}
