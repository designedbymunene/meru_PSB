import { pgTable, integer, text, varchar, date } from 'drizzle-orm/pg-core'
import { timestamps } from './common'
import { professionalBodies } from './reference-data'

// Professional Memberships table - Professional body memberships
export const professionalMemberships = pgTable('professional_memberships', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity({
        startWith: 1000,
        increment: 1
    }),
    applicantProfileId: integer('applicant_profile_id').notNull(),

    membershipBody: text('membership_body').notNull(), // e.g., "Kenya Institute of Management"
    membershipBodyId: integer('membership_body_id').references(() => professionalBodies.id),
    membershipType: text('membership_type').notNull(), // e.g., "Full", "Associate"
    registrationNumber: varchar('registration_number', { length: 100 }), // Membership number
    expiryDate: date('expiry_date'), // Membership expiry date

    ...timestamps
})

// TypeScript types
export type ProfessionalMembership = typeof professionalMemberships.$inferSelect
export type NewProfessionalMembership = typeof professionalMemberships.$inferInsert
