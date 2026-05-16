import { Hono } from 'hono'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { successResponse, ValidationError } from '../utils/errors'
import { InterviewService } from '../services/interview-service'

export const interviewsRouter = new Hono()

/**
 * POST /api/interviews/schedule
 * Schedules a new interview.
 * Admin only.
 */
interviewsRouter.post('/schedule', authenticate, requireAdmin, async (c) => {
    const user = c.get('user')
    const body = await c.req.json()
    
    if (!body.vacancyId || !body.applicationId || !body.scheduledAt || !body.venue || !body.panelMembers) {
        throw new ValidationError('Missing required fields: vacancyId, applicationId, scheduledAt, venue, panelMembers')
    }

    const interview = await InterviewService.scheduleInterview({
        vacancyId: parseInt(body.vacancyId),
        applicationId: parseInt(body.applicationId),
        scheduledAt: new Date(body.scheduledAt),
        venue: body.venue,
        virtualLink: body.virtualLink,
        panelMembers: body.panelMembers,
        adminId: user.userId
    })

    return successResponse(c, interview, 'Interview scheduled successfully')
})

/**
 * POST /api/interviews/:interviewId/score
 * Submits or updates an interview score.
 * Authenticated users (Panel members).
 */
interviewsRouter.post('/:interviewId/score', authenticate, async (c) => {
    const user = c.get('user')
    const interviewId = parseInt(c.req.param('interviewId') || '0')
    const body = await c.req.json()

    if (isNaN(interviewId)) {
        throw new ValidationError('Invalid interviewId')
    }

    if (body.score === undefined || !body.comments) {
        throw new ValidationError('Missing required fields: score, comments')
    }

    const result = await InterviewService.submitScore({
        interviewId,
        panelMemberId: user.userId,
        score: parseInt(body.score),
        comments: body.comments,
        conflictOfInterest: !!body.conflictOfInterest,
        declarationNotes: body.declarationNotes
    })

    return successResponse(c, result, 'Score submitted successfully')
})

/**
 * GET /api/interviews/:vacancyId/results
 * Fetches aggregated results for a vacancy.
 * Admin only.
 */
interviewsRouter.get('/:vacancyId/results', authenticate, requireAdmin, async (c) => {
    const vacancyId = parseInt(c.req.param('vacancyId') || '0')
    
    if (isNaN(vacancyId)) {
        throw new ValidationError('Invalid vacancyId')
    }

    const results = await InterviewService.getInterviewResults(vacancyId)
    return successResponse(c, results)
})

/**
 * GET /api/interviews/my-interviews
 * Fetches interviews assigned to the current user (if they are a panel member).
 * Authenticated users.
 */
interviewsRouter.get('/my-interviews', authenticate, async (c) => {
    const user = c.get('user')
    const results = await InterviewService.getMyInterviews(user.userId)
    return successResponse(c, results)
})
