import { relations } from 'drizzle-orm'
import { users } from './users'
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

// Relations for users
export const usersRelations = relations(users, ({ many, one }) => ({
    applications: many(applications),
    createdVacancies: many(vacancies),
    passwordResetSessions: many(passwordResetSessions),
    applicantProfile: one(applicantProfiles, {
        fields: [users.id],
        references: [applicantProfiles.userId]
    })
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
    documents: many(vacancyDocuments)
}))

// Relations for applications
export const applicationsRelations = relations(applications, ({ one }) => ({
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
    referees: many(referees)
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
