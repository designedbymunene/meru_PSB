import { z } from 'zod'

/**
 * Helper to handle optional/nullable foreign key IDs.
 * Converts 0, "0", empty strings, and null to null.
 * This prevents foreign key violations in the database when "None" or "Select..." is chosen in the UI.
 */
const coerceNullableId = z.preprocess(
    (val) => (val === '' || val === 0 || val === '0' || val === null) ? null : val,
    z.coerce.number().nullable().optional()
)

// Applicant Profile Schema
export const applicantProfileSchema = z.object({

    fullName: z.string().min(2, 'Name must be at least 2 characters').max(200),
    idNumber: z.string().min(1, 'ID number is required'), // Free text - no strict format
    gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Gender is required' }),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format'),
    ethnicityId: coerceNullableId,
    phoneNumber: z.string().min(1, 'Phone number is required'), // Free text - supports international
    email: z.string().email('Invalid email address'),
    homeCountyId: coerceNullableId,
    homeSubCountyId: coerceNullableId,
    wardId: coerceNullableId,
    impairment: z.boolean().default(false),
    impairmentDetails: z.string().optional(),
    publicServiceInfo: z.string().optional(),
    personalNumber: z.string().optional(),
    
    // N/A Flags
    hasNoExperience: z.boolean().default(false),
    hasNoCertificates: z.boolean().default(false),
    hasNoMemberships: z.boolean().default(false),
    hasNoTrainings: z.boolean().default(false),
    hasNoReferees: z.boolean().default(false)
})

export const updateApplicantProfileSchema = applicantProfileSchema.partial()

// Qualification Schema
export const qualificationSchema = z.object({
    level: z.string().min(1, 'Qualification level is required'),
    course: z.string().min(2, 'Course name must be at least 2 characters'),
    courseId: coerceNullableId,
    grade: z.string().optional(),
    institution: z.string().min(1, 'Institution is required'),
    institutionId: coerceNullableId,
    yearStart: z.number()
        .min(1950, 'Year must be after 1950')
        .max(new Date().getFullYear())
        .optional(),
    yearEnd: z.number()
        .min(1950, 'Year must be after 1950')
        .max(new Date().getFullYear() + 10) // Allow future end dates for ongoing studies
        .optional()
        .nullable(),
    stillStudying: z.boolean().optional().default(false)
}).refine(
    (data) => {
        if (data.yearStart && data.yearEnd && !data.stillStudying) {
            return data.yearEnd >= data.yearStart
        }
        return true
    },
    {
        message: 'End year must be after or equal to start year',
        path: ['yearEnd']
    }
)

// Update schema - defined separately to avoid .partial() on refined schema
export const updateQualificationSchema = z.object({
    level: z.string().min(1, 'Qualification level is required').optional(),
    course: z.string().min(2, 'Course name must be at least 2 characters').optional(),
    courseId: coerceNullableId,
    grade: z.string().optional(),
    institution: z.string().min(1, 'Institution is required').optional(),
    institutionId: coerceNullableId,
    yearStart: z.number()
        .min(1950, 'Year must be after 1950')
        .max(new Date().getFullYear())
        .optional(),
    yearEnd: z.number()
        .min(1950, 'Year must be after 1950')
        .max(new Date().getFullYear() + 10)
        .optional()
        .nullable(),
    stillStudying: z.boolean().optional()
}).refine(
    (data) => {
        if (data.yearStart && data.yearEnd && !data.stillStudying) {
            return data.yearEnd >= data.yearStart
        }
        return true
    },
    {
        message: 'End year must be after or equal to start year',
        path: ['yearEnd']
    }
)

// Professional Detail Schema
export const professionalDetailSchema = z.object({
    licenseType: z.string().min(1, 'License type is required'),
    issuingBody: z.string().min(1, 'Issuing body is required'),
    issuingBodyId: coerceNullableId,
    registrationNumber: z.string().min(1, 'Registration number is required'),
    issueDate: z.string().min(1, 'Issue date is required'),
    expiryDate: z.union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expiry date must be in YYYY-MM-DD format'),
        z.literal(''),
        z.null(),
        z.undefined()
    ]).optional().transform(e => e === '' ? null : e)
})

export const updateProfessionalDetailSchema = professionalDetailSchema.partial()

// Training Course Schema
export const trainingCourseSchema = z.object({
    courseName: z.string().min(2, 'Course name is required'),
    courseId: coerceNullableId,
    description: z.string().optional(),
    grade: z.string().optional(),
    institution: z.string().optional(),
    institutionId: coerceNullableId,
    year: z.number()
        .min(1950, 'Year must be after 1950')
        .max(new Date().getFullYear())
        .optional(),
    certificatePath: z.string().optional()
})

export const updateTrainingCourseSchema = trainingCourseSchema.partial()

// Professional Membership Schema
export const professionalMembershipSchema = z.object({
    membershipBody: z.string().min(2, 'Membership body is required'),
    membershipBodyId: coerceNullableId,
    membershipType: z.string().min(1, 'Membership type is required'),
    registrationNumber: z.string().optional(),
    expiryDate: z.union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expiry date must be in YYYY-MM-DD format'),
        z.literal(''),
        z.null(),
        z.undefined()
    ]).optional().transform(e => e === '' ? null : e)
})

export const updateProfessionalMembershipSchema = professionalMembershipSchema.partial()

// Employment History Schema
export const employmentHistorySchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    endDate: z.union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
        z.literal(''),
        z.null(),
        z.undefined()
    ]).optional().transform(e => e === '' ? null : e),
    jobTitle: z.string().min(2, 'Job title is required'),
    jobTitleId: coerceNullableId,
    jobGroup: z.string().optional(),
    jobGroupId: coerceNullableId,
    organization: z.string().min(2, 'Organization is required'),
    organizationId: coerceNullableId,
    responsibilities: z.string().optional()
}).refine(
    (data) => {
        if (data.startDate && data.endDate) {
            return new Date(data.endDate) >= new Date(data.startDate)
        }
        return true
    },
    {
        message: 'End date must be after or equal to start date',
        path: ['endDate']
    }
)

// Update schema - defined separately to avoid .partial() on refined schema
export const updateEmploymentHistorySchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format').optional(),
    endDate: z.union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
        z.literal(''),
        z.null(),
        z.undefined()
    ]).optional().transform(e => e === '' ? null : e),
    jobTitle: z.string().min(2, 'Job title is required').optional(),
    jobTitleId: coerceNullableId,
    jobGroup: z.string().optional(),
    jobGroupId: coerceNullableId,
    organization: z.string().min(2, 'Organization is required').optional(),
    organizationId: coerceNullableId,
    responsibilities: z.string().optional()
}).refine(
    (data) => {
        if (data.startDate && data.endDate) {
            return new Date(data.endDate) >= new Date(data.startDate)
        }
        return true
    },
    {
        message: 'End date must be after or equal to start date',
        path: ['endDate']
    }
)

// Referee Schema
export const refereeSchema = z.object({
    fullName: z.string().min(2, 'Full name is required'),
    organization: z.string().min(2, 'Organization is required'),
    designation: z.string().min(2, 'Designation is required'),
    phone: z.string().min(1, 'Phone number is required'),
    email: z.string().email('Invalid email address'),
    address: z.string().optional(),
    relationship: z.string().optional()
})

export const updateRefereeSchema = refereeSchema.partial()

export type ApplicantProfileInput = z.infer<typeof applicantProfileSchema>
export type UpdateApplicantProfileInput = z.infer<typeof updateApplicantProfileSchema>
export type QualificationInput = z.infer<typeof qualificationSchema>
export type UpdateQualificationInput = z.infer<typeof updateQualificationSchema>
export type ProfessionalDetailInput = z.infer<typeof professionalDetailSchema>
export type UpdateProfessionalDetailInput = z.infer<typeof updateProfessionalDetailSchema>
export type TrainingCourseInput = z.infer<typeof trainingCourseSchema>
export type UpdateTrainingCourseInput = z.infer<typeof updateTrainingCourseSchema>
export type ProfessionalMembershipInput = z.infer<typeof professionalMembershipSchema>
export type UpdateProfessionalMembershipInput = z.infer<typeof updateProfessionalMembershipSchema>
export type EmploymentHistoryInput = z.infer<typeof employmentHistorySchema>
export type UpdateEmploymentHistoryInput = z.infer<typeof updateEmploymentHistorySchema>
export type RefereeInput = z.infer<typeof refereeSchema>
export type UpdateRefereeInput = z.infer<typeof updateRefereeSchema>
