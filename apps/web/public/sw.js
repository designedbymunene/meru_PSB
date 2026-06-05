// Service Worker for Web Push Notifications
self.addEventListener('install', (event) => {
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
    if (!event.data) {
        return
    }

    try {
        const data = event.data.json()
        const options = {
            body: data.body || '',
            icon: data.icon || '/logo-icon.png',
            badge: data.badge || '/badge-icon.png',
            vibrate: [200, 100, 200],
            data: data.data || {},
            actions: [
                {
                    action: 'view',
                    title: 'View'
                },
                {
                    action: 'close',
                    title: 'Close'
                }
            ]
        }

        event.waitUpUntil(
            self.registration.showNotification(data.title || 'Notification', options)
        )
    } catch (error) {
        console.error('[SW] Error handling push event:', error)
    }
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    if (event.action === 'view') {
        const applicationId = event.notification.data?.applicationId
        const url = applicationId
            ? `/applications/${applicationId}`
            : '/applications'

        event.waitUntil(
            self.clients.openWindow(url)
        )
    }
})
