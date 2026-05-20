import { pgTable, integer, varchar, unique } from 'drizzle-orm/pg-core'
import { timestamps } from './common'

// Ethnicities table
export const ethnicities = pgTable('ethnicities', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    ...timestamps
})

// Institutions table
export const institutions = pgTable('institutions', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    type: varchar('type', { length: 50 }), // UNIVERSITY, COLLEGE, SCHOOL, etc.
    ...timestamps
})

// Courses table
export const courses = pgTable('courses', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    level: varchar('level', { length: 50 }), // BACHELORS, DIPLOMA, etc.
    ...timestamps
})

// Professional Bodies table
export const professionalBodies = pgTable('professional_bodies', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    acronym: varchar('acronym', { length: 50 }),
    ...timestamps
})

// Education Levels table
export const educationLevels = pgTable('education_levels', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 100 }).notNull().unique(), // KCPE, KCSE, etc.
    code: varchar('code', { length: 50 }).notNull().unique(),
    ...timestamps
})

// Education Grades table
export const educationGrades = pgTable('education_grades', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    levelId: integer('level_id').notNull().references(() => educationLevels.id, { onDelete: 'cascade' }),
    grade: varchar('grade', { length: 50 }).notNull(),
    ...timestamps
}, (t) => ({
    unq: unique().on(t.levelId, t.grade)
}))

// Types
export type Ethnicity = typeof ethnicities.$inferSelect
export type Institution = typeof institutions.$inferSelect
export type Course = typeof courses.$inferSelect
export type ProfessionalBody = typeof professionalBodies.$inferSelect
export type EducationLevel = typeof educationLevels.$inferSelect
export type EducationGrade = typeof educationGrades.$inferSelect
