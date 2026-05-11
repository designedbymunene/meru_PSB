import { pgTable, integer, text, timestamp, varchar, jsonb } from 'drizzle-orm/pg-core'
import { users } from './users'
import { timestamps } from './common'

export const auditLogs = pgTable('audit_logs', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    adminId: integer('admin_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    action: varchar('action', { length: 50 }).notNull(), // e.g., 'STATUS_UPDATE', 'REVIEW_SUBMITTED'
    targetType: varchar('target_type', { length: 50 }).notNull(), // e.g., 'APPLICATION'
    targetId: integer('target_id').notNull(),
    previousState: jsonb('previous_state'),
    newState: jsonb('new_state'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    ...timestamps
})

export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert
