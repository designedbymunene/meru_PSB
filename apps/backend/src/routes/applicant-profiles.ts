import { Hono } from 'hono'
import { db } from '../db'
import {
    applicantProfiles,
    qualifications,
    professionalDetails,
    trainingCourses,
    professionalMemberships,
    employmentHistory,
    referees
} from '../db/schema'
import { eq, and, or, ilike, desc, asc, sql, SQL } from 'drizzle-orm'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { successResponse, NotFoundError, ForbiddenError, ValidationError, ConflictError } from '../utils/errors'
import { calculateProfileCompletion } from '../utils/profile-completion'
import { logger } from '../utils/logger'
import { auditLog } from '../middleware/audit-logger'
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

// Helper to get current user's profile ID
const getMyProfileId = async (userId: number) => {
    const profile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.userId, userId),
        columns: { id: true }
    })
    if (!profile) throw new NotFoundError('Profile not found. Please create a profile first.')
    return profile.id
}

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
        logger.error({ err: error }, 'Failed to fetch profile stats')
        throw error
    }
})

// ============ APPLICANT PROFILE ENDPOINTS ============

// GET /api/applicant-profiles - Alias for /me (Get current user's profile)
applicantProfilesRouter.get('/', authenticate, async (c) => {
    const user = c.get('user')
    logger.debug({ userId: user.userId }, 'Fetching profile for user via root alias')

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
            logger.debug({ userId: user.userId }, 'Profile not found for user via root alias')
            return successResponse(c, null)
        }

        const profileWithCompletion = {
            ...profile,
            profileCompletion: calculateProfileCompletion(profile)
        }

        return successResponse(c, profileWithCompletion)
    } catch (error) {
        logger.error({ err: error, userId: user.userId }, 'Error fetching profile for user via root alias')
        throw error
    }
})

// GET /api/applicant-profiles/me - Get current user's profile
applicantProfilesRouter.get('/me', authenticate, async (c) => {
    const user = c.get('user')
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
            return successResponse(c, null)
        }

        const profileWithCompletion = {
            ...profile,
            profileCompletion: calculateProfileCompletion(profile)
        }

        return successResponse(c, profileWithCompletion)
    } catch (error) {
        logger.error({ err: error, userId: user.userId }, 'Error fetching profile for user via /me')
        throw error
    }
})

// PUT /api/applicant-profiles/me - Update current user's profile
applicantProfilesRouter.put('/me', authenticate, async (c) => {
    const user = c.get('user')
    let body: any
    try {
        body = await c.req.json()
    } catch (e) {
        logger.error({ err: e }, 'Failed to parse JSON body or empty body received in PUT /me')
        throw new ValidationError('Invalid request: Empty or malformed JSON body')
    }

    // Check if profile exists
    const existingProfile = await db.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.userId, user.userId)
    })

    const schema = existingProfile ? updateApplicantProfileSchema : applicantProfileSchema
    const validationResult = schema.safeParse(body)

    if (!validationResult.success) {
        throw new ValidationError('Invalid profile data', validationResult.error.flatten())
    }

    const data = validationResult.data

    try {
        let profile: any

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
        throw new NotFoundError('Profile')
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
        throw new NotFoundError('Profile')
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

    let profile: any

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

// ============ SUB-RESOURCES REGISTRATION HELPER ============

function registerSubResourceRoutes({
    subPath,
    table,
    schema,
    updateSchema,
    fieldName,
    paramName
}: {
    subPath: string
    table: any
    schema: any
    updateSchema: any
    fieldName: string
    paramName: string
}) {
    const resolveProfileId = async (c: any, userId: number) => {
        const idParam = c.req.param('id')
        if (idParam === 'me') {
            return getMyProfileId(userId)
        }
        const parsed = parseInt(idParam || '0', 10)
        if (isNaN(parsed) || parsed <= 0) {
            throw new ValidationError('Invalid profile ID')
        }
        return parsed
    }

    // Unified route version (handles both /me/ and /:id/)
    applicantProfilesRouter.get(`/:id/${subPath}`, authenticate, async (c) => {
        const user = c.get('user')
        const profileId = await resolveProfileId(c, user.userId)
        
        const profile = await db.query.applicantProfiles.findFirst({
            where: eq(applicantProfiles.id, profileId)
        })
        if (!profile) throw new NotFoundError('Profile')
        if (user.role !== 'admin' && profile.userId !== user.userId) {
            throw new ForbiddenError('Access denied')
        }
        
        const items = await db.select().from(table).where(eq(table.applicantProfileId, profileId))
        return successResponse(c, items)
    })

    applicantProfilesRouter.post(`/:id/${subPath}`, authenticate, async (c) => {
        const user = c.get('user')
        const profileId = await resolveProfileId(c, user.userId)
        const body = await c.req.json()
        
        const profile = await db.query.applicantProfiles.findFirst({
            where: eq(applicantProfiles.id, profileId)
        })
        if (!profile) throw new NotFoundError('Profile')
        if (profile.userId !== user.userId) {
            throw new ForbiddenError(`You can only add ${fieldName.toLowerCase()}s to your own profile`)
        }
        
        const validationResult = schema.safeParse(body)
        if (!validationResult.success) {
            throw new ValidationError(`Invalid ${fieldName.toLowerCase()} data`, validationResult.error.flatten())
        }
        const inserted = await (db.insert(table).values({
            applicantProfileId: profileId,
            ...validationResult.data
        }).returning() as any)
        const item = inserted[0]
        return successResponse(c, item, `${fieldName} added successfully`)
    })

    applicantProfilesRouter.put(`/:id/${subPath}/:${paramName}`, authenticate, async (c) => {
        const user = c.get('user')
        const profileId = await resolveProfileId(c, user.userId)
        const itemId = parseInt(c.req.param(paramName) || '0')
        const body = await c.req.json()
        
        const profile = await db.query.applicantProfiles.findFirst({
            where: eq(applicantProfiles.id, profileId)
        })
        if (!profile || profile.userId !== user.userId) {
            throw new ForbiddenError('Access denied')
        }
        
        const validationResult = updateSchema.safeParse(body)
        if (!validationResult.success) {
            throw new ValidationError(`Invalid ${fieldName.toLowerCase()} data`, validationResult.error.flatten())
        }
        const updatedResult = await (db.update(table).set({
            ...validationResult.data,
            updatedAt: new Date()
        }).where(and(
            eq(table.id, itemId),
            eq(table.applicantProfileId, profileId)
        )).returning() as any)
        const updated = updatedResult[0]
        if (!updated) throw new NotFoundError(fieldName)
        return successResponse(c, updated, `${fieldName} updated successfully`)
    })

    applicantProfilesRouter.delete(`/:id/${subPath}/:${paramName}`, authenticate, async (c) => {
        const user = c.get('user')
        const profileId = await resolveProfileId(c, user.userId)
        const itemId = parseInt(c.req.param(paramName) || '0')
        
        const profile = await db.query.applicantProfiles.findFirst({
            where: eq(applicantProfiles.id, profileId)
        })
        if (!profile || profile.userId !== user.userId) {
            throw new ForbiddenError('Access denied')
        }
        const deletedResult = await (db.delete(table).where(and(
            eq(table.id, itemId),
            eq(table.applicantProfileId, profileId)
        )).returning() as any)
        const deleted = deletedResult[0]
        if (!deleted) throw new NotFoundError(fieldName)
        return successResponse(c, null, `${fieldName} deleted successfully`)
    })
}

// Register all sub-resource routes
registerSubResourceRoutes({
    subPath: 'qualifications',
    table: qualifications,
    schema: qualificationSchema,
    updateSchema: updateQualificationSchema,
    fieldName: 'Qualification',
    paramName: 'qualId'
})

registerSubResourceRoutes({
    subPath: 'professional-details',
    table: professionalDetails,
    schema: professionalDetailSchema,
    updateSchema: updateProfessionalDetailSchema,
    fieldName: 'Professional detail',
    paramName: 'detailId'
})

registerSubResourceRoutes({
    subPath: 'training-courses',
    table: trainingCourses,
    schema: trainingCourseSchema,
    updateSchema: updateTrainingCourseSchema,
    fieldName: 'Training course',
    paramName: 'courseId'
})

registerSubResourceRoutes({
    subPath: 'professional-memberships',
    table: professionalMemberships,
    schema: professionalMembershipSchema,
    updateSchema: updateProfessionalMembershipSchema,
    fieldName: 'Professional membership',
    paramName: 'membershipId'
})

registerSubResourceRoutes({
    subPath: 'employment-history',
    table: employmentHistory,
    schema: employmentHistorySchema,
    updateSchema: updateEmploymentHistorySchema,
    fieldName: 'Employment history',
    paramName: 'historyId'
})

registerSubResourceRoutes({
    subPath: 'referees',
    table: referees,
    schema: refereeSchema,
    updateSchema: updateRefereeSchema,
    fieldName: 'Referee',
    paramName: 'refId'
})

// ============ ADMIN ENDPOINTS ============

// GET /api/applicant-profiles/admin/all - Get all profiles (admin only)
applicantProfilesRouter.get('/admin/all', authenticate, requireAdmin, auditLog('VIEW_ALL_PROFILES', 'APPLICANT_PROFILE'), async (c) => {
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

    try {
        const profiles = await db.query.applicantProfiles.findMany({
            where: whereClause,
            orderBy,
            limit: limitNum,
            offset: offsetNum
        })

        // Get total count for pagination
        const totalCountResult = await db.select({ count: sql<number>`count(*)::int` })
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
    } catch (error) {
        logger.error({ err: error }, 'Failed to fetch admin profiles')
        throw error
    }
})

// GET /api/applicant-profiles/admin/export - Export profiles (admin only)
applicantProfilesRouter.get('/admin/export', authenticate, requireAdmin, auditLog('EXPORT_DATA', 'APPLICANT_PROFILE'), async (c) => {
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

    try {
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
                homeCounty: true,
                homeSubCounty: true,
                ward: true,
                residenceCounty: true,
                residenceSubCounty: true,
                residenceWard: true,
                ethnicity: true,
                qualifications: true,
                professionalDetails: true,
                trainingCourses: true,
                professionalMemberships: true,
                employmentHistory: true,
                referees: true
            }
        })

        const escapeCsv = (field: any): string => {
            if (field === null || field === undefined) return ''
            let stringField = String(field)
            
            // Prevent CSV injection
            const injectionChars = ['=', '+', '-', '@', '\t', '\r']
            if (injectionChars.some(char => stringField.startsWith(char))) {
                stringField = `'${stringField}`
            }

            if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
                return `"${stringField.replace(/"/g, '""')}"`
            }
            return stringField
        }

        const headers = [
            'Applicant Name', 'ID-Number', 'Gender', 'Date of Birth', 
            'Ethnicity', 'Tel. Contact', 'Email', 'Home County', 'Home Sub County', 'Ward', 
            'Residence County', 'Residence Sub County', 'Residence Ward',
            'Impairment', 'Information on Public Service', 'Personal/Employment Number.', 
            'Qualification', 'Professional/Technical Details', 'Relevant Courses and Training Details', 
            'Membership', 'Employment history', 'Referees'
        ]

        const csvRows = [headers.join(',')]

        for (const profile of profiles) {
            const qualificationsStr = (profile.qualifications || []).map((q: any) =>
                `${q.level} :: ${q.course} :: ${q.grade || 'N/A'} :: ${q.institution} :: ${q.yearStart} - ${q.yearEnd || 'Present'}`
            ).join('\n')

            const profDetails = (profile.professionalDetails || []).map((p: any) =>
                `${p.issuingBody || p.registrationBody} :: ${p.registrationNumber} :: ${p.expiryDate ? new Date(p.expiryDate).toISOString().split('T')[0] : 'N/A'}`
            ).join('\n')

            const trainings = (profile.trainingCourses || []).map((t: any) =>
                `${t.institution} :: ${t.courseName} :: ${t.grade || 'N/A'} :: ${t.year || 'N/A'}`
            ).join('\n')

            const memberships = (profile.professionalMemberships || []).map((m: any) =>
                `${m.membershipBody} :: ${m.registrationNumber} :: ${m.membershipType} :: ${m.expiryDate ? new Date(m.expiryDate).toISOString().split('T')[0] : 'N/A'}`
            ).join('\n')

            const employment = (profile.employmentHistory || []).map((e: any) =>
                `${e.startDate ? new Date(e.startDate).toISOString().split('T')[0] : 'N/A'} - ${e.endDate ? new Date(e.endDate).toISOString().split('T')[0] : 'Present'} :: ${e.jobTitle} :: ${e.jobGroup || 'N/A'} :: ${e.organization}`
            ).join('\n')

            const refereesStr = (profile.referees || []).map((r: any) =>
                `${r.fullName} :: ${r.organization} :: ${r.designation} :: ${r.phone} :: ${r.email}`
            ).join('\n')

            const row = [
                profile.fullName,
                profile.idNumber,
                profile.gender,
                profile.dateOfBirth,
                profile.ethnicity?.name || '',
                profile.phoneNumber,
                profile.email,
                profile.homeCounty?.name || '',
                profile.homeSubCounty?.name || '',
                profile.ward?.name || '',
                profile.residenceCounty?.name || '',
                profile.residenceSubCounty?.name || '',
                profile.residenceWard?.name || '',
                profile.impairment ? `YES: ${profile.impairmentDetails || ''}` : 'NO',
                profile.publicServiceInfo,
                profile.personalNumber,
                qualificationsStr,
                profDetails,
                trainings,
                memberships,
                employment,
                refereesStr
            ].map(escapeCsv).join(',')

            csvRows.push(row)
        }

        const csvContent = csvRows.join('\n')
        return new Response(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="applicant_profiles_export_${new Date().toISOString().split('T')[0]}.csv"`
            }
        })
    } catch (error) {
        logger.error({ err: error }, 'Failed to export admin profiles')
        throw error
    }
})
