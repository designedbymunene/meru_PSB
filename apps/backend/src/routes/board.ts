import { Hono } from 'hono'
import { z } from 'zod'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { validate } from '../middleware/validation'
import { BoardService } from '../services/board-service'
import { successResponse, ValidationError } from '../utils/errors'

export const boardRouter = new Hono()

const recordResolutionSchema = z.object({
    vacancyId: z.number().int().positive(),
    resolutionText: z.string().min(1, 'Resolution text is required')
})

/**
 * GET /api/board/resolutions
 * Fetches recent board resolutions.
 * Restricted to admins.
 */
boardRouter.get('/resolutions', authenticate, requireAdmin, async (c) => {
    const resolutions = await BoardService.getResolutions()
    return successResponse(c, resolutions)
})

/**
 * POST /api/board/resolution
 * Records a board resolution for a vacancy.
 * Restricted to admins.
 */
boardRouter.post('/resolution', authenticate, requireAdmin, validate(recordResolutionSchema), async (c) => {
    const user = c.get('user')
    const data = c.get('validatedData') as { vacancyId: number; resolutionText: string }
    
    const resolution = await BoardService.recordResolution({
        vacancyId: data.vacancyId,
        resolutionText: data.resolutionText,
        adminId: user.userId
    })
    
    return successResponse(c, resolution, 'Resolution recorded successfully')
})

