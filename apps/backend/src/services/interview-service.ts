import { db } from '../db'
import { eq, and, between, sql } from 'drizzle-orm'
import { interviews, interviewScores, applications, vacancyPanelMembers, interviewCriteria, interviewCriteriaScores, vacancies } from '../db/schema'
import { ValidationError } from '../utils/errors'
import { AuditService } from './audit-service'
import { ApplicationNotificationService } from './application-notification-service'
import PDFDocument from 'pdfkit'

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
        const [updatedApplication] = await db.update(applications)
            .set({ status: 'interviewing', updatedAt: new Date() })
            .where(eq(applications.id, applicationId))
            .returning()

        if (updatedApplication) {
            await ApplicationNotificationService.notifyApplicationStatusChange({
                applicantId: updatedApplication.applicantId,
                applicationId: updatedApplication.id,
                vacancyId: updatedApplication.vacancyId,
                status: 'interviewing',
            })
        }

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
        score?: number, 
        comments: string, 
        conflictOfInterest: boolean, 
        declarationNotes?: string,
        criteriaScores?: { criteriaId: number, score: number }[]
    }) {
        const { interviewId, panelMemberId, score, comments, conflictOfInterest, declarationNotes, criteriaScores } = data

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

        // Calculate final score
        let finalScore = score || 0
        if (criteriaScores && criteriaScores.length > 0) {
            finalScore = criteriaScores.reduce((sum, cs) => sum + cs.score, 0)
        }

        return await db.transaction(async (tx) => {
            const existingScore = await tx.query.interviewScores.findFirst({
                where: and(
                    eq(interviewScores.interviewId, interviewId),
                    eq(interviewScores.panelMemberId, panelMemberId)
                )
            })

            let result
            if (existingScore) {
                [result] = await tx.update(interviewScores)
                    .set({ 
                        score: finalScore, 
                        comments, 
                        conflictOfInterest, 
                        declarationNotes, 
                        updatedAt: new Date() 
                    })
                    .where(eq(interviewScores.id, existingScore.id))
                    .returning()
            } else {
                [result] = await tx.insert(interviewScores)
                    .values({
                        interviewId,
                        panelMemberId,
                        score: finalScore,
                        comments,
                        conflictOfInterest,
                        declarationNotes
                    })
                    .returning()
            }

            // Handle criteria scores
            if (criteriaScores && criteriaScores.length > 0) {
                await tx.delete(interviewCriteriaScores)
                    .where(eq(interviewCriteriaScores.interviewScoreId, result.id))

                const newCriteriaScores = criteriaScores.map(cs => ({
                    interviewScoreId: result.id,
                    criteriaId: cs.criteriaId,
                    score: cs.score
                }))

                await tx.insert(interviewCriteriaScores).values(newCriteriaScores)
            }

            await AuditService.logAction({
                adminId: panelMemberId,
                action: 'INTERVIEW_SCORE_SUBMITTED',
                targetType: 'interview_score',
                targetId: result.id,
                newState: { ...result, criteriaScores }
            })

            return result
        })
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
            return {
                vacancyId,
                interviews: []
            }
        }

        const results = []

        for (const interview of vacancyInterviews) {
            const scores = await db.query.interviewScores.findMany({
                where: eq(interviewScores.interviewId, interview.id),
                with: {
                    criteriaScores: {
                        with: {
                            criteria: true
                        }
                    }
                }
            })

            const totalScore = scores.reduce((sum, s) => sum + s.score, 0)
            const averageScore = scores.length > 0 ? totalScore / scores.length : 0

            results.push({
                interviewId: interview.id,
                applicationId: interview.applicationId,
                applicantName: interview.application?.applicantProfile?.fullName || 'Anonymous',
                tags: (interview.application as any).tags || [],
                scores: scores.map(s => ({
                    panelMemberId: s.panelMemberId,
                    score: s.score,
                    comments: s.comments,
                    criteriaScores: s.criteriaScores.map(cs => ({
                        criteriaName: cs.criteria.name,
                        score: cs.score,
                        maxScore: cs.criteria.maxScore
                    }))
                })),
                averageScore: Math.round(averageScore * 100) / 100,
                scoresSubmitted: scores.length,
                totalPanelMembers: (interview.panelMembers as number[]).length,
                status: interview.status,
                scheduledAt: interview.scheduledAt,
                venue: interview.venue
            })
        }

        // Sort by average score descending
        return {
            vacancyId,
            interviews: results.sort((a, b) => b.averageScore - a.averageScore)
        }
    }

    /**
     * Gets an interview by ID with full details.
     */
    static async getInterviewById(id: number) {
        const interview = await db.query.interviews.findFirst({
            where: eq(interviews.id, id),
            with: {
                vacancy: true,
                application: {
                    with: {
                        applicantProfile: true
                    }
                }
            }
        })

        if (!interview) {
            return null
        }

        const scores = await db.query.interviewScores.findMany({
            where: eq(interviewScores.interviewId, id),
            with: {
                criteriaScores: {
                    with: {
                        criteria: true
                    }
                }
            }
        })

        return {
            ...interview,
            scores
        }
    }

    /**
     * Updates an interview's status.
     */
    static async updateInterviewStatus(id: number, status: 'scheduled' | 'completed' | 'cancelled', adminId: number) {
        const [updated] = await db.update(interviews)
            .set({ status, updatedAt: new Date() })
            .where(eq(interviews.id, id))
            .returning()

        if (!updated) return null

        // If completed, we might want to update application status too
        if (status === 'completed') {
            await db.update(applications)
                .set({ status: 'interviewed', updatedAt: new Date() })
                .where(eq(applications.id, updated.applicationId))
        }

        await AuditService.logAction({
            adminId,
            action: `INTERVIEW_STATUS_${status.toUpperCase()}`,
            targetType: 'interview',
            targetId: id,
            newState: updated
        })

        return updated
    }

    /**
     * Reschedules an interview.
     */
    static async rescheduleInterview(id: number, data: { scheduledAt: Date, venue: string, virtualLink?: string, adminId: number }) {
        const { scheduledAt, venue, virtualLink, adminId } = data

        const [updated] = await db.update(interviews)
            .set({ 
                scheduledAt, 
                venue, 
                virtualLink, 
                updatedAt: new Date() 
            })
            .where(eq(interviews.id, id))
            .returning()

        if (!updated) return null

        await AuditService.logAction({
            adminId,
            action: 'INTERVIEW_RESCHEDULED',
            targetType: 'interview',
            targetId: id,
            newState: updated
        })

        return updated
    }

    /**
     * Gets all panel members and their scores/declarations for a vacancy.
     */
    static async getVacancyPanel(vacancyId: number) {
        const vacancyInterviews = await db.query.interviews.findMany({
            where: eq(interviews.vacancyId, vacancyId)
        })

        const panelMemberIds = new Set<number>()
        vacancyInterviews.forEach(i => {
            (i.panelMembers as number[]).forEach(id => panelMemberIds.add(id))
        })

        const panelData = []
        for (const memberId of panelMemberIds) {
            const scores = await db.query.interviewScores.findMany({
                where: eq(interviewScores.panelMemberId, memberId)
            })

            panelData.push({
                memberId,
                totalAssessments: scores.length,
                conflictsDeclared: scores.filter(s => s.conflictOfInterest).length,
                declarations: scores.filter(s => s.conflictOfInterest).map(s => ({
                    interviewId: s.interviewId,
                    notes: s.declarationNotes
                }))
            })
        }

        return panelData
    }

    /**
     * Gets interviews assigned to a panel member.
     */
    static async getMyInterviews(panelMemberId: number) {
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

    /**
     * Gets default panel members for a vacancy.
     */
    static async getDefaultPanel(vacancyId: number) {
        return await db.query.vacancyPanelMembers.findMany({
            where: eq(vacancyPanelMembers.vacancyId, vacancyId),
            with: {
                user: true
            }
        })
    }

    /**
     * Sets default panel members for a vacancy.
     */
    static async setDefaultPanel(vacancyId: number, userIds: number[]) {
        return await db.transaction(async (tx) => {
            await tx.delete(vacancyPanelMembers)
                .where(eq(vacancyPanelMembers.vacancyId, vacancyId))

            if (userIds.length === 0) return []

            const newMembers = userIds.map(userId => ({
                vacancyId,
                userId
            }))

            return await tx.insert(vacancyPanelMembers)
                .values(newMembers)
                .returning()
        })
    }

    /**
     * Bulk schedules interviews for multiple applications.
     */
    static async bulkScheduleInterviews(data: {
        vacancyId: number,
        applicationIds: number[],
        startAt: Date,
        durationMinutes: number,
        gapMinutes: number,
        venue: string,
        virtualLink?: string,
        panelMembers: number[],
        adminId: number
    }) {
        const { vacancyId, applicationIds, startAt, durationMinutes, gapMinutes, venue, virtualLink, panelMembers, adminId } = data

        const results = []
        let currentStartTime = new Date(startAt)

        return await db.transaction(async (tx) => {
            for (const applicationId of applicationIds) {
                const [interview] = await tx.insert(interviews).values({
                    vacancyId,
                    applicationId,
                    scheduledAt: new Date(currentStartTime),
                    venue,
                    virtualLink,
                    panelMembers,
                    status: 'scheduled'
                }).returning()

                await tx.update(applications)
                    .set({ status: 'interviewing', updatedAt: new Date() })
                    .where(eq(applications.id, applicationId))

                results.push(interview)

                await AuditService.logAction({
                    adminId,
                    action: 'INTERVIEW_SCHEDULED',
                    targetType: 'interview',
                    targetId: interview.id,
                    newState: interview
                })
                
                currentStartTime = new Date(currentStartTime.getTime() + (durationMinutes + gapMinutes) * 60 * 1000)
            }
            return results
        })
    }

    /**
     * Gets interview criteria for a vacancy.
     */
    static async getInterviewCriteria(vacancyId: number) {
        return await db.query.interviewCriteria.findMany({
            where: eq(interviewCriteria.vacancyId, vacancyId)
        })
    }

    /**
     * Sets interview criteria for a vacancy.
     */
    static async setInterviewCriteria(vacancyId: number, criteria: { name: string, maxScore: number, description?: string }[]) {
        return await db.transaction(async (tx) => {
            await tx.delete(interviewCriteria)
                .where(eq(interviewCriteria.vacancyId, vacancyId))

            if (criteria.length === 0) return []

            const newCriteria = criteria.map(c => ({
                vacancyId,
                ...c
            }))

            return await tx.insert(interviewCriteria)
                .values(newCriteria)
                .returning()
        })
    }

    /**
     * Generates a formal PDF report for interview results.
     */
    static async generatePanelReport(vacancyId: number) {
        const results = await this.getInterviewResults(vacancyId)
        const vacancy = await db.query.vacancies.findFirst({
            where: eq(vacancies.id, vacancyId)
        })

        if (!vacancy) throw new ValidationError('Vacancy not found')

        return new Promise<{ buffer: Buffer, filename: string }>((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50, size: 'A4' })
            const chunks: Buffer[] = []

            doc.on('data', (chunk) => chunks.push(chunk))
            doc.on('end', () => resolve({ 
                buffer: Buffer.concat(chunks),
                filename: `Interview_Report_${vacancy.advertisementNumber.replace(/\//g, '_')}.pdf`
            }))

            // Helper to draw horizontal line
            const line = (y: number) => doc.moveTo(50, y).lineTo(545, y).stroke()

            // Header
            doc.fontSize(16).font('Helvetica-Bold').text('MERU COUNTY PUBLIC SERVICE BOARD', { align: 'center' })
            doc.fontSize(12).text('RECRUITMENT AND SELECTION PANEL REPORT', { align: 'center' })
            doc.moveDown()
            line(doc.y)
            doc.moveDown(0.5)

            // Vacancy Info
            doc.fontSize(10).font('Helvetica-Bold').text('Position: ', { continued: true }).font('Helvetica').text(vacancy.title)
            doc.font('Helvetica-Bold').text('Advertisement Ref: ', { continued: true }).font('Helvetica').text(vacancy.advertisementNumber)
            doc.font('Helvetica-Bold').text('Report Date: ', { continued: true }).font('Helvetica').text(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
            doc.moveDown()
            line(doc.y)
            doc.moveDown()

            // Summary Table
            doc.fontSize(11).font('Helvetica-Bold').text('Candidate Performance Summary')
            doc.moveDown(0.5)

            const startY = doc.y
            doc.fontSize(9).font('Helvetica-Bold')
            doc.text('RANK', 50, startY)
            doc.text('CANDIDATE NAME', 90, startY)
            doc.text('APP ID', 300, startY)
            doc.text('SCORE (AVG)', 380, startY, { width: 80, align: 'right' })
            doc.text('STATUS', 480, startY, { width: 65, align: 'right' })
            doc.moveDown(0.5)
            line(doc.y)
            doc.moveDown(0.5)

            doc.font('Helvetica')
            results.interviews.forEach((interview, index) => {
                if (doc.y > 750) doc.addPage()
                const y = doc.y
                doc.text(`${index + 1}`, 50, y)
                doc.text(interview.applicantName.toUpperCase(), 90, y)
                doc.text(`#${interview.applicationId}`, 300, y)
                doc.text(`${interview.averageScore.toFixed(1)}%`, 380, y, { width: 80, align: 'right' })
                doc.text(interview.status.toUpperCase(), 480, y, { width: 65, align: 'right' })
                doc.moveDown(0.5)
            })

            doc.moveDown(2)
            
            // Signatures
            if (doc.y > 650) doc.addPage()
            doc.fontSize(11).font('Helvetica-Bold').text('Authentication')
            doc.moveDown()
            doc.fontSize(10).font('Helvetica').text('We, the undersigned members of the interview panel, certify that the above results are a true reflection of the candidates\' performance.')
            doc.moveDown(2)

            const sigY = doc.y
            doc.text('__________________________', 50, sigY)
            doc.text('CHAIRPERSON', 50, sigY + 15)

            doc.text('__________________________', 350, sigY)
            doc.text('SECRETARY', 350, sigY + 15)

            doc.end()
        })
    }
}
