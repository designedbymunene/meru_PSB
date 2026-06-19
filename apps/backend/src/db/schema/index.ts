// Export tables
export * from './users'
export * from './venues'
export * from './venue-tags'
export * from './vacancies'
export * from './downloads'

export * from './applications'
export * from './departments'
export * from './job-groups'
export * from './venues'
export * from './vacancy-documents'
export * from './applicant-profiles'
export * from './password-reset-sessions'
export * from './login-otp-sessions'
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
export * from './shortlisting'
export * from './interviews'
export * from './board'
export * from './archive'
export * from './notifications'
export * from './web-push-subscriptions'

// Import tables and relations for schema object
import { users, revokedTokens } from './users'
import { activeSessions } from './active-sessions'
import { vacancies } from './vacancies'
import { applications } from './applications'
import { applicationsArchive, vacanciesArchive } from './archive'
import { departments } from './departments'
import { jobGroups } from './job-groups'
import { venues } from './venues'
import { venueTags } from './venue-tags'
import { vacancyDocuments } from './vacancy-documents'
import { applicantProfiles } from './applicant-profiles'
import { passwordResetSessions } from './password-reset-sessions'
import { loginOtpSessions } from './login-otp-sessions'
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
import { shortlistCriteria } from './shortlisting'
import { interviews, interviewScores, vacancyPanelMembers, interviewCriteria, interviewCriteriaScores } from './interviews'
import { boardResolutions } from './board'
import { downloadCategories, downloadFiles } from './downloads'
import { notifications, notificationPreferences } from './notifications'
import { webPushSubscriptions } from './web-push-subscriptions'


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
    loginOtpSessionsRelations,
    qualificationsRelations,
    employmentHistoryRelations,
    professionalDetailsRelations,
    trainingCoursesRelations,
    professionalMembershipsRelations,
    refereesRelations,
    applicantDocumentsRelations,
    interviewsRelations,
    interviewScoresRelations,
    interviewCriteriaRelations,
    interviewCriteriaScoresRelations,
    vacancyPanelMembersRelations,
    boardResolutionsRelations,
    auditLogsRelations,
    downloadCategoriesRelations,
    downloadFilesRelations
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
    venues,
    venueTags,
    vacancyDocuments,
    applicantProfiles,
    passwordResetSessions,
    loginOtpSessions,
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
    shortlistCriteria,
    interviews,
    interviewScores,
    vacancyPanelMembers,
    interviewCriteria,
    interviewCriteriaScores,
    boardResolutions,
    downloadCategories,
    downloadFiles,
    notifications,
    notificationPreferences,
    webPushSubscriptions,
    applicationsArchive,
    vacanciesArchive,
    // Relations
    usersRelations,
    vacanciesRelations,
    applicationsRelations,
    departmentsRelations,
    jobGroupsRelations,
    vacancyDocumentsRelations,
    applicantProfilesRelations,
    passwordResetSessionsRelations,
    loginOtpSessionsRelations,
    qualificationsRelations,
    employmentHistoryRelations,
    professionalDetailsRelations,
    trainingCoursesRelations,
    professionalMembershipsRelations,
    refereesRelations,
    applicantDocumentsRelations,
    interviewsRelations,
    interviewScoresRelations,
    interviewCriteriaRelations,
    interviewCriteriaScoresRelations,
    vacancyPanelMembersRelations,
    boardResolutionsRelations,
    auditLogsRelations,
    downloadCategoriesRelations,
    downloadFilesRelations
}
