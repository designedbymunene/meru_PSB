import { z } from 'zod'

// --- SCHEMAS ---
export * from './schemas/auth'
export * from './schemas/vacancies'
export * from './schemas/applications'
export * from './schemas/applicant-profile'
export * from './utils/profile-completion'

import type { RegisterInput, LoginInput, ForgotPasswordRequestInput, RefreshTokenInput, ResetPasswordInput } from './schemas/auth'
import type {
    CreateDepartmentInput,
    UpdateDepartmentInput,
    CreateJobGroupInput,
    UpdateJobGroupInput,
    CreateVacancyInput,
    UpdateVacancyInput
} from './schemas/vacancies'
import type { CreateVenueInput, UpdateVenueInput } from './schemas/venues'
import type { CreateVenueTagInput, UpdateVenueTagInput } from './schemas/venue-tags'
import type {
    CreateApplicationInput,
    UpdateApplicationStatusInput,
    ApplicationFiltersInput,
    BulkApplicationStatusInput,
    ApplicationReviewInput
} from './schemas/applications'
import type {
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
    UpdateEmploymentHistoryInput,
    ProfileFiltersInput
} from './schemas/applicant-profile'

export * from './schemas/venues'
export * from './schemas/venue-tags'
export * from './schemas/downloads'

export type {
    RegisterInput, LoginInput, ForgotPasswordRequestInput, RefreshTokenInput, ResetPasswordInput,
    CreateDepartmentInput, UpdateDepartmentInput, CreateJobGroupInput, UpdateJobGroupInput, CreateVacancyInput, UpdateVacancyInput,
    CreateVenueInput, UpdateVenueInput,
    CreateVenueTagInput, UpdateVenueTagInput,
    CreateApplicationInput, UpdateApplicationStatusInput, ApplicationFiltersInput, BulkApplicationStatusInput, ApplicationReviewInput,
    ApplicantProfileInput, UpdateApplicantProfileInput, QualificationInput, UpdateQualificationInput, ProfessionalDetailInput, UpdateProfessionalDetailInput, TrainingCourseInput, UpdateTrainingCourseInput, ProfessionalMembershipInput, UpdateProfessionalMembershipInput, EmploymentHistoryInput, UpdateEmploymentHistoryInput,
    ProfileFiltersInput
}

// --- COMPATIBILITY ALIASES ---
export type LoginCredentials = LoginInput
export type RegisterData = RegisterInput
export type BulkStatusUpdateData = BulkApplicationStatusInput
export type ReviewApplicationData = ApplicationReviewInput

export type CreateProfileInput = ApplicantProfileInput
export type CreateQualificationInput = QualificationInput
export type CreateProfessionalDetailInput = ProfessionalDetailInput
export type CreateTrainingCourseInput = TrainingCourseInput
export type CreateProfessionalMembershipInput = ProfessionalMembershipInput
export type CreateEmploymentHistoryInput = EmploymentHistoryInput

export type CreateApplicationData = CreateApplicationInput
export type ApplicationFilters = ApplicationFiltersInput
export type CreateDepartmentData = CreateDepartmentInput
export type CreateJobGroupData = CreateJobGroupInput
export type CreateVacancyData = CreateVacancyInput
export type UpdateVacancyData = UpdateVacancyInput

export type LoginSchemaType = z.infer<typeof import('./schemas/auth').loginSchema>
export type RegisterSchemaType = z.infer<typeof import('./schemas/auth').registerSchema>
export type ResetPasswordSchemaType = z.infer<typeof import('./schemas/auth').resetPasswordSchema>

export type CreateDepartmentSchemaType = z.infer<typeof import('./schemas/vacancies').createDepartmentSchema>
export type CreateJobGroupSchemaType = z.infer<typeof import('./schemas/vacancies').createJobGroupSchema>
export type CreateVenueSchemaType = z.infer<typeof import('./schemas/venues').createVenueSchema>
export type CreateVacancySchemaType = z.infer<typeof import('./schemas/vacancies').createVacancySchema>
export type UpdateVacancySchemaType = z.infer<typeof import('./schemas/vacancies').updateVacancySchema>

export type CreateApplicationSchemaType = z.infer<typeof import('./schemas/applications').createApplicationSchema>
export type ReviewApplicationSchemaType = z.infer<typeof import('./schemas/applications').applicationReviewSchema>

export type CreateProfileSchemaType = z.infer<typeof import('./schemas/applicant-profile').applicantProfileSchema>
export type CreateQualificationSchemaType = z.infer<typeof import('./schemas/applicant-profile').qualificationSchema>
export type CreateProfessionalDetailSchemaType = z.infer<typeof import('./schemas/applicant-profile').professionalDetailSchema>
export type CreateTrainingCourseSchemaType = z.infer<typeof import('./schemas/applicant-profile').trainingCourseSchema>
export type CreateProfessionalMembershipSchemaType = z.infer<typeof import('./schemas/applicant-profile').professionalMembershipSchema>
export type CreateEmploymentHistorySchemaType = z.infer<typeof import('./schemas/applicant-profile').employmentHistorySchema>

// Aliases for compatibility
export { applicantProfileSchema as createProfileSchema } from './schemas/applicant-profile'
export { qualificationSchema as createQualificationSchema } from './schemas/applicant-profile'
export { professionalDetailSchema as createProfessionalDetailSchema } from './schemas/applicant-profile'
export { trainingCourseSchema as createTrainingCourseSchema } from './schemas/applicant-profile'
export { professionalMembershipSchema as createProfessionalMembershipSchema } from './schemas/applicant-profile'
export { employmentHistorySchema as createEmploymentHistorySchema } from './schemas/applicant-profile'
export { applicationReviewSchema as reviewApplicationSchema } from './schemas/applications'

// --- INTERFACES ---

export { AxiosError, isAxiosError } from 'axios'
export type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

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

export interface Department {
    id: number
    name: string
    description: string | null
    status: 'active' | 'inactive'
    createdAt: string
    updatedAt: string
}

export interface Venue {
    id: number
    name: string
    location: string | null
    tagIds: number[]
    createdAt: string
    updatedAt: string
}

export interface VenueTag {
    id: number
    name: string
    color: string
    createdAt: string
    updatedAt: string
}

export interface VenueWithRelations extends Venue {
    tags?: VenueTag[]
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
    applicationsCount?: number
}

export interface Application {
    id: number
    vacancyId: number
    applicantId: number
    status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewing' | 'interviewed' | 'accepted' | 'rejected'
    appliedAt: string
    reviewedAt: string | null
    reviewedBy: number | null
    notes: string | null
    rejectionReason: string | null
    feedbackToApplicant: string | null
    rating: number | null
    profileSnapshot: any | null
    applicantProfileSnapshot?: any | null
    createdAt: string
    updatedAt: string
}

export interface AuditLog {
    id: number
    adminId: number
    action: string
    targetType: string
    targetId: number
    previousState: any | null
    newState: any | null
    ipAddress: string | null
    userAgent: string | null
    createdAt: string
    updatedAt: string
}

export interface AuditLogWithRelations extends AuditLog {
    admin?: {
        fullName: string
    }
}

export interface ApplicationWithRelations extends Application {
    vacancy?: Vacancy & {
        department?: Department | null
        jobGroup?: JobGroup
    }
    applicant?: User & {
        applicantProfile?: ApplicantProfile & {
            homeCounty?: { name: string } | null
        } | null
    }
    reviewer?: User | null
    auditLogs?: AuditLogWithRelations[]
    interviews?: Interview[]
}

export interface Qualification {
    id: number
    applicantProfileId: number
    level: string
    course: string
    courseId: number | null
    grade: string | null
    institution: string
    institutionId: number | null
    yearStart: number | null
    yearEnd: number | null
    stillStudying: boolean
    createdAt: string
    updatedAt: string
}

export interface ProfessionalDetail {
    id: number
    applicantProfileId: number
    licenseType: string
    issuingBody: string
    issuingBodyId: number | null
    registrationNumber: string
    issueDate: string
    expiryDate: string | null
    createdAt: string
    updatedAt: string
}

export interface TrainingCourse {
    id: number
    applicantProfileId: number
    courseName: string
    courseId: number | null
    description: string | null
    grade: string | null
    institution: string | null
    institutionId: number | null
    year: number | null
    certificatePath: string | null
    createdAt: string
    updatedAt: string
}

export interface ProfessionalMembership {
    id: number
    applicantProfileId: number
    membershipBody: string
    membershipBodyId: number | null
    membershipType: string
    registrationNumber: string | null
    expiryDate: string | null
    createdAt: string
    updatedAt: string
}

export interface EmploymentHistory {
    id: number
    applicantProfileId: number
    organization: string
    organizationId: number | null
    jobTitle: string
    jobTitleId: number | null
    jobGroup: string | null
    jobGroupId: number | null
    startDate: string
    endDate: string | null
    responsibilities: string | null
    createdAt: string
    updatedAt: string
}

export interface ApplicantDocument {
    id: number
    userId: number
    documentType: string
    originalName: string
    filename: string
    filePath: string
    fileSize: number
    mimeType: string
    status: string
    rejectionReason?: string | null
    verifiedAt?: string | null
    verifiedBy?: number | null
    createdAt: string
    updatedAt: string
}

export interface Referee {
    id: number
    applicantProfileId: number
    fullName: string
    organization: string
    designation: string
    phone: string
    email: string
    address: string | null
    relationship: string | null
    createdAt: string
    updatedAt: string
}

export interface ApplicantProfile {
    id: number
    applicantId: number
    applicantName: string
    fullName?: string // For compatibility with schema
    idNumber: string
    gender: 'Male' | 'Female' | 'Other'
    birthYear: number
    dateOfBirth?: string // For compatibility with schema
    ethnicity: string | null
    ethnicityId: number | null
    phone: string
    phoneNumber?: string // For compatibility with schema
    email: string
    homeCounty: string | null
    homeCountyId: number | null
    homeSubCounty: string | null
    homeSubCountyId: number | null
    ward: string | null
    wardId: number | null
    impairment: boolean
    impairmentDetails: string | null
    publicServiceInfo: string | null
    personalNumber: string | null
    hasNoExperience: boolean
    hasNoCertificates: boolean
    hasNoMemberships: boolean
    hasNoTrainings: boolean
    hasNoReferees: boolean
    createdAt: string
    updatedAt: string
}

export interface ApplicantProfileWithRelations extends ApplicantProfile {
    qualifications: Qualification[]
    professionalDetails: ProfessionalDetail[]
    trainingCourses: TrainingCourse[]
    professionalMemberships: ProfessionalMembership[]
    employmentHistory: EmploymentHistory[]
    documents: ApplicantDocument[]
    referees: Referee[]
}

export type VacancyFilters = {
    departmentId?: string
    jobGroupId?: string
    search?: string
    status?: 'open' | 'closed'
}

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
    pagination?: {
        total: number
        page: number
        limit: number
        totalPages: number
        hasNext?: boolean
        hasPrev?: boolean
    }
}

// --- SHORTLISTING & INTERVIEW TYPES ---

export interface ShortlistCriteria {
    id: number
    vacancyId: number
    weights: {
        education?: number
        experience?: number
        memberships?: number
        qualifications?: number
        skills?: number
        certifications?: number
        professionalMemberships?: number
    }
    minScore: number
    configuredBy: number
    createdAt: string
    updatedAt: string
}

export interface ShortlistResult {
    vacancyId: number
    processed: number
    shortlisted: number
    fallbackShortlisted?: number
    failed: number
    results: Array<{
        applicationId: number
        applicantName: string
        totalScore: number
        isShortlisted: boolean
        breakdown: Record<string, number>
    }>
}

export interface Interview {
    id: number
    vacancyId: number
    applicationId: number
    scheduledAt: string
    venue: string
    virtualLink?: string
    status: 'scheduled' | 'completed' | 'cancelled'
    panelMembers: number[]
    createdAt: string
    updatedAt: string
}

export interface InterviewWithRelations extends Interview {
    vacancy?: Vacancy
    application?: ApplicationWithRelations
    panelMemberDetails?: User[]
}

export interface InterviewScore {
    id: number
    interviewId: number
    panelMemberId: number
    score: number
    comments: string
    conflictOfInterest: boolean
    declarationNotes?: string
    createdAt: string
    updatedAt: string
}

export interface InterviewResults {
    vacancyId: number
    interviews: Array<{
        interviewId: number
        applicantName: string
        applicationId: number
        scheduledAt: string
        venue: string
        status: string
        averageScore: number
        scoresSubmitted: number
        totalPanelMembers: number
        scores: Array<{
            panelMemberName: string
            score: number
            comments: string
        }>
    }>
}

// --- BOARD GOVERNANCE TYPES ---

export interface BoardResolution {
    id: number
    vacancyId: number
    resolutionText: string
    status: 'approved' | 'rejected' | 'deferred'
    approvedBy: number
    createdAt: string
    updatedAt: string
}

export interface BoardResolutionInput {
    vacancyId: number
    resolutionText: string
}

export interface BoardResolutionWithRelations extends BoardResolution {
    vacancy?: Vacancy & { department?: Department }
    approver?: User
}

// --- REPORTS TYPES ---

export interface ReportFilters {
    vacancyId?: number
    departmentId?: number
    startDate?: string
    endDate?: string
}

export interface FunnelDataPoint {
    name: string
    value: number
    fill: string
}

export interface TimeSeriesDataPoint {
    date: string
    count: number
}

export interface DiversityReport {
    vacancyId?: number
    period: { start: string; end: string }
    gender: { Male: number; Female: number; Other: number; PreferNotToSay: number }
    ethnicity: Record<string, number>
    disability: { hasImpairment: number; noImpairment: number; preferNotToSay: number }
    counties: Record<string, number>
    meruSubCounties?: Record<string, number>
    meruWards?: Record<string, number>
    totalApplicants: number
}

export interface VacancyPerformance {
    id: number
    title: string
    department: string
    applicationsCount: number
    shortlistedCount: number
    interviewedCount: number
    acceptedCount: number
}

export interface KPIReport {
    period: { start: string; end: string }
    timeToShortlist: { avg: number; min: number; max: number }
    timeToInterview: { avg: number; min: number; max: number }
    totalVacancies: number
    totalApplications: number
    averageRating: number
    recruitmentVelocity: {
        stage: string
        avgDays: number
    }[]
}

export interface ConversionTrendPoint {
    date: string
    applicationToShortlist: number
    shortlistToInterview: number
    interviewToAcceptance: number
}

// Input types
export interface CreateShortlistCriteriaInput {
    vacancyId: number
    weights: ShortlistCriteria['weights']
    minScore: number
}

export interface ScheduleInterviewInput {
    vacancyId: number
    applicationId: number
    scheduledAt: string
    venue: string
    virtualLink?: string
    panelMembers?: number[]
}

export interface RescheduleInterviewInput {
    scheduledAt: string
    venue: string
    virtualLink?: string
}

export interface UpdateInterviewStatusInput {
    status: 'scheduled' | 'completed' | 'cancelled'
}

export interface SubmitInterviewScoreInput {
    interviewId: number
    score: number
    comments: string
    conflictOfInterest?: boolean
    declarationNotes?: string
}
