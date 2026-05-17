"use client"

import { Bell, Mail, Smartphone, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"

type NotificationChannel = 'email' | 'sms' | 'push' | 'none'
type NotificationFrequency = 'instant' | 'daily' | 'weekly'

interface NotificationPreference {
    channel: NotificationChannel
    enabled: boolean
    label: string
    description: string
    icon: React.ElementType
}

interface NotificationPreferencesProps {
    applicationId?: string
    onSave?: (preferences: NotificationState) => void
}

interface NotificationState {
    statusUpdates: NotificationChannel
    interviewReminders: NotificationChannel
    documentRequests: NotificationChannel
    emailDigest: NotificationFrequency
    smsOptIn: boolean
}

const defaultState: NotificationState = {
    statusUpdates: 'email',
    interviewReminders: 'email',
    documentRequests: 'email',
    emailDigest: 'instant',
    smsOptIn: false
}

const channelOptions: NotificationPreference[] = [
    {
        channel: 'email',
        enabled: true,
        label: 'Email',
        description: 'Receive notifications via email',
        icon: Mail
    },
    {
        channel: 'sms',
        enabled: true,
        label: 'SMS',
        description: 'Get text message alerts',
        icon: Smartphone
    },
    {
        channel: 'push',
        enabled: true,
        label: 'Push Notifications',
        description: 'Browser push notifications',
        icon: Bell
    },
    {
        channel: 'none',
        enabled: true,
        label: 'None',
        description: 'Disable these notifications',
        icon: Mail
    }
]

const frequencyOptions = [
    { value: 'instant' as const, label: 'Instant', description: 'Send as soon as they happen' },
    { value: 'daily' as const, label: 'Daily Digest', description: 'Once per day summary' },
    { value: 'weekly' as const, label: 'Weekly Summary', description: 'Once per week digest' }
]

export function ApplicationNotificationPreferences({
    applicationId,
    onSave
}: NotificationPreferencesProps) {
    const [preferences, setPreferences] = useState<NotificationState>(defaultState)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        setSaved(false)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        onSave?.(preferences)
        setSaving(false)
        setSaved(true)

        setTimeout(() => setSaved(false), 3000)
    }

    const updatePreference = (key: keyof NotificationState, value: any) => {
        setPreferences(prev => ({ ...prev, [key]: value }))
        setSaved(false)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        Notification Settings
                    </h3>
                </div>
                {saved && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3.5 w-3.5" />
                        Saved
                    </span>
                )}
            </div>

            {/* Notification Types */}
            <div className="space-y-4">
                {/* Status Updates */}
                <NotificationRow
                    title="Status Updates"
                    description="Application status changes"
                    value={preferences.statusUpdates}
                    options={channelOptions}
                    onChange={(value) => updatePreference('statusUpdates', value)}
                />

                {/* Interview Reminders */}
                <NotificationRow
                    title="Interview Reminders"
                    description="Upcoming interview alerts"
                    value={preferences.interviewReminders}
                    options={channelOptions}
                    onChange={(value) => updatePreference('interviewReminders', value)}
                />

                {/* Document Requests */}
                <NotificationRow
                    title="Document Requests"
                    description="Additional document requests"
                    value={preferences.documentRequests}
                    options={channelOptions}
                    onChange={(value) => updatePreference('documentRequests', value)}
                />
            </div>

            {/* Email Digest Frequency */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email Summary Frequency
                </p>
                <div className="grid grid-cols-3 gap-2">
                    {frequencyOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => updatePreference('emailDigest', option.value)}
                            className={cn(
                                "p-3 rounded-lg border text-center transition-all duration-200",
                                preferences.emailDigest === option.value
                                    ? "bg-blue-50 dark:bg-blue-950/30 border-blue-500 dark:border-blue-500"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                            )}
                        >
                            <p className={cn(
                                "text-sm font-medium",
                                preferences.emailDigest === option.value
                                    ? "text-blue-700 dark:text-blue-300"
                                    : "text-slate-700 dark:text-slate-300"
                            )}>
                                {option.label}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {option.description}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* SMS Opt-in */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            SMS Notifications
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Get instant text alerts for important updates
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => updatePreference('smsOptIn', !preferences.smsOptIn)}
                    className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                        preferences.smsOptIn
                            ? "bg-blue-600"
                            : "bg-slate-200 dark:bg-slate-700"
                    )}
                >
                    <span
                        className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
                            preferences.smsOptIn ? "translate-x-6" : "translate-x-1"
                        )}
                    />
                </button>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full"
                    variant={saved ? "outline" : "default"}
                >
                    {saving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : saved ? (
                        <>
                            <Check className="h-4 w-4 mr-2" />
                            Saved
                        </>
                    ) : (
                        'Save Preferences'
                    )}
                </Button>
            </div>

            {/* Info Text */}
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                You can change these settings anytime from your profile
            </p>
        </div>
    )
}

interface NotificationRowProps {
    title: string
    description: string
    value: NotificationChannel
    options: NotificationPreference[]
    onChange: (value: NotificationChannel) => void
}

function NotificationRow({ title, description, value, options, onChange }: NotificationRowProps) {
    return (
        <div className="space-y-2">
            <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {options.map((option) => {
                    const Icon = option.icon
                    const isSelected = value === option.channel

                    return (
                        <button
                            key={option.channel}
                            onClick={() => onChange(option.channel)}
                            className={cn(
                                "flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all duration-200",
                                isSelected
                                    ? "bg-blue-50 dark:bg-blue-950/30 border-blue-500 dark:border-blue-500"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                            )}
                        >
                            <Icon className={cn(
                                "h-4 w-4 shrink-0",
                                isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-600"
                            )} />
                            <div className="min-w-0">
                                <p className={cn(
                                    "text-xs font-medium truncate",
                                    isSelected ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-300"
                                )}>
                                    {option.label}
                                </p>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
