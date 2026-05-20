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

// --- Qualification Levels and Grading Constants ---

export const KNQF_LEVELS = [
    'Level 10 (Doctorate / PhD)',
    'Level 9 (Master\'s Degree)',
    'Level 8 (Postgrad Diploma / Professional Bachelor\'s)',
    'Level 7 (Bachelor\'s Degree / Professional Diploma)',
    'Level 6 (National Diploma / NSC V / HND)',
    'Level 5 (Craft Certificate / NSC IV)',
    'Level 4 (Artisan Certificate / NSC III / GTT I)',
    'Level 3 (Senior Secondary / KCSE / NSC II / GTT II)',
    'Level 2 (Junior Secondary / NSC I / GTT III)',
    'Level 1 (Primary Certificate / Basic Skills)',
] as const

export type KNQFLevel = typeof KNQF_LEVELS[number]

/**
 * Maps legacy qualification levels to their KNQF equivalents.
 * Ensures backward compatibility with existing data.
 */
export const LEGACY_LEVEL_MAP: Record<string, KNQFLevel> = {
    'DOCTORATE': 'Level 10 (Doctorate / PhD)',
    'MASTERS': 'Level 9 (Master\'s Degree)',
    'BACHELORS': 'Level 7 (Bachelor\'s Degree / Professional Diploma)',
    'DIPLOMA': 'Level 6 (National Diploma / NSC V / HND)',
    'CERTIFICATE': 'Level 5 (Craft Certificate / NSC IV)',
    'KCSE': 'Level 3 (Senior Secondary / KCSE / NSC II / GTT II)',
    'KCPE': 'Level 1 (Primary Certificate / Basic Skills)',
}

export const KNQF_LEVEL_NAME_MAP: Record<string, string> = {
    // KNQF Levels
    'KNQF_LEVEL_10': 'Level 10 (Doctorate / PhD)',
    'KNQF_LEVEL_9': 'Level 9 (Master\'s Degree)',
    'KNQF_LEVEL_8': 'Level 8 (Postgrad Diploma / Professional Bachelor\'s)',
    'KNQF_LEVEL_7': 'Level 7 (Bachelor\'s Degree / Professional Diploma)',
    'KNQF_LEVEL_6': 'Level 6 (National Diploma / NSC V / HND)',
    'KNQF_LEVEL_5': 'Level 5 (Craft Certificate / NSC IV)',
    'KNQF_LEVEL_4': 'Level 4 (Artisan Certificate / NSC III / GTT I)',
    'KNQF_LEVEL_3': 'Level 3 (Senior Secondary / KCSE / NSC II / GTT II)',
    'KNQF_LEVEL_2': 'Level 2 (Junior Secondary / NSC I / GTT III)',
    'KNQF_LEVEL_1': 'Level 1 (Primary Certificate / Basic Skills)',
    // Legacy levels
    'DOCTORATE': 'Level 10 (Doctorate / PhD)',
    'MASTERS': 'Level 9 (Master\'s Degree)',
    'POSTGRAD_DIPLOMA': 'Level 8 (Postgrad Diploma / Professional Bachelor\'s)',
    'BACHELORS': 'Level 7 (Bachelor\'s Degree / Professional Diploma)',
    'HIGHER_DIPLOMA': 'Level 6 (National Diploma / NSC V / HND)',
    'DIPLOMA': 'Level 6 (National Diploma / NSC V / HND)',
    'CERTIFICATE': 'Level 5 (Craft Certificate / NSC IV)',
    'KCSE': 'Level 3 (Senior Secondary / KCSE / NSC II / GTT II)',
    'KCPE': 'Level 1 (Primary Certificate / Basic Skills)',
}

export function formatKNQFLevel(level: string): string {
    return KNQF_LEVEL_NAME_MAP[level] || level;
}


export const KCSE_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'] as const
export const TVET_GRADES = ['Distinction', 'Credit', 'Pass', 'Fail', 'Refer'] as const
export const UNIVERSITY_GRADES = [
    'First Class Honours',
    'Second Class Honours (Upper Division)',
    'Second Class Honours (Lower Division)',
    'Pass',
    'Fail'
] as const

/**
 * Validates a grade against a qualification level based on the Kenyan grading system.
 */
export const validateGradeForLevel = (level: string, grade: string | undefined | null) => {
    if (!grade || grade === 'N/A') return true;

    // Normalize level
    const normalizedLevel = LEGACY_LEVEL_MAP[level] || level;

    // Level 1 to 4 grades should include A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, E
    if (
        level === 'KNQF_LEVEL_1' ||
        level === 'KNQF_LEVEL_2' ||
        level === 'KNQF_LEVEL_3' ||
        level === 'KNQF_LEVEL_4' ||
        normalizedLevel.includes('Level 1') ||
        normalizedLevel.includes('Level 2') ||
        normalizedLevel.includes('Level 3') ||
        normalizedLevel.includes('Level 4')
    ) {
        return ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'].includes(grade);
    }

    // Level 3 / KCSE
    if (normalizedLevel.includes('Level 3') || level === 'KCSE') {
        return KCSE_GRADES.includes(grade as any);
    }

    // Level 4-6 / TVET (Artisan, Craft, Diploma)
    if (normalizedLevel.match(/Level [456]/) || ['DIPLOMA', 'CERTIFICATE'].includes(level)) {
        return TVET_GRADES.includes(grade as any) || /^[1-7]$/.test(grade);
    }

    // Level 7-10 / University (Bachelors, PGD, Masters, PhD)
    if (normalizedLevel.match(/Level (7|8|9|10)/) || ['BACHELORS', 'MASTERS', 'DOCTORATE'].includes(level)) {
        return UNIVERSITY_GRADES.includes(grade as any) || ['Pass', 'Fail'].includes(grade);
    }

    return true; // Default for other levels or if no match
}

// Applicant Profile Schema
export const applicantProfileSchema = z.object({

    fullName: z.string().min(2, 'Name must be at least 2 characters').max(200),
    idNumber: z.string().min(1, 'ID number is required'), // Free text - no strict format
    gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Gender is required' }),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format'),
    ethnicityId: z.coerce.number({ required_error: 'Please select your ethnicity', invalid_type_error: 'Please select a valid ethnicity' }).min(1, 'Please select a valid ethnicity'),
    phoneNumber: z.string().min(1, 'Phone number is required'), // Free text - supports international
    email: z.string().email('Invalid email address'),
    homeCountyId: z.coerce.number({ required_error: 'Please select your home county', invalid_type_error: 'Please select a valid home county' }).min(1, 'Please select a valid home county'),
    homeSubCountyId: z.coerce.number({ required_error: 'Please select your sub-county', invalid_type_error: 'Please select a valid sub-county' }).min(1, 'Please select a valid sub-county'),
    wardId: z.coerce.number({ required_error: 'Please select your ward', invalid_type_error: 'Please select a valid ward' }).min(1, 'Please select a valid ward'),
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
}).superRefine((data, ctx) => {
    // Year validation
    if (data.yearStart && data.yearEnd && !data.stillStudying) {
        if (data.yearEnd < data.yearStart) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'End year must be after or equal to start year',
                path: ['yearEnd']
            })
        }
    }

    // Grade validation
    if (data.level && data.grade && !validateGradeForLevel(data.level, data.grade)) {
        const normalizedLevel = LEGACY_LEVEL_MAP[data.level] || data.level
        let expected = ''
        if (normalizedLevel.includes('Level 3') || data.level === 'KCSE') {
            expected = `one of: ${KCSE_GRADES.join(', ')}`
        } else if (normalizedLevel.match(/Level [456]/) || ['DIPLOMA', 'CERTIFICATE'].includes(data.level)) {
            expected = `one of: ${TVET_GRADES.join(', ')} or 1-7`
        } else if (normalizedLevel.match(/Level (7|8|9|10)/) || ['BACHELORS', 'MASTERS', 'DOCTORATE'].includes(data.level)) {
            expected = `one of: ${UNIVERSITY_GRADES.join(', ')}`
        }

        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid grade for ${data.level}. Expected ${expected}`,
            path: ['grade']
        })
    }
})

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
}).superRefine((data, ctx) => {
    // Year validation
    if (data.yearStart && data.yearEnd && !data.stillStudying) {
        if (data.yearEnd < data.yearStart) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'End year must be after or equal to start year',
                path: ['yearEnd']
            })
        }
    }

    // Grade validation (only if both are provided in the update, or we'd need current record)
    if (data.level && data.grade && !validateGradeForLevel(data.level, data.grade)) {
        const normalizedLevel = LEGACY_LEVEL_MAP[data.level] || data.level
        let expected = ''
        if (normalizedLevel.includes('Level 3') || data.level === 'KCSE') {
            expected = `one of: ${KCSE_GRADES.join(', ')}`
        } else if (normalizedLevel.match(/Level [456]/) || ['DIPLOMA', 'CERTIFICATE'].includes(data.level)) {
            expected = `one of: ${TVET_GRADES.join(', ')} or 1-7`
        } else if (normalizedLevel.match(/Level (7|8|9|10)/) || ['BACHELORS', 'MASTERS', 'DOCTORATE'].includes(data.level)) {
            expected = `one of: ${UNIVERSITY_GRADES.join(', ')}`
        }

        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid grade for ${data.level}. Expected ${expected}`,
            path: ['grade']
        })
    }
})

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

// Profile Filter Schema
export const profileFiltersSchema = z.object({
    searchTerm: z.string().optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    impairment: z.string().optional(), // "true" or "false" as string from query params
    ethnicityId: z.string().optional(),
    homeCountyId: z.string().optional(),
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('50'),
    sortBy: z.enum(['fullName', 'createdAt', 'idNumber']).optional().default('fullName'),
    order: z.enum(['asc', 'desc']).optional().default('asc')
})

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
export type ProfileFiltersInput = z.infer<typeof profileFiltersSchema>
