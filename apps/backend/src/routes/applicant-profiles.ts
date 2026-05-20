import { Hono } from 'hono'
import { db } from '../db'
import {
    applicantProfiles,
    qualifications,
    professionalDetails,
    trainingCourses,
    professionalMemberships,
    employmentHistory,
    referees,
    users
} from '../db/schema'
import { eq, and, or, ilike, desc, asc, sql, SQL } from 'drizzle-orm'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { successResponse, NotFoundError, ForbiddenError, ValidationError, ConflictError } from '../utils/errors'
import { calculateProfileCompletion } from '../utils/profile-completion'
import {
    applicantProfileSchema,
    updateApplicantProfileSchema,
    qualificationSchema,
    updateQualificationSchema,
    professionalDetailSchema,
    updateProfessionalDetailSchema,
    trainingCourseSchema,
    updateTrainingCourseSchema,
    professionalMembershipSchema,
    updateProfessionalMembershipSchema,
    employmentHistorySchema,
    updateEmploymentHistorySchema,
    refereeSchema,
    updateRefereeSchema,
    profileFiltersSchema
} from '@meru/shared'

export const applicantProfilesRouter = new Hono()

// ============ STATS ENDPOINT ============

// GET /api/applicant-profiles/stats - Get applicant profile statistics (Admin only)
applicantProfilesRouter.get('/stats', authenticate, requireAdmin, async (c) => {
    try {
        const [
            totalProfilesResult,
            pwdProfilesResult,
            maleProfilesResult,
            femaleProfilesResult
        ] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(applicantProfiles),
            db.select({ count: sql<number>`count(*)` }).from(applicantProfiles).where(eq(applicantProfiles.impairment, true)),
            db.select({ count: sql<number>`count(*)` }).from(applicantProfiles).where(eq(applicantProfiles.gender, 'Male')),
            db.select({ count: sql<number>`count(*)` }).from(applicantProfiles).where(eq(applicantProfiles.gender, 'Female'))
        ])

        return successResponse(c, {
            totalProfiles: Number(totalProfilesResult[0].count),
            pwdProfiles: Number(pwdProfilesResult[0].count),
            maleProfiles: Number(maleProfilesResult[0].count),
            femaleProfiles: Number(femaleProfilesResult[0].count)
        })
    } catch (error) {
        console.error('[ERROR] Failed to fetch profile stats', error)
        throw error
    }
})

// ============ APPLICANT PROFILE ENDPOINTS ============

// GET /api/applicant-profiles - Alias for /me (Get current user's profile)
applicantProfilesRouter.get('/', authenticate, async (c) => {
    const user = c.get('user')
    console.log(`[DEBUG] Fetching profile for user: ${user.userId}`)

    try {
        const profile = await db.query.applicantProfiles.findFirst({
            where: eq(applicantProfiles.userId, user.userId),
            with: {
                qualifications: true,
                professionalDetails: true,
                trainingCourses: true,
                professionalMemberships: true,
                employmentHistory: true,
                referees: true,
                documents: true
            }
        })

        if (!profile) {
            console.log(`[DEBUG] Profile not found for user: ${user.userId}`)
            return successResponse(c, null)
        }

        const profileWithCompletion = {
            ...profile,
            profileCompletion: calculateProfileCompletion(profile)
        }

        return successResponse(c, profileWithCompletion)
    } catch (error) {
        console.error(`[ERROR] Error fetching profile for user: ${user.userId}`, error)
        throw error
    }
})

// GET /api/applicant-profiles/me - Get current user's profile
applicantProfilesRouter.get('/me', authenticate, async (c) => {
    const user = c.get('user')

    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.userId, user.userId),
        with: {
            qualifications: true,
            professionalDetails: true,
            trainingCourses: true,
            professionalMemberships: true,
            employmentHistory: true,
            referees: true,
            documents: true
        }

    })

    if (!profile) {
        return successResponse(c, null)
    }

    const profileWithCompletion = {
        ...profile,
        profileCompletion: calculateProfileCompletion(profile)
    }

    return successResponse(c, profileWithCompletion)
})

// PUT /api/applicant-profiles/me - Update current user's profile
applicantProfilesRouter.put('/me', authenticate, async (c) => {
    const user = c.get('user')
    let body;
    try {
        body = await c.req.json()
    } catch (e) {
        console.error('[ERROR] Failed to parse JSON body or empty body received', e)
        throw new ValidationError('Invalid request: Empty or malformed JSON body')
    }

    // Check if profile exists
    const existingProfile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.userId, user.userId)
    })

    // If it's a new profile, validate with the full schema to ensure required fields
    // If it's an update, validate with the partial schema
    const schema = existingProfile ? updateApplicantProfileSchema : applicantProfileSchema
    const validationResult = schema.safeParse(body)

    if (!validationResult.success) {
        throw new ValidationError('Invalid profile data', validationResult.error.flatten())
    }

    const data = validationResult.data

    try {
        let profile

        await db.transaction(async (tx) => {
            if (existingProfile) {
                // Update existing profile
                [profile] = await tx
                    .update(applicantProfiles)
                    .set({
                        ...data,
                        updatedAt: new Date()
                    })
                    .where(eq(applicantProfiles.id, existingProfile.id))
                    .returning()
            } else {
                // Create new profile
                [profile] = await tx
                    .insert(applicantProfiles)
                    .values({
                        userId: user.userId,
                        ...data
                    } as any)
                    .returning()
            }
        })

        return successResponse(c, profile, existingProfile ? 'Profile updated successfully' : 'Profile created successfully')
    } catch (error: any) {
        const dbError = error.cause || error

        if (dbError.code === '23505') {
            if (dbError.constraint === 'applicant_profiles_id_number_unique' || dbError.detail?.includes('id_number')) {
                throw new ConflictError('A profile with this ID Number already exists')
            }
            if (dbError.constraint === 'applicant_profiles_user_id_unique') {
                throw new ConflictError('You already have a profile')
            }
        }
        throw error
    }
})

// ============ ME (CURRENT USER) SECTION ENDPOINTS ============

// Helper to get current user's profile ID
const getMyProfileId = async (userId: number) => {
    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.userId, userId),
        columns: { id: true }
    })
    if (!profile) throw new NotFoundError('Profile not found. Please create a profile first.')
    return profile.id
}

// GET /api/applicant-profiles/me/qualifications
applicantProfilesRouter.get('/me/qualifications', authenticate, async (c) => {
    const user = c.get('user')
    const profileId = await getMyProfileId(user.userId)
    const quals = await db.query.qualifications.findMany({
        where: eq(qualifications.applicantProfileId, profileId)
    })
    return successResponse(c, quals)
})

// POST /api/applicant-profiles/me/qualifications
applicantProfilesRouter.post('/me/qualifications', authenticate, async (c) => {
    const user = c.get('user')
    const profileId = await getMyProfileId(user.userId)
    const body = await c.req.json()
    const validationResult = qualificationSchema.safeParse(body)
    if (!validationResult.success) {
        throw new ValidationError('Invalid qualification data', validationResult.error.flatten())
    }
    const [qualification] = await db.insert(qualifications).values({
        applicantProfileId: profileId,
        ...validationResult.data
    }).returning()
    return successResponse(c, qualification, 'Qualification added successfully')
})

// PUT /api/applicant-profiles/me/qualifications/:qualId
applicantProfilesRouter.put('/me/qualifications/:qualId', authenticate, async (c) => {
    const user = c.get('user')
    const qualId = parseInt(c.req.param('qualId') || '0')
    const profileId = await getMyProfileId(user.userId)
    const body = await c.req.json()
    const validationResult = updateQualificationSchema.safeParse(body)
    if (!validationResult.success) {
        throw new ValidationError('Invalid qualification data', validationResult.error.flatten())
    }
    const [updated] = await db.update(qualifications).set({
        ...validationResult.data,
        updatedAt: new Date()
    }).where(and(
        eq(qualifications.id, qualId),
        eq(qualifications.applicantProfileId, profileId)
    )).returning()
    if (!updated) throw new NotFoundError('Qualification not found')
    return successResponse(c, updated, 'Qualification updated successfully')
})

// DELETE /api/applicant-profiles/me/qualifications/:qualId
applicantProfilesRouter.delete('/me/qualifications/:qualId', authenticate, async (c) => {
    const user = c.get('user')
    const qualId = parseInt(c.req.param('qualId') || '0')
    const profileId = await getMyProfileId(user.userId)
    await db.delete(qualifications).where(and(
        eq(qualifications.id, qualId),
        eq(qualifications.applicantProfileId, profileId)
    ))
    return successResponse(c, null, 'Qualification deleted successfully')
})

// GET /api/applicant-profiles/me/professional-details
applicantProfilesRouter.get('/me/professional-details', authenticate, async (c) => {
    const user = c.get('user')
    const profileId = await getMyProfileId(user.userId)
    const details = await db.query.professionalDetails.findMany({
        where: eq(professionalDetails.applicantProfileId, profileId)
    })
    return successResponse(c, details)
})

// POST /api/applicant-profiles/me/professional-details
applicantProfilesRouter.post('/me/professional-details', authenticate, async (c) => {
    const user = c.get('user')
    const profileId = await getMyProfileId(user.userId)
    const body = await c.req.json()
    const validationResult = professionalDetailSchema.safeParse(body)
    if (!validationResult.success) {
        throw new ValidationError('Invalid professional detail data', validationResult.error.flatten())
    }
    const [detail] = await db.insert(professionalDetails).values({
        applicantProfileId: profileId,
        ...validationResult.data
    }).returning()
    return successResponse(c, detail, 'Professional detail added successfully')
})

// PUT /api/applicant-profiles/me/professional-details/:detailId
applicantProfilesRouter.put('/me/professional-details/:detailId', authenticate, async (c) => {
    const user = c.get('user')
    const detailId = parseInt(c.req.param('detailId') || '0')
    const profileId = await getMyProfileId(user.userId)
    const body = await c.req.json()
    const validationResult = updateProfessionalDetailSchema.safeParse(body)
    if (!validationResult.success) {
        throw new ValidationError('Invalid professional detail data', validationResult.error.flatten())
    }
    const [updated] = await db.update(professionalDetails).set({
        ...validationResult.data,
        updatedAt: new Date()
    }).where(and(
        eq(professionalDetails.id, detailId),
        eq(professionalDetails.applicantProfileId, profileId)
    )).returning()
    if (!updated) throw new NotFoundError('Professional detail not found')
    return successResponse(c, updated, 'Professional detail updated successfully')
})

// DELETE /api/applicant-profiles/me/professional-details/:detailId
applicantProfilesRouter.delete('/me/professional-details/:detailId', authenticate, async (c) => {
    const user = c.get('user')
    const detailId = parseInt(c.req.param('detailId') || '0')
    const profileId = await getMyProfileId(user.userId)
    await db.delete(professionalDetails).where(and(
        eq(professionalDetails.id, detailId),
        eq(professionalDetails.applicantProfileId, profileId)
    ))
    return successResponse(c, null, 'Professional detail deleted successfully')
})

// GET /api/applicant-profiles/me/training-courses
applicantProfilesRouter.get('/me/training-courses', authenticate, async (c) => {
    const user = c.get('user')
    const profileId = await getMyProfileId(user.userId)
    const courses = await db.query.trainingCourses.findMany({
        where: eq(trainingCourses.applicantProfileId, profileId)
    })
    return successResponse(c, courses)
})

// POST /api/applicant-profiles/me/training-courses
applicantProfilesRouter.post('/me/training-courses', authenticate, async (c) => {
    const user = c.get('user')
    const profileId = await getMyProfileId(user.userId)
    const body = await c.req.json()
    const validationResult = trainingCourseSchema.safeParse(body)
    if (!validationResult.success) {
        throw new ValidationError('Invalid training course data', validationResult.error.flatten())
    }
    const [course] = await db.insert(trainingCourses).values({
        applicantProfileId: profileId,
        ...validationResult.data
    }).returning()
    return successResponse(c, course, 'Training course added successfully')
})

// PUT /api/applicant-profiles/me/training-courses/:courseId
applicantProfilesRouter.put('/me/training-courses/:courseId', authenticate, async (c) => {
    const user = c.get('user')
    const courseId = parseInt(c.req.param('courseId') || '0')
    const profileId = await getMyProfileId(user.userId)
    const body = await c.req.json()
    const validationResult = updateTrainingCourseSchema.safeParse(body)
    if (!validationResult.success) {
        throw new ValidationError('Invalid training course data', validationResult.error.flatten())
    }
    const [updated] = await db.update(trainingCourses).set({
        ...validationResult.data,
        updatedAt: new Date()
    }).where(and(
        eq(trainingCourses.id, courseId),
        eq(trainingCourses.applicantProfileId, profileId)
    )).returning()
    if (!updated) throw new NotFoundError('Training course not found')
    return successResponse(c, updated, 'Training course updated successfully')
})

// DELETE /api/applicant-profiles/me/training-courses/:courseId
applicantProfilesRouter.delete('/me/training-courses/:courseId', authenticate, async (c) => {
    const user = c.get('user')
    const courseId = parseInt(c.req.param('courseId') || '0')
    const profileId = await getMyProfileId(user.userId)
    await db.delete(trainingCourses).where(and(
        eq(trainingCourses.id, courseId),
        eq(trainingCourses.applicantProfileId, profileId)
    ))
    return successResponse(c, null, 'Training course deleted successfully')
})

// GET /api/applicant-profiles/me/professional-memberships
applicantProfilesRouter.get('/me/professional-memberships', authenticate, async (c) => {
    const user = c.get('user')
    const profileId = await getMyProfileId(user.userId)
    const memberships = await db.query.professionalMemberships.findMany({
        where: eq(professionalMemberships.applicantProfileId, profileId)
    })
    return successResponse(c, memberships)
})

// POST /api/applicant-profiles/me/professional-memberships
applicantProfilesRouter.post('/me/professional-memberships', authenticate, async (c) => {
    const user = c.get('user')
    const profileId = await getMyProfileId(user.userId)
    const body = await c.req.json()
    const validationResult = professionalMembershipSchema.safeParse(body)
    if (!validationResult.success) {
        throw new ValidationError('Invalid professional membership data', validationResult.error.flatten())
    }
    const [membership] = await db.insert(professionalMemberships).values({
        applicantProfileId: profileId,
        ...validationResult.data
    }).returning()
    return successResponse(c, membership, 'Professional membership added successfully')
})

// PUT /api/applicant-profiles/me/professional-memberships/:membershipId
applicantProfilesRouter.put('/me/professional-memberships/:membershipId', authenticate, async (c) => {
    const user = c.get('user')
    const membershipId = parseInt(c.req.param('membershipId') || '0')
    const profileId = await getMyProfileId(user.userId)
    const body = await c.req.json()
    const validationResult = updateProfessionalMembershipSchema.safeParse(body)
    if (!validationResult.success) {
        throw new ValidationError('Invalid professional membership data', validationResult.error.flatten())
    }
    const [updated] = await db.update(professionalMemberships).set({
        ...validationResult.data,
        updatedAt: new Date()
    }).where(and(
        eq(professionalMemberships.id, membershipId),
        eq(professionalMemberships.applicantProfileId, profileId)
    )).returning()
    if (!updated) throw new NotFoundError('Professional membership not found')
    return successResponse(c, updated, 'Professional membership updated successfully')
})

// DELETE /api/applicant-profiles/me/professional-memberships/:membershipId
applicantProfilesRouter.delete('/me/professional-memberships/:membershipId', authenticate, async (c) => {
    const user = c.get('user')
    const membershipId = parseInt(c.req.param('membershipId') || '0')
    const profileId = await getMyProfileId(user.userId)
    await db.delete(professionalMemberships).where(and(
        eq(professionalMemberships.id, membershipId),
        eq(professionalMemberships.applicantProfileId, profileId)
    ))
    return successResponse(c, null, 'Professional membership deleted successfully')
})

// GET /api/applicant-profiles/me/employment-history
applicantProfilesRouter.get('/me/employment-history', authenticate, async (c) => {
    const user = c.get('user')
    const profileId = await getMyProfileId(user.userId)
    const history = await db.query.employmentHistory.findMany({
        where: eq(employmentHistory.applicantProfileId, profileId)
    })
    return successResponse(c, history)
})

// POST /api/applicant-profiles/me/employment-history
applicantProfilesRouter.post('/me/employment-history', authenticate, async (c) => {
    const user = c.get('user')
    const profileId = await getMyProfileId(user.userId)
    const body = await c.req.json()
    const validationResult = employmentHistorySchema.safeParse(body)
    if (!validationResult.success) {
        throw new ValidationError('Invalid employment history data', validationResult.error.flatten())
    }
    const [history] = await db.insert(employmentHistory).values({
        applicantProfileId: profileId,
        ...validationResult.data
    }).returning()
    return successResponse(c, history, 'Employment history added successfully')
})

// PUT /api/applicant-profiles/me/employment-history/:historyId
applicantProfilesRouter.put('/me/employment-history/:historyId', authenticate, async (c) => {
    const user = c.get('user')
    const historyId = parseInt(c.req.param('historyId') || '0')
    const profileId = await getMyProfileId(user.userId)
    const body = await c.req.json()
    const validationResult = updateEmploymentHistorySchema.safeParse(body)
    if (!validationResult.success) {
        throw new ValidationError('Invalid employment history data', validationResult.error.flatten())
    }
    const [updated] = await db.update(employmentHistory).set({
        ...validationResult.data,
        updatedAt: new Date()
    }).where(and(
        eq(employmentHistory.id, historyId),
        eq(employmentHistory.applicantProfileId, profileId)
    )).returning()
    if (!updated) throw new NotFoundError('Employment history not found')
    return successResponse(c, updated, 'Employment history updated successfully')
})

// DELETE /api/applicant-profiles/me/employment-history/:historyId
applicantProfilesRouter.delete('/me/employment-history/:historyId', authenticate, async (c) => {
    const user = c.get('user')
    const historyId = parseInt(c.req.param('historyId') || '0')
    const profileId = await getMyProfileId(user.userId)
    await db.delete(employmentHistory).where(and(
        eq(employmentHistory.id, historyId),
        eq(employmentHistory.applicantProfileId, profileId)
    ))
    return successResponse(c, null, 'Employment history deleted successfully')
})

// GET /api/applicant-profiles/:id - Get profile by ID (admin or owner)
applicantProfilesRouter.get('/:id', authenticate, async (c) => {
    const id = parseInt(c.req.param('id') || '0')
    const user = c.get('user')

    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, id),
        with: {
            user: {
                columns: {
                    id: true,
                    phoneNumber: true,
                    email: true,
                    fullName: true
                }
            },
            qualifications: true,
            professionalDetails: true,
            trainingCourses: true,
            professionalMemberships: true,
            employmentHistory: true,
                homeCounty: true,
                homeSubCounty: true,
                ward: true,
                ethnicity: true,
                referees: true,
                documents: true
        }
    })

    if (!profile) {
        throw new NotFoundError('Profile not found')
    }

    // Only allow admin or the profile owner to view
    if (user.role !== 'admin' && profile.userId !== user.userId) {
        throw new ForbiddenError('You can only view your own profile')
    }

    return successResponse(c, profile)
})

// GET /api/applicant-profiles/user/:userId - Get profile by User ID (admin or owner)
applicantProfilesRouter.get('/user/:userId', authenticate, async (c) => {
    const targetUserId = parseInt(c.req.param('userId') || '0')
    const currentUser = c.get('user')

    // Only allow admin or the profile owner to view
    if (currentUser.role !== 'admin' && targetUserId !== currentUser.userId) {
        throw new ForbiddenError('You can only view your own profile')
    }

    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.userId, targetUserId),
        with: {
            user: {
                columns: {
                    id: true,
                    phoneNumber: true,
                    email: true,
                    fullName: true
                }
            },
            qualifications: true,
            professionalDetails: true,
            trainingCourses: true,
            professionalMemberships: true,
            employmentHistory: true,
                homeCounty: true,
                homeSubCounty: true,
                ward: true,
                ethnicity: true,
                referees: true,
                documents: true
        }
    })

    if (!profile) {
        throw new NotFoundError('Profile not found for this user')
    }

    return successResponse(c, profile)
})

// POST /api/applicant-profiles - Create or update profile
applicantProfilesRouter.post('/', authenticate, async (c) => {
    const user = c.get('user')
    const body = await c.req.json()

    // Validate input
    const validationResult = applicantProfileSchema.safeParse(body)

    if (!validationResult.success) {
        throw new ValidationError('Invalid profile data', validationResult.error.flatten())
    }

    const data = validationResult.data

    // Check if profile already exists
    const existingProfile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.userId, user.userId)
    })

    let profile

    try {
        if (existingProfile) {
            // Update existing profile
            [profile] = await db
                .update(applicantProfiles)
                .set({
                    ...data,
                    updatedAt: new Date()
                })
                .where(eq(applicantProfiles.id, existingProfile.id))
                .returning()
        } else {
            // Create new profile
            [profile] = await db
                .insert(applicantProfiles)
                .values({
                    userId: user.userId,
                    ...data
                })
                .returning()
        }
    } catch (error: any) {
        // Drizzle/node-postgres error wrapper
        const dbError = error.cause || error

        // Handle unique constraint violation (duplicate ID number)
        if (dbError.code === '23505') {
            if (dbError.constraint === 'applicant_profiles_id_number_unique' || dbError.detail?.includes('id_number')) {
                throw new ConflictError('A profile with this ID Number already exists')
            }
            if (dbError.constraint === 'applicant_profiles_user_id_unique') {
                throw new ConflictError('You already have a profile')
            }
            if (dbError.constraint === 'applicant_profiles_email_unique' || dbError.detail?.includes('email')) {
                throw new ConflictError('A profile with this email address already exists')
            }
        }
        throw error
    }

    return successResponse(c, profile, existingProfile ? 'Profile updated successfully' : 'Profile created successfully')
})

// ============ QUALIFICATIONS ENDPOINTS ============

// GET /api/applicant-profiles/:id/qualifications - Get all qualifications
applicantProfilesRouter.get('/:id/qualifications', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const user = c.get('user')

    // Verify profile ownership or admin
    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile) {
        throw new NotFoundError('Profile not found')
    }

    if (user.role !== 'admin' && profile.userId !== user.userId) {
        throw new ForbiddenError('Access denied')
    }

    const quals = await db.query.qualifications.findMany({
        where: eq(qualifications.applicantProfileId, profileId)
    })

    return successResponse(c, quals)
})

// POST /api/applicant-profiles/:id/qualifications - Add qualification
applicantProfilesRouter.post('/:id/qualifications', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const user = c.get('user')
    const body = await c.req.json()

    // Verify profile ownership
    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile) {
        throw new NotFoundError('Profile not found')
    }

    if (profile.userId !== user.userId) {
        throw new ForbiddenError('You can only add qualifications to your own profile')
    }

    // Validate input
    const validationResult = qualificationSchema.safeParse(body)

    if (!validationResult.success) {
        throw new ValidationError('Invalid qualification data', validationResult.error.flatten())
    }

    const [qualification] = await db
        .insert(qualifications)
        .values({
            applicantProfileId: profileId,
            ...validationResult.data
        })
        .returning()

    return successResponse(c, qualification, 'Qualification added successfully')
})

// PUT /api/applicant-profiles/:id/qualifications/:qualId - Update qualification
applicantProfilesRouter.put('/:id/qualifications/:qualId', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const qualId = parseInt(c.req.param('qualId') || '0')
    const user = c.get('user')
    const body = await c.req.json()

    // Verify ownership
    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile || profile.userId !== user.userId) {
        throw new ForbiddenError('Access denied')
    }

    // Validate input
    const validationResult = updateQualificationSchema.safeParse(body)

    if (!validationResult.success) {
        throw new ValidationError('Invalid qualification data', validationResult.error.flatten())
    }

    const [updated] = await db
        .update(qualifications)
        .set({
            ...validationResult.data,
            updatedAt: new Date()
        })
        .where(and(
            eq(qualifications.id, qualId),
            eq(qualifications.applicantProfileId, profileId)
        ))
        .returning()

    if (!updated) {
        throw new NotFoundError('Qualification not found')
    }

    return successResponse(c, updated, 'Qualification updated successfully')
})

// DELETE /api/applicant-profiles/:id/qualifications/:qualId - Delete qualification
applicantProfilesRouter.delete('/:id/qualifications/:qualId', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const qualId = parseInt(c.req.param('qualId') || '0')
    const user = c.get('user')

    // Verify ownership
    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile || profile.userId !== user.userId) {
        throw new ForbiddenError('Access denied')
    }

    await db.delete(qualifications).where(and(
        eq(qualifications.id, qualId),
        eq(qualifications.applicantProfileId, profileId)
    ))

    return successResponse(c, null, 'Qualification deleted successfully')
})

// ============ PROFESSIONAL DETAILS ENDPOINTS ============

// GET /api/applicant-profiles/:id/professional-details
applicantProfilesRouter.get('/:id/professional-details', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const user = c.get('user')

    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile) {
        throw new NotFoundError('Profile not found')
    }

    if (user.role !== 'admin' && profile.userId !== user.userId) {
        throw new ForbiddenError('Access denied')
    }

    const details = await db.query.professionalDetails.findMany({
        where: eq(professionalDetails.applicantProfileId, profileId)
    })

    return successResponse(c, details)
})

// POST /api/applicant-profiles/:id/professional-details
applicantProfilesRouter.post('/:id/professional-details', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const user = c.get('user')
    const body = await c.req.json()

    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile || profile.userId !== user.userId) {
        throw new ForbiddenError('Access denied')
    }

    const validationResult = professionalDetailSchema.safeParse(body)

    if (!validationResult.success) {
        throw new ValidationError('Invalid professional detail data', validationResult.error.flatten())
    }

    const [detail] = await db
        .insert(professionalDetails)
        .values({
            applicantProfileId: profileId,
            ...validationResult.data
        })
        .returning()

    return successResponse(c, detail, 'Professional detail added successfully')
})

// PUT /api/applicant-profiles/:id/professional-details/:detailId
applicantProfilesRouter.put('/:id/professional-details/:detailId', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const detailId = parseInt(c.req.param('detailId') || '0')
    const user = c.get('user')
    const body = await c.req.json()

    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile || profile.userId !== user.userId) {
        throw new ForbiddenError('Access denied')
    }

    const validationResult = updateProfessionalDetailSchema.safeParse(body)

    if (!validationResult.success) {
        throw new ValidationError('Invalid professional detail data', validationResult.error.flatten())
    }

    const [updated] = await db
        .update(professionalDetails)
        .set({
            ...validationResult.data,
            updatedAt: new Date()
        })
        .where(and(
            eq(professionalDetails.id, detailId),
            eq(professionalDetails.applicantProfileId, profileId)
        ))
        .returning()

    if (!updated) {
        throw new NotFoundError('Professional detail not found')
    }

    return successResponse(c, updated, 'Professional detail updated successfully')
})

// DELETE /api/applicant-profiles/:id/professional-details/:detailId
applicantProfilesRouter.delete('/:id/professional-details/:detailId', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const detailId = parseInt(c.req.param('detailId') || '0')
    const user = c.get('user')

    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile || profile.userId !== user.userId) {
        throw new ForbiddenError('Access denied')
    }

    await db.delete(professionalDetails).where(and(
        eq(professionalDetails.id, detailId),
        eq(professionalDetails.applicantProfileId, profileId)
    ))

    return successResponse(c, null, 'Professional detail deleted successfully')
})

// ============ REFEREES ENDPOINTS ============

// GET /api/applicant-profiles/me/referees
applicantProfilesRouter.get('/me/referees', authenticate, async (c) => {
    const user = c.get('user')
    const profileId = await getMyProfileId(user.userId)
    const items = await db.query.referees.findMany({
        where: eq(referees.applicantProfileId, profileId)
    })
    return successResponse(c, items)
})

// POST /api/applicant-profiles/me/referees
applicantProfilesRouter.post('/me/referees', authenticate, async (c) => {
    const user = c.get('user')
    const profileId = await getMyProfileId(user.userId)
    const body = await c.req.json()
    const validationResult = refereeSchema.safeParse(body)
    if (!validationResult.success) {
        throw new ValidationError('Invalid referee data', validationResult.error.flatten())
    }
    const [item] = await db.insert(referees).values({
        applicantProfileId: profileId,
        ...validationResult.data
    }).returning()
    return successResponse(c, item, 'Referee added successfully')
})

// PUT /api/applicant-profiles/me/referees/:refId
applicantProfilesRouter.put('/me/referees/:refId', authenticate, async (c) => {
    const user = c.get('user')
    const refId = parseInt(c.req.param('refId') || '0')
    const profileId = await getMyProfileId(user.userId)
    const body = await c.req.json()
    const validationResult = updateRefereeSchema.safeParse(body)
    if (!validationResult.success) {
        throw new ValidationError('Invalid referee data', validationResult.error.flatten())
    }
    const [updated] = await db.update(referees).set({
        ...validationResult.data,
        updatedAt: new Date()
    }).where(and(
        eq(referees.id, refId),
        eq(referees.applicantProfileId, profileId)
    )).returning()
    if (!updated) throw new NotFoundError('Referee not found')
    return successResponse(c, updated, 'Referee updated successfully')
})

// DELETE /api/applicant-profiles/me/referees/:refId
applicantProfilesRouter.delete('/me/referees/:refId', authenticate, async (c) => {
    const user = c.get('user')
    const refId = parseInt(c.req.param('refId') || '0')
    const profileId = await getMyProfileId(user.userId)
    await db.delete(referees).where(and(
        eq(referees.id, refId),
        eq(referees.applicantProfileId, profileId)
    ))
    return successResponse(c, null, 'Referee deleted successfully')
})

// ============ TRAINING COURSES ENDPOINTS ============

// GET /api/applicant-profiles/:id/training-courses
applicantProfilesRouter.get('/:id/training-courses', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const user = c.get('user')

    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile) {
        throw new NotFoundError('Profile not found')
    }

    if (user.role !== 'admin' && profile.userId !== user.userId) {
        throw new ForbiddenError('Access denied')
    }

    const courses = await db.query.trainingCourses.findMany({
        where: eq(trainingCourses.applicantProfileId, profileId)
    })

    return successResponse(c, courses)
})

// POST /api/applicant-profiles/:id/training-courses
applicantProfilesRouter.post('/:id/training-courses', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const user = c.get('user')
    const body = await c.req.json()

    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile || profile.userId !== user.userId) {
        throw new ForbiddenError('Access denied')
    }

    const validationResult = trainingCourseSchema.safeParse(body)

    if (!validationResult.success) {
        throw new ValidationError('Invalid training course data', validationResult.error.flatten())
    }

    const [course] = await db
        .insert(trainingCourses)
        .values({
            applicantProfileId: profileId,
            ...validationResult.data
        })
        .returning()

    return successResponse(c, course, 'Training course added successfully')
})

// PUT /api/applicant-profiles/:id/training-courses/:courseId
applicantProfilesRouter.put('/:id/training-courses/:courseId', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const courseId = parseInt(c.req.param('courseId') || '0')
    const user = c.get('user')
    const body = await c.req.json()

    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile || profile.userId !== user.userId) {
        throw new ForbiddenError('Access denied')
    }

    const validationResult = updateTrainingCourseSchema.safeParse(body)

    if (!validationResult.success) {
        throw new ValidationError('Invalid training course data', validationResult.error.flatten())
    }

    const [updated] = await db
        .update(trainingCourses)
        .set({
            ...validationResult.data,
            updatedAt: new Date()
        })
        .where(and(
            eq(trainingCourses.id, courseId),
            eq(trainingCourses.applicantProfileId, profileId)
        ))
        .returning()

    if (!updated) {
        throw new NotFoundError('Training course not found')
    }

    return successResponse(c, updated, 'Training course updated successfully')
})

// DELETE /api/applicant-profiles/:id/training-courses/:courseId
applicantProfilesRouter.delete('/:id/training-courses/:courseId', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const courseId = parseInt(c.req.param('courseId') || '0')
    const user = c.get('user')

    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile || profile.userId !== user.userId) {
        throw new ForbiddenError('Access denied')
    }

    await db.delete(trainingCourses).where(and(
        eq(trainingCourses.id, courseId),
        eq(trainingCourses.applicantProfileId, profileId)
    ))

    return successResponse(c, null, 'Training course deleted successfully')
})

// ============ PROFESSIONAL MEMBERSHIPS ENDPOINTS ============

// GET /api/applicant-profiles/:id/professional-memberships
applicantProfilesRouter.get('/:id/professional-memberships', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const user = c.get('user')

    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile) {
        throw new NotFoundError('Profile not found')
    }

    if (user.role !== 'admin' && profile.userId !== user.userId) {
        throw new ForbiddenError('Access denied')
    }

    const memberships = await db.query.professionalMemberships.findMany({
        where: eq(professionalMemberships.applicantProfileId, profileId)
    })

    return successResponse(c, memberships)
})

// POST /api/applicant-profiles/:id/professional-memberships
applicantProfilesRouter.post('/:id/professional-memberships', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const user = c.get('user')
    const body = await c.req.json()

    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile || profile.userId !== user.userId) {
        throw new ForbiddenError('Access denied')
    }

    const validationResult = professionalMembershipSchema.safeParse(body)

    if (!validationResult.success) {
        throw new ValidationError('Invalid professional membership data', validationResult.error.flatten())
    }

    const [membership] = await db
        .insert(professionalMemberships)
        .values({
            applicantProfileId: profileId,
            ...validationResult.data
        })
        .returning()

    return successResponse(c, membership, 'Professional membership added successfully')
})

// PUT /api/applicant-profiles/:id/professional-memberships/:membershipId
applicantProfilesRouter.put('/:id/professional-memberships/:membershipId', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const membershipId = parseInt(c.req.param('membershipId') || '0')
    const user = c.get('user')
    const body = await c.req.json()

    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile || profile.userId !== user.userId) {
        throw new ForbiddenError('Access denied')
    }

    const validationResult = updateProfessionalMembershipSchema.safeParse(body)

    if (!validationResult.success) {
        throw new ValidationError('Invalid professional membership data', validationResult.error.flatten())
    }

    const [updated] = await db
        .update(professionalMemberships)
        .set({
            ...validationResult.data,
            updatedAt: new Date()
        })
        .where(and(
            eq(professionalMemberships.id, membershipId),
            eq(professionalMemberships.applicantProfileId, profileId)
        ))
        .returning()

    if (!updated) {
        throw new NotFoundError('Professional membership not found')
    }

    return successResponse(c, updated, 'Professional membership updated successfully')
})

// DELETE /api/applicant-profiles/:id/professional-memberships/:membershipId
applicantProfilesRouter.delete('/:id/professional-memberships/:membershipId', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const membershipId = parseInt(c.req.param('membershipId') || '0')
    const user = c.get('user')

    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile || profile.userId !== user.userId) {
        throw new ForbiddenError('Access denied')
    }

    await db.delete(professionalMemberships).where(and(
        eq(professionalMemberships.id, membershipId),
        eq(professionalMemberships.applicantProfileId, profileId)
    ))

    return successResponse(c, null, 'Professional membership deleted successfully')
})

// ============ EMPLOYMENT HISTORY ENDPOINTS ============

// GET /api/applicant-profiles/:id/employment-history
applicantProfilesRouter.get('/:id/employment-history', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const user = c.get('user')

    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile) {
        throw new NotFoundError('Profile not found')
    }

    if (user.role !== 'admin' && profile.userId !== user.userId) {
        throw new ForbiddenError('Access denied')
    }

    const history = await db.query.employmentHistory.findMany({
        where: eq(employmentHistory.applicantProfileId, profileId)
    })

    return successResponse(c, history)
})

// POST /api/applicant-profiles/:id/employment-history
applicantProfilesRouter.post('/:id/employment-history', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const user = c.get('user')
    const body = await c.req.json()

    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile || profile.userId !== user.userId) {
        throw new ForbiddenError('Access denied')
    }

    const validationResult = employmentHistorySchema.safeParse(body)

    if (!validationResult.success) {
        throw new ValidationError('Invalid employment history data', validationResult.error.flatten())
    }

    const [history] = await db
        .insert(employmentHistory)
        .values({
            applicantProfileId: profileId,
            ...validationResult.data
        })
        .returning()

    return successResponse(c, history, 'Employment history added successfully')
})

// PUT /api/applicant-profiles/:id/employment-history/:historyId
applicantProfilesRouter.put('/:id/employment-history/:historyId', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const historyId = parseInt(c.req.param('historyId') || '0')
    const user = c.get('user')
    const body = await c.req.json()

    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile || profile.userId !== user.userId) {
        throw new ForbiddenError('Access denied')
    }

    const validationResult = updateEmploymentHistorySchema.safeParse(body)

    if (!validationResult.success) {
        throw new ValidationError('Invalid employment history data', validationResult.error.flatten())
    }

    const [updated] = await db
        .update(employmentHistory)
        .set({
            ...validationResult.data,
            updatedAt: new Date()
        })
        .where(and(
            eq(employmentHistory.id, historyId),
            eq(employmentHistory.applicantProfileId, profileId)
        ))
        .returning()

    if (!updated) {
        throw new NotFoundError('Employment history not found')
    }

    return successResponse(c, updated, 'Employment history updated successfully')
})

// DELETE /api/applicant-profiles/:id/employment-history/:historyId
applicantProfilesRouter.delete('/:id/employment-history/:historyId', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id') || '0')
    const historyId = parseInt(c.req.param('historyId') || '0')
    const user = c.get('user')

    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, profileId)
    })

    if (!profile || profile.userId !== user.userId) {
        throw new ForbiddenError('Access denied')
    }

    await db.delete(employmentHistory).where(and(
        eq(employmentHistory.id, historyId),
        eq(employmentHistory.applicantProfileId, profileId)
    ))

    return successResponse(c, null, 'Employment history deleted successfully')
})

// ============ ADMIN ENDPOINTS ============

// GET /api/applicant-profiles/admin/all - Get all profiles (admin only) 
applicantProfilesRouter.get('/admin/all', authenticate, requireAdmin, async (c) => {
    const query = c.req.query()
    const filters = profileFiltersSchema.safeParse(query)

    if (!filters.success) {
        throw new ValidationError('Invalid filter parameters', filters.error.flatten())
    }

    const {
        searchTerm,
        gender,
        impairment,
        ethnicityId,
        homeCountyId,
        page,
        limit,
        sortBy,
        order
    } = filters.data

    const limitNum = Math.min(parseInt(limit), 50)
    const pageNum = parseInt(page)
    const offsetNum = (pageNum - 1) * limitNum

    const whereConditions: (SQL | undefined)[] = []

    if (searchTerm) {
        whereConditions.push(
            or(
                ilike(applicantProfiles.fullName, `%${searchTerm}%`),
                ilike(applicantProfiles.idNumber, `%${searchTerm}%`),
                ilike(applicantProfiles.email, `%${searchTerm}%`)
            )
        )
    }

    if (gender) {
        whereConditions.push(eq(applicantProfiles.gender, gender))
    }

    if (impairment !== undefined) {
        whereConditions.push(eq(applicantProfiles.impairment, impairment === 'true'))
    }

    if (ethnicityId) {
        whereConditions.push(eq(applicantProfiles.ethnicityId, parseInt(ethnicityId)))
    }

    if (homeCountyId) {
        whereConditions.push(eq(applicantProfiles.homeCountyId, parseInt(homeCountyId)))
    }

    const whereClause = whereConditions.length > 0 ? and(...(whereConditions.filter(Boolean) as SQL[])) : undefined

    const sortDirection = order === 'desc' ? desc : asc
    let orderBy: SQL
    switch (sortBy) {
        case 'idNumber':
            orderBy = sortDirection(applicantProfiles.idNumber)
            break
        case 'createdAt':
            orderBy = sortDirection(applicantProfiles.createdAt)
            break
        case 'fullName':
        default:
            orderBy = sortDirection(applicantProfiles.fullName)
    }

    const profiles = await db.query.applicantProfiles.findMany({
        where: whereClause,
        orderBy,
        limit: limitNum,
        offset: offsetNum
    })

    // Get total count for pagination
    const totalCountResult = await db.select({ count: sql`count(*)::int` })
        .from(applicantProfiles)
        .where(whereClause)

    const totalCount = totalCountResult[0].count

    return successResponse(c, {
        data: profiles,
        pagination: {
            total: totalCount,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(totalCount / limitNum),
            hasNext: offsetNum + limitNum < totalCount,
            hasPrev: pageNum > 1
        }
    })
})

// GET /api/applicant-profiles/admin/export - Export profiles (admin only)
applicantProfilesRouter.get('/admin/export', authenticate, requireAdmin, async (c) => {
    const query = c.req.query()
    const filters = profileFiltersSchema.safeParse(query)

    const whereConditions: (SQL | undefined)[] = []

    if (filters.success) {
        const { searchTerm, gender, impairment, ethnicityId, homeCountyId } = filters.data

        if (searchTerm) {
            whereConditions.push(
                or(
                    ilike(applicantProfiles.fullName, `%${searchTerm}%`),
                    ilike(applicantProfiles.idNumber, `%${searchTerm}%`),
                    ilike(applicantProfiles.email, `%${searchTerm}%`)
                )
            )
        }
        if (gender) whereConditions.push(eq(applicantProfiles.gender, gender))
        if (impairment !== undefined) whereConditions.push(eq(applicantProfiles.impairment, impairment === 'true'))
        if (ethnicityId) whereConditions.push(eq(applicantProfiles.ethnicityId, parseInt(ethnicityId)))
        if (homeCountyId) whereConditions.push(eq(applicantProfiles.homeCountyId, parseInt(homeCountyId)))
    }

    const whereClause = whereConditions.length > 0 ? and(...(whereConditions.filter(Boolean) as SQL[])) : undefined

    const profiles = await db.query.applicantProfiles.findMany({
        where: whereClause,
        with: {
            user: {
                columns: {
                    phoneNumber: true,
                    email: true,
                    fullName: true
                }
            },
            qualifications: true,
            professionalDetails: true,
            trainingCourses: true,
            professionalMemberships: true,
            employmentHistory: true,
            referees: true,
            documents: true
        }
    })

    // Transform to flat structure for CSV export
    const exportData = profiles.map(profile => ({
        // Profile data
        name: profile.fullName,
        idNumber: profile.idNumber,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth,
        ethnicity: profile.ethnicityId,
        phoneNumber: profile.phoneNumber,
        email: profile.email,
        county: profile.homeCountyId,
        subCounty: profile.homeSubCountyId,
        ward: profile.wardId,
        impairment: profile.impairment,
        // User data
        userPhone: (profile.user as any)?.phoneNumber,
        userEmail: (profile.user as any)?.email,
        // Counts
        qualificationsCount: profile.qualifications.length,
        professionalDetailsCount: profile.professionalDetails.length,
        trainingCoursesCount: profile.trainingCourses.length,
        membershipCount: profile.professionalMemberships.length,
        employmentHistoryCount: profile.employmentHistory.length,
        refereesCount: (profile as any).referees?.length || 0
    }))

    return successResponse(c, exportData)
})
