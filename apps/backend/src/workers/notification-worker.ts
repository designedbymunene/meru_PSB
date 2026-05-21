import { Worker, Job } from 'bullmq';
import { db } from '../db';
import { users, vacancies } from '../db/schema';
import { eq } from 'drizzle-orm';
import { NotificationService } from '../services/notification-service';
import { sendApplicationStatusEmail } from '../utils/mailer';
import { getApplicationStatusLabel, isApplicationNotificationStatus } from '../utils/application-status';
import { redisConnection, QUEUE_NAMES } from '../utils/queue';
import { logger } from '../utils/logger';

export const notificationWorker = new Worker(
    QUEUE_NAMES.NOTIFICATIONS,
    async (job: Job) => {
        const { type, payload } = job.data;
        logger.info({ jobId: job.id, type }, '[NotificationWorker] Processing job');

        if (type === 'application_status_change') {
            const { applicantId, vacancyId, applicationId, status, feedbackToApplicant, rejectionReason } = payload;

            if (!isApplicationNotificationStatus(status)) {
                logger.info({ jobId: job.id, status }, '[NotificationWorker] Skipped: invalid notification status');
                return;
            }

            const [applicant, vacancy] = await Promise.all([
                db.query.users.findFirst({
                    where: eq(users.id, applicantId),
                    columns: {
                        email: true,
                        fullName: true,
                        pushToken: true,
                    },
                }),
                db.query.vacancies.findFirst({
                    where: eq(vacancies.id, vacancyId),
                    columns: {
                        title: true,
                    },
                }),
            ]);

            if (!applicant) {
                logger.error({ jobId: job.id, applicantId }, '[NotificationWorker] Applicant not found');
                throw new Error(`Applicant not found: ${applicantId}`);
            }

            if (!vacancy) {
                logger.error({ jobId: job.id, vacancyId }, '[NotificationWorker] Vacancy not found');
                throw new Error(`Vacancy not found: ${vacancyId}`);
            }

            const statusLabel = getApplicationStatusLabel(status);
            const title = statusLabel === 'Not Successful'
                ? 'Application Update - Not Successful'
                : `Application Update - ${statusLabel}`;
            const body = `Your application for ${vacancy.title} is now ${statusLabel}.`;

            const [emailResult, pushResult] = await Promise.all([
                applicant.email
                    ? sendApplicationStatusEmail({
                          to: applicant.email,
                          fullName: applicant.fullName,
                          vacancyTitle: vacancy.title,
                          status,
                          feedbackToApplicant,
                          rejectionReason,
                      })
                    : Promise.resolve({ success: false, error: 'No applicant email' }),
                applicant.pushToken
                    ? NotificationService.sendPushNotification({
                          to: applicant.pushToken,
                          title,
                          body,
                          data: {
                              applicationId,
                              vacancyId,
                              status,
                              statusLabel,
                          },
                          priority: 'high',
                          sound: 'default',
                      })
                    : Promise.resolve({ success: false, error: 'No push token' }),
            ]);

            logger.info({
                jobId: job.id,
                emailSuccess: emailResult?.success,
                pushSuccess: pushResult?.success
            }, '[NotificationWorker] Job processed successfully');
        } else {
            logger.warn({ jobId: job.id, type }, '[NotificationWorker] Unknown job type');
        }
    },
    {
        connection: redisConnection,
        concurrency: 5 // Process up to 5 jobs concurrently
    }
);

notificationWorker.on('completed', (job) => {
    logger.debug({ jobId: job.id }, '[NotificationWorker] Job completed successfully');
});

notificationWorker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, '[NotificationWorker] Job failed');
});
