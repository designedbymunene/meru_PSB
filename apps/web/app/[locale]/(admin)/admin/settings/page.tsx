'use client'

import { useState } from 'react'
import { useAuthContext } from '@/hooks/use-auth'
import {
    useSecuritySettings,
    useActiveSessions,
    useToggle2FA,
    useRevokeSession,
    useUpdatePassword
} from '@/hooks/use-account'
import { useUsers } from '@/hooks/use-users'
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
    Settings,
    History,
    Users as UsersIcon,
    Database,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
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
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export default function AdminSettingsPage() {
    const { user } = useAuthContext()
    const { data: security, isLoading: isSecurityLoading } = useSecuritySettings()
    const { data: sessions, isLoading: isSessionsLoading } = useActiveSessions()
    const { data: usersData, isLoading: isUsersLoading } = useUsers()
    const toggle2fa = useToggle2FA()
    const revokeSession = useRevokeSession()
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
        } catch (error) {}
    }

    if (isSecurityLoading || isSessionsLoading || isUsersLoading) {
        return <div className="p-8 space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-[400px] w-full" /></div>
    }

    const securityData = security?.data
    const adminUsers = (usersData as any)?.data || []

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
                    <p className="text-muted-foreground">Manage portal configuration, security and administrative users</p>
                </div>
            </div>

            <Tabs defaultValue="account" className="space-y-6">
                <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
                    <TabsTrigger value="account" className="rounded-lg px-6 py-2">
                        <User className="h-4 w-4 mr-2" />
                        Account
                    </TabsTrigger>
                    <TabsTrigger value="users" className="rounded-lg px-6 py-2">
                        <UsersIcon className="h-4 w-4 mr-2" />
                        User Management
                    </TabsTrigger>
                    <TabsTrigger value="system" className="rounded-lg px-6 py-2">
                        <Settings className="h-4 w-4 mr-2" />
                        Portal Config
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="rounded-lg px-6 py-2">
                        <History className="h-4 w-4 mr-2" />
                        Audit Logs
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="rounded-lg px-6 py-2">
                        <Palette className="h-4 w-4 mr-2" />
                        Appearance
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="space-y-6 outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
                                <CardHeader>
                                    <CardTitle>Update Password</CardTitle>
                                    <CardDescription>Secure your administrative access</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="currentPassword"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Current Password</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" {...field} className="rounded-xl h-12" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="newPassword"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>New Password</FormLabel>
                                                            <FormControl>
                                                                <Input type="password" {...field} className="rounded-xl h-12" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="confirmPassword"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Confirm Password</FormLabel>
                                                            <FormControl>
                                                                <Input type="password" {...field} className="rounded-xl h-12" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <Button type="submit" disabled={updatePassword.isPending} className="rounded-xl h-11 px-8 font-bold">
                                                {updatePassword.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                                Update Admin Password
                                            </Button>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
                                <CardHeader>
                                    <CardTitle>Two-Factor Authentication</CardTitle>
                                    <CardDescription>Mandatory for all administrative accounts</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-amber-900 dark:text-amber-400 flex items-center gap-2">
                                                <ShieldAlert className="h-4 w-4" />
                                                Email Verification
                                            </p>
                                            <p className="text-xs text-amber-700 dark:text-amber-500 font-medium max-w-md">
                                                Active session security requires an email code for every new login to prevent unauthorized access.
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

                        <div className="space-y-6">
                            <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
                                <CardHeader>
                                    <CardTitle className="text-lg">Active Admin Sessions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {sessions?.data?.map((session: any) => (
                                        <div key={session.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 shadow-sm">
                                                {session.deviceType === 'mobile' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold truncate">{session.deviceName || 'Unknown'}</p>
                                                <p className="text-[10px] text-muted-foreground">{session.isCurrent ? 'Active Now' : formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}</p>
                                            </div>
                                            {!session.isCurrent && (
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => revokeSession.mutate(session.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="users" className="space-y-6 outline-none">
                    <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Administrative Users</CardTitle>
                                <CardDescription>Users with access to the recruitment portal back-office</CardDescription>
                            </div>
                            <Button className="rounded-xl h-10 px-4">
                                <UsersIcon className="h-4 w-4 mr-2" />
                                Invite Admin
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Full Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {adminUsers.map((admin: any) => (
                                        <TableRow key={admin.id}>
                                            <TableCell className="font-bold">{admin.fullName}</TableCell>
                                            <TableCell>{admin.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={admin.role === 'admin' ? 'default' : 'secondary'} className="rounded-md uppercase text-[10px] font-black">
                                                    {admin.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs">{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="rounded-lg h-8 px-3 font-bold text-xs">Edit</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="system" className="space-y-6 outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
                            <CardHeader>
                                <CardTitle>Recruitment Parameters</CardTitle>
                                <CardDescription>Global settings for all vacancies</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold">Maintenance Mode</p>
                                        <p className="text-xs text-muted-foreground">Disable all public applications</p>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold">Email Notifications</p>
                                        <p className="text-xs text-muted-foreground">Global dispatch for system alerts</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
                            <CardHeader>
                                <CardTitle>Data Management</CardTitle>
                                <CardDescription>System backups and maintenance</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-slate-200 dark:border-slate-800 font-bold">
                                    <Database className="mr-2 h-4 w-4 text-blue-500" />
                                    Export System Database
                                </Button>
                                <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-slate-200 dark:border-slate-800 font-bold">
                                    <Database className="mr-2 h-4 w-4 text-green-500" />
                                    Run Backup (Manual)
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="audit" className="space-y-6 outline-none">
                    <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>Audit Logs</CardTitle>
                            <CardDescription>Comprehensive record of all administrative actions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-8 text-center bg-slate-50/50 dark:bg-slate-900/50">
                                <History className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                                <p className="font-bold text-slate-600 dark:text-slate-400">Audit logs are being recorded in the background.</p>
                                <p className="text-xs text-slate-400 mt-1">Full viewer interface coming soon in the next update.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-6 outline-none">
                    <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>Theme Preferences</CardTitle>
                            <CardDescription>Customize the admin dashboard interface</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { value: 'light', icon: Sun, label: 'Light' },
                                    { value: 'dark', icon: Moon, label: 'Dark' },
                                    { value: 'system', icon: MonitorIcon, label: 'System' },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setTheme(opt.value)}
                                        className={cn(
                                            "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                                            theme === opt.value ? "border-primary bg-primary/5" : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                                        )}
                                    >
                                        <opt.icon className={cn("h-6 w-6", theme === opt.value ? "text-primary" : "text-slate-400")} />
                                        <span className="text-sm font-bold">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
