import { db } from '../db'
import { users, vacancies } from '../db/schema'
import { eq } from 'drizzle-orm'
import { NotificationService } from './notification-service'
import { sendApplicationStatusEmail } from '../utils/mailer'
import { getApplicationStatusLabel, isApplicationNotificationStatus } from '../utils/application-status'

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

        const [applicant, vacancy] = await Promise.all([
            db.query.users.findFirst({
                where: eq(users.id, input.applicantId),
                columns: {
                    email: true,
                    fullName: true,
                    pushToken: true,
                },
            }),
            db.query.vacancies.findFirst({
                where: eq(vacancies.id, input.vacancyId),
                columns: {
                    title: true,
                },
            }),
        ])

        if (!applicant) {
            console.error(`[ApplicationNotificationService] Applicant ${input.applicantId} not found`)
            return { success: false, error: 'Applicant not found' }
        }

        if (!vacancy) {
            console.error(`[ApplicationNotificationService] Vacancy ${input.vacancyId} not found`)
            return { success: false, error: 'Vacancy not found' }
        }

        const statusLabel = getApplicationStatusLabel(input.status)
        const title = statusLabel === 'Not Successful'
            ? 'Application Update - Not Successful'
            : `Application Update - ${statusLabel}`
        const body = `Your application for ${vacancy.title} is now ${statusLabel}.`

        const [emailResult, pushResult] = await Promise.all([
            applicant.email
                ? sendApplicationStatusEmail({
                      to: applicant.email,
                      fullName: applicant.fullName,
                      vacancyTitle: vacancy.title,
                      status: input.status,
                      feedbackToApplicant: input.feedbackToApplicant,
                      rejectionReason: input.rejectionReason,
                  })
                : Promise.resolve({ success: false, error: 'No applicant email' }),
            applicant.pushToken
                ? NotificationService.sendPushNotification({
                      to: applicant.pushToken,
                      title,
                      body,
                      data: {
                          applicationId: input.applicationId,
                          vacancyId: input.vacancyId,
                          status: input.status,
                          statusLabel,
                      },
                      priority: 'high',
                      sound: 'default',
                  })
                : Promise.resolve({ success: false, error: 'No push token' }),
        ])

        return {
            success: true,
            email: emailResult,
            push: pushResult,
        }
    }
}
