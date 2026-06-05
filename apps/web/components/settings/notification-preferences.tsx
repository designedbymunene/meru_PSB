'use client'

import { Bell, Mail, Smartphone, Loader2, Globe, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/use-notifications'
import { useWebPush } from '@/hooks/use-web-push'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function NotificationPreferencesSettings() {
    const { data: preferences, isLoading: isLoadingPreferences } = useNotificationPreferences()
    const { mutate: updatePreferences, isPending } = useUpdateNotificationPreferences()
    const {
        isSupported: webPushSupported,
        permission: webPushPermission,
        isSubscribed: webPushSubscribed,
        isLoading: webPushLoading,
        toggle: toggleWebPush
    } = useWebPush()

    const [formData, setFormData] = useState<{
        statusUpdates: 'email' | 'push' | 'in_app' | 'none'
        interviewReminders: 'email' | 'push' | 'in_app' | 'none'
        documentRequests: 'email' | 'push' | 'in_app' | 'none'
        emailDigest: 'instant' | 'daily' | 'weekly' | 'none'
    }>({
        statusUpdates: 'in_app',
        interviewReminders: 'in_app',
        documentRequests: 'in_app',
        emailDigest: 'daily'
    })

    useEffect(() => {
        if (preferences) {
            setFormData({
                statusUpdates: preferences.statusUpdates,
                interviewReminders: preferences.interviewReminders,
                documentRequests: preferences.documentRequests,
                emailDigest: preferences.emailDigest
            })
        }
    }, [preferences])

    const handleSave = () => {
        updatePreferences(formData, {
            onSuccess: () => {
                toast.success('Notification preferences updated')
            },
            onError: () => {
                toast.error('Failed to update preferences')
            }
        })
    }

    const channelOptions = [
        { value: 'email', label: 'Email', icon: Mail },
        { value: 'push', label: 'Push Notifications', icon: Smartphone },
        { value: 'in_app', label: 'In-App', icon: Bell },
        { value: 'none', label: 'Disabled', icon: null }
    ]

    const digestOptions = [
        { value: 'instant', label: 'Instant' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'none', label: 'Disabled' }
    ]

    if (isLoadingPreferences) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                        Manage how and when you receive notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Application Status Updates */}
                    <div className="space-y-2">
                        <Label htmlFor="status-updates" className="text-base font-semibold">
                            Application Status Updates
                        </Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Get notified when your application status changes
                        </p>
                        <Select
                            value={formData.statusUpdates}
                            onValueChange={(value) =>
                                setFormData({ ...formData, statusUpdates: value as any })
                            }
                        >
                            <SelectTrigger id="status-updates">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {channelOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Interview Reminders */}
                    <div className="space-y-2">
                        <Label htmlFor="interview-reminders" className="text-base font-semibold">
                            Interview Reminders
                        </Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Get notified about upcoming interviews
                        </p>
                        <Select
                            value={formData.interviewReminders}
                            onValueChange={(value) =>
                                setFormData({ ...formData, interviewReminders: value as any })
                            }
                        >
                            <SelectTrigger id="interview-reminders">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {channelOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Document Requests */}
                    <div className="space-y-2">
                        <Label htmlFor="document-requests" className="text-base font-semibold">
                            Document Requests
                        </Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Get notified when additional documents are required
                        </p>
                        <Select
                            value={formData.documentRequests}
                            onValueChange={(value) =>
                                setFormData({ ...formData, documentRequests: value as any })
                            }
                        >
                            <SelectTrigger id="document-requests">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {channelOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Web Push Notifications */}
                    {webPushSupported && (
                        <div className="space-y-2 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <Label htmlFor="web-push" className="text-base font-semibold flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        Browser Push Notifications
                                    </Label>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        Receive notifications in your browser even when the app is closed
                                    </p>
                                </div>
                                <Switch
                                    id="web-push"
                                    checked={webPushSubscribed}
                                    onCheckedChange={toggleWebPush}
                                    disabled={webPushLoading || webPushPermission === 'denied'}
                                />
                            </div>

                            {webPushPermission === 'denied' && (
                                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                        Browser notifications are blocked. Enable them in your browser settings to use this feature.
                                    </p>
                                </div>
                            )}

                            {webPushPermission === 'granted' && webPushSubscribed && (
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    ✓ Push notifications are enabled for this browser
                                </p>
                            )}
                        </div>
                    )}

                    {/* Email Digest */}
                    <div className="space-y-2">
                        <Label htmlFor="email-digest" className="text-base font-semibold">
                            Email Digest Frequency
                        </Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            How often to receive email summaries
                        </p>
                        <Select
                            value={formData.emailDigest}
                            onValueChange={(value) =>
                                setFormData({ ...formData, emailDigest: value as any })
                            }
                        >
                            <SelectTrigger id="email-digest">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {digestOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={isPending}
                        className="w-full"
                    >
                        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Preferences
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
