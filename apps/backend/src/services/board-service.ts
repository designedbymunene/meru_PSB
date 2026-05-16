import { db } from '../db'
import { eq, and } from 'drizzle-orm'
import { vacancies, boardResolutions, applications } from '../db/schema'
import { InterviewService } from './interview-service'
import { AuditService } from './audit-service'
import { NotFoundError } from '../utils/errors'
import PDFDocument from 'pdfkit'

export class BoardService {
    /**
     * Generates a PDF board pack for a specific vacancy.
     */
    static async generateBoardPack(vacancyId: number): Promise<Buffer> {
        const vacancy = await db.query.vacancies.findFirst({
            where: eq(vacancies.id, vacancyId),
            with: {
                department: true,
                jobGroup: true
            }
        })

        if (!vacancy) {
            throw new NotFoundError('Vacancy not found')
        }

        const interviewResults = await InterviewService.getInterviewResults(vacancyId)
        
        // Fetch shortlisted count
        const shortlistedApps = await db.query.applications.findMany({
            where: and(
                eq(applications.vacancyId, vacancyId),
                eq(applications.status, 'shortlisted')
            )
        })

        // Fetch total applicants
        const totalApps = await db.query.applications.findMany({
            where: eq(applications.vacancyId, vacancyId)
        })

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 })
            const buffers: Buffer[] = []

            doc.on('data', buffers.push.bind(buffers))
            doc.on('end', () => resolve(Buffer.concat(buffers)))
            doc.on('error', reject)

            // Header
            doc.fontSize(20).text('Meru County Public Service Board', { align: 'center' })
            doc.moveDown()
            doc.fontSize(16).text('Board Pack: Recruitment Summary', { align: 'center' })
            doc.moveDown()
            doc.strokeColor('#333').moveTo(50, doc.y).lineTo(550, doc.y).stroke()
            doc.moveDown()

            // Vacancy Details
            doc.fontSize(14).text('Vacancy Information', { underline: true })
            doc.moveDown(0.5)
            doc.fontSize(12).text(`Title: ${vacancy.title}`)
            doc.text(`Advertisement Number: ${vacancy.advertisementNumber}`)
            doc.text(`Department: ${vacancy.department?.name || 'N/A'}`)
            doc.text(`Job Group: ${vacancy.jobGroup?.name || 'N/A'}`)
            doc.text(`Open Positions: ${vacancy.openPositions}`)
            doc.text(`Closing Date: ${new Date(vacancy.closingDate).toLocaleDateString()}`)
            doc.moveDown()

            // Statistics
            doc.fontSize(14).text('Recruitment Statistics', { underline: true })
            doc.moveDown(0.5)
            doc.fontSize(12).text(`Total Applicants: ${totalApps.length}`)
            doc.text(`Total Shortlisted: ${shortlistedApps.length}`)
            doc.text(`Interviews Conducted: ${interviewResults.length}`)
            doc.moveDown()

            // Interview Results Table
            doc.fontSize(14).text('Interview Results (Ranked by Average Score)', { underline: true })
            doc.moveDown(0.5)

            if (interviewResults.length === 0) {
                doc.fontSize(12).text('No interviews have been conducted for this vacancy.')
            } else {
                // Table Header
                doc.fontSize(10).font('Helvetica-Bold')
                doc.text('Rank', 50, doc.y, { continued: true, width: 40 })
                doc.text('Candidate Name', 90, doc.y, { continued: true, width: 250 })
                doc.text('Avg Score (%)', 350, doc.y, { align: 'right' })
                doc.moveDown(0.5)
                doc.font('Helvetica')
                
                interviewResults.forEach((res, index) => {
                    const currentY = doc.y
                    doc.text(`${index + 1}`, 50, currentY, { width: 40 })
                    doc.text(`${res.applicantName}`, 90, currentY, { width: 250 })
                    doc.text(`${res.averageScore.toFixed(2)}%`, 350, currentY, { align: 'right' })
                    doc.moveDown(0.2)
                })
            }

            // Footer
            const pageCount = doc.bufferedPageRange().count
            for (let i = 0; i < pageCount; i++) {
                doc.switchToPage(i)
                doc.fontSize(8).text(
                    `Generated on ${new Date().toLocaleString()} - Page ${i + 1} of ${pageCount}`,
                    50,
                    750,
                    { align: 'center' }
                )
            }

            doc.end()
        })
    }

    /**
     * Records a board resolution for a vacancy.
     */
    static async recordResolution(data: { vacancyId: number, resolutionText: string, adminId: number }) {
        const { vacancyId, resolutionText, adminId } = data

        const [resolution] = await db.insert(boardResolutions).values({
            vacancyId,
            resolutionText,
            approvedBy: adminId,
            status: 'approved'
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
