import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { timestamps } from './common'
import { users } from './users'

export const loginOtpSessions = pgTable('login_otp_sessions', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity({
        startWith: 1000,
        increment: 1
    }),
    userId: integer('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    otpHash: text('otp_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    attemptCount: integer('attempt_count').notNull().default(0),
    ...timestamps
})

export type LoginOtpSession = typeof loginOtpSessions.$inferSelect
export type NewLoginOtpSession = typeof loginOtpSessions.$inferInsert
