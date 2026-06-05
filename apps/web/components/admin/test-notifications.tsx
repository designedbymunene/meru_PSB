'use client'

import { useState } from 'react'
import { Bell, Send, Loader2, CheckCircle2, XCircle, Smartphone, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

type NotificationType = 'application_status' | 'interview_reminder' | 'document_request' | 'application_update' | 'general'

interface TestResult {
    notification: any
    pushSent: boolean
    webPushSent: boolean
}

export function TestNotifications() {
    const [isSending, setIsSending] = useState(false)
    const [testResult, setTestResult] = useState<TestResult | null>(null)

    const [formData, setFormData] = useState({
        userId: '',
        title: 'Test Notification',
        message: 'This is a test notification from Meru County PSB',
        type: 'general' as NotificationType
    })

    const notificationTypes: { value: NotificationType; label: string }[] = [
        { value: 'application_status', label: 'Application Status' },
        { value: 'interview_reminder', label: 'Interview Reminder' },
        { value: 'document_request', label: 'Document Request' },
        { value: 'application_update', label: 'Application Update' },
        { value: 'general', label: 'General' }
    ]

    const handleSendTest = async () => {
        setIsSending(true)
        setTestResult(null)

        try {
            const response = await fetch('/api/notifications/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    userId: formData.userId ? parseInt(formData.userId) : undefined,
                    title: formData.title,
                    message: formData.message,
                    type: formData.type,
                    data: { test: true }
                })
            })

            if (!response.ok) {
                throw new Error('Failed to send test notification')
            }

            const data = await response.json()
            setTestResult(data.data)
            toast.success('Test notification sent successfully')
        } catch (error) {
            console.error('Failed to send test notification:', error)
            toast.error('Failed to send test notification')
        } finally {
            setIsSending(false)
        }
    }

    const handleSendToSelf = () => {
        setFormData({ ...formData, userId: '' })
        handleSendTest()
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Send Test Notification</CardTitle>
                    <CardDescription>
                        Send a test notification to verify the notification system is working correctly
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="userId">Target User ID (Optional)</Label>
                        <Input
                            id="userId"
                            type="number"
                            placeholder="Leave empty to send to yourself"
                            value={formData.userId}
                            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        />
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            If empty, the notification will be sent to your account
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Notification Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value as NotificationType })}
                        >
                            <SelectTrigger id="type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {notificationTypes.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Notification title"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Notification message"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleSendTest}
                            disabled={isSending}
                            className="flex-1"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Test Notification
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={handleSendToSelf}
                            disabled={isSending}
                            variant="outline"
                        >
                            <Bell className="w-4 h-4 mr-2" />
                            Send to Self
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {testResult && (
                <Card>
                    <CardHeader>
                        <CardTitle>Test Results</CardTitle>
                        <CardDescription>
                            Notification delivery status for each channel
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Bell className="w-5 h-5 text-slate-600" />
                                    <div>
                                        <p className="font-medium">In-App Notification</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Notification ID: {testResult.notification?.id}
                                        </p>
                                    </div>
                                </div>
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="w-5 h-5 text-slate-600" />
                                    <div>
                                        <p className="font-medium">Mobile Push Notification</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {testResult.pushSent
                                                ? 'Successfully sent via Expo'
                                                : 'No mobile push token found'}
                                        </p>
                                    </div>
                                </div>
                                {testResult.pushSent ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-slate-400" />
                                )}
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-slate-600" />
                                    <div>
                                        <p className="font-medium">Web Push Notification</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {testResult.webPushSent
                                                ? 'Successfully sent via Web Push'
                                                : 'No web push subscription found'}
                                        </p>
                                    </div>
                                </div>
                                {testResult.webPushSent ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-slate-400" />
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
