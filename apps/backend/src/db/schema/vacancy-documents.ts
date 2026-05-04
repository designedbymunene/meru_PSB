import { pgTable, integer, varchar, text } from 'drizzle-orm/pg-core'
import { vacancies } from './vacancies'
import { users } from './users'
import { timestamps } from './common'

// Vacancy Documents table (for PDF files)
export const vacancyDocuments = pgTable('vacancy_documents', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity({
        startWith: 1000,
        increment: 1
    }),
    vacancyId: integer('vacancy_id').notNull().references(() => vacancies.id, { onDelete: 'cascade' }),
    filename: varchar('filename', { length: 255 }).notNull(),
    originalName: varchar('original_name', { length: 255 }).notNull(),
    filePath: text('file_path').notNull(),
    fileSize: integer('file_size').notNull(), // in bytes
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    uploadedBy: integer('uploaded_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
    ...timestamps
})

// TypeScript types
export type VacancyDocument = typeof vacancyDocuments.$inferSelect
export type NewVacancyDocument = typeof vacancyDocuments.$inferInsert
