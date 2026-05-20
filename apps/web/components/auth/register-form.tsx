'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail, Lock, User, Eye, EyeOff, Building } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { registerSchema } from '@meru/shared'
import { useRegister } from '@/hooks/use-auth'
import { Logo } from '@/components/shared/logo'

type RegisterFormValues = {
    email: string
    phoneNumber: string
    password: string
    firstName: string
    lastName: string
    nationalId: string
    role?: 'applicant' | 'admin'
}

type RegisterFormData = RegisterFormValues & {
    role: 'applicant' | 'admin'
}

interface RegisterFormProps {
    onSuccess?: (data: RegisterFormData) => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps = {}) {
    const [showPassword, setShowPassword] = useState(false)
    const register = useRegister()
    const router = useRouter()
    const isPending = register.isPending

    const form = useForm<RegisterFormValues, any, RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            nationalId: '',
            password: '',
            role: 'applicant' as const,
        },
    })

    function onSubmit(data: RegisterFormData) {
        register.mutate(data, {
            onSuccess: () => {
                if (onSuccess) {
                    onSuccess(data)
                } else {
                    router.push('/dashboard')
                }
            },
        })
    }

    return (
        <Card className="w-full max-w-md border-t-4 border-t-primary shadow-md rounded-md">
            <CardHeader className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div className="flex justify-center mb-2">
                    <Logo size="lg" variant="icon" />
                </div>
                <CardTitle className="text-2xl font-bold text-center text-slate-900 dark:text-white">
                    Citizen Registration
                </CardTitle>
                <CardDescription className="text-center text-slate-500">
                    Create an official account to access public services
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem id="firstName">
                                        <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">First Name <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    placeholder="e.g. John"
                                                    className="pl-10 rounded-md border-slate-300 focus-visible:ring-primary"
                                                    disabled={isPending}
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem id="lastName">
                                        <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Last Name <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    placeholder="e.g. Doe"
                                                    className="pl-10 rounded-md border-slate-300 focus-visible:ring-primary"
                                                    disabled={isPending}
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="nationalId"
                            render={({ field }) => (
                                <FormItem id="nationalId">
                                    <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">National ID Number <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Enter ID number"
                                                className="pl-10 rounded-md border-slate-300 focus-visible:ring-primary"
                                                disabled={isPending}
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem id="phoneNumber">
                                    <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Phone Number <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="tel"
                                                placeholder="+254..."
                                                className="pl-10 rounded-md border-slate-300 focus-visible:ring-primary"
                                                disabled={isPending}
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem id="email">
                                    <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Email Address <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="email"
                                                placeholder="example@domain.com"
                                                className="pl-10 rounded-md border-slate-300 focus-visible:ring-primary"
                                                disabled={isPending}
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem id="password">
                                    <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Password <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className="pl-10 pr-10 rounded-md border-slate-300 focus-visible:ring-primary"
                                                disabled={isPending}
                                                {...field}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={isPending}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-slate-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-slate-400" />
                                                )}
                                                <span className="sr-only">
                                                    {showPassword ? 'Hide password' : 'Show password'}
                                                </span>
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full rounded-md font-semibold" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Submit Registration'
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-md">
                <div className="text-sm text-center text-slate-600 dark:text-slate-400">
                    Already registered?{' '}
                    <Link href="/login" className="text-primary hover:underline font-semibold">
                        Sign in to portal
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
