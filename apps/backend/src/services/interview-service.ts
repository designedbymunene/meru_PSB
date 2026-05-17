import { db } from '../db'
import { eq, and, or, between, sql } from 'drizzle-orm'
import { interviews, interviewScores, applications } from '../db/schema'
import { ValidationError } from '../utils/errors'
import { AuditService } from './audit-service'

export class InterviewService {
    /**
     * Schedules a new interview.
     */
    static async scheduleInterview(data: { 
        vacancyId: number, 
        applicationId: number, 
        scheduledAt: Date, 
        venue: string, 
        virtualLink?: string, 
        panelMembers: number[],
        adminId: number 
    }) {
        const { vacancyId, applicationId, scheduledAt, venue, virtualLink, panelMembers, adminId } = data

        // 1. Conflict checking
        const startTime = new Date(scheduledAt.getTime() - 60 * 60 * 1000) // 1 hour before
        const endTime = new Date(scheduledAt.getTime() + 60 * 60 * 1000)  // 1 hour after

        // Check candidate conflict
        const candidateConflict = await db.query.interviews.findFirst({
            where: and(
                eq(interviews.applicationId, applicationId),
                between(interviews.scheduledAt, startTime, endTime),
                eq(interviews.status, 'scheduled')
            )
        })

        if (candidateConflict) {
            throw new ValidationError('Candidate is already scheduled for another interview within this time window.')
        }

        // Check panel members conflict
        // Since panelMembers is a JSONB array of IDs, we need to check if any of these IDs exist in other interviews' panel_members
        // This is a bit tricky with Drizzle and JSONB arrays.
        // For Postgres, we can use the ?| operator to check if any of the elements in an array exist in the JSONB array.
        
        // We'll search for interviews in the same time window and then filter in JS for panel member conflicts
        // OR use raw SQL if needed. Let's try raw SQL for efficiency.
        
        const existingInterviews = await db.query.interviews.findMany({
            where: and(
                between(interviews.scheduledAt, startTime, endTime),
                eq(interviews.status, 'scheduled')
            )
        })

        for (const interview of existingInterviews) {
            const members = interview.panelMembers as number[]
            const conflict = panelMembers.some(id => members.includes(id))
            if (conflict) {
                throw new ValidationError(`One or more panel members are already scheduled for another interview within this time window.`)
            }
        }

        // 2. Insert interview
        const [interview] = await db.insert(interviews).values({
            vacancyId,
            applicationId,
            scheduledAt,
            venue,
            virtualLink,
            panelMembers,
            status: 'scheduled'
        }).returning()

        // 3. Update application status
        await db.update(applications)
            .set({ status: 'interviewing', updatedAt: new Date() })
            .where(eq(applications.id, applicationId))

        // 4. Log audit action
        await AuditService.logAction({
            adminId,
            action: 'INTERVIEW_SCHEDULED',
            targetType: 'interview',
            targetId: interview.id,
            newState: interview
        })

        return interview
    }

    /**
     * Submits or updates an interview score.
     */
    static async submitScore(data: { 
        interviewId: number, 
        panelMemberId: number, 
        score: number, 
        comments: string, 
        conflictOfInterest: boolean, 
        declarationNotes?: string 
    }) {
        const { interviewId, panelMemberId, score, comments, conflictOfInterest, declarationNotes } = data

        // Check if interview exists
        const interview = await db.query.interviews.findFirst({
            where: eq(interviews.id, interviewId)
        })

        if (!interview) {
            throw new ValidationError('Interview not found.')
        }

        // Check if user is a panel member
        const members = interview.panelMembers as number[]
        if (!members.includes(panelMemberId)) {
            throw new ValidationError('User is not a panel member for this interview.')
        }

        const existingScore = await db.query.interviewScores.findFirst({
            where: and(
                eq(interviewScores.interviewId, interviewId),
                eq(interviewScores.panelMemberId, panelMemberId)
            )
        })

        let result
        if (existingScore) {
            [result] = await db.update(interviewScores)
                .set({ 
                    score, 
                    comments, 
                    conflictOfInterest, 
                    declarationNotes, 
                    updatedAt: new Date() 
                })
                .where(eq(interviewScores.id, existingScore.id))
                .returning()
        } else {
            [result] = await db.insert(interviewScores)
                .values({
                    interviewId,
                    panelMemberId,
                    score,
                    comments,
                    conflictOfInterest,
                    declarationNotes
                })
                .returning()
        }

        await AuditService.logAction({
            adminId: panelMemberId,
            action: 'INTERVIEW_SCORE_SUBMITTED',
            targetType: 'interview_score',
            targetId: result.id,
            newState: result
        })

        return result
    }

    /**
     * Gets aggregated interview results for a vacancy.
     */
    static async getInterviewResults(vacancyId: number) {
        // Fetch all interviews for the vacancy
        const vacancyInterviews = await db.query.interviews.findMany({
            where: eq(interviews.vacancyId, vacancyId),
            with: {
                application: {
                    with: {
                        applicantProfile: true
                    }
                }
            }
        })

        if (vacancyInterviews.length === 0) {
            return []
        }

        const results = []

        for (const interview of vacancyInterviews) {
            const scores = await db.query.interviewScores.findMany({
                where: eq(interviewScores.interviewId, interview.id)
            })

            const totalScore = scores.reduce((sum, s) => sum + s.score, 0)
            const averageScore = scores.length > 0 ? totalScore / scores.length : 0

            results.push({
                interviewId: interview.id,
                applicationId: interview.applicationId,
                applicantName: interview.application?.applicantProfile?.fullName || 'Anonymous',
                tags: (interview.application as any).tags || [],
                scores: scores,
                averageScore: Math.round(averageScore * 100) / 100,
                status: interview.status,
                scheduledAt: interview.scheduledAt
            })
        }

        // Sort by average score descending
        return results.sort((a, b) => b.averageScore - a.averageScore)
    }

    /**
     * Gets interviews assigned to a panel member.
     */
    static async getMyInterviews(panelMemberId: number) {
        // We need to use raw SQL or a custom filter for JSONB array containment
        // Postgres: panel_members @> '[userId]'
        
        return await db.query.interviews.findMany({
            where: sql`${interviews.panelMembers} @> ${JSON.stringify([panelMemberId])}::jsonb`,
            with: {
                vacancy: true,
                application: {
                    with: {
                        applicantProfile: true
                    }
                }
            }
        })
    }
}
