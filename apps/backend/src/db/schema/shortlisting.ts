import { pgTable, integer, jsonb } from 'drizzle-orm/pg-core'
import { vacancies } from './vacancies'
import { users } from './users'
import { timestamps } from './common'

// Shortlist criteria for a vacancy
export const shortlistCriteria = pgTable('shortlist_criteria', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    vacancyId: integer('vacancy_id').notNull().references(() => vacancies.id, { onDelete: 'cascade' }),
    weights: jsonb('weights').notNull().default({}), // Scoring weights for qualifications, experience, etc.
    minScore: integer('min_score').notNull().default(0), // Threshold for shortlisting
    configuredBy: integer('configured_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
    ...timestamps
})

// TypeScript types
export type ShortlistCriteria = typeof shortlistCriteria.$inferSelect
export type NewShortlistCriteria = typeof shortlistCriteria.$inferInsert
