import { pgTable, integer, varchar, text, numeric } from 'drizzle-orm/pg-core'
import { timestamps } from './common'

// Job Groups table
export const jobGroups = pgTable('job_groups', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity({
        startWith: 100,
        increment: 1
    }),
    name: varchar('name', { length: 200 }).notNull().unique(),
    description: text('description'),
    salaryMin: numeric('salary_min', { precision: 12, scale: 2 }).notNull(),
    salaryMax: numeric('salary_max', { precision: 12, scale: 2 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('active'), // 'active', 'inactive'
    ...timestamps
})

// TypeScript types
export type JobGroup = typeof jobGroups.$inferSelect
export type NewJobGroup = typeof jobGroups.$inferInsert
