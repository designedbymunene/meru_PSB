import { db } from '../db'
import { eq, and } from 'drizzle-orm'
import { applications, vacancies } from '../db/schema'
import { ProfileService } from './profile-service'
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors'
import { calculateProfileCompletion } from '../utils/profile-completion'

export class ApplicationService {
    /**
     * Submits a new job application.
     * Performs validation, completeness checks, and captures a profile snapshot.
     */
    static async submitApplication(userId: number, vacancyId: number) {
        // 1. Fetch full profile outside transaction
        const profile = await ProfileService.getFullProfile(userId)
        if (!profile) {
            throw new ValidationError('Please create your profile before applying.')
        }

        // 2. Validate completeness outside transaction
        const completion = calculateProfileCompletion(profile)
        if (!completion || !completion.canApply) {
            throw new ValidationError(
                'Complete the required profile sections before applying. Missing: ' +
                (completion?.requiredMissing?.join(', ') || 'Required sections')
            )
        }

        return await db.transaction(async (tx) => {
            // 3. Check if vacancy exists
            const vacancy = await tx.query.vacancies.findFirst({
                where: eq(vacancies.id, vacancyId)
            })

            if (!vacancy) {
                throw new NotFoundError('Vacancy not found')
            }

            // 4. Check deadline and status
            const now = new Date()
            const closingDate = new Date(vacancy.closingDate)
            closingDate.setHours(23, 59, 59, 999)

            if (vacancy.status === 'closed' || now > closingDate) {
                throw new ValidationError('This vacancy is no longer accepting applications.')
            }

            // 5. Check for duplicate application or existing draft
            const existing = await tx.query.applications.findFirst({
                where: and(
                    eq(applications.applicantId, userId),
                    eq(applications.vacancyId, vacancyId)
                )
            })

            if (existing) {
                // If it's already submitted (not a draft), throw error
                if (existing.status !== 'draft') {
                    throw new ConflictError('You have already applied for this vacancy.')
                }

                // If it's a draft, update it to pending and capture snapshot
                const [updatedApplication] = await tx
                    .update(applications)
                    .set({
                        status: 'pending',
                        profileSnapshot: profile,
                        appliedAt: new Date(),
                        updatedAt: new Date()
                    })
                    .where(eq(applications.id, existing.id))
                    .returning()

                return updatedApplication
            }

            // 6. Create new application with snapshot
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
