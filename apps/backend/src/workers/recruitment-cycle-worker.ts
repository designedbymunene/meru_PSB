import { Worker, Job } from 'bullmq';
import { db } from '../db';
import { vacancies, applications, vacanciesArchive, applicationsArchive } from '../db/schema';
import { and, eq, lt } from 'drizzle-orm';
import { redisConnection, QUEUE_NAMES } from '../utils/queue';
import { logger } from '../utils/logger';

export const recruitmentCycleWorker = new Worker(
    QUEUE_NAMES.RECRUITMENT_CYCLE,
    async (job: Job) => {
        logger.info({ jobId: job.id }, '[RecruitmentCycleWorker] Processing job');

        try {
            await db.transaction(async (tx) => {
                // 1. Identify open vacancies past the grace period
                const now = new Date();
                const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
                const dateString = threeDaysAgo.toISOString().split('T')[0];
                
                const expiredVacancies = await tx.select()
                    .from(vacancies)
                    .where(and(
                        eq(vacancies.status, 'open'),
                        lt(vacancies.closingDate, dateString)
                    ));

                if (expiredVacancies.length === 0) {
                    logger.info('[RecruitmentCycleWorker] No expired vacancies to archive');
                    return;
                }

                // 2. Archive
                for (const vacancy of expiredVacancies) {
                    // Archive applications
                    const vacancyApplications = await tx.select()
                        .from(applications)
                        .where(eq(applications.vacancyId, vacancy.id));

                    if (vacancyApplications.length > 0) {
                        await tx.insert(applicationsArchive).values(vacancyApplications.map(app => ({
                            originalId: app.id,
                            applicantId: app.applicantId,
                            vacancyId: app.vacancyId,
                            status: app.status,
                            notes: app.notes,
                            tags: app.tags,
                            rating: app.rating,
                            reviewedAt: app.reviewedAt,
                            reviewedBy: app.reviewedBy,
                            rejectionReason: app.rejectionReason,
                            feedbackToApplicant: app.feedbackToApplicant,
                            profileSnapshot: app.profileSnapshot,
                            lastStep: app.lastStep,
                            partialData: app.partialData,
                            appliedAt: app.appliedAt,
                            createdAt: app.createdAt,
                            updatedAt: app.updatedAt
                        } as any)));
                    }

                    // Archive vacancy
                    await tx.insert(vacanciesArchive).values({
                        originalId: vacancy.id,
                        advertisementNumber: vacancy.advertisementNumber,
                        title: vacancy.title,
                        description: vacancy.description,
                        departmentId: vacancy.departmentId,
                        jobGroupId: vacancy.jobGroupId,
                        closingDate: vacancy.closingDate,
                        openPositions: vacancy.openPositions,
                        jobRequirements: vacancy.jobRequirements,
                        jobResponsibilities: vacancy.jobResponsibilities,
                        status: vacancy.status,
                        createdBy: vacancy.createdBy,
                        createdAt: vacancy.createdAt,
                        updatedAt: vacancy.updatedAt
                    } as any);

                    // 3. Update status
                    await tx.update(vacancies)
                        .set({ status: 'closed' })
                        .where(eq(vacancies.id, vacancy.id));
                }

                logger.info({ count: expiredVacancies.length }, '[RecruitmentCycleWorker] Successfully archived vacancies and applications');
            });
        } catch (error) {
            logger.error({ err: error }, '[RecruitmentCycleWorker] Failed to process job');
            throw error;
        }
    },
    { connection: redisConnection }
);
