import { pgTable, integer, varchar, text, boolean } from 'drizzle-orm/pg-core'
import { users } from './users'
import { counties, constituencies, wards } from './locations'
import { ethnicities } from './reference-data'
import { timestamps } from './common'

// Applicant Profiles table - Core applicant information
export const applicantProfiles = pgTable('applicant_profiles', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity({
        startWith: 1000,
        increment: 1
    }),
    userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),

    // Core applicant info

    fullName: text('full_name').notNull(),
    idNumber: varchar('id_number', { length: 50 }).notNull().unique(),
    gender: varchar('gender', { length: 20 }),
    dateOfBirth: varchar('date_of_birth', { length: 10 }), // YYYY-MM-DD
    ethnicityId: integer('ethnicity_id').references(() => ethnicities.id),
    phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
    email: varchar('email', { length: 320 }).notNull(),

    // Location data
    homeCountyId: integer('home_county_id').references(() => counties.id),
    homeSubCountyId: integer('home_sub_county_id').references(() => constituencies.id),
    wardId: integer('ward_id').references(() => wards.id),

    residenceCountyId: integer('residence_county_id').references(() => counties.id),
    residenceSubCountyId: integer('residence_sub_county_id').references(() => constituencies.id),
    residenceWardId: integer('residence_ward_id').references(() => wards.id),

    // Status/Metadata
    impairment: boolean('impairment').default(false).notNull(),
    impairmentDetails: text('impairment_details'), // Details if impairment is true
    publicServiceInfo: text('public_service_info'), // Public service information
    personalNumber: varchar('personal_number', { length: 50 }), // Personal/Staff number

    // N/A Flags for beginners
    hasNoExperience: boolean('has_no_experience').default(false).notNull(),
    hasNoCertificates: boolean('has_no_certificates').default(false).notNull(),
    hasNoMemberships: boolean('has_no_memberships').default(false).notNull(),
    hasNoTrainings: boolean('has_no_trainings').default(false).notNull(),
    hasNoReferees: boolean('has_no_referees').default(false).notNull(),

    ...timestamps
})

// TypeScript types
export type ApplicantProfile = typeof applicantProfiles.$inferSelect
export type NewApplicantProfile = typeof applicantProfiles.$inferInsert
