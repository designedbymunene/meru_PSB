import { notificationQueue } from '../utils/queue'
import { isApplicationNotificationStatus } from '../utils/application-status'
import { logger } from '../utils/logger'

type ApplicationStatusNotificationInput = {
    applicantId: number
    applicationId: number
    vacancyId: number
    status: string
    feedbackToApplicant?: string | null
    rejectionReason?: string | null
}

export class ApplicationNotificationService {
    static async notifyApplicationStatusChange(input: ApplicationStatusNotificationInput) {
        if (!isApplicationNotificationStatus(input.status)) {
            return { success: true, skipped: true }
        }

        try {
            logger.info({ applicantId: input.applicantId, vacancyId: input.vacancyId }, '[ApplicationNotificationService] Enqueuing notification job')
            
            const job = await notificationQueue.add('application_status_change', {
                type: 'application_status_change',
                payload: input
            })

            return {
                success: true,
                jobId: job.id
            }
        } catch (error) {
            logger.error({ err: error, input }, '[ApplicationNotificationService] Failed to enqueue notification job')
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown queue error'
            }
        }
    }
}
