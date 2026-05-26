import { db, vacancies, vacancyDocuments, applications, departments, jobGroups } from '../db'
import { eq, desc, and, inArray, sql, or, ilike } from 'drizzle-orm'
import { NotFoundError } from '../utils/errors'
import fs from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { logger } from '../utils/logger'

export class VacancyService {
    static async getStats(requestId?: string) {
        logger.info({ requestId }, '[VacancyService] Fetching stats')
        const [
            totalResult,
            openResult,
            closedResult,
            positionsResult
        ] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(vacancies),
            db.select({ count: sql<number>`count(*)` }).from(vacancies).where(eq(vacancies.status, 'open')),
            db.select({ count: sql<number>`count(*)` }).from(vacancies).where(eq(vacancies.status, 'closed')),
            db.select({ sum: sql<number>`sum(${vacancies.openPositions})` }).from(vacancies).where(eq(vacancies.status, 'open'))
        ])

        return {
            totalVacancies: Number(totalResult[0].count) || 0,
            openVacancies: Number(openResult[0].count) || 0,
            closedVacancies: Number(closedResult[0].count) || 0,
            totalOpenPositions: Number(positionsResult[0].sum) || 0
        }
    }

    static async list(params: {
        status?: string
        departmentId?: string
        jobGroupId?: string
        search?: string
        page: number
        limit: number
    }, requestId?: string) {
        logger.info({ params, requestId }, '[VacancyService] Listing vacancies')
        const { status, departmentId, jobGroupId, search, page, limit } = params
        const offset = (page - 1) * limit

        const conditions = []
        if (status === 'open' || status === 'closed') {
            conditions.push(eq(vacancies.status, status))
        }
        if (departmentId) {
            conditions.push(eq(vacancies.departmentId, parseInt(departmentId)))
        }
        if (jobGroupId) {
            conditions.push(eq(vacancies.jobGroupId, parseInt(jobGroupId)))
        }
        if (search) {
            conditions.push(or(
                ilike(vacancies.title, `%${search}%`),
                ilike(vacancies.advertisementNumber, `%${search}%`)
            ))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const [vacancyList, totalCountResult] = await Promise.all([
            db.select()
                .from(vacancies)
                .where(whereClause)
                .orderBy(desc(vacancies.createdAt))
                .limit(limit)
                .offset(offset),
            db.select({ count: sql<number>`count(*)::int` })
                .from(vacancies)
                .where(whereClause)
        ])

        const totalCount = totalCountResult[0].count

        if (vacancyList.length === 0) {
            return {
                data: [],
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    totalPages: Math.ceil(totalCount / limit)
                }
            }
        }

        const departmentIds = [...new Set(vacancyList.map(v => v.departmentId).filter(Boolean))] as number[]
        const jobGroupIds = [...new Set(vacancyList.map(v => v.jobGroupId))]

        const [departmentList, jobGroupList, applicationCounts] = await Promise.all([
            departmentIds.length > 0
                ? db.select().from(departments).where(inArray(departments.id, departmentIds))
                : Promise.resolve([]),
            db.select().from(jobGroups).where(inArray(jobGroups.id, jobGroupIds)),
            db.select({
                vacancyId: applications.vacancyId,
                count: sql<number>`count(*)::int`
            })
                .from(applications)
                .where(inArray(applications.vacancyId, vacancyList.map(v => v.id)))
                .groupBy(applications.vacancyId)
        ])

        const departmentMap = new Map(departmentList.map(d => [d.id, d]))
        const jobGroupMap = new Map(jobGroupList.map(jg => [jg.id, jg]))
        const applicationCountMap = new Map(applicationCounts.map(ac => [ac.vacancyId, ac.count]))

        const allVacancies = vacancyList.map(vacancy => {
            const { createdAt, updatedAt, creator: _creator, ...vacancyBase } = vacancy as any
            return {
                ...vacancyBase,
                department: vacancy.departmentId ? departmentMap.get(vacancy.departmentId) ?? null : null,
                jobGroup: jobGroupMap.get(vacancy.jobGroupId) ?? null,
                applicationsCount: applicationCountMap.get(vacancy.id) || 0
            }
        })

        return {
            data: allVacancies,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        }
    }

    static async get(id: number, userId?: number, requestId?: string) {
        logger.info({ id, userId, requestId }, '[VacancyService] Fetching vacancy by ID')
        const vacancy = await db.query.vacancies.findFirst({
            where: eq(vacancies.id, id),
            with: {
                creator: {
                    columns: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                department: true,
                jobGroup: true,
                documents: {
                    columns: {
                        id: true,
                        filename: true,
                        originalName: true,
                        fileSize: true,
                        mimeType: true,
                        createdAt: true
                    }
                }
            }
        })

        if (!vacancy) {
            throw new NotFoundError('Vacancy')
        }

        let hasApplied = false
        if (userId) {
            const application = await db.query.applications.findFirst({
                where: and(
                    eq(applications.applicantId, userId),
                    eq(applications.vacancyId, id)
                )
            })
            hasApplied = !!application
        }

        const [{ count: applicationsCount }] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(applications)
            .where(eq(applications.vacancyId, id))

        const { createdAt, updatedAt, creator: _creator, ...vacancyBase } = vacancy as any

        return { ...vacancyBase, hasApplied, applicationsCount }
    }

    static async create(data: {
        advertisementNumber?: string
        title: string
        description: string
        departmentId: number
        jobGroupId: number
        closingDate: string
        openPositions?: number
        jobRequirements?: string[]
        jobResponsibilities?: string[]
        status?: string
    }, userId: number, requestId?: string) {
        logger.info({ data, userId, requestId }, '[VacancyService] Creating vacancy')
        let advertisementNumber = data.advertisementNumber
        if (!advertisementNumber) {
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
            const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase()
            advertisementNumber = `VAC-${dateStr}-${randomSuffix}`
        }

        const [newVacancy] = await db
            .insert(vacancies)
            .values({
                advertisementNumber: advertisementNumber,
                title: data.title,
                description: data.description,
                departmentId: data.departmentId,
                jobGroupId: data.jobGroupId,
                closingDate: data.closingDate,
                openPositions: data.openPositions || 1,
                jobRequirements: data.jobRequirements || [],
                jobResponsibilities: data.jobResponsibilities || [],
                status: data.status || 'open',
                createdBy: userId
            })
            .returning()

        return newVacancy
    }

    static async update(id: number, data: Partial<{
        advertisementNumber: string
        title: string
        description: string
        departmentId: number
        jobGroupId: number
        closingDate: string
        openPositions: number
        jobRequirements: string[]
        jobResponsibilities: string[]
        status: string
    }>, requestId?: string) {
        logger.info({ id, data, requestId }, '[VacancyService] Updating vacancy')
        const [updatedVacancy] = await db
            .update(vacancies)
            .set(data)
            .where(eq(vacancies.id, id))
            .returning()

        if (!updatedVacancy) {
            throw new NotFoundError('Vacancy')
        }

        return updatedVacancy
    }

    static async delete(id: number, requestId?: string) {
        logger.info({ id, requestId }, '[VacancyService] Deleting vacancy')
        const [deletedVacancy] = await db
            .delete(vacancies)
            .where(eq(vacancies.id, id))
            .returning()

        if (!deletedVacancy) {
            throw new NotFoundError('Vacancy')
        }

        const docs = await db.query.vacancyDocuments.findMany({
            where: eq(vacancyDocuments.vacancyId, id)
        })

        for (const doc of docs) {
            try {
                await fs.unlink(doc.filePath)
            } catch (err) {
                logger.error({ err, filePath: doc.filePath, requestId }, '[VacancyService] Failed to delete physical file')
            }
        }

        await db.delete(vacancyDocuments).where(eq(vacancyDocuments.vacancyId, id))
    }

    static async uploadPdf(params: {
        vacancyId: number
        fileName: string
        fileType: string
        buffer: ArrayBuffer
        userId: number
    }, requestId?: string) {
        logger.info({ vacancyId: params.vacancyId, fileName: params.fileName, requestId }, '[VacancyService] Uploading PDF')
        const vacancy = await db.query.vacancies.findFirst({
            where: eq(vacancies.id, params.vacancyId)
        })

        if (!vacancy) {
            throw new NotFoundError('Vacancy')
        }

        const uploadDir = path.join(process.cwd(), 'uploads/vacancies', params.vacancyId.toString())

        if (!existsSync(uploadDir)) {
            await fs.mkdir(uploadDir, { recursive: true })
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = path.extname(params.fileName)
        const filename = `doc-${uniqueSuffix}${ext}`
        const filePath = path.join(uploadDir, filename)

        await fs.writeFile(filePath, Buffer.from(params.buffer))

        const [newDocument] = await db
            .insert(vacancyDocuments)
            .values({
                vacancyId: params.vacancyId,
                filename: filename,
                originalName: params.fileName,
                filePath: filePath,
                fileSize: params.buffer.byteLength,
                mimeType: params.fileType,
                uploadedBy: params.userId
            })
            .returning()

        return newDocument
    }

    static async listPdfs(vacancyId: number, requestId?: string) {
        logger.info({ vacancyId, requestId }, '[VacancyService] Listing PDFs')
        const vacancy = await db.query.vacancies.findFirst({
            where: eq(vacancies.id, vacancyId)
        })

        if (!vacancy) {
            throw new NotFoundError('Vacancy')
        }

        return await db.query.vacancyDocuments.findMany({
            where: eq(vacancyDocuments.vacancyId, vacancyId),
            orderBy: desc(vacancyDocuments.createdAt)
        })
    }

    static async deletePdf(vacancyId: number, pdfId: number, requestId?: string) {
        logger.info({ vacancyId, pdfId, requestId }, '[VacancyService] Deleting PDF')
        const doc = await db.query.vacancyDocuments.findFirst({
            where: eq(vacancyDocuments.id, pdfId)
        })

        if (!doc || doc.vacancyId !== vacancyId) {
            throw new NotFoundError('PDF Document')
        }

        try {
            await fs.unlink(doc.filePath)
        } catch (err) {
            logger.error({ err, filePath: doc.filePath, requestId }, '[VacancyService] Failed to delete physical file')
        }

        await db.delete(vacancyDocuments).where(eq(vacancyDocuments.id, pdfId))
    }
}
