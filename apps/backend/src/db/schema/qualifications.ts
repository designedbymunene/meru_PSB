import { pgTable, integer, varchar, text } from 'drizzle-orm/pg-core'
import { timestamps } from './common'
import { courses, institutions } from './reference-data'

// Qualifications table - One-to-many with applicant profiles
export const qualifications = pgTable('qualifications', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity({
        startWith: 1000,
        increment: 1
    }),
    applicantProfileId: integer('applicant_profile_id').notNull(),

    level: varchar('level', { length: 100 }).notNull(), // DOCTORATE, MASTERS, BACHELORS, DIPLOMA, CERTIFICATE, KCSE, KCPE
    course: text('course').notNull(), // e.g., PROSTHODONTICS, COMPUTER SCIENCE
    courseId: integer('course_id').references(() => courses.id),
    grade: varchar('grade', { length: 50 }), // PASS, CREDIT, DISTINCTION, First Class, etc.
    institution: text('institution').notNull(), // Free text - university/college name
    institutionId: integer('institution_id').references(() => institutions.id),
    yearStart: integer('year_start'), // Start year
    yearEnd: integer('year_end'), // End year (null if ongoing)

    ...timestamps
})

// TypeScript types
export type Qualification = typeof qualifications.$inferSelect
export type NewQualification = typeof qualifications.$inferInsert
