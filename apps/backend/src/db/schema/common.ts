import { timestamp } from 'drizzle-orm/pg-core'

// Common timestamp pattern
export const timestamps = {
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
        .$onUpdateFn(() => new Date())
}
