import { Hono } from 'hono'
import { db, applications, users, auditLogs } from '../db'
import { eq, and, desc, asc, inArray, SQL, or, ilike, exists, count, sql } from 'drizzle-orm'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { validate } from '../middleware/validation'
import {
    updateApplicationStatusSchema,
    applicationFiltersSchema,
    bulkApplicationStatusSchema,
    applicationReviewSchema,
    type BulkApplicationStatusInput,
    type ApplicationReviewInput
} from '@meru/shared'
import { NotFoundError, ForbiddenError, successResponse, ConflictError, ValidationError } from '../utils/errors'
import { ApplicationService } from '../services/application-service'
import { AuditService } from '../services/audit-service'
import { auditLog } from '../middleware/audit-logger'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

export const applicationsRouter = new Hono()

// ============ APPLICANT ENDPOINTS ============

// GET /api/applications/me - Get current user's applications
applicationsRouter.get('/me', authenticate, async (c) => {
    const user = c.get('user')
    const { vacancyId: vacancyIdRaw } = c.req.query()
    const vacancyId = vacancyIdRaw && !isNaN(parseInt(vacancyIdRaw)) ? parseInt(vacancyIdRaw) : undefined

    const apps = await db.query.applications.findMany({
        where: and(
            eq(applications.applicantId, user.userId),
            vacancyId ? eq(applications.vacancyId, vacancyId) : undefined
        ),
        with: {
            vacancy: {
                with: {
                    department: true,
                    jobGroup: true
                }
            },
            reviewer: {
                columns: {
                    id: true,
                    phoneNumber: true,
                    fullName: true,
                    email: true
                }
            }
        },
        orderBy: desc(applications.appliedAt)
    })

    return successResponse(c, apps)
})

// GET /api/applications - Get applications (applicants see own, admins see all)
applicationsRouter.get('/', authenticate, async (c) => {
    const user = c.get('user')
    const { vacancyId: vacancyIdRaw } = c.req.query()
    const vacancyId = vacancyIdRaw && !isNaN(parseInt(vacancyIdRaw)) ? parseInt(vacancyIdRaw) : undefined

    let allApplications

    if (user.role === 'admin') {
        allApplications = await db.query.applications.findMany({
            where: vacancyId ? eq(applications.vacancyId, vacancyId) : undefined,
            with: {
                applicant: {
                    columns: {
                        id: true,
                        phoneNumber: true,
                        fullName: true,
                        email: true
                    }
                },
                vacancy: {
                    with: {
                        department: true,
                        jobGroup: true
                    }
                }
            },
            orderBy: desc(applications.appliedAt)
        })
    } else {
        allApplications = await db.query.applications.findMany({
            where: and(
                eq(applications.applicantId, user.userId),
                vacancyId ? eq(applications.vacancyId, vacancyId) : undefined
            ),
            with: {
                applicant: {
                    columns: {
                        id: true,
                        phoneNumber: true,
                        fullName: true,
                        email: true
                    }
                },
                vacancy: {
                    with: {
                        department: true,
                        jobGroup: true
                    }
                }
            },
            orderBy: desc(applications.appliedAt)
        })
    }

    return successResponse(c, allApplications)
})

// GET /api/applications/:id - Get single application
applicationsRouter.get('/:id', authenticate, async (c) => {
    const id = parseInt(c.req.param('id') || '0')
    const user = c.get('user')

    const application = await db.query.applications.findFirst({
        where: eq(applications.id, id),
        with: {
            applicant: {
                columns: {
                    id: true,
                    phoneNumber: true,
                    fullName: true,
                    email: true
                },
                with: user.role === 'admin' ? {
                    applicantProfile: {
                        with: {
                            qualifications: true,
                            employmentHistory: true,
                            professionalDetails: true,
                            trainingCourses: true,
                            professionalMemberships: true,
                            referees: true,
                            documents: true
                        }
                    }
                } : undefined
            },
            vacancy: {
                with: {
                    department: true,
                    jobGroup: true
                }
            },
            reviewer: {
                columns: {
                    id: true,
                    phoneNumber: true,
                    fullName: true,
                    email: true
                }
            },
            auditLogs: {
                with: {
                    admin: {
                        columns: {
                            fullName: true
                        }
                    }
                },
                orderBy: desc(auditLogs.createdAt)
            }
        }
    })

    if (!application) {
        throw new NotFoundError('Application')
    }

    if (user.role !== 'admin' && application.applicantId !== user.userId) {
        throw new ForbiddenError('You can only view your own applications')
    }

    return successResponse(c, application)
})

// POST /api/applications - Apply for a vacancy
applicationsRouter.post('/', authenticate, async (c) => {
    const user = c.get('user')
    console.log(`[Applications] User ${user.userId} is applying for a vacancy`)

    try {
        let vacancyId: number | undefined
        const contentType = c.req.header('Content-Type') || ''

        if (contentType.includes('application/json')) {
            const body = await c.req.json()
            vacancyId = body.vacancyId ? parseInt(body.vacancyId.toString()) : undefined
        } else {
            const body = await c.req.parseBody()
            vacancyId = body.vacancyId ? parseInt(body.vacancyId as string) : undefined
        }

        if (!vacancyId) {
            return c.json(
                { success: false, error: { code: 'INVALID_INPUT', message: 'Vacancy ID is required', details: null } },
                { status: 400 }
            )
        }

        const newApplication = await ApplicationService.submitApplication(user.userId, vacancyId)

        return successResponse(
            c,
            newApplication,
            'Application submitted successfully'
        )
    } catch (error: any) {
        // Handle database unique constraint violation
        const dbError = error.cause || error
        if (dbError.code === '23505') {
            throw new ConflictError('You have already applied for this vacancy.')
        }

        console.error('Application submission error:', error)
        const status = error.statusCode || 500
        const code = error.name || 'SERVER_ERROR'
        return c.json(
            { success: false, error: { code, message: error.message, details: error.details || null } },
            { status }
        )
    }
})

// POST /api/applications/auto-save - Auto-save application progress
applicationsRouter.post('/auto-save', authenticate, async (c) => {
    const user = c.get('user')
    const { vacancyId, lastStep, partialData } = await c.req.json()

    if (!vacancyId) {
        throw new ValidationError('Vacancy ID is required')
    }

    // Check if application already exists
    const [existing] = await db
        .select()
        .from(applications)
        .where(
            and(
                eq(applications.applicantId, user.userId),
                eq(applications.vacancyId, vacancyId)
            )
        )

    if (existing) {
        // If it's already submitted (not a draft), we might not want to overwrite it with partial data
        // but for now let's assume auto-save only happens for drafts or we check status
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

        return successResponse(c, updated, 'Progress saved')
    } else {
        // Create new draft application
        const [inserted] = await db
            .insert(applications)
            .values({
                applicantId: user.userId,
                vacancyId,
                status: 'draft',
                lastStep,
                partialData
            })
            .returning()

        return successResponse(c, inserted, 'Progress saved')
    }
})


// DELETE /api/applications/:id - Delete own application
applicationsRouter.delete('/:id', authenticate, async (c) => {
    const id = parseInt(c.req.param('id') || '0')
    const user = c.get('user')

    const application = await db.query.applications.findFirst({
        where: eq(applications.id, id)
    })

    if (!application) {
        throw new NotFoundError('Application')
    }

    if (user.role !== 'admin' && application.applicantId !== user.userId) {
        throw new ForbiddenError('You can only delete your own applications')
    }

    await db.delete(applications).where(eq(applications.id, id))

    return successResponse(c, null, 'Application deleted successfully')
})

// ============ ADMIN REVIEW & MANAGEMENT ENDPOINTS ============

// GET /api/applications/admin/search - Advanced search and filtering for admin
applicationsRouter.get('/admin/search', authenticate, requireAdmin, async (c) => {
    const query = c.req.query()

    const filters = applicationFiltersSchema.safeParse({
        status: query.status,
        vacancyId: query.vacancyId,
        applicantId: query.applicantId,
        searchTerm: query.searchTerm,
        sortBy: query.sortBy,
        order: query.order,
        limit: query.limit,
        offset: query.offset
    })

    if (!filters.success) {
        throw new Error(`Invalid filter parameters: ${filters.error.message}`)
    }

    const { status, vacancyId, applicantId, searchTerm, sortBy, order, limit, offset } = filters.data
    const limitNum = Math.min(parseInt(limit), 100)
    const offsetNum = parseInt(offset)

    // Using core API for complex filters with joins
    const whereConditions: (SQL | undefined)[] = []
    if (status) whereConditions.push(eq(applications.status, status))
    if (vacancyId) whereConditions.push(eq(applications.vacancyId, parseInt(vacancyId)))
    if (applicantId) whereConditions.push(eq(applications.applicantId, parseInt(applicantId)))
    
    // Search term in applicant name or email
    if (searchTerm) {
        whereConditions.push(
            exists(
                db.select()
                    .from(users)
                    .where(
                        and(
                            eq(users.id, applications.applicantId),
                            or(
                                ilike(users.fullName, `%${searchTerm}%`),
                                ilike(users.email, `%${searchTerm}%`)
                            )
                        )
                    )
            )
        )
    }

    const filteredConditions = whereConditions.filter((c): c is SQL => !!c)
    let whereClause = filteredConditions.length > 0 ? and(...filteredConditions) : undefined
    
    const sortDirection = order === 'asc' ? asc : desc
    let orderBy = sortBy === 'reviewedAt' ? sortDirection(applications.reviewedAt) : sortDirection(applications.appliedAt)

    const result = await db.query.applications.findMany({
        where: whereClause,
        with: {
            applicant: {
                columns: {
                    id: true,
                    phoneNumber: true,
                    fullName: true,
                    email: true
                },
                with: {
                    applicantProfile: {
                        with: {
                            homeCounty: true
                        }
                    }
                }
            },
            vacancy: {
                with: {
                    department: true,
                    jobGroup: true
                }
            },
            reviewer: {
                columns: {
                    id: true,
                    phoneNumber: true,
                    fullName: true
                }
            }
        },
        orderBy,
        limit: limitNum,
        offset: offsetNum
    })

    // Optimize total count
    const totalCountResult = await db.select({ count: sql`count(*)::int` })
        .from(applications)
        .where(whereClause)
    
    const totalCount = Number(totalCountResult[0].count)

    return successResponse(c, {
        data: result,
        pagination: {
            total: totalCount,
            limit: limitNum,
            offset: offsetNum,
            hasMore: offsetNum + limitNum < totalCount
        }
    })
})

// GET /api/applications/admin/dashboard - Admin dashboard statistics
applicationsRouter.get('/admin/dashboard', authenticate, requireAdmin, async (c) => {
    const allApplications = await db.query.applications.findMany()

    const stats = {
        total: allApplications.length,
        pending: allApplications.filter(a => a.status === 'pending').length,
        reviewed: allApplications.filter(a => a.status === 'reviewed').length,
        accepted: allApplications.filter(a => a.status === 'accepted').length,
        rejected: allApplications.filter(a => a.status === 'rejected').length,
        avgRating: allApplications
            .filter(a => a.rating)
            .reduce((sum, a) => sum + (a.rating || 0), 0) / (allApplications.filter(a => a.rating).length || 1),
        byVacancy: {} as Record<number, number>
    }

    allApplications.forEach(app => {
        stats.byVacancy[app.vacancyId] = (stats.byVacancy[app.vacancyId] || 0) + 1
    })

    return successResponse(c, stats)
})

// PATCH /api/applications/:id/status - Update application status
applicationsRouter.patch(
    '/:id/status',
    authenticate,
    requireAdmin,
    validate(updateApplicationStatusSchema),
    async (c) => {
        const id = parseInt(c.req.param('id') || '0')
        const data = c.get('validatedData' as any)
        const user = c.get('user')

        const application = await db.query.applications.findFirst({
            where: eq(applications.id, id)
        })

        if (!application) {
            throw new NotFoundError('Application')
        }

        const previousState = { ...application }
        const updateData: any = {
            status: data.status,
            reviewedAt: new Date(),
            reviewedBy: user.userId
        }

        if (data.notes) updateData.notes = data.notes
        if (data.tags) updateData.tags = data.tags
        if (data.status === 'rejected' && data.rejectionReason) updateData.rejectionReason = data.rejectionReason

        const [updatedApplication] = await db
            .update(applications)
            .set(updateData)
            .where(eq(applications.id, id))
            .returning()

        await AuditService.logAction({
            adminId: user.userId,
            action: 'STATUS_UPDATE',
            targetType: 'APPLICATION',
            targetId: id,
            previousState,
            newState: updatedApplication,
            ipAddress: c.req.header('x-forwarded-for') || c.req.header('remote-addr'),
            userAgent: c.req.header('user-agent')
        })

        return successResponse(
            c,
            updatedApplication,
            'Application status updated successfully'
        )
    }
)

// POST /api/applications/:id/review - Comprehensive application review
applicationsRouter.post(
    '/:id/review',
    authenticate,
    requireAdmin,
    validate(applicationReviewSchema),
    async (c) => {
        const id = parseInt(c.req.param('id') || '0')
        const data = c.get('validatedData' as any) as ApplicationReviewInput
        const user = c.get('user')

        const application = await db.query.applications.findFirst({
            where: eq(applications.id, id)
        })

        if (!application) {
            throw new NotFoundError('Application')
        }

        const previousState = { ...application }
        const updateData: any = {
            status: data.status,
            notes: data.notes,
            tags: data.tags,
            rating: data.rating,
            reviewedAt: new Date(),
            reviewedBy: user.userId
        }

        if (data.rejectionReason && data.status === 'rejected') updateData.rejectionReason = data.rejectionReason
        if (data.feedbackToApplicant) updateData.feedbackToApplicant = data.feedbackToApplicant

        const [updatedApplication] = await db
            .update(applications)
            .set(updateData)
            .where(eq(applications.id, id))
            .returning()

        await AuditService.logAction({
            adminId: user.userId,
            action: 'REVIEW_SUBMITTED',
            targetType: 'APPLICATION',
            targetId: id,
            previousState,
            newState: updatedApplication,
            ipAddress: c.req.header('x-forwarded-for') || c.req.header('remote-addr'),
            userAgent: c.req.header('user-agent')
        })

        return successResponse(
            c,
            updatedApplication,
            `Application marked as ${data.status} with feedback`,
            200
        )
    }
)

// POST /api/applications/admin/bulk-status - Bulk update application statuses
applicationsRouter.post(
    '/admin/bulk-status',
    authenticate,
    requireAdmin,
    validate(bulkApplicationStatusSchema),
    async (c) => {
        const data = c.get('validatedData' as any) as BulkApplicationStatusInput
        const user = c.get('user')

        const updateData = {
            status: data.status,
            reviewedAt: new Date(),
            reviewedBy: user.userId,
            notes: data.notes
        }

        await db
            .update(applications)
            .set(updateData)
            .where(inArray(applications.id, data.applicationIds))

        const updated = await db.query.applications.findMany({
            where: inArray(applications.id, data.applicationIds)
        })

        await AuditService.logAction({
            adminId: user.userId,
            action: 'BULK_STATUS_UPDATE',
            targetType: 'APPLICATION',
            targetId: 0,
            newState: { updatedCount: updated.length, applicationIds: data.applicationIds, status: data.status },
            ipAddress: c.req.header('x-forwarded-for'),
            userAgent: c.req.header('user-agent')
        })

        return successResponse(
            c,
            { updatedCount: updated.length, applications: updated },
            `Updated ${updated.length} applications`
        )
    }
)

// GET /api/applications/admin/export - Export applications for reporting
applicationsRouter.get('/admin/export', authenticate, requireAdmin, auditLog('EXPORT_DATA', 'APPLICATION'), async (c) => {
    const status = c.req.query('status')
    const vacancyId = c.req.query('vacancyId')

    const whereConditions: (SQL | undefined)[] = []
    if (status) whereConditions.push(eq(applications.status, status))
    if (vacancyId) whereConditions.push(eq(applications.vacancyId, parseInt(vacancyId)))

    const filteredConditions = whereConditions.filter((c): c is SQL => !!c)

    const results = await db.query.applications.findMany({
        where: filteredConditions.length > 0 ? and(...filteredConditions) : undefined,
        with: {
            applicant: {
                with: {
                    applicantProfile: {
                        with: {
                            qualifications: true,
                            employmentHistory: true,
                            professionalDetails: true,
                            trainingCourses: true,
                            professionalMemberships: true
                        }
                    }
                }
            },
            vacancy: {
                with: {
                    department: true,
                    jobGroup: true
                }
            }
        },
        orderBy: desc(applications.appliedAt)
    })

    const escapeCsv = (field: any): string => {
        if (field === null || field === undefined) return ''
        const stringField = String(field)
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`
        }
        return stringField
    }

    const headers = [
        'VNo', 'Vacancy description', 'Applicant Name', 'ID-Number', 'Gender', 'Birth Year', 
        'Ethnicity', 'Tel. Contact', 'Email', 'Home County', 'Home Sub County', 'Ward', 
        'Impairment', 'Information on Public Service', 'Personal/Employment Number.', 
        'Qualification', 'Professional/Technical Details', 'Relevant Courses and Training Details', 
        'Membership', 'Employment history'
    ]

    const csvRows = [headers.join(',')]

    for (const app of results) {
        const profile = (app.profileSnapshot as any) || (app.applicant.applicantProfile as any)
        const vacancy = app.vacancy

        if (!profile) continue

        const qualifications = (profile.qualifications || []).map((q: any) =>
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

        const row = [
            vacancy.advertisementNumber,
            vacancy.title,
            profile.fullName || profile.applicantName,
            profile.idNumber,
            profile.gender,
            profile.birthYear,
            profile.ethnicity,
            profile.phoneNumber || profile.phone,
            profile.email,
            profile.homeCounty,
            profile.homeSubCounty,
            profile.ward,
            profile.impairment ? `YES: ${profile.impairmentDetails || ''}` : 'NO',
            profile.publicServiceInfo,
            profile.personalNumber,
            qualifications,
            profDetails,
            trainings,
            memberships,
            employment
        ].map(escapeCsv).join(',')

        csvRows.push(row)
    }

    const csvContent = csvRows.join('\n')
    return new Response(csvContent, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="applicants_export_${new Date().toISOString().split('T')[0]}.csv"`
        }
    })
})
