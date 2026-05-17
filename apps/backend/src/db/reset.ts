import { db } from './index'
import { 
    departments, 
    jobGroups, 
    users, 
    vacancies, 
    applications, 
    applicantProfiles, 
    passwordResetSessions,
    revokedTokens,
    qualifications,
    professionalDetails,
    trainingCourses,
    professionalMemberships,
    employmentHistory,
    vacancyDocuments
} from './schema'
import { not, eq } from 'drizzle-orm'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Completely wipes the database for a fresh seed.
 * BE CAREFUL: This deletes ALL data in the specified tables except the admin user.
 */
export async function resetDatabase() {
    console.warn('⚠️  WARNING: Resetting database...')
    
    try {
        // Delete in correct order to avoid foreign key violations
        await db.delete(applications)
        await db.delete(vacancyDocuments)
        await db.delete(vacancies)
        await db.delete(qualifications)
        await db.delete(professionalDetails)
        await db.delete(trainingCourses)
        await db.delete(professionalMemberships)
        await db.delete(employmentHistory)
        await db.delete(applicantProfiles)
        await db.delete(passwordResetSessions)
        await db.delete(revokedTokens)
        
        // Delete all users except admin
        await db.delete(users).where(not(eq(users.role, 'admin')))
        
        // Let's also not delete departments and job groups since they are reference data
        // and might be needed by the admin or subsequent operations, unless you want them wiped.
        // I'll wipe them if they were originally wiped. Wait, they might be needed. 
        // I'll just wipe what was originally wiped, except users.
        await db.delete(departments)
        await db.delete(jobGroups)
        
        console.log('✅ Database wiped successfully (Admin users retained).')
    } catch (error) {
        console.error('❌ Database wipe failed:', error)
        throw error
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    resetDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
}
