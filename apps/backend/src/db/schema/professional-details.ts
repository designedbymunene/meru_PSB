import { pgTable, integer, text, varchar, date } from 'drizzle-orm/pg-core'
import { timestamps } from './common'
import { professionalBodies } from './reference-data'

// Professional Details table - Registration with professional bodies
export const professionalDetails = pgTable('professional_details', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity({
        startWith: 1000,
        increment: 1
    }),
    applicantProfileId: integer('applicant_profile_id').notNull(),

    registrationBody: text('registration_body').notNull(), // e.g., "Kenya Medical Practitioners Board"
    registrationBodyId: integer('registration_body_id').references(() => professionalBodies.id),
    registrationNumber: varchar('registration_number', { length: 100 }).notNull(),
    expiryDate: date('expiry_date'), // Registration expiry date

    ...timestamps
})

// TypeScript types
export type ProfessionalDetail = typeof professionalDetails.$inferSelect
export type NewProfessionalDetail = typeof professionalDetails.$inferInsert
