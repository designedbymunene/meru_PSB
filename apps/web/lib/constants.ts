export const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export const VACANCY_STATUS = {
    OPEN: 'open',
    CLOSED: 'closed',
} as const

export const APPLICATION_STATUS = {
    PENDING: 'pending',
    REVIEWED: 'reviewed',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
} as const

export const APPLICATION_STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
} as const

export const AVAILABILITY_OPTIONS = [
    { value: 'immediate', label: 'Immediate' },
    { value: '1_week', label: '1 Week' },
    { value: '2_weeks', label: '2 Weeks' },
    { value: '1_month', label: '1 Month' },
    { value: '2_months', label: '2 Months' },
] as const

export const USER_ROLES = {
    APPLICANT: 'applicant',
    ADMIN: 'admin',
} as const

export const QUERY_KEYS = {
    // Auth
    USER: ['user'],

    // Vacancies
    VACANCIES: ['vacancies'],
    VACANCY: (id: number) => ['vacancy', id],
    VACANCY_PDFS: (id: number) => ['vacancy', id, 'pdfs'],

    // Applications
    APPLICATIONS: ['applications'],
    MY_APPLICATIONS: ['applications', 'mine'],
    APPLICATION: (id: number) => ['application', id],

    // Reference data

    DEPARTMENTS: ['departments'],
    DEPARTMENT: (id: number) => ['department', id],
    JOB_GROUPS: ['job-groups'],
    JOB_GROUP: (id: number) => ['job-group', id],

    // Applicant Profiles
    APPLICANT_PROFILES: ['applicant-profiles'],
    MY_PROFILE: ['applicant-profile', 'me'],
    APPLICANT_PROFILE: (id: number) => ['applicant-profile', id],
    QUALIFICATIONS: (profileId: number) => ['qualifications', profileId],
    PROFESSIONAL_DETAILS: (profileId: number) => ['professional-details', profileId],
    TRAINING_COURSES: (profileId: number) => ['training-courses', profileId],
    PROFESSIONAL_MEMBERSHIPS: (profileId: number) => ['professional-memberships', profileId],
    EMPLOYMENT_HISTORY: (profileId: number) => ['employment-history', profileId],
} as const
