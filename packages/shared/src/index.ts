import { z } from 'zod'

// --- AUTH ---
export * from './schemas/auth'
export type { RegisterInput, LoginInput, ForgotPasswordRequestInput, RefreshTokenInput, ResetPasswordInput } from './schemas/auth'

// Compatibility aliases
export type LoginSchemaType = z.infer<typeof import('./schemas/auth').loginSchema>
export type RegisterSchemaType = z.infer<typeof import('./schemas/auth').registerSchema>
export type ResetPasswordSchemaType = z.infer<typeof import('./schemas/auth').resetPasswordSchema>

export interface User {
    id: number;
    email: string;
    phoneNumber: string;
    fullName: string;
    role: 'applicant' | 'admin';
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    };
    message?: string;
}

// --- DEPARTMENTS & JOB GROUPS ---
export interface Department {
    id: number
    name: string
    description: string | null
    status: 'active' | 'inactive'
    createdAt: string
    updatedAt: string
}

export interface JobGroup {
    id: number
    name: string
    description: string | null
    salaryMin: string
    salaryMax: string
    status: 'active' | 'inactive'
    createdAt: string
    updatedAt: string
}

export type CreateDepartmentSchemaType = z.infer<typeof import('./schemas/vacancies').createDepartmentSchema>
export type CreateJobGroupSchemaType = z.infer<typeof import('./schemas/vacancies').createJobGroupSchema>

// --- VACANCIES ---
export * from './schemas/vacancies'
export type { 
    CreateDepartmentInput, 
    UpdateDepartmentInput, 
    CreateJobGroupInput, 
    UpdateJobGroupInput, 
    CreateVacancyInput, 
    UpdateVacancyInput 
} from './schemas/vacancies'

export interface Vacancy {
    id: number
    advertisementNumber: string | null
    title: string
    description: string
    departmentId: number
    jobGroupId: number
    closingDate: string
    openPositions: number
    jobRequirements: string[]
    jobResponsibilities: string[]
    status: 'open' | 'closed'
    createdBy: number
    createdAt: string
    updatedAt: string
    hasApplied?: boolean
}

export interface VacancyDocument {
    id: number
    vacancyId: number
    filename: string
    originalName: string
    filePath: string
    fileSize: number
    mimeType: string
    uploadedBy: number
    createdAt: string
    updatedAt: string
}

export interface VacancyWithRelations extends Vacancy {
    department?: Department | null
    jobGroup?: JobGroup
    documents?: VacancyDocument[]
}

export type CreateVacancySchemaType = z.infer<typeof import('./schemas/vacancies').createVacancySchema>
export type UpdateVacancySchemaType = z.infer<typeof import('./schemas/vacancies').updateVacancySchema>

// --- APPLICATIONS ---
export * from './schemas/applications'
export type { 
    CreateApplicationInput, 
    UpdateApplicationStatusInput, 
    ApplicationFiltersInput, 
    BulkApplicationStatusInput, 
    ApplicationReviewInput 
} from './schemas/applications'

export interface Application {
    id: number
    vacancyId: number
    applicantId: number
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
    appliedAt: string
    reviewedAt: string | null
    reviewedBy: number | null
    notes: string | null
    rejectionReason: string | null
    feedbackToApplicant: string | null
    rating: number | null
    createdAt: string
    updatedAt: string
}

export interface ApplicationWithRelations extends Application {
    vacancy?: Vacancy
    applicant?: User
}

// For compatibility with code that uses 'reviewApplicationSchema':
export { applicationReviewSchema as reviewApplicationSchema } from './schemas/applications'

export type CreateApplicationSchemaType = z.infer<typeof import('./schemas/applications').createApplicationSchema>
export type ReviewApplicationSchemaType = z.infer<typeof import('./schemas/applications').applicationReviewSchema>

// --- APPLICANT PROFILE ---
export * from './schemas/applicant-profile'
export type { 
    ApplicantProfileInput, 
    UpdateApplicantProfileInput, 
    QualificationInput, 
    UpdateQualificationInput, 
    ProfessionalDetailInput, 
    UpdateProfessionalDetailInput, 
    TrainingCourseInput, 
    UpdateTrainingCourseInput, 
    ProfessionalMembershipInput, 
    UpdateProfessionalMembershipInput, 
    EmploymentHistoryInput, 
    UpdateEmploymentHistoryInput 
} from './schemas/applicant-profile'

export interface ApplicantProfile {
    id: number
    applicantId: number
    applicantName: string
    idNumber: string
    gender: 'Male' | 'Female' | 'Other'
    birthYear: number
    ethnicity: string | null
    phone: string
    email: string
    homeCounty: string | null
    homeSubCounty: string | null
    ward: string | null
    impairment: boolean
    impairmentDetails: string | null
    publicServiceInfo: string | null
    personalNumber: string | null
    createdAt: string
    updatedAt: string
}

// Aliases for compatibility
export { applicantProfileSchema as createProfileSchema } from './schemas/applicant-profile'
export { qualificationSchema as createQualificationSchema } from './schemas/applicant-profile'
export { professionalDetailSchema as createProfessionalDetailSchema } from './schemas/applicant-profile'
export { trainingCourseSchema as createTrainingCourseSchema } from './schemas/applicant-profile'
export { professionalMembershipSchema as createProfessionalMembershipSchema } from './schemas/applicant-profile'
export { employmentHistorySchema as createEmploymentHistorySchema } from './schemas/applicant-profile'

export type CreateProfileSchemaType = z.infer<typeof import('./schemas/applicant-profile').applicantProfileSchema>
export type CreateQualificationSchemaType = z.infer<typeof import('./schemas/applicant-profile').qualificationSchema>
export type CreateProfessionalDetailSchemaType = z.infer<typeof import('./schemas/applicant-profile').professionalDetailSchema>
export type CreateTrainingCourseSchemaType = z.infer<typeof import('./schemas/applicant-profile').trainingCourseSchema>
export type CreateProfessionalMembershipSchemaType = z.infer<typeof import('./schemas/applicant-profile').professionalMembershipSchema>
export type CreateEmploymentHistorySchemaType = z.infer<typeof import('./schemas/applicant-profile').employmentHistorySchema>

// --- API CLIENT ---
export * from './api/client-factory'
export * from './api/retry-policy'

// --- API RESPONSES ---
export interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
    error?: {
        code: string
        message: string
        details?: any
    }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    meta: {
        total: number
        limit: number
        offset: number
    }
}
