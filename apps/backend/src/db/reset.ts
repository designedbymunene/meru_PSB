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
import dotenv from 'dotenv'

dotenv.config()

/**
 * Completely wipes the database for a fresh seed.
 * BE CAREFUL: This deletes ALL data in the specified tables.
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
        await db.delete(users)
        await db.delete(departments)
        await db.delete(jobGroups)
        
        console.log('✅ Database wiped successfully.')
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
