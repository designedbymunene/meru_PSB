import { Hono } from 'hono'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { successResponse, ValidationError, NotFoundError } from '../utils/errors'
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
 * POST /api/interviews/bulk-schedule
 * Bulk schedules interviews for multiple candidates.
 * Admin only.
 */
interviewsRouter.post('/bulk-schedule', authenticate, requireAdmin, async (c) => {
    const user = c.get('user')
    const body = await c.req.json()
    
    if (!body.vacancyId || !body.applicationIds || !body.startAt || !body.durationMinutes || !body.venue || !body.panelMembers) {
        throw new ValidationError('Missing required fields for bulk scheduling')
    }

    const interviews = await InterviewService.bulkScheduleInterviews({
        vacancyId: parseInt(body.vacancyId),
        applicationIds: body.applicationIds,
        startAt: new Date(body.startAt),
        durationMinutes: parseInt(body.durationMinutes),
        gapMinutes: parseInt(body.gapMinutes || '0'),
        venue: body.venue,
        virtualLink: body.virtualLink,
        panelMembers: body.panelMembers,
        adminId: user.userId
    })

    return successResponse(c, interviews, 'Interviews scheduled successfully')
})

/**
 * GET /api/interviews/admin/:vacancyId/default-panel
 * Fetches default panel members for a vacancy.
 */
interviewsRouter.get('/admin/:vacancyId/default-panel', authenticate, requireAdmin, async (c) => {
    const vacancyId = parseInt(c.req.param('vacancyId') || '0')
    if (isNaN(vacancyId)) throw new ValidationError('Invalid vacancyId')

    const panel = await InterviewService.getDefaultPanel(vacancyId)
    return successResponse(c, panel)
})

/**
 * POST /api/interviews/admin/:vacancyId/default-panel
 * Sets default panel members for a vacancy.
 */
interviewsRouter.post('/admin/:vacancyId/default-panel', authenticate, requireAdmin, async (c) => {
    const vacancyId = parseInt(c.req.param('vacancyId') || '0')
    const body = await c.req.json()

    if (isNaN(vacancyId)) throw new ValidationError('Invalid vacancyId')
    if (!Array.isArray(body.userIds)) throw new ValidationError('userIds must be an array')

    const result = await InterviewService.setDefaultPanel(vacancyId, body.userIds)
    return successResponse(c, result, 'Default panel updated successfully')
})

/**
 * GET /api/interviews/admin/:vacancyId/criteria
 * Fetches interview criteria for a vacancy.
 */
interviewsRouter.get('/admin/:vacancyId/criteria', authenticate, requireAdmin, async (c) => {
    const vacancyId = parseInt(c.req.param('vacancyId') || '0')
    if (isNaN(vacancyId)) throw new ValidationError('Invalid vacancyId')

    const criteria = await InterviewService.getInterviewCriteria(vacancyId)
    return successResponse(c, criteria)
})

/**
 * POST /api/interviews/admin/:vacancyId/criteria
 * Sets interview criteria for a vacancy.
 */
interviewsRouter.post('/admin/:vacancyId/criteria', authenticate, requireAdmin, async (c) => {
    const vacancyId = parseInt(c.req.param('vacancyId') || '0')
    const body = await c.req.json()

    if (isNaN(vacancyId)) throw new ValidationError('Invalid vacancyId')
    if (!Array.isArray(body.criteria)) throw new ValidationError('criteria must be an array')

    const result = await InterviewService.setInterviewCriteria(vacancyId, body.criteria)
    return successResponse(c, result, 'Interview criteria updated successfully')
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
 * GET /api/interviews/admin/:id
 * Fetches an interview by ID with full details.
 * Admin only.
 */
interviewsRouter.get('/admin/:id', authenticate, requireAdmin, async (c) => {
    const id = parseInt(c.req.param('id') || '0')
    if (isNaN(id)) throw new ValidationError('Invalid interview ID')

    const interview = await InterviewService.getInterviewById(id)
    if (!interview) throw new NotFoundError('Interview')

    return successResponse(c, interview)
})

/**
 * PATCH /api/interviews/admin/:id/status
 * Updates interview status.
 * Admin only.
 */
interviewsRouter.patch('/admin/:id/status', authenticate, requireAdmin, async (c) => {
    const user = c.get('user')
    const id = parseInt(c.req.param('id') || '0')
    const body = await c.req.json()

    if (isNaN(id)) throw new ValidationError('Invalid interview ID')
    if (!body.status) throw new ValidationError('Status is required')

    const interview = await InterviewService.updateInterviewStatus(id, body.status, user.userId)
    if (!interview) throw new NotFoundError('Interview')

    return successResponse(c, interview, 'Interview status updated successfully')
})

/**
 * PATCH /api/interviews/admin/:id/reschedule
 * Reschedules an interview.
 * Admin only.
 */
interviewsRouter.patch('/admin/:id/reschedule', authenticate, requireAdmin, async (c) => {
    const user = c.get('user')
    const id = parseInt(c.req.param('id') || '0')
    const body = await c.req.json()

    if (isNaN(id)) throw new ValidationError('Invalid interview ID')
    if (!body.scheduledAt || !body.venue) throw new ValidationError('Scheduled date and venue are required')

    const interview = await InterviewService.rescheduleInterview(id, {
        scheduledAt: new Date(body.scheduledAt),
        venue: body.venue,
        virtualLink: body.virtualLink,
        adminId: user.userId
    })
    if (!interview) throw new NotFoundError('Interview')

    return successResponse(c, interview, 'Interview rescheduled successfully')
})

/**
 * GET /api/interviews/admin/:vacancyId/panel
 * Fetches panel members and their activity for a vacancy.
 * Admin only.
 */
interviewsRouter.get('/admin/:vacancyId/panel', authenticate, requireAdmin, async (c) => {
    const vacancyId = parseInt(c.req.param('vacancyId') || '0')
    if (isNaN(vacancyId)) throw new ValidationError('Invalid vacancy ID')

    const panel = await InterviewService.getVacancyPanel(vacancyId)
    return successResponse(c, panel)
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
