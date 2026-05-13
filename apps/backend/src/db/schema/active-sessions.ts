import { pgTable, integer, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core'
import { timestamps } from './common'
import { users } from './users'

export const activeSessions = pgTable('active_sessions', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('userId').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    tokenVersion: integer('token_version').notNull(),
    deviceId: varchar('device_id', { length: 255 }),
    deviceName: varchar('device_name', { length: 255 }),
    os: varchar('os', { length: 255 }),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    lastActive: timestamp('last_active', { withTimezone: true }).defaultNow().notNull(),
    isCurrent: boolean('is_current').default(false).notNull(),
    ...timestamps
})

export type ActiveSession = typeof activeSessions.$inferSelect
export type NewActiveSession = typeof activeSessions.$inferInsert
