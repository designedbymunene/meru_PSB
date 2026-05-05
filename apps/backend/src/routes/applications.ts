import { Hono } from 'hono'
import { db, applications, vacancies, type Qualification, type ProfessionalDetail, type TrainingCourse, type ProfessionalMembership, type EmploymentHistory } from '../db'
import { eq, and, desc, asc, inArray } from 'drizzle-orm'
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
import { NotFoundError, ForbiddenError, successResponse } from '../utils/errors'
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
    const { vacancyId } = c.req.query()

    const apps = await db.query.applications.findMany({
        where: and(
            eq(applications.applicantId, user.userId),
            vacancyId ? eq(applications.vacancyId, parseInt(vacancyId as string)) : undefined
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
    const { vacancyId } = c.req.query()

    let allApplications

    if (user.role === 'admin') {
        // Admin can see all applications with filters
        allApplications = await db.query.applications.findMany({
            where: vacancyId ? eq(applications.vacancyId, parseInt(vacancyId as string)) : undefined,
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
        // Applicants can only see their own applications
        allApplications = await db.query.applications.findMany({
            where: and(
                eq(applications.applicantId, user.userId),
                vacancyId ? eq(applications.vacancyId, parseInt(vacancyId as string)) : undefined
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
    const id = parseInt(c.req.param('id'))
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
                    fullName: true,
                    email: true
                }
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

        // Try to get vacancyId from JSON body first
        const contentType = c.req.header('Content-Type') || ''

        if (contentType.includes('application/json')) {
            const body = await c.req.json()
            console.log('[Applications] Received JSON body:', JSON.stringify(body))
            vacancyId = body.vacancyId ? parseInt(body.vacancyId.toString()) : undefined
        } else {
            // Fallback to form data
            const body = await c.req.parseBody()
            console.log('[Applications] Received form data:', body)
            vacancyId = body.vacancyId ? parseInt(body.vacancyId as string) : undefined
        }

        if (!vacancyId) {
            console.warn('[Applications] Submission failed: Vacancy ID is missing')
            return c.json(
                { success: false, error: { code: 'INVALID_INPUT', message: 'Vacancy ID is required', details: null } },
                { status: 400 }
            )
        }

        console.log(`[Applications] Validated Vacancy ID: ${vacancyId}`)


        // Check if vacancy exists and if deadline has passed
        const vacancy = await db.query.vacancies.findFirst({
            where: eq(vacancies.id, vacancyId)
        })

        if (!vacancy) {
            return c.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Vacancy not found', details: null } },
                { status: 404 }
            )
        }

        // Check deadline and status
        const now = new Date()
        const closingDate = new Date(vacancy.closingDate)
        // Deadline is inclusive of the closing date, so we set it to the end of that day
        closingDate.setHours(23, 59, 59, 999)

        if (vacancy.status === 'closed' || now > closingDate) {
            return c.json(
                {
                    success: false,
                    error: {
                        code: 'VACANCY_CLOSED',
                        message: 'This vacancy is no longer accepting applications (deadline has passed or it is closed).',
                        details: null
                    }
                },
                { status: 400 }
            )
        }

        // Check if user has already applied for this vacancy
        const existingApplication = await db.query.applications.findFirst({
            where: and(
                eq(applications.applicantId, user.userId),
                eq(applications.vacancyId, vacancyId)
            )
        })

        if (existingApplication) {
            return c.json(
                {
                    success: false,
                    error: {
                        code: 'DUPLICATE_APPLICATION',
                        message: 'You have already applied for this vacancy.',
                        details: null
                    }
                },
                { status: 400 }
            )
        }

        // Create application
        const [newApplication] = await db
            .insert(applications)
            .values({
                applicantId: user.userId,
                vacancyId,
                status: 'pending'
            })
            .returning()

        return successResponse(
            c,
            newApplication,
            'Application submitted successfully'
        )
    } catch (error) {
        console.error('Application submission error:', error)
        return c.json(
            { success: false, error: { code: 'SERVER_ERROR', message: (error as Error).message, details: null } },
            { status: 500 }
        )
    }
})

// DELETE /api/applications/:id - Delete own application
applicationsRouter.delete('/:id', authenticate, async (c) => {
    const id = parseInt(c.req.param('id'))
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

    const { status, vacancyId, applicantId, sortBy, order, limit, offset } = filters.data
    const limitNum = Math.min(parseInt(limit), 100)
    const offsetNum = parseInt(offset)

    // Build where conditions
    const whereConditions: any[] = []

    if (status) {
        whereConditions.push(eq(applications.status, status))
    }

    if (vacancyId) {
        whereConditions.push(eq(applications.vacancyId, parseInt(vacancyId)))
    }

    if (applicantId) {
        whereConditions.push(eq(applications.applicantId, parseInt(applicantId)))
    }

    // Build combined where clause
    let whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

    // Determine sort direction
    const sortDirection = order === 'asc' ? asc : desc
    let orderBy

    switch (sortBy) {
        case 'reviewedAt':
            orderBy = sortDirection(applications.reviewedAt)
            break
        default:
            orderBy = sortDirection(applications.appliedAt)
    }

    const result = await db.query.applications.findMany({
        where: whereClause,
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

    const total = await db.query.applications.findMany({
        where: whereClause
    })

    return successResponse(c, {
        data: result,
        pagination: {
            total: total.length,
            limit: limitNum,
            offset: offsetNum,
            hasMore: offsetNum + limitNum < total.length
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

    // Group by vacancy
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
        const id = parseInt(c.req.param('id'))
        const data = c.get('validatedData' as never) as { status: string; notes?: string; rejectionReason?: string }
        const user = c.get('user')

        const application = await db.query.applications.findFirst({
            where: eq(applications.id, id)
        })

        if (!application) {
            throw new NotFoundError('Application')
        }

        const updateData: any = {
            status: data.status,
            reviewedAt: new Date(),
            reviewedBy: user.userId
        }

        if (data.notes) {
            updateData.notes = data.notes
        }

        if (data.status === 'rejected' && data.rejectionReason) {
            updateData.rejectionReason = data.rejectionReason
        }

        const [updatedApplication] = await db
            .update(applications)
            .set(updateData)
            .where(eq(applications.id, id))
            .returning()

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
        const id = parseInt(c.req.param('id'))
        const data = c.get('validatedData' as never) as ApplicationReviewInput
        const user = c.get('user')

        const application = await db.query.applications.findFirst({
            where: eq(applications.id, id)
        })

        if (!application) {
            throw new NotFoundError('Application')
        }

        const updateData: any = {
            status: data.status,
            notes: data.notes,
            rating: data.rating,
            reviewedAt: new Date(),
            reviewedBy: user.userId
        }

        if (data.rejectionReason && data.status === 'rejected') {
            updateData.rejectionReason = data.rejectionReason
        }

        if (data.feedbackToApplicant) {
            updateData.feedbackToApplicant = data.feedbackToApplicant
        }

        const [updatedApplication] = await db
            .update(applications)
            .set(updateData)
            .where(eq(applications.id, id))
            .returning()

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
        const data = c.get('validatedData' as never) as BulkApplicationStatusInput
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

        return successResponse(
            c,
            { updatedCount: updated.length, applications: updated },
            `Updated ${updated.length} applications`
        )
    }
)

// GET /api/applications/admin/by-status/:status - Get applications by status
applicationsRouter.get('/admin/by-status/:status', authenticate, requireAdmin, async (c) => {
    const status = c.req.param('status')
    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected']

    if (!validStatuses.includes(status)) {
        throw new Error('Invalid status')
    }

    const result = await db.query.applications.findMany({
        where: eq(applications.status, status),
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
            },
            reviewer: {
                columns: {
                    id: true,
                    phoneNumber: true,
                    fullName: true
                }
            }
        },
        orderBy: desc(applications.appliedAt)
    })

    return successResponse(c, result)
})

// GET /api/applications/admin/by-vacancy/:vacancyId - Get all applications for a vacancy
applicationsRouter.get('/admin/by-vacancy/:vacancyId', authenticate, requireAdmin, async (c) => {
    const vacancyId = parseInt(c.req.param('vacancyId'))

    const result = await db.query.applications.findMany({
        where: eq(applications.vacancyId, vacancyId),
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
            },
            reviewer: {
                columns: {
                    id: true,
                    phoneNumber: true,
                    fullName: true
                }
            }
        },
        orderBy: [desc(applications.status), desc(applications.appliedAt)]
    })

    return successResponse(c, result)
})

// GET /api/applications/admin/export - Export applications for reporting
applicationsRouter.get('/admin/export', authenticate, requireAdmin, async (c) => {
    const status = c.req.query('status')
    const vacancyId = c.req.query('vacancyId')

    const whereConditions: any[] = []
    if (status) whereConditions.push(eq(applications.status, status))
    if (vacancyId) whereConditions.push(eq(applications.vacancyId, parseInt(vacancyId)))

    const results = await db.query.applications.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
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

    // Helper to escape CSV fields
    const escapeCsv = (field: any): string => {
        if (field === null || field === undefined) return ''
        const stringField = String(field)
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`
        }
        return stringField
    }

    const headers = [
        'VNo',
        'Vacancy description',
        'Applicant Name',
        'ID-Number',
        'Gender',
        'Birth Year',
        'Ethnicity',
        'Tel. Contact',
        'Email',
        'Home County',
        'Home Sub County',
        'Ward',
        'Impairment',
        'Information on Public Service',
        'Personal/Employment Number.',
        'Qualification',
        'Professional/Technical Details',
        'Relevant Courses and Training Details',
        'Membership',
        'Employment history'
    ]

    const csvRows = [headers.join(',')]

    for (const app of results) {
        const profile = app.applicant.applicantProfile
        const vacancy = app.vacancy

        // If no profile (shouldn't happen for valid applicants), skip or fill empty
        if (!profile) continue

        // Format Qualifications
        // Format: LEVEL :: COURSE :: GRADE :: INSTITUTION :: YEAR_START - YEAR_END
        const qualifications = profile.qualifications.map((q: Qualification) =>
            `${q.level} :: ${q.course} :: ${q.grade || 'N/A'} :: ${q.institution} :: ${q.yearStart} - ${q.yearEnd || 'Present'}`
        ).join('\n')

        // Format Professional Details
        // Format: BODY :: REG_NO :: EXPIRY_DATE
        const profDetails = profile.professionalDetails.map((p: ProfessionalDetail) =>
            `${p.registrationBody} :: ${p.registrationNumber} :: ${p.expiryDate ? new Date(p.expiryDate).toISOString().split('T')[0] : 'N/A'}`
        ).join('\n')

        // Format Training Courses
        // Format: INSTITUTION :: COURSE :: GRADE :: YEAR
        const trainings = profile.trainingCourses.map((t: TrainingCourse) =>
            `${t.institution} :: ${t.courseName} :: ${t.grade || 'N/A'} :: ${t.year || 'N/A'}`
        ).join('\n')

        // Format Memberships
        // Format: BODY :: NO :: TYPE :: EXPIRY_DATE
        const memberships = profile.professionalMemberships.map((m: ProfessionalMembership) =>
            `${m.membershipBody} :: ${m.registrationNumber} :: ${m.membershipType} :: ${m.expiryDate ? new Date(m.expiryDate).toISOString().split('T')[0] : 'N/A'}`
        ).join('\n')

        // Format Employment History
        // Format: START - END :: POSITION :: JOB_GROUP :: ORG
        const employment = profile.employmentHistory.map((e: EmploymentHistory) =>
            `${e.startDate ? new Date(e.startDate).toISOString().split('T')[0] : 'N/A'} - ${e.endDate ? new Date(e.endDate).toISOString().split('T')[0] : 'Present'} :: ${e.jobTitle} :: ${e.jobGroup || 'N/A'} :: ${e.organization}`
        ).join('\n')

        const row = [
            vacancy.advertisementNumber,     // VNo
            vacancy.title,                   // Vacancy description
            profile.applicantName,           // Applicant Name
            profile.idNumber,                // ID-Number
            profile.gender,                  // Gender
            profile.birthYear,               // Birth Year
            profile.ethnicity,               // Ethnicity
            profile.phone,                   // Tel. Contact
            profile.email,                   // Email
            profile.homeCounty,              // Home County
            profile.homeSubCounty,           // Home Sub County
            profile.ward,                    // Ward
            profile.impairment ? `YES: ${profile.impairmentDetails || ''}` : 'NO',     // Impairment
            profile.publicServiceInfo,       // Information on Public Service
            profile.personalNumber,          // Personal/Employment Number.
            qualifications,                  // Qualification
            profDetails,                     // Professional/Technical Details
            trainings,                       // Relevant Courses and Training Details
            memberships,                     // Membership
            employment                       // Employment history
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
