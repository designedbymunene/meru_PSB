import {
    boolean,
    timestamp,
    pgTable,
    text,
    varchar,
    integer,
} from 'drizzle-orm/pg-core'

// Download Categories Table
export const downloadCategories = pgTable('download_categories', {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    icon: varchar('icon', { length: 100 }).default('FileText').notNull(),
    order: integer().default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Download Files Table
export const downloadFiles = pgTable('download_files', {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    categoryId: integer('category_id').references(() => downloadCategories.id, { onDelete: 'cascade' }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description').notNull(),
    url: text('url').notNull(),
    fileSize: varchar('file_size', { length: 50 }).default('PDF').notNull(),
    updatedDate: varchar('updated_date', { length: 50 }).default('').notNull(),
    order: integer().default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    downloadCount: integer('download_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type DownloadCategory = typeof downloadCategories.$inferSelect
export type NewDownloadCategory = typeof downloadCategories.$inferInsert
export type DownloadFile = typeof downloadFiles.$inferSelect
export type NewDownloadFile = typeof downloadFiles.$inferInsert
