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
export * from './referees'
export * from './locations'
export * from './reference-data'
export * from './audit-logs'
export * from './active-sessions'
export * from './applicant-documents'


// Import tables and relations for schema object
import { users, revokedTokens } from './users'
import { activeSessions } from './active-sessions'
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
import { referees } from './referees'
import { counties, constituencies, wards } from './locations'
import {
    ethnicities,
    institutions,
    courses,
    professionalBodies,
    educationLevels,
    educationGrades
} from './reference-data'
import { auditLogs } from './audit-logs'
import { applicantDocuments } from './applicant-documents'


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
    professionalMembershipsRelations,
    refereesRelations,
    applicantDocumentsRelations
} from './relations'

// Export schema object with relations for query API
export const schema = {
    users,
    revokedTokens,
    activeSessions,
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
    referees,
    counties,
    constituencies,
    wards,
    ethnicities,
    institutions,
    courses,
    professionalBodies,
    educationLevels,
    educationGrades,
    auditLogs,
    applicantDocuments,
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
    professionalMembershipsRelations,
    refereesRelations,
    applicantDocumentsRelations
}
