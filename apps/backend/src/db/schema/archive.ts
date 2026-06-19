import { pgTable, integer, varchar, text, date, json, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { timestamps } from './common'

// Vacancies Archive table
export const vacanciesArchive = pgTable('vacancies_archive', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(), // New Archive ID
    originalId: integer('original_id').notNull(),
    advertisementNumber: varchar('advertisement_number', { length: 100 }).notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    departmentId: integer('department_id'),
    jobGroupId: integer('job_group_id').notNull(),
    closingDate: date('closing_date').notNull(),
    openPositions: integer('open_positions').notNull().default(1),
    jobRequirements: json('job_requirements').$type<string[]>().notNull(),
    jobResponsibilities: json('job_responsibilities').$type<string[]>().notNull(),
    status: varchar('status', { length: 20 }).notNull(),
    createdBy: integer('created_by').notNull(),
    archivedAt: timestamp('archived_at', { withTimezone: true }).defaultNow().notNull(),
    ...timestamps
})

// Applications Archive table
export const applicationsArchive = pgTable('applications_archive', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(), // New Archive ID
    originalId: integer('original_id').notNull(),
    applicantId: integer('applicant_id').notNull(),
    vacancyId: integer('vacancy_id').notNull(),
    status: varchar('status', { length: 20 }).notNull(),
    notes: text('notes'),
    tags: jsonb('tags').$type<string[]>().default([]),
    rating: integer('rating'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    reviewedBy: integer('reviewed_by'),
    rejectionReason: text('rejection_reason'),
    feedbackToApplicant: text('feedback_to_applicant'),
    profileSnapshot: jsonb('profile_snapshot'),
    lastStep: integer('last_step'),
    partialData: jsonb('partial_data'),
    appliedAt: timestamp('applied_at', { withTimezone: true }).notNull(),
    archivedAt: timestamp('archived_at', { withTimezone: true }).defaultNow().notNull(),
    ...timestamps
})

// TypeScript types
export type VacancyArchive = typeof vacanciesArchive.$inferSelect
export type NewVacancyArchive = typeof vacanciesArchive.$inferInsert
export type ApplicationArchive = typeof applicationsArchive.$inferSelect
export type NewApplicationArchive = typeof applicationsArchive.$inferInsert
