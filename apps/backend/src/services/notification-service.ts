import { db } from '../db'
import { users, notifications } from '../db/schema'
import { eq } from 'drizzle-orm'
import { logger } from '../utils/logger'

export type PushNotificationPayload = {
    to: string | string[]
    title?: string
    body: string
    data?: Record<string, any>
    sound?: 'default' | null
    priority?: 'default' | 'normal' | 'high'
}

export type NotificationType = 'application_status' | 'interview_reminder' | 'document_request' | 'application_update' | 'general'

export interface CreateNotificationParams {
    userId: number
    type: NotificationType
    title: string
    message: string
    data?: Record<string, any>
}

export class NotificationService {
    /**
     * Sends a push notification via Expo
     */
    static async sendPushNotification(payload: PushNotificationPayload) {
        logger.info({ to: payload.to }, '[NotificationService] Sending push notification')
        
        try {
            const response = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            const data = await response.json()
            
            if (!response.ok) {
                logger.error({ data }, '[NotificationService] Expo API error')
                return { success: false, error: data }
            }

            logger.info('[NotificationService] Notification sent successfully')
            return { success: true, data }
        } catch (error) {
            logger.error({ err: error }, '[NotificationService] Failed to send push notification')
            return { success: false, error }
        }
    }

    /**
     * Sends a notification to a specific user by their ID
     */
    static async notifyUser(userId: number, title: string, body: string, data?: Record<string, any>) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: {
                pushToken: true
            }
        })

        if (!user?.pushToken) {
            logger.info({ userId }, '[NotificationService] User has no push token. Skipping.')
            return { success: false, error: 'No push token' }
        }

        return this.sendPushNotification({
            to: user.pushToken,
            title,
            body,
            data
        })
    }

    /**
     * Sends a notification to multiple users
     */
    static async notifyUsers(userIds: number[], title: string, body: string, data?: Record<string, any>) {
        const recipients = await db.query.users.findMany({
            where: (users, { inArray }) => inArray(users.id, userIds),
            columns: {
                pushToken: true
            }
        })

        const tokens = recipients
            .map(r => r.pushToken)
            .filter((token): token is string => !!token)

        if (tokens.length === 0) {
            return { success: false, error: 'No push tokens found' }
        }

        return this.sendPushNotification({
            to: tokens,
            title,
            body,
            data
        })
    }

    /**
     * Create an in-app notification for a user
     */
    static async createInAppNotification(params: CreateNotificationParams) {
        const [notification] = await db
            .insert(notifications)
            .values({
                userId: params.userId,
                type: params.type,
                title: params.title,
                message: params.message,
                data: params.data || null,
                read: false
            })
            .returning()

        return notification
    }

    /**
     * Create in-app notifications for multiple users
     */
    static async createInAppNotificationsForUsers(
        userIds: number[],
        params: Omit<CreateNotificationParams, 'userId'>
    ) {
        const notificationsToInsert = userIds.map(userId => ({
            userId,
            type: params.type,
            title: params.title,
            message: params.message,
            data: params.data || null,
            read: false
        }))

        await db.insert(notifications).values(notificationsToInsert)
    }

    /**
     * Notify user of application status change
     */
    static async notifyApplicationStatusChange(
        userId: number,
        applicationId: number,
        jobTitle: string,
        newStatus: string
    ) {
        return this.createInAppNotification({
            userId,
            type: 'application_status',
            title: 'Application Status Updated',
            message: `Your application for ${jobTitle} has been updated to: ${newStatus}`,
            data: { applicationId, jobTitle, newStatus }
        })
    }

    /**
     * Notify user of interview schedule
     */
    static async notifyInterviewScheduled(
        userId: number,
        interviewId: number,
        jobTitle: string,
        scheduleDate: string,
        scheduleTime: string
    ) {
        return this.createInAppNotification({
            userId,
            type: 'interview_reminder',
            title: 'Interview Scheduled',
            message: `You have an interview scheduled for ${jobTitle} on ${scheduleDate} at ${scheduleTime}`,
            data: { interviewId, jobTitle, scheduleDate, scheduleTime }
        })
    }

    /**
     * Notify user of document request
     */
    static async notifyDocumentRequested(
        userId: number,
        applicationId: number,
        documentType: string
    ) {
        return this.createInAppNotification({
            userId,
            type: 'document_request',
            title: 'Additional Documents Required',
            message: `Please submit ${documentType} for your application`,
            data: { applicationId, documentType }
        })
    }

    /**
     * Send general notification
     */
    static async notifyGeneral(
        userId: number,
        title: string,
        message: string,
        data?: Record<string, any>
    ) {
        return this.createInAppNotification({
            userId,
            type: 'general',
            title,
            message,
            data
        })
    }
}
