import { Hono } from 'hono'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { BoardService } from '../services/board-service'
import { successResponse } from '../utils/errors'

export const boardRouter = new Hono()

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
 * GET /api/board/pack/:vacancyId
 * Generates and streams a PDF board pack for a vacancy.
 * Restricted to admins.
 */
boardRouter.get('/pack/:vacancyId', authenticate, requireAdmin, async (c) => {
    const vacancyId = parseInt(c.req.param('vacancyId'))
    const buffer = await BoardService.generateBoardPack(vacancyId)
    
    return c.body(buffer, 200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="board-pack-${vacancyId}.pdf"`
    })
})

/**
 * POST /api/board/resolution
 * Records a board resolution for a vacancy.
 * Restricted to admins.
 */
boardRouter.post('/resolution', authenticate, requireAdmin, async (c) => {
    const user = c.get('user' as never) as { userId: number }
    const body = await c.req.json()
    
    const resolution = await BoardService.recordResolution({
        vacancyId: body.vacancyId,
        resolutionText: body.resolutionText,
        adminId: user.userId
    })
    
    return successResponse(c, resolution, 'Resolution recorded successfully')
})
