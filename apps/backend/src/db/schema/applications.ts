import { pgTable, integer, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { users } from './users'
import { vacancies } from './vacancies'

// Applications table
export const applications = pgTable('applications', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity({
        startWith: 1000,
        increment: 1
    }),
    applicantId: integer('applicant_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    vacancyId: integer('vacancy_id').notNull().references(() => vacancies.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'reviewed', 'accepted', 'rejected'
    notes: text('notes'), // admin-only internal notes
    rating: integer('rating'), // 1-5 rating from reviewer
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    reviewedBy: integer('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
    rejectionReason: text('rejection_reason'),
    feedbackToApplicant: text('feedback_to_applicant'), // feedback visible to applicant
    appliedAt: timestamp('applied_at', { withTimezone: true }).defaultNow().notNull()
})

// TypeScript types
export type Application = typeof applications.$inferSelect
export type NewApplication = typeof applications.$inferInsert
