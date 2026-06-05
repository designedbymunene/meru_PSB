import { pgTable, integer, text, timestamp, json } from 'drizzle-orm/pg-core'
import { timestamps } from './common'
import { users } from './users'

// Web Push Subscriptions table
export const webPushSubscriptions = pgTable('web_push_subscriptions', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull(),
    keys: json('keys').notNull().$type<{
        p256dh: string
        auth: string
    }>(),
    userAgent: text('user_agent'),
    lastUsed: timestamp('last_used', { withTimezone: true }),
    ...timestamps
})

// TypeScript types
export type WebPushSubscription = typeof webPushSubscriptions.$inferSelect
export type NewWebPushSubscription = typeof webPushSubscriptions.$inferInsert
