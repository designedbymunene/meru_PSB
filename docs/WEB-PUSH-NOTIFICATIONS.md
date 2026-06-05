# Web Push Notifications - Implementation Summary

## Changes Made

### 1. Notification Triggers Updated
**File:** `apps/backend/src/utils/application-status.ts`
- Notifications now only trigger for `interviewing` and `accepted` statuses
- Removed `rejected` from notification triggers

### 2. Web Push Backend Implementation

#### New Files Created:
- `apps/backend/src/db/schema/web-push-subscriptions.ts` - Database schema for web push subscriptions
- `apps/backend/src/services/web-push-service.ts` - Web push service for managing subscriptions and sending notifications
- `apps/backend/scripts/generate-vapid-keys.ts` - Script to generate VAPID keys

#### Modified Files:
- `apps/backend/src/utils/env.ts` - Added VAPID environment variables
- `apps/backend/src/db/schema/index.ts` - Exported web push subscriptions schema
- `apps/backend/src/routes/notifications.ts` - Added web push subscription endpoints and test notification endpoint
- `apps/backend/src/workers/notification-worker.ts` - Added web push notification sending

### 3. Web Push Frontend Implementation

#### New Files Created:
- `apps/web/public/sw.js` - Service worker for handling push notifications
- `apps/web/lib/web-push.ts` - Web push utility functions
- `apps/web/hooks/use-web-push.ts` - React hook for web push functionality
- `apps/web/components/admin/test-notifications.tsx` - Admin component for testing notifications

#### Modified Files:
- `apps/web/lib/api/notifications.ts` - Added web push and test notification API methods
- `apps/web/components/settings/notification-preferences.tsx` - Added web push subscription toggle

### 4. Environment Configuration

#### Added to `.env.example`:
```bash
# Web Push Notification Configuration (VAPID Keys)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@merupsb.go.ke
```

## Setup Instructions

### 1. Generate VAPID Keys

Run the following command in the backend directory:

```bash
cd apps/backend
pnpm run generate-vapid-keys
```

Copy the generated keys to your `.env` file.

### 2. Run Database Migration

The new `web_push_subscriptions` table needs to be created:

```bash
cd apps/backend
pnpm db:push
```

### 3. Configure Service Worker

The service worker (`sw.js`) is already in the `public` folder. Ensure your web server serves this file correctly.

### 4. Enable Web Push in the Web App

1. Users can enable web push notifications from their notification preferences
2. The browser will request permission
3. Once granted, push notifications will be delivered

## API Endpoints

### Public
- `GET /api/notifications/web-push/vapid-key` - Get VAPID public key for subscription

### Authenticated
- `POST /api/notifications/web-push/subscribe` - Subscribe to web push notifications
- `POST /api/notifications/web-push/unsubscribe` - Unsubscribe from web push notifications
- `GET /api/notifications/web-push/subscriptions` - Get user's web push subscriptions

### Admin Only
- `POST /api/notifications/test` - Send a test notification

## Notification Channels

When an application status changes to `interviewing` or `accepted`, notifications are sent via:

1. **Email** - Always sent if user has an email
2. **Mobile Push** - Sent via Expo if user has a mobile push token
3. **Web Push** - Sent if user has subscribed to web push notifications
4. **In-App** - Always created in the notifications table

## Testing Notifications

Admins can test notifications by:

1. Navigate to the admin panel
2. Use the `TestNotifications` component
3. Choose to send to themselves or a specific user
4. View results for each channel (in-app, mobile push, web push)

## Browser Compatibility

Web Push Notifications require:
- Service Worker support
- Push API support
- Notification API support

Supported browsers:
- Chrome (Desktop and Android)
- Firefox (Desktop and Android)
- Edge (Desktop)
- Safari (Desktop macOS 10.9+)
- Safari (iOS 16.4+)

Not supported:
- IE11
- Older mobile browsers
