import { pgTable, integer, varchar } from 'drizzle-orm/pg-core'
import { timestamps } from './common'

// Counties table
export const counties = pgTable('counties', {
    id: integer('id').primaryKey(), // Using numeric IDs from the SQL dump
    code: varchar('code', { length: 50 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    ...timestamps
})

// Constituencies / Sub-Counties table
export const constituencies = pgTable('constituencies', {
    id: integer('id').primaryKey(),
    countyId: integer('county_id').notNull().references(() => counties.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 50 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    ...timestamps
})

// Wards table
export const wards = pgTable('wards', {
    id: integer('id').primaryKey(),
    constituencyId: integer('constituency_id').notNull().references(() => constituencies.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 50 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    voters: varchar('voters', { length: 255 }),
    pollingStations: varchar('polling_stations', { length: 255 }),
    ...timestamps
})

// Types
export type County = typeof counties.$inferSelect
export type Constituency = typeof constituencies.$inferSelect
export type Ward = typeof wards.$inferSelect
