import { pgTable, integer, text, timestamp, varchar, jsonb, boolean } from 'drizzle-orm/pg-core'
import { vacancies } from './vacancies'
import { applications } from './applications'
import { users } from './users'
import { timestamps } from './common'

// Interviews table
export const interviews = pgTable('interviews', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    vacancyId: integer('vacancy_id').notNull().references(() => vacancies.id, { onDelete: 'cascade' }),
    applicationId: integer('application_id').notNull().references(() => applications.id, { onDelete: 'cascade' }),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
    venue: text('venue').notNull(),
    virtualLink: text('virtual_link'),
    status: varchar('status', { length: 20 }).notNull().default('scheduled'), // 'scheduled', 'completed', 'cancelled'
    panelMembers: jsonb('panel_members').$type<number[] | string[]>().notNull().default([]), // array of user IDs or names
    ...timestamps
})

// Interview scores table
export const interviewScores = pgTable('interview_scores', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    interviewId: integer('interview_id').notNull().references(() => interviews.id, { onDelete: 'cascade' }),
    panelMemberId: integer('panel_member_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    score: integer('score').notNull(),
    comments: text('comments').notNull(),
    conflictOfInterest: boolean('conflict_of_interest').notNull().default(false),
    declarationNotes: text('declaration_notes'),
    ...timestamps
})

// TypeScript types
export type Interview = typeof interviews.$inferSelect
export type NewInterview = typeof interviews.$inferInsert

export type InterviewScore = typeof interviewScores.$inferSelect
export type NewInterviewScore = typeof interviewScores.$inferInsert
