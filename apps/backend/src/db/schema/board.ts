import { pgTable, integer, text, varchar } from 'drizzle-orm/pg-core'
import { vacancies } from './vacancies'
import { users } from './users'
import { timestamps } from './common'

// Board Resolutions table
export const boardResolutions = pgTable('board_resolutions', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    vacancyId: integer('vacancy_id').notNull().references(() => vacancies.id, { onDelete: 'cascade' }),
    resolutionText: text('resolution_text').notNull(),
    status: varchar('status', { length: 20 }).notNull().default('draft'), // 'draft', 'approved'
    approvedBy: integer('approved_by').references(() => users.id),
    ...timestamps
})

// TypeScript types
export type BoardResolution = typeof boardResolutions.$inferSelect
export type NewBoardResolution = typeof boardResolutions.$inferInsert
