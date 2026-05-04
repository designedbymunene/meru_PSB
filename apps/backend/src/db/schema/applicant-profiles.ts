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

    applicantName: text('applicant_name').notNull(),
    idNumber: varchar('id_number', { length: 50 }).notNull().unique(), // Free text validation
    gender: varchar('gender', { length: 20 }), // Male, Female, Other
    birthYear: integer('birth_year'),
    ethnicityId: integer('ethnicity_id').references(() => ethnicities.id),
    phone: varchar('phone', { length: 20 }).notNull(), // Free text - supports international
    email: varchar('email', { length: 320 }).notNull(),

    // Location data
    homeCountyId: integer('home_county_id').references(() => counties.id),
    homeSubCountyId: integer('home_sub_county_id').references(() => constituencies.id),
    wardId: integer('ward_id').references(() => wards.id),

    // Status/Metadata
    impairment: boolean('impairment').default(false).notNull(),
    impairmentDetails: text('impairment_details'), // Details if impairment is true
    publicServiceInfo: text('public_service_info'), // Public service information
    personalNumber: varchar('personal_number', { length: 50 }), // Personal/Staff number

    ...timestamps
})

// TypeScript types
export type ApplicantProfile = typeof applicantProfiles.$inferSelect
export type NewApplicantProfile = typeof applicantProfiles.$inferInsert
