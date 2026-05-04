import { z } from 'zod'

// Applicant Profile Schema
export const applicantProfileSchema = z.object({

    applicantName: z.string().min(2, 'Name must be at least 2 characters').max(200),
    idNumber: z.string().min(1, 'ID number is required'), // Free text - no strict format
    gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Gender is required' }),
    birthYear: z.number()
        .min(1940, 'Birth year cannot be before 1940')
        .max(new Date().getFullYear() - 18, 'Must be at least 18 years old'),
    ethnicityId: z.coerce.number().optional(),
    phone: z.string().min(1, 'Phone number is required'), // Free text - supports international
    email: z.string().email('Invalid email address'),
    homeCountyId: z.coerce.number().optional(),
    homeSubCountyId: z.coerce.number().optional(),
    wardId: z.coerce.number().optional(),
    impairment: z.boolean().default(false),
    impairmentDetails: z.string().optional(),
    publicServiceInfo: z.string().optional(),
    personalNumber: z.string().optional()
})

export const updateApplicantProfileSchema = applicantProfileSchema.partial()

// Qualification Schema
export const qualificationSchema = z.object({
    level: z.enum(['DOCTORATE', 'MASTERS', 'BACHELORS', 'DIPLOMA', 'CERTIFICATE', 'KCSE', 'KCPE', 'OTHER'], {
        required_error: 'Qualification level is required'
    }),
    course: z.string().min(2, 'Course name must be at least 2 characters'),
    courseId: z.coerce.number().optional(),
    grade: z.string().optional(),
    institution: z.string().min(1, 'Institution is required'),
    institutionId: z.coerce.number().optional(),
    yearStart: z.number()
        .min(1950, 'Year must be after 1950')
        .max(new Date().getFullYear())
        .optional(),
    yearEnd: z.number()
        .min(1950, 'Year must be after 1950')
        .max(new Date().getFullYear() + 10) // Allow future end dates for ongoing studies
        .optional()
}).refine(
    (data) => {
        if (data.yearStart && data.yearEnd) {
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
    level: z.enum(['DOCTORATE', 'MASTERS', 'BACHELORS', 'DIPLOMA', 'CERTIFICATE', 'KCSE', 'KCPE', 'OTHER']).optional(),
    course: z.string().min(2, 'Course name must be at least 2 characters').optional(),
    courseId: z.coerce.number().optional(),
    grade: z.string().optional(),
    institution: z.string().min(1, 'Institution is required').optional(),
    institutionId: z.coerce.number().optional(),
    yearStart: z.number()
        .min(1950, 'Year must be after 1950')
        .max(new Date().getFullYear())
        .optional(),
    yearEnd: z.number()
        .min(1950, 'Year must be after 1950')
        .max(new Date().getFullYear() + 10)
        .optional()
}).refine(
    (data) => {
        if (data.yearStart && data.yearEnd) {
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
    registrationBody: z.string().min(2, 'Registration body is required'),
    registrationBodyId: z.coerce.number().optional(),
    registrationNumber: z.string().min(1, 'Registration number is required'),
    expiryDate: z.string().optional() // ISO date string
})

export const updateProfessionalDetailSchema = professionalDetailSchema.partial()

// Training Course Schema
export const trainingCourseSchema = z.object({
    courseName: z.string().min(2, 'Course name is required'),
    courseId: z.coerce.number().optional(),
    description: z.string().optional(),
    grade: z.string().optional(),
    institution: z.string().optional(),
    institutionId: z.coerce.number().optional(),
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
    membershipBodyId: z.coerce.number().optional(),
    membershipType: z.string().min(1, 'Membership type is required'),
    registrationNumber: z.string().optional(),
    expiryDate: z.string().optional() // ISO date string
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
    jobTitleId: z.coerce.number().optional(),
    jobGroup: z.string().optional(),
    jobGroupId: z.coerce.number().optional(),
    organization: z.string().min(2, 'Organization is required'),
    organizationId: z.coerce.number().optional(),
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
    jobTitleId: z.coerce.number().optional(),
    jobGroup: z.string().optional(),
    jobGroupId: z.coerce.number().optional(),
    organization: z.string().min(2, 'Organization is required').optional(),
    organizationId: z.coerce.number().optional(),
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
