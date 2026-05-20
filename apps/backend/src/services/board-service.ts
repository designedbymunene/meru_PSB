import { db } from '../db'
import { eq, desc } from 'drizzle-orm'
import { vacancies, boardResolutions, applications, shortlistCriteria } from '../db/schema'
import { InterviewService } from './interview-service'
import { AuditService } from './audit-service'
import { NotFoundError } from '../utils/errors'

export class BoardService {
    /**
     * Fetches recent board resolutions.
     */
    static async getResolutions(limit = 50) {
        return db.query.boardResolutions.findMany({
            with: {
                vacancy: {
                    with: {
                        department: true
                    }
                },
                approver: true
            },
            orderBy: [desc(boardResolutions.createdAt)],
            limit
        })
    }

    /**
     * Records a board resolution for a vacancy.
     */
    static async recordResolution(data: { vacancyId: number, resolutionText: string, adminId: number, status?: 'draft' | 'approved' }) {
        const { vacancyId, resolutionText, adminId, status = 'approved' } = data

        const [resolution] = await db.insert(boardResolutions).values({
            vacancyId,
            resolutionText,
            approvedBy: adminId,
            status
        }).returning()

        await AuditService.logAction({
            adminId,
            action: 'BOARD_RESOLUTION_RECORDED',
            targetType: 'board_resolution',
            targetId: resolution.id,
            newState: resolution
        })

        return resolution
    }
}
