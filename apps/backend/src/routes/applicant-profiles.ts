import { Hono } from 'hono'
import { db } from '../db'
import {
    applicantProfiles,
    qualifications,
    professionalDetails,
    trainingCourses,
    professionalMemberships,
    employmentHistory
} from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { successResponse, NotFoundError, ForbiddenError, ValidationError, ConflictError } from '../utils/errors'
import {
    applicantProfileSchema,
    qualificationSchema,
    updateQualificationSchema,
    professionalDetailSchema,
    updateProfessionalDetailSchema,
    trainingCourseSchema,
    updateTrainingCourseSchema,
    professionalMembershipSchema,
    updateProfessionalMembershipSchema,
    employmentHistorySchema,
    updateEmploymentHistorySchema
} from '@meru/shared'

export const applicantProfilesRouter = new Hono()

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
                employmentHistory: true
            }
        })

        if (!profile) {
            console.log(`[DEBUG] Profile not found for user: ${user.userId}`)
            return successResponse(c, null)
        }

        return successResponse(c, profile)
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
            employmentHistory: true
        }
    })

    if (!profile) {
        return successResponse(c, null)
    }

    return successResponse(c, profile)
})

// GET /api/applicant-profiles/:id - Get profile by ID (admin or owner)
applicantProfilesRouter.get('/:id', authenticate, async (c) => {
    const id = parseInt(c.req.param('id'))
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
            employmentHistory: true
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
    const targetUserId = parseInt(c.req.param('userId'))
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
            employmentHistory: true
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
    const profileId = parseInt(c.req.param('id'))
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
    const profileId = parseInt(c.req.param('id'))
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
    const profileId = parseInt(c.req.param('id'))
    const qualId = parseInt(c.req.param('qualId'))
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
    const profileId = parseInt(c.req.param('id'))
    const qualId = parseInt(c.req.param('qualId'))
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
    const profileId = parseInt(c.req.param('id'))
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
    const profileId = parseInt(c.req.param('id'))
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
    const profileId = parseInt(c.req.param('id'))
    const detailId = parseInt(c.req.param('detailId'))
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
    const profileId = parseInt(c.req.param('id'))
    const detailId = parseInt(c.req.param('detailId'))
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

// ============ TRAINING COURSES ENDPOINTS ============

// GET /api/applicant-profiles/:id/training-courses
applicantProfilesRouter.get('/:id/training-courses', authenticate, async (c) => {
    const profileId = parseInt(c.req.param('id'))
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
    const profileId = parseInt(c.req.param('id'))
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
    const profileId = parseInt(c.req.param('id'))
    const courseId = parseInt(c.req.param('courseId'))
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
    const profileId = parseInt(c.req.param('id'))
    const courseId = parseInt(c.req.param('courseId'))
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
    const profileId = parseInt(c.req.param('id'))
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
    const profileId = parseInt(c.req.param('id'))
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
    const profileId = parseInt(c.req.param('id'))
    const membershipId = parseInt(c.req.param('membershipId'))
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
    const profileId = parseInt(c.req.param('id'))
    const membershipId = parseInt(c.req.param('membershipId'))
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
    const profileId = parseInt(c.req.param('id'))
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
    const profileId = parseInt(c.req.param('id'))
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
    const profileId = parseInt(c.req.param('id'))
    const historyId = parseInt(c.req.param('historyId'))
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
    const profileId = parseInt(c.req.param('id'))
    const historyId = parseInt(c.req.param('historyId'))
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
    const profiles = await db.query.applicantProfiles.findMany({
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
            employmentHistory: true
        }
    })

    return successResponse(c, profiles)
})

// GET /api/applicant-profiles/admin/export - Export profiles (admin only)
applicantProfilesRouter.get('/admin/export', authenticate, requireAdmin, async (c) => {
    const profiles = await db.query.applicantProfiles.findMany({
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
            employmentHistory: true
        }
    })

    // Transform to flat structure for CSV export
    const exportData = profiles.map(profile => ({
        // Profile data
        name: profile.applicantName,
        idNumber: profile.idNumber,
        gender: profile.gender,
        birthYear: profile.birthYear,
        ethnicity: profile.ethnicity,
        phone: profile.phone,
        email: profile.email,
        county: profile.homeCounty,
        subCounty: profile.homeSubCounty,
        ward: profile.ward,
        impairment: profile.impairment,
        // User data
        userPhone: (profile.user as any).phoneNumber,
        userEmail: (profile.user as any).email,
        // Counts
        qualificationsCount: profile.qualifications.length,
        professionalDetailsCount: profile.professionalDetails.length,
        trainingCoursesCount: profile.trainingCourses.length,
        membershipCount: profile.professionalMemberships.length,
        employmentHistoryCount: profile.employmentHistory.length
    }))

    return successResponse(c, exportData)
})
