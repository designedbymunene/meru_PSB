import { db } from '../db'
import { desc } from 'drizzle-orm'
import { boardResolutions } from '../db/schema'
import { AuditService } from './audit-service'

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
