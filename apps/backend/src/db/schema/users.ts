import { pgTable, integer, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core'
import { timestamps } from './common'

// Users table
export const users = pgTable('users', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity({
        startWith: 1000,
        increment: 1
    }),
    email: varchar('email', { length: 320 }).notNull().unique(),
    phoneNumber: varchar('phone_number', { length: 20 }).notNull().unique(),
    password: text('password').notNull(),
    fullName: text('full_name').notNull(),
    role: varchar('role', { length: 20 }).notNull().default('applicant'), // 'applicant' or 'admin'
    tokenVersion: integer('token_version').notNull().default(0),
    twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
    ...timestamps
})

// Revoked tokens table (blocklist for refresh tokens)
export const revokedTokens = pgTable('revoked_tokens', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ...timestamps
})

// TypeScript types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserWithoutPassword = Omit<User, 'password'>

export type RevokedToken = typeof revokedTokens.$inferSelect
export type NewRevokedToken = typeof revokedTokens.$inferInsert
