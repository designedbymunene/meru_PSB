import { pgTable, integer, varchar, text } from 'drizzle-orm/pg-core'
import { timestamps } from './common'

// Departments table
export const departments = pgTable('departments', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity({
        startWith: 100,
        increment: 1
    }),
    name: varchar('name', { length: 200 }).notNull().unique(),
    description: text('description'),
    status: varchar('status', { length: 20 }).notNull().default('active'), // 'active', 'inactive'
    ...timestamps
})

// TypeScript types
export type Department = typeof departments.$inferSelect
export type NewDepartment = typeof departments.$inferInsert
