import { pgTable, integer, varchar, text, jsonb } from 'drizzle-orm/pg-core'
import { timestamps } from './common'

export const venues = pgTable('venues', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    location: text('location'),
    tagIds: jsonb('tag_ids').$type<number[]>().notNull().default([]),
    ...timestamps
})

export type Venue = typeof venues.$inferSelect
export type NewVenue = typeof venues.$inferInsert
