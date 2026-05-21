import { db } from '../db'
import { eq } from 'drizzle-orm'
import { applicantProfiles } from '../db/schema'
import { calculateProfileCompletion } from '../utils/profile-completion'

export class ProfileService {
    /**
     * Fetches the complete profile for a user with all its relations.
     */
    static async getFullProfile(userId: number, database = db) {
        return await database.query.applicantProfiles.findFirst({
            where: eq(applicantProfiles.userId, userId),
            with: {
                qualifications: true,
                professionalDetails: true,
                trainingCourses: true,
                professionalMemberships: true,
                employmentHistory: true,
                referees: true,
                documents: true,
                homeCounty: true,
                homeSubCounty: true,
                ward: true,
                ethnicity: true
            }
        })
    }

    /**
     * Checks if a profile satisfies the required application sections.
     */
    static async isProfileComplete(userId: number, database = db) {
        const profile = await this.getFullProfile(userId, database)
        if (!profile) return false

        const completion = calculateProfileCompletion(profile)
        return completion.canApply
    }

    /**
     * Gets completion stats for a profile.
     */
    static async getCompletionStats(userId: number, database = db) {
        const profile = await this.getFullProfile(userId, database)
        if (!profile) return null

        return calculateProfileCompletion(profile)
    }
}
