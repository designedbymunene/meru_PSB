'use client'

import { useState } from 'react'
import { useAuthContext } from '@/providers'
import {
    useSecuritySettings,
    useToggle2FA,
    useUpdatePassword,
} from '@/hooks/use-account'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Lock,
    Shield,
    Smartphone,
    LogOut,
    Trash2,
    Key,
    ShieldAlert,
    Bell,
    User,
    CheckCircle2,
    Monitor,
    ChevronRight,
    RefreshCw,
    ShieldCheck,
    Palette,
    Sun,
    Moon,
    Monitor as MonitorIcon,
    History,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
// import { UserAuditLogs } from '@/components/settings/user-audit-logs'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTheme } from 'next-themes'

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export default function SettingsPage() {
    const { user } = useAuthContext()
    const { data: security, isLoading: isSecurityLoading } = useSecuritySettings()
    // const { data: sessions, isLoading: isSessionsLoading } = useActiveSessions()
    const toggle2fa = useToggle2FA()
    // const revokeSession = useRevokeSession()
    const updatePassword = useUpdatePassword()
    const { theme, setTheme } = useTheme()

    const form = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    })

    const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
        try {
            await updatePassword.mutateAsync({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            })
            form.reset()
        } catch (error) {
            // Error handled by mutation onError
        }
    }

    if (isSecurityLoading) {
        return (
            <div className="space-y-8 animate-pulse pb-12">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48 rounded-xl" />
                    <Skeleton className="h-4 w-64 rounded-lg" />
                </div>
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-24 rounded-lg" />
                    <Skeleton className="h-10 w-24 rounded-lg" />
                    <Skeleton className="h-10 w-24 rounded-lg" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-[300px] w-full rounded-2xl" />
                        <Skeleton className="h-[200px] w-full rounded-2xl" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-[400px] w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        )
    }

    const securityData = security?.data

    return (
        <div className="pb-20 space-y-10">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your account preferences and security</p>
            </div>

            <Tabs defaultValue="security" className="space-y-8">
                <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
                    <TabsTrigger value="account" className="rounded-lg px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                        <User className="h-4 w-4 mr-2" />
                        Account
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                        <Shield className="h-4 w-4 mr-2" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="rounded-lg px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                        <Palette className="h-4 w-4 mr-2" />
                        Appearance
                    </TabsTrigger>
                    {/* Activity Logs (audit logs) removed for applicant */}
                </TabsList>

                <TabsContent value="account" className="space-y-8 outline-none">
                    <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-slate-900/40">
                        <CardHeader className="border-b border-slate-50 dark:border-slate-800/60 pb-6">
                            <CardTitle className="text-xl">Personal Information</CardTitle>
                            <CardDescription>Update your basic account details</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</Label>
                                    <Input id="fullName" defaultValue={user?.fullName} disabled className="h-12 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</Label>
                                    <Input id="email" defaultValue={user?.email} disabled className="h-12 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-50 dark:border-slate-800/60 flex items-start gap-4 p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl">
                                <div className="bg-primary/10 p-2.5 rounded-xl">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Profile Identity</p>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        Your name and email are synced with your official recruitment profile. 
                                        To change these, please update your main profile in the <Button variant="link" className="h-auto p-0 text-xs font-bold text-primary">Profile Section</Button>.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-8 outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Password Change */}
                            <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-slate-900/40">
                                <CardHeader className="border-b border-slate-50 dark:border-slate-800/60 pb-6">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                                            <Key className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-xl">Update Password</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Last changed {securityData?.passwordLastChanged && securityData.passwordLastChanged !== 'Never' 
                                            ? formatDistanceToNow(new Date(securityData.passwordLastChanged), { addSuffix: true }) 
                                            : 'Never'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-8">
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="currentPassword"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Password</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="••••••••" className="h-12 rounded-xl border-slate-200 dark:border-slate-700" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="newPassword"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">New Password</FormLabel>
                                                            <FormControl>
                                                                <Input type="password" placeholder="••••••••" className="h-12 rounded-xl border-slate-200 dark:border-slate-700" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="confirmPassword"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm New Password</FormLabel>
                                                            <FormControl>
                                                                <Input type="password" placeholder="••••••••" className="h-12 rounded-xl border-slate-200 dark:border-slate-700" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="flex justify-end pt-2">
                                                <Button type="submit" disabled={updatePassword.isPending} className="h-11 rounded-xl px-8 font-bold">
                                                    {updatePassword.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                                    Update Password
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>

                            {/* 2FA */}
                            <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-slate-900/40">
                                <CardHeader className="border-b border-slate-50 dark:border-slate-800/60 pb-6">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                                            <ShieldAlert className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-xl">Two-Factor Authentication</CardTitle>
                                    </div>
                                    <CardDescription>Add an extra layer of security to your account</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-8">
                                    <div className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Require code from email</p>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md">
                                                Whenever you sign in, we'll send a security code to your registered email to confirm it's really you.
                                            </p>
                                        </div>
                                        <Switch 
                                            checked={securityData?.twoFactorEnabled} 
                                            onCheckedChange={(checked) => toggle2fa.mutate(checked)}
                                            disabled={toggle2fa.isPending}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sessions Management disabled for applicant */}
                        <div className="space-y-8">
                            {/*
                            <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-slate-900/40 h-full">
                                <CardHeader className="border-b border-slate-50 dark:border-slate-800/60 pb-6">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="bg-pink-50 dark:bg-pink-900/20 p-2 rounded-lg text-pink-600 dark:text-pink-400">
                                            <Smartphone className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-xl">Active Sessions</CardTitle>
                                    </div>
                                    <CardDescription>Devices currently logged into your account</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    {sessions?.data?.map((session: any) => (
                                        <div key={session.id} className="group relative flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800/60">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                                session.isCurrent ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                            )}>
                                                {session.deviceType === 'mobile' ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                        {session.deviceName || 'Unknown Device'}
                                                    </p>
                                                    {session.isCurrent && (
                                                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium">
                                                    {session.browser || 'Browser'} • {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
                                                </p>
                                            </div>
                                            {!session.isCurrent && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 rounded-lg text-slate-300 hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-all"
                                                    onClick={() => revokeSession.mutate(session.id)}
                                                    disabled={revokeSession.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}

                                    {(sessions?.data?.length ?? 0) > 1 && (
                                        <Button 
                                            variant="outline" 
                                            className="w-full mt-4 h-11 rounded-xl border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold text-xs uppercase tracking-wider"
                                            onClick={() => revokeSession.mutate(undefined)}
                                            disabled={revokeSession.isPending}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Revoke All Other Sessions
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                            */}

                            <div className="p-6 rounded-[2.5rem] bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 space-y-4">
                                <div className="bg-primary/20 p-2.5 rounded-2xl w-fit">
                                    <ShieldCheck className="h-6 w-6 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-base font-bold text-slate-900 dark:text-white">Security Tip</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                        Enable two-factor authentication and regularly update your password to keep your recruitment profile secure.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-8 outline-none">
                    <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-slate-900/40">
                        <CardHeader className="border-b border-slate-50 dark:border-slate-800/60 pb-6">
                            <CardTitle className="text-xl">Email Notifications</CardTitle>
                            <CardDescription>Choose what updates you want to receive via email</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            {[
                                { title: 'Application Status', desc: 'Get notified when your application status changes (e.g., Shortlisted, Interviewed)' },
                                { title: 'New Vacancies', desc: 'Receive alerts for new job postings that match your profile' },
                                { title: 'Deadline Reminders', desc: 'Important reminders before job applications close' },
                                { title: 'Account Security', desc: 'Critical alerts regarding your login activity and password changes' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-4 first:pt-0 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                                        <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                                    </div>
                                    <Switch defaultChecked={item.title === 'Account Security' || item.title === 'Application Status'} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-8 outline-none">
                    <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-slate-900/40">
                        <CardHeader className="border-b border-slate-50 dark:border-slate-800/60 pb-6">
                            <CardTitle className="text-xl">Theme</CardTitle>
                            <CardDescription>Customize how the application looks on your device</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { value: 'light', icon: Sun, label: 'Light', description: 'Clean and bright interface' },
                                    { value: 'dark', icon: Moon, label: 'Dark', description: 'Easy on the eyes' },
                                    { value: 'system', icon: MonitorIcon, label: 'System', description: 'Matches your device preference' },
                                ].map((option) => {
                                    const Icon = option.icon
                                    const isActive = theme === option.value
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                                            className={cn(
                                                "relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all text-left",
                                                isActive
                                                    ? "border-primary bg-primary/5 shadow-sm"
                                                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                                                isActive
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                            )}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{option.label}</p>
                                                <p className="text-xs text-slate-500 font-medium">{option.description}</p>
                                            </div>
                                            {isActive && (
                                                <div className="absolute top-4 right-4">
                                                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Activity Logs (audit logs) content removed for applicant */}
            </Tabs>
        </div>
    )
}
