import { pgTable, integer, varchar, text } from 'drizzle-orm/pg-core'
import { timestamps } from './common'

// Referees table - One-to-many with applicant profiles
export const referees = pgTable('referees', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity({
        startWith: 1000,
        increment: 1
    }),
    applicantProfileId: integer('applicant_profile_id').notNull(),

    fullName: varchar('full_name', { length: 255 }).notNull(),
    organization: varchar('organization', { length: 255 }).notNull(),
    designation: varchar('designation', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }).notNull(),
    email: varchar('email', { length: 320 }).notNull(),
    address: text('address'),
    relationship: varchar('relationship', { length: 100 }),

    ...timestamps
})

// TypeScript types
export type Referee = typeof referees.$inferSelect
export type NewReferee = typeof referees.$inferInsert
