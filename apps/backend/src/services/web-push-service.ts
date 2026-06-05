import webpush from 'web-push'
import { db } from '../db'
import { webPushSubscriptions } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { logger } from '../utils/logger'
import { getWebPushConfig } from '../utils/env'

let vapidInitialized = false

const ensureVapidInitialized = () => {
    if (!vapidInitialized) {
        const config = getWebPushConfig()
        webpush.setVapidDetails(
            config.VAPID_SUBJECT,
            config.VAPID_PUBLIC_KEY,
            config.VAPID_PRIVATE_KEY
        )
        vapidInitialized = true
        logger.info('[WebPushService] VAPID initialized')
    }
}

export type WebPushSubscription = {
    endpoint: string
    keys: {
        p256dh: string
        auth: string
    }
}

export class WebPushService {
    /**
     * Get VAPID public key for client-side subscription
     */
    static getVapidPublicKey() {
        const config = getWebPushConfig()
        return config.VAPID_PUBLIC_KEY
    }

    /**
     * Subscribe a user to web push notifications
     */
    static async subscribe(userId: number, subscription: WebPushSubscription, userAgent?: string) {
        ensureVapidInitialized()

        // Check if subscription already exists
        const existing = await db.query.webPushSubscriptions.findFirst({
            where: eq(webPushSubscriptions.endpoint, subscription.endpoint)
        })

        if (existing) {
            // Update existing subscription
            await db.update(webPushSubscriptions)
                .set({
                    userId,
                    keys: subscription.keys,
                    userAgent,
                    lastUsed: new Date(),
                    updatedAt: new Date()
                })
                .where(eq(webPushSubscriptions.id, existing.id))

            logger.info({ subscriptionId: existing.id }, '[WebPushService] Updated existing subscription')
            return { success: true, subscriptionId: existing.id }
        }

        // Create new subscription
        const [newSub] = await db.insert(webPushSubscriptions)
            .values({
                userId,
                endpoint: subscription.endpoint,
                keys: subscription.keys,
                userAgent,
                lastUsed: new Date()
            })
            .returning()

        logger.info({ subscriptionId: newSub.id }, '[WebPushService] Created new subscription')
        return { success: true, subscriptionId: newSub.id }
    }

    /**
     * Unsubscribe a user from web push notifications
     */
    static async unsubscribe(userId: number, endpoint: string) {
        await db.delete(webPushSubscriptions)
            .where(and(
                eq(webPushSubscriptions.userId, userId),
                eq(webPushSubscriptions.endpoint, endpoint)
            ))

        logger.info({ userId, endpoint }, '[WebPushService] Subscription removed')
        return { success: true }
    }

    /**
     * Get all subscriptions for a user
     */
    static async getUserSubscriptions(userId: number) {
        return db.query.webPushSubscriptions.findMany({
            where: eq(webPushSubscriptions.userId, userId)
        })
    }

    /**
     * Send a push notification via web push
     */
    static async sendPushNotification(subscription: WebPushSubscription, payload: {
        title: string
        body: string
        icon?: string
        badge?: string
        data?: Record<string, any>
    }) {
        ensureVapidInitialized()

        try {
            await webpush.sendNotification(subscription, JSON.stringify(payload))
            logger.info({ endpoint: subscription.endpoint }, '[WebPushService] Notification sent successfully')
            return { success: true }
        } catch (error: any) {
            if (error.statusCode === 410) {
                // Subscription expired or invalid, delete it
                await db.delete(webPushSubscriptions)
                    .where(eq(webPushSubscriptions.endpoint, subscription.endpoint))
                logger.warn({ endpoint: subscription.endpoint }, '[WebPushService] Subscription expired, deleted')
                return { success: false, error: 'Subscription expired' }
            }
            logger.error({ err: error, endpoint: subscription.endpoint }, '[WebPushService] Failed to send notification')
            return { success: false, error: error.message }
        }
    }

    /**
     * Send a notification to a specific user via web push
     */
    static async notifyUser(userId: number, payload: {
        title: string
        body: string
        icon?: string
        badge?: string
        data?: Record<string, any>
    }) {
        const subscriptions = await this.getUserSubscriptions(userId)

        if (subscriptions.length === 0) {
            return { success: false, error: 'No subscriptions found' }
        }

        const results = await Promise.allSettled(
            subscriptions.map(sub =>
                this.sendPushNotification(
                    { endpoint: sub.endpoint, keys: sub.keys },
                    payload
                )
            )
        )

        const succeeded = results.filter(r => r.status === 'fulfilled' && r.value.success).length
        const failed = results.length - succeeded

        logger.info({ userId, succeeded, failed }, '[WebPushService] Notification sent to user')

        return { success: succeeded > 0, succeeded, failed }
    }

    /**
     * Send notification to multiple users
     */
    static async notifyUsers(userIds: number[], payload: {
        title: string
        body: string
        icon?: string
        badge?: string
        data?: Record<string, any>
    }) {
        const subscriptions = await db.query.webPushSubscriptions.findMany({
            where: (subs, { inArray }) => inArray(subs.userId, userIds)
        })

        if (subscriptions.length === 0) {
            return { success: false, error: 'No subscriptions found' }
        }

        const results = await Promise.allSettled(
            subscriptions.map(sub =>
                this.sendPushNotification(
                    { endpoint: sub.endpoint, keys: sub.keys },
                    payload
                )
            )
        )

        const succeeded = results.filter(r => r.status === 'fulfilled' && r.value.success).length
        const failed = results.length - succeeded

        logger.info({ userIds, succeeded, failed }, '[WebPushService] Notification sent to users')

        return { success: succeeded > 0, succeeded, failed }
    }
}
