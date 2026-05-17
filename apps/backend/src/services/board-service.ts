import { db } from '../db'
import { eq, and, desc } from 'drizzle-orm'
import { vacancies, boardResolutions, applications, shortlistCriteria, applicantProfiles, ethnicities, users } from '../db/schema'
import { InterviewService } from './interview-service'
import { AuditService } from './audit-service'
import { NotFoundError } from '../utils/errors'
import PDFDocument from 'pdfkit'

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
        
        // Fetch shortlist criteria
        const criteria = await db.query.shortlistCriteria.findFirst({
            where: eq(shortlistCriteria.vacancyId, vacancyId)
        })

        // Fetch applications with profiles for diversity analytics
        const allApps = await db.query.applications.findMany({
            where: eq(applications.vacancyId, vacancyId),
            with: {
                applicantProfile: {
                    with: {
                        ethnicity: true
                    }
                }
            }
        })

        const shortlistedApps = allApps.filter(app => app.status === 'shortlisted')

        // Analytics calculation helper
        const getAnalytics = (apps: typeof allApps) => {
            const stats = {
                gender: { male: 0, female: 0, other: 0 },
                disability: 0,
                ethnicities: {} as Record<string, number>
            }

            apps.forEach(app => {
                const profile = app.applicantProfile
                if (!profile) return

                // Gender
                const gender = profile.gender?.toLowerCase()
                if (gender === 'male') stats.gender.male++
                else if (gender === 'female') stats.gender.female++
                else stats.gender.other++

                // Disability
                if (profile.impairment) stats.disability++

                // Ethnicity
                const ethName = profile.ethnicity?.name || 'Unknown'
                stats.ethnicities[ethName] = (stats.ethnicities[ethName] || 0) + 1
            })

            return stats
        }

        const totalStats = getAnalytics(allApps)
        const shortlistedStats = getAnalytics(shortlistedApps)

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 })
            const buffers: Buffer[] = []

            doc.on('data', buffers.push.bind(buffers))
            doc.on('end', () => resolve(Buffer.concat(buffers)))
            doc.on('error', reject)

            // Header
            doc.fontSize(20).font('Helvetica-Bold').text('MERU COUNTY PUBLIC SERVICE BOARD', { align: 'center' })
            doc.moveDown(0.2)
            doc.fontSize(14).font('Helvetica').text('Official Recruitment Board Pack', { align: 'center' })
            doc.moveDown()
            doc.strokeColor('#333').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke()
            doc.moveDown()

            // 1. Vacancy Details
            doc.fontSize(16).font('Helvetica-Bold').text('1. Vacancy Information')
            doc.moveDown(0.5)
            doc.fontSize(11).font('Helvetica')
            const details = [
                ['Position Title:', vacancy.title],
                ['Advert Number:', vacancy.advertisementNumber],
                ['Department:', vacancy.department?.name || 'N/A'],
                ['Job Group:', vacancy.jobGroup?.name || 'N/A'],
                ['Positions:', vacancy.openPositions.toString()],
                ['Closing Date:', new Date(vacancy.closingDate).toLocaleDateString()]
            ]
            
            details.forEach(([label, value]) => {
                doc.font('Helvetica-Bold').text(label, 60, doc.y, { continued: true })
                doc.font('Helvetica').text(` ${value}`, 160)
            })
            doc.moveDown()

            // 2. Shortlisting Criteria
            doc.fontSize(16).font('Helvetica-Bold').text('2. Shortlisting Criteria')
            doc.moveDown(0.5)
            if (criteria) {
                doc.fontSize(11).font('Helvetica').text(`Minimum Score Required: ${criteria.minScore}%`)
                doc.moveDown(0.2)
                doc.text('Scoring Weights Applied:')
                const weights = criteria.weights as Record<string, number>
                Object.entries(weights).forEach(([key, val]) => {
                    doc.text(`• ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${val}%`, 70)
                })
            } else {
                doc.fontSize(11).font('Helvetica').italic().text('Standard shortlisting criteria applied.')
            }
            doc.moveDown()

            // 3. Diversity & Inclusion Analytics
            doc.fontSize(16).font('Helvetica-Bold').text('3. Diversity & Inclusion Analytics')
            doc.moveDown(0.5)
            
            // Table Header for Analytics
            const drawStatRow = (label: string, total: number, shortlisted: number) => {
                const currentY = doc.y
                doc.fontSize(11).font('Helvetica').text(label, 60, currentY, { width: 150 })
                doc.text(total.toString(), 250, currentY, { width: 100, align: 'center' })
                doc.text(shortlisted.toString(), 350, currentY, { width: 100, align: 'center' })
                doc.moveDown(0.2)
            }

            doc.fontSize(10).font('Helvetica-Bold')
            doc.text('Metric', 60, doc.y, { continued: true, width: 150 })
            doc.text('Total Applicants', 250, doc.y, { continued: true, width: 100, align: 'center' })
            doc.text('Shortlisted', 350, doc.y, { width: 100, align: 'center' })
            doc.moveDown(0.5)
            doc.strokeColor('#eee').moveTo(60, doc.y).lineTo(500, doc.y).stroke()
            doc.moveDown(0.3)

            drawStatRow('Total Count', allApps.length, shortlistedApps.length)
            drawStatRow('Gender: Male', totalStats.gender.male, shortlistedStats.gender.male)
            drawStatRow('Gender: Female', totalStats.gender.female, shortlistedStats.gender.female)
            drawStatRow('Persons with Disability', totalStats.disability, shortlistedStats.disability)
            
            doc.moveDown()

            // 4. Interview Rankings
            doc.addPage()
            doc.fontSize(16).font('Helvetica-Bold').text('4. Interview Rankings (Final Scores)')
            doc.moveDown(0.5)

            if (interviewResults.length === 0) {
                doc.fontSize(12).font('Helvetica').text('No interviews have been conducted for this vacancy.')
            } else {
                doc.fontSize(10).font('Helvetica-Bold')
                doc.text('Rank', 50, doc.y, { continued: true, width: 40 })
                doc.text('Candidate Name', 90, doc.y, { continued: true, width: 200 })
                doc.text('Internal Tags', 290, doc.y, { continued: true, width: 150 })
                doc.text('Score (%)', 450, doc.y, { align: 'right' })
                doc.moveDown(0.5)
                doc.strokeColor('#333').moveTo(50, doc.y).lineTo(550, doc.y).stroke()
                doc.moveDown(0.5)
                
                doc.font('Helvetica')
                interviewResults.forEach((res, index) => {
                    const currentY = doc.y
                    // Highlight top candidates (within open positions)
                    if (index < vacancy.openPositions) {
                        doc.rect(45, currentY - 2, 510, 15).fill('#f0f9ff')
                        doc.fillColor('#000')
                    }
                    
                    doc.text(`${index + 1}`, 50, currentY, { width: 40 })
                    doc.text(`${res.applicantName}`, 90, currentY, { width: 200 })
                    
                    const tags = (res as any).tags || []
                    doc.fontSize(8).text(tags.join(', ') || '-', 290, currentY, { width: 150 })
                    doc.fontSize(10).text(`${res.averageScore.toFixed(2)}%`, 450, currentY, { align: 'right' })
                    doc.moveDown(0.5)
                    
                    if (doc.y > 700) doc.addPage()
                })
            }

            // Footer
            const pageCount = doc.bufferedPageRange().count
            for (let i = 0; i < pageCount; i++) {
                doc.switchToPage(i)
                doc.fontSize(8).fillColor('#666').text(
                    `Meru County PSB - Confidential - Generated on ${new Date().toLocaleString()} - Page ${i + 1} of ${pageCount}`,
                    50,
                    760,
                    { align: 'center' }
                )
            }

            doc.end()
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
