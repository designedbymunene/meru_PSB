import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

export type PushNotificationPayload = {
    to: string | string[]
    title?: string
    body: string
    data?: Record<string, any>
    sound?: 'default' | null
    priority?: 'default' | 'normal' | 'high'
}

export class NotificationService {
    /**
     * Sends a push notification via Expo
     */
    static async sendPushNotification(payload: PushNotificationPayload) {
        console.log(`[NotificationService] Sending push notification to: ${payload.to}`)
        
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
                console.error(`[NotificationService] Expo API error:`, data)
                return { success: false, error: data }
            }

            console.log(`[NotificationService] Notification sent successfully`)
            return { success: true, data }
        } catch (error) {
            console.error(`[NotificationService] Failed to send push notification:`, error)
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
            console.log(`[NotificationService] User ${userId} has no push token. Skipping.`)
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
}
