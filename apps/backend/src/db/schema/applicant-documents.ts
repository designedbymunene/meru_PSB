import { pgTable, integer, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'
import { timestamps } from './common'

export const documentStatusEnum = pgEnum('document_status', ['pending', 'uploaded', 'verified', 'rejected'])

export const applicantDocuments = pgTable('applicant_documents', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity({
        startWith: 1000,
        increment: 1
    }),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    documentType: varchar('document_type', { length: 100 }).notNull(), // e.g., 'ID Card', 'Degree', 'CV'
    originalName: varchar('original_name', { length: 255 }).notNull(),
    filename: varchar('filename', { length: 255 }).notNull(),
    filePath: text('file_path').notNull(),
    fileSize: integer('file_size').notNull(), // in bytes
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    status: documentStatusEnum('status').default('uploaded').notNull(),
    rejectionReason: text('rejection_reason'),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    verifiedBy: integer('verified_by').references(() => users.id),
    ...timestamps
})

export type ApplicantDocument = typeof applicantDocuments.$inferSelect
export type NewApplicantDocument = typeof applicantDocuments.$inferInsert
