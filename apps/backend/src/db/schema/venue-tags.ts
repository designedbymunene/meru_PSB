import { pgTable, integer, varchar, text } from 'drizzle-orm/pg-core'
import { timestamps } from './common'

export const venueTags = pgTable('venue_tags', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    color: varchar('color', { length: 50 }).notNull().default('blue'),
    ...timestamps
})

export type VenueTag = typeof venueTags.$inferSelect
export type NewVenueTag = typeof venueTags.$inferInsert
