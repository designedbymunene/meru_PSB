import { relations } from 'drizzle-orm'
import { users } from './users'
import { vacancies } from './vacancies'
import { applications } from './applications'
import { departments } from './departments'
import { jobGroups } from './job-groups'
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
import { applicantDocuments } from './applicant-documents'
import { interviews, interviewScores, vacancyPanelMembers, interviewCriteria, interviewCriteriaScores } from './interviews'
import { boardResolutions } from './board'
import { auditLogs } from './audit-logs'
import { downloadCategories, downloadFiles } from './downloads'

import { counties, constituencies, wards } from './locations'
import { 
    ethnicities, 
    institutions, 
    courses, 
    professionalBodies 
} from './reference-data'

// Relations for users
export const usersRelations = relations(users, ({ many, one }) => ({
    applications: many(applications),
    createdVacancies: many(vacancies),
    passwordResetSessions: many(passwordResetSessions),
    applicantProfile: one(applicantProfiles, {
        fields: [users.id],
        references: [applicantProfiles.userId]
    }),
    documents: many(applicantDocuments),
    interviewScores: many(interviewScores),
    approvedResolutions: many(boardResolutions)
}))

// Relations for password reset sessions
export const passwordResetSessionsRelations = relations(
    passwordResetSessions,
    ({ one }) => ({
        user: one(users, {
            fields: [passwordResetSessions.userId],
            references: [users.id]
        })
    })
)

export const loginOtpSessionsRelations = relations(
    loginOtpSessions,
    ({ one }) => ({
        user: one(users, {
            fields: [loginOtpSessions.userId],
            references: [users.id]
        })
    })
)

// Relations for vacancies
export const vacanciesRelations = relations(vacancies, ({ one, many }) => ({
    creator: one(users, {
        fields: [vacancies.createdBy],
        references: [users.id]
    }),
    department: one(departments, {
        fields: [vacancies.departmentId],
        references: [departments.id]
    }),
    jobGroup: one(jobGroups, {
        fields: [vacancies.jobGroupId],
        references: [jobGroups.id]
    }),
    applications: many(applications),
    documents: many(vacancyDocuments),
    interviews: many(interviews),
    panelMembers: many(vacancyPanelMembers),
    interviewCriteria: many(interviewCriteria),
    resolutions: many(boardResolutions)
}))

// Relations for applications
export const applicationsRelations = relations(applications, ({ one, many }) => ({
    applicant: one(users, {
        fields: [applications.applicantId],
        references: [users.id]
    }),
    vacancy: one(vacancies, {
        fields: [applications.vacancyId],
        references: [vacancies.id]
    }),
    reviewer: one(users, {
        fields: [applications.reviewedBy],
        references: [users.id]
    }),
    interviews: many(interviews),
    applicantProfile: one(applicantProfiles, {
        fields: [applications.applicantId],
        references: [applicantProfiles.userId]
    }),
    auditLogs: many(auditLogs)
}))

// Relations for audit logs
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
    admin: one(users, {
        fields: [auditLogs.adminId],
        references: [users.id]
    }),
    application: one(applications, {
        fields: [auditLogs.targetId],
        references: [applications.id]
    })
}))

// Relations for interviews
export const interviewsRelations = relations(interviews, ({ one, many }) => ({
    vacancy: one(vacancies, {
        fields: [interviews.vacancyId],
        references: [vacancies.id]
    }),
    application: one(applications, {
        fields: [interviews.applicationId],
        references: [applications.id]
    }),
    scores: many(interviewScores)
}))

// Relations for interview scores
export const interviewScoresRelations = relations(interviewScores, ({ one, many }) => ({
    interview: one(interviews, {
        fields: [interviewScores.interviewId],
        references: [interviews.id]
    }),
    panelMember: one(users, {
        fields: [interviewScores.panelMemberId],
        references: [users.id]
    }),
    criteriaScores: many(interviewCriteriaScores)
}))

// Relations for interview criteria
export const interviewCriteriaRelations = relations(interviewCriteria, ({ one, many }) => ({
    vacancy: one(vacancies, {
        fields: [interviewCriteria.vacancyId],
        references: [vacancies.id]
    }),
    scores: many(interviewCriteriaScores)
}))

// Relations for interview criteria scores
export const interviewCriteriaScoresRelations = relations(interviewCriteriaScores, ({ one }) => ({
    interviewScore: one(interviewScores, {
        fields: [interviewCriteriaScores.interviewScoreId],
        references: [interviewScores.id]
    }),
    criteria: one(interviewCriteria, {
        fields: [interviewCriteriaScores.criteriaId],
        references: [interviewCriteria.id]
    })
}))

// Relations for vacancy panel members
export const vacancyPanelMembersRelations = relations(vacancyPanelMembers, ({ one }) => ({
    vacancy: one(vacancies, {
        fields: [vacancyPanelMembers.vacancyId],
        references: [vacancies.id]
    }),
    user: one(users, {
        fields: [vacancyPanelMembers.userId],
        references: [users.id]
    })
}))

// Relations for departments
export const departmentsRelations = relations(departments, ({ many }) => ({
    vacancies: many(vacancies)
}))

// Relations for job groups
export const jobGroupsRelations = relations(jobGroups, ({ many }) => ({
    vacancies: many(vacancies)
}))

// Relations for vacancy documents
export const vacancyDocumentsRelations = relations(vacancyDocuments, ({ one }) => ({
    vacancy: one(vacancies, {
        fields: [vacancyDocuments.vacancyId],
        references: [vacancies.id]
    }),
    uploader: one(users, {
        fields: [vacancyDocuments.uploadedBy],
        references: [users.id]
    })
}))

// Relations for applicant profiles
export const applicantProfilesRelations = relations(applicantProfiles, ({ one, many }) => ({
    user: one(users, {
        fields: [applicantProfiles.userId],
        references: [users.id]
    }),
    homeCounty: one(counties, {
        fields: [applicantProfiles.homeCountyId],
        references: [counties.id]
    }),
    homeSubCounty: one(constituencies, {
        fields: [applicantProfiles.homeSubCountyId],
        references: [constituencies.id]
    }),
    ward: one(wards, {
        fields: [applicantProfiles.wardId],
        references: [wards.id]
    }),
    ethnicity: one(ethnicities, {
        fields: [applicantProfiles.ethnicityId],
        references: [ethnicities.id]
    }),
    qualifications: many(qualifications),
    professionalDetails: many(professionalDetails),
    trainingCourses: many(trainingCourses),
    professionalMemberships: many(professionalMemberships),
    employmentHistory: many(employmentHistory),
    referees: many(referees),
    documents: many(applicantDocuments)
}))

// Relations for qualifications
export const qualificationsRelations = relations(qualifications, ({ one }) => ({
    profile: one(applicantProfiles, {
        fields: [qualifications.applicantProfileId],
        references: [applicantProfiles.id]
    }),
    institution: one(institutions, {
        fields: [qualifications.institutionId],
        references: [institutions.id]
    }),
    course: one(courses, {
        fields: [qualifications.courseId],
        references: [courses.id]
    })
}))

// Relations for employment history
export const employmentHistoryRelations = relations(employmentHistory, ({ one }) => ({
    profile: one(applicantProfiles, {
        fields: [employmentHistory.applicantProfileId],
        references: [applicantProfiles.id]
    })
}))

// Relations for professional details
export const professionalDetailsRelations = relations(professionalDetails, ({ one }) => ({
    profile: one(applicantProfiles, {
        fields: [professionalDetails.applicantProfileId],
        references: [applicantProfiles.id]
    }),
    issuingBody: one(professionalBodies, {
        fields: [professionalDetails.issuingBodyId],
        references: [professionalBodies.id]
    })
}))

// Relations for training courses
export const trainingCoursesRelations = relations(trainingCourses, ({ one }) => ({
    profile: one(applicantProfiles, {
        fields: [trainingCourses.applicantProfileId],
        references: [applicantProfiles.id]
    }),
    institution: one(institutions, {
        fields: [trainingCourses.institutionId],
        references: [institutions.id]
    }),
    course: one(courses, {
        fields: [trainingCourses.courseId],
        references: [courses.id]
    })
}))

// Relations for professional memberships
export const professionalMembershipsRelations = relations(professionalMemberships, ({ one }) => ({
    profile: one(applicantProfiles, {
        fields: [professionalMemberships.applicantProfileId],
        references: [applicantProfiles.id]
    }),
    membershipBody: one(professionalBodies, {
        fields: [professionalMemberships.membershipBodyId],
        references: [professionalBodies.id]
    })
}))

// Relations for referees
export const refereesRelations = relations(referees, ({ one }) => ({
    profile: one(applicantProfiles, {
        fields: [referees.applicantProfileId],
        references: [applicantProfiles.id]
    })
}))

// Relations for applicant documents
export const applicantDocumentsRelations = relations(applicantDocuments, ({ one }) => ({
    user: one(users, {
        fields: [applicantDocuments.userId],
        references: [users.id]
    }),
    profile: one(applicantProfiles, {
        fields: [applicantDocuments.userId],
        references: [applicantProfiles.userId]
    }),
    verifier: one(users, {
        fields: [applicantDocuments.verifiedBy],
        references: [users.id]
    })
}))

// Relations for board resolutions
export const boardResolutionsRelations = relations(boardResolutions, ({ one }) => ({
    vacancy: one(vacancies, {
        fields: [boardResolutions.vacancyId],
        references: [vacancies.id]
    }),
    approver: one(users, {
        fields: [boardResolutions.approvedBy],
        references: [users.id]
    })
}))

// Relations for download categories
export const downloadCategoriesRelations = relations(downloadCategories, ({ many }) => ({
    files: many(downloadFiles)
}))

// Relations for download files
export const downloadFilesRelations = relations(downloadFiles, ({ one }) => ({
    category: one(downloadCategories, {
        fields: [downloadFiles.categoryId],
        references: [downloadCategories.id]
    })
}))
