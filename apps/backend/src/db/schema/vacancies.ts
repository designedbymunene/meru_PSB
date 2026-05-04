import { pgTable, integer, varchar, text, date, json } from 'drizzle-orm/pg-core'
import { users } from './users'
import { departments } from './departments'
import { jobGroups } from './job-groups'
import { timestamps } from './common'

// Vacancies table
export const vacancies = pgTable('vacancies', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity({
        startWith: 1000,
        increment: 1
    }),
    advertisementNumber: varchar('advertisement_number', { length: 100 }).notNull().unique(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    departmentId: integer('department_id').references(() => departments.id, { onDelete: 'cascade' }),
    jobGroupId: integer('job_group_id').notNull().references(() => jobGroups.id, { onDelete: 'cascade' }),
    closingDate: date('closing_date').notNull(),
    openPositions: integer('open_positions').notNull().default(1),
    jobRequirements: json('job_requirements').$type<string[]>().notNull().default([]),
    jobResponsibilities: json('job_responsibilities').$type<string[]>().notNull().default([]),
    status: varchar('status', { length: 20 }).notNull().default('open'), // 'open', 'closed'
    createdBy: integer('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
    ...timestamps
})

// TypeScript types
export type Vacancy = typeof vacancies.$inferSelect
export type NewVacancy = typeof vacancies.$inferInsert
