// Export tables
export * from './users'
export * from './vacancies'
export * from './applications'
export * from './departments'
export * from './job-groups'
export * from './vacancy-documents'
export * from './applicant-profiles'
export * from './password-reset-sessions'
export * from './qualifications'
export * from './professional-details'
export * from './training-courses'
export * from './professional-memberships'
export * from './employment-history'
export * from './locations'
export * from './reference-data'

// Import tables and relations for schema object
import { users, revokedTokens } from './users'
import { vacancies } from './vacancies'
import { applications } from './applications'
import { departments } from './departments'
import { jobGroups } from './job-groups'
import { vacancyDocuments } from './vacancy-documents'
import { applicantProfiles } from './applicant-profiles'
import { passwordResetSessions } from './password-reset-sessions'
import { qualifications } from './qualifications'
import { professionalDetails } from './professional-details'
import { trainingCourses } from './training-courses'
import { professionalMemberships } from './professional-memberships'
import { employmentHistory } from './employment-history'
import { counties, constituencies, wards } from './locations'
import {
    ethnicities,
    institutions,
    courses,
    professionalBodies,
    educationLevels,
    educationGrades
} from './reference-data'

export * from './relations'

import {
    usersRelations,
    vacanciesRelations,
    applicationsRelations,
    departmentsRelations,
    jobGroupsRelations,
    vacancyDocumentsRelations,
    applicantProfilesRelations,
    passwordResetSessionsRelations,
    qualificationsRelations,
    employmentHistoryRelations,
    professionalDetailsRelations,
    trainingCoursesRelations,
    professionalMembershipsRelations
} from './relations'

// Export schema object with relations for query API
export const schema = {
    users,
    revokedTokens,
    vacancies,
    applications,
    departments,
    jobGroups,
    vacancyDocuments,
    applicantProfiles,
    passwordResetSessions,
    qualifications,
    professionalDetails,
    trainingCourses,
    professionalMemberships,
    employmentHistory,
    counties,
    constituencies,
    wards,
    ethnicities,
    institutions,
    courses,
    professionalBodies,
    educationLevels,
    educationGrades,
    // Relations
    usersRelations,
    vacanciesRelations,
    applicationsRelations,
    departmentsRelations,
    jobGroupsRelations,
    vacancyDocumentsRelations,
    applicantProfilesRelations,
    passwordResetSessionsRelations,
    qualificationsRelations,
    employmentHistoryRelations,
    professionalDetailsRelations,
    trainingCoursesRelations,
    professionalMembershipsRelations
}
