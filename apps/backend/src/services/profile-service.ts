import { db } from '../db'
import { eq } from 'drizzle-orm'
import { applicantProfiles } from '../db/schema'
import { calculateProfileCompletion } from '../utils/profile-completion'

export class ProfileService {
    /**
     * Fetches the complete profile for a user with all its relations.
     */
    static async getFullProfile(userId: number) {
        return await db.query.applicantProfiles.findFirst({
            where: eq(applicantProfiles.userId, userId),
            with: {
                qualifications: true,
                professionalDetails: true,
                trainingCourses: true,
                professionalMemberships: true,
                employmentHistory: true,
                referees: true
            }
        })
    }

    /**
     * Checks if a profile is 100% complete.
     */
    static async isProfileComplete(userId: number) {
        const profile = await this.getFullProfile(userId)
        if (!profile) return false

        const completion = calculateProfileCompletion(profile)
        return completion.overallPercentage === 100
    }

    /**
     * Gets completion stats for a profile.
     */
    static async getCompletionStats(userId: number) {
        const profile = await this.getFullProfile(userId)
        if (!profile) return null

        return calculateProfileCompletion(profile)
    }
}
