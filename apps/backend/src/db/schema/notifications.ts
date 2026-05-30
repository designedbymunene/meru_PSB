import { pgTable, integer, varchar, text, timestamp, boolean, json } from 'drizzle-orm/pg-core'
import { timestamps } from './common'
import { users } from './users'

// Notifications table
export const notifications = pgTable('notifications', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { 
        length: 50,
        enum: ['application_status', 'interview_reminder', 'document_request', 'application_update', 'general']
    }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    data: json('data').$type<Record<string, any>>(), // Store additional data like applicationId, interviewId, etc.
    read: boolean('read').notNull().default(false),
    readAt: timestamp('read_at', { withTimezone: true }),
    ...timestamps
})

// Notification preferences table
export const notificationPreferences = pgTable('notification_preferences', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
    statusUpdates: varchar('status_updates', { 
        length: 20,
        enum: ['email', 'push', 'in_app', 'none']
    }).notNull().default('in_app'),
    interviewReminders: varchar('interview_reminders', { 
        length: 20,
        enum: ['email', 'push', 'in_app', 'none']
    }).notNull().default('in_app'),
    documentRequests: varchar('document_requests', { 
        length: 20,
        enum: ['email', 'push', 'in_app', 'none']
    }).notNull().default('in_app'),
    emailDigest: varchar('email_digest', { 
        length: 20,
        enum: ['instant', 'daily', 'weekly', 'none']
    }).notNull().default('daily'),
    ...timestamps
})

// TypeScript types
export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert

export type NotificationPreference = typeof notificationPreferences.$inferSelect
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert
