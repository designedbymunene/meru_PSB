import { Hono } from 'hono'
import { db } from '../db'
import { notifications, notificationPreferences, users } from '../db/schema'
import { eq, desc, and, sql } from 'drizzle-orm'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { successResponse, NotFoundError, ValidationError } from '../utils/errors'
import { buildPagination, parsePagination } from '../utils/pagination'
import { validate } from '../middleware/validation'
import { z } from 'zod'
import { WebPushService } from '../services/web-push-service'
import { NotificationService } from '../services/notification-service'

export const notificationsRouter = new Hono()

const updateNotificationPreferencesSchema = z.object({
    statusUpdates: z.enum(['email', 'push', 'in_app', 'none']).optional(),
    interviewReminders: z.enum(['email', 'push', 'in_app', 'none']).optional(),
    documentRequests: z.enum(['email', 'push', 'in_app', 'none']).optional(),
    emailDigest: z.enum(['instant', 'daily', 'weekly', 'none']).optional()
})

// GET /api/notifications - Get user notifications with pagination
notificationsRouter.get('/', authenticate, async (c) => {
    try {
        const user = c.get('user')
        const { page = '1', limit = '20' } = c.req.query()
        const { offset, limit: pageSize } = parsePagination(page, limit)

        const userNotifications = await db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, user.userId))
            .orderBy(desc(notifications.createdAt))
            .limit(pageSize)
            .offset(offset)

        const [{ total }] = await db
            .select({ total: sql<number>`count(*)::int` })
            .from(notifications)
            .where(eq(notifications.userId, user.userId))

        const pagination = buildPagination(total, parseInt(page), pageSize)

        return successResponse(c, {
            data: userNotifications,
            pagination
        })
    } catch (error) {
        throw error
    }
})

// GET /api/notifications/unread-count - Get unread notification count
notificationsRouter.get('/unread-count', authenticate, async (c) => {
    try {
        const user = c.get('user')

        const [{ unreadCount }] = await db
            .select({ unreadCount: sql<number>`count(*)::int` })
            .from(notifications)
            .where(and(
                eq(notifications.userId, user.userId),
                eq(notifications.read, false)
            ))

        return successResponse(c, { unreadCount })
    } catch (error) {
        throw error
    }
})

// GET /api/notifications/preferences - Get user notification preferences
notificationsRouter.get('/preferences', authenticate, async (c) => {
    try {
        const user = c.get('user')

        let [prefs] = await db
            .select()
            .from(notificationPreferences)
            .where(eq(notificationPreferences.userId, user.userId))

        // If preferences don't exist, create default ones
        if (!prefs) {
            const [newPrefs] = await db
                .insert(notificationPreferences)
                .values({
                    userId: user.userId,
                    statusUpdates: 'in_app',
                    interviewReminders: 'in_app',
                    documentRequests: 'in_app',
                    emailDigest: 'daily'
                })
                .returning()
            prefs = newPrefs
        }

        return successResponse(c, prefs)
    } catch (error) {
        throw error
    }
})

// PUT /api/notifications/preferences - Update notification preferences
notificationsRouter.put('/preferences', authenticate, validate(updateNotificationPreferencesSchema), async (c) => {
    try {
        const user = c.get('user')
        const body = c.get('validatedData') as z.infer<typeof updateNotificationPreferencesSchema>

        let [prefs] = await db
            .select()
            .from(notificationPreferences)
            .where(eq(notificationPreferences.userId, user.userId))

        if (!prefs) {
            const [newPrefs] = await db
                .insert(notificationPreferences)
                .values({
                    userId: user.userId,
                    statusUpdates: body.statusUpdates || 'in_app',
                    interviewReminders: body.interviewReminders || 'in_app',
                    documentRequests: body.documentRequests || 'in_app',
                    emailDigest: body.emailDigest || 'daily'
                })
                .returning()
            return successResponse(c, newPrefs, 'Preferences created', 201)
        }

        const [updated] = await db
            .update(notificationPreferences)
            .set(body)
            .where(eq(notificationPreferences.userId, user.userId))
            .returning()

        return successResponse(c, updated)
    } catch (error) {
        throw error
    }
})

// GET /api/notifications/:id - Get a specific notification
notificationsRouter.get('/:id', authenticate, async (c) => {
    try {
        const user = c.get('user')
        const idParam = c.req.param('id')
        const id = idParam ? parseInt(idParam) : 0

        const [notification] = await db
            .select()
            .from(notifications)
            .where(and(
                eq(notifications.id, id),
                eq(notifications.userId, user.userId)
            ))

        if (!notification) {
            throw new NotFoundError('Notification not found')
        }

        return successResponse(c, notification)
    } catch (error) {
        throw error
    }
})

// PATCH /api/notifications/read-all - Mark all notifications as read
notificationsRouter.patch('/read-all', authenticate, async (c) => {
    try {
        const user = c.get('user')

        await db
            .update(notifications)
            .set({
                read: true,
                readAt: new Date()
            })
            .where(and(
                eq(notifications.userId, user.userId),
                eq(notifications.read, false)
            ))

        return successResponse(c, { message: 'All notifications marked as read' })
    } catch (error) {
        throw error
    }
})

// PATCH /api/notifications/:id - Mark notification as read
notificationsRouter.patch('/:id', authenticate, async (c) => {
    try {
        const user = c.get('user')
        const idParam = c.req.param('id')
        const id = idParam ? parseInt(idParam) : 0

        const [notification] = await db
            .select()
            .from(notifications)
            .where(and(
                eq(notifications.id, id),
                eq(notifications.userId, user.userId)
            ))

        if (!notification) {
            throw new NotFoundError('Notification not found')
        }

        const [updated] = await db
            .update(notifications)
            .set({
                read: true,
                readAt: new Date()
            })
            .where(eq(notifications.id, id))
            .returning()

        return successResponse(c, updated)
    } catch (error) {
        throw error
    }
})

// DELETE /api/notifications/:id - Delete a notification
notificationsRouter.delete('/:id', authenticate, async (c) => {
    try {
        const user = c.get('user')
        const idParam = c.req.param('id')
        const id = idParam ? parseInt(idParam) : 0

        const [notification] = await db
            .select()
            .from(notifications)
            .where(and(
                eq(notifications.id, id),
                eq(notifications.userId, user.userId)
            ))

        if (!notification) {
            throw new NotFoundError('Notification not found')
        }

        await db
            .delete(notifications)
            .where(eq(notifications.id, id))

        return successResponse(c, { message: 'Notification deleted' })
    } catch (error) {
        throw error
    }
})

// Web Push Subscription endpoints
const webPushSubscriptionSchema = z.object({
    endpoint: z.string().url(),
    keys: z.object({
        p256dh: z.string(),
        auth: z.string()
    })
})

// GET /api/notifications/web-push/vapid-key - Get VAPID public key for subscription
notificationsRouter.get('/web-push/vapid-key', async (c) => {
    try {
        const vapidKey = WebPushService.getVapidPublicKey()
        return successResponse(c, { vapidKey })
    } catch (error) {
        throw error
    }
})

// POST /api/notifications/web-push/subscribe - Subscribe to web push notifications
notificationsRouter.post('/web-push/subscribe', authenticate, validate(webPushSubscriptionSchema), async (c) => {
    try {
        const user = c.get('user')
        const subscription = c.get('validatedData') as z.infer<typeof webPushSubscriptionSchema>
        const userAgent = c.req.header('user-agent')

        const result = await WebPushService.subscribe(user.userId, subscription, userAgent)

        if (!result.success) {
            throw new Error('Failed to subscribe')
        }

        return successResponse(c, { subscriptionId: result.subscriptionId }, 'Subscribed successfully')
    } catch (error) {
        throw error
    }
})

// POST /api/notifications/web-push/unsubscribe - Unsubscribe from web push notifications
notificationsRouter.post('/web-push/unsubscribe', authenticate, async (c) => {
    try {
        const user = c.get('user')
        const { endpoint } = await c.req.json()

        if (!endpoint) {
            throw new ValidationError('Endpoint is required')
        }

        await WebPushService.unsubscribe(user.userId, endpoint)

        return successResponse(c, null, 'Unsubscribed successfully')
    } catch (error) {
        throw error
    }
})

// GET /api/notifications/web-push/subscriptions - Get user's web push subscriptions
notificationsRouter.get('/web-push/subscriptions', authenticate, async (c) => {
    try {
        const user = c.get('user')
        const subscriptions = await WebPushService.getUserSubscriptions(user.userId)

        return successResponse(c, { subscriptions })
    } catch (error) {
        throw error
    }
})

// Admin-only: Test notification endpoints
const testNotificationSchema = z.object({
    userId: z.number().optional(),
    title: z.string().min(1).max(255),
    message: z.string().min(1).max(1000),
    type: z.enum(['application_status', 'interview_reminder', 'document_request', 'application_update', 'general']).default('general'),
    data: z.record(z.any()).optional()
})

// POST /api/notifications/test - Send a test notification (admin only)
notificationsRouter.post('/test', authenticate, requireAdmin, validate(testNotificationSchema), async (c) => {
    try {
        const admin = c.get('user')
        const testData = c.get('validatedData') as z.infer<typeof testNotificationSchema>

        // If userId is provided, send to that user; otherwise send to admin
        const targetUserId = testData.userId || admin.userId

        // Create in-app notification
        const [notification] = await db.insert(notifications)
            .values({
                userId: targetUserId,
                type: testData.type,
                title: testData.title,
                message: testData.message,
                data: testData.data || null,
                read: false
            })
            .returning()

        // Try to send push notification if user has a push token
        const user = await db.query.users.findFirst({
            where: eq(users.id, targetUserId),
            columns: { pushToken: true }
        })

        let pushResult = null
        let webPushResult = null

        if (user?.pushToken) {
            pushResult = await NotificationService.sendPushNotification({
                to: user.pushToken,
                title: testData.title,
                body: testData.message,
                data: { ...testData.data, notificationId: notification.id }
            })
        }

        // Try to send web push notification
        webPushResult = await WebPushService.notifyUser(targetUserId, {
            title: testData.title,
            body: testData.message,
            icon: '/logo-icon.png',
            badge: '/badge-icon.png',
            data: { ...testData.data, notificationId: notification.id }
        })

        return successResponse(c, {
            notification,
            pushSent: pushResult?.success || false,
            webPushSent: webPushResult?.success || false
        }, 'Test notification sent')
    } catch (error) {
        throw error
    }
})
