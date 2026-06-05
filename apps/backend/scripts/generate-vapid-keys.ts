#!/usr/bin/env tsx
/**
 * Generate VAPID keys for Web Push notifications
 *
 * Run with: pnpm run generate-vapid-keys
 */

import webpush from 'web-push'

const vapidKeys = webpush.generateVAPIDKeys()

console.log('\n=== VAPID Keys Generated ===\n')
console.log('Add these to your .env file:\n')
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`)
console.log(`VAPID_SUBJECT=mailto:admin@merupsb.go.ke`)
console.log('\n===========================\n')
