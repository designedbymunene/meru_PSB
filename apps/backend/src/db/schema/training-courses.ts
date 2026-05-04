import { pgTable, integer, text, varchar } from 'drizzle-orm/pg-core'
import { timestamps } from './common'
import { institutions, courses } from './reference-data'

// Training Courses table - Relevant courses and training
export const trainingCourses = pgTable('training_courses', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity({
        startWith: 1000,
        increment: 1
    }),
    applicantProfileId: integer('applicant_profile_id').notNull(),

    courseName: text('course_name').notNull(), // e.g., "STRATEGIC LEADERSHIP"
    courseId: integer('course_id').references(() => courses.id),
    description: text('description'), // Course description
    grade: varchar('grade', { length: 50 }), // Grade/result if applicable
    institution: text('institution'), // Free text - institution name
    institutionId: integer('institution_id').references(() => institutions.id),
    year: integer('year'), // Year completed
    certificatePath: text('certificate_path'), // Optional uploaded certificate file path

    ...timestamps
})

// TypeScript types
export type TrainingCourse = typeof trainingCourses.$inferSelect
export type NewTrainingCourse = typeof trainingCourses.$inferInsert
