import { pgTable, integer, text, varchar, date } from 'drizzle-orm/pg-core'
import { timestamps } from './common'

// Employment History table - Work experience records
export const employmentHistory = pgTable('employment_history', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity({
        startWith: 1000,
        increment: 1
    }),
    applicantProfileId: integer('applicant_profile_id').notNull(),

    startDate: date('start_date').notNull(), // Employment start date
    endDate: date('end_date'), // Employment end date (null if currently employed)
    jobTitle: text('job_title').notNull(), // e.g., "SENIOR DENTAL OFFICER"
    jobGroup: varchar('job_group', { length: 50 }), // e.g., "GROUP K"
    organization: text('organization').notNull(), // Employer name
    responsibilities: text('responsibilities'), // Job responsibilities/description

    ...timestamps
})

// TypeScript types
export type EmploymentHistory = typeof employmentHistory.$inferSelect
export type NewEmploymentHistory = typeof employmentHistory.$inferInsert
