'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react'
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
import { resetPasswordSchema, forgotPasswordRequestSchema, type ResetPasswordSchemaType } from '@meru/shared'
import { useResetPassword, useRequestPasswordReset } from '@/hooks/use-auth'
import { Logo } from '@/components/shared/logo'

export function ForgotPasswordForm() {
    const [step, setStep] = useState<1 | 2>(1)
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    
    const { mutate: requestReset, isPending: isRequesting } = useRequestPasswordReset()
    const { mutate: resetPassword, isPending: isResetting } = useResetPassword()

    const form = useForm<any>({
        resolver: zodResolver(step === 1 ? forgotPasswordRequestSchema : resetPasswordSchema),
        defaultValues: {
            email: '',
            otp: '',
            newPassword: '',
        },
    })

    function onSubmit(data: ResetPasswordSchemaType) {
        if (step === 1) {
            requestReset(data.email, {
                onSuccess: () => {
                    setEmail(data.email)
                    setStep(2)
                }
            })
        } else {
            resetPassword({
                email: email || data.email,
                otp: data.otp,
                newPassword: data.newPassword,
            })
        }
    }

    const isPending = isRequesting || isResetting

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <div className="flex justify-center mb-4">
                    <Logo size="lg" variant="icon" />
                </div>
                <CardTitle className="text-2xl font-bold text-center">
                    {step === 1 ? 'Forgot Password' : 'Reset Password'}
                </CardTitle>
                <CardDescription className="text-center">
                    {step === 1 
                        ? 'Enter your email to receive a reset code' 
                        : `Enter the 6-digit code sent to ${email}`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {step === 1 ? (
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem id="email">
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    className="pl-10"
                                                    disabled={isPending}
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <>
                                <FormField
                                    control={form.control}
                                    name="otp"
                                    render={({ field }) => (
                                        <FormItem id="otp">
                                            <FormLabel>Verification Code</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="000000"
                                                        className="pl-10 tracking-[0.5em] font-mono text-center"
                                                        maxLength={6}
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
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem id="newPassword">
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="••••••••"
                                                        className="pl-10 pr-10"
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
                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
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
                            </>
                        )}
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {step === 1 ? 'Requesting...' : 'Resetting...'}
                                </>
                            ) : (
                                step === 1 ? 'Get Reset Code' : 'Reset Password'
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
                {step === 2 && (
                    <Button 
                        variant="ghost" 
                        className="text-sm" 
                        onClick={() => setStep(1)}
                        disabled={isPending}
                    >
                        Back to email entry
                    </Button>
                )}
                <Link
                    href="/login"
                    className="inline-flex items-center text-sm text-primary hover:underline"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                </Link>
            </CardFooter>
        </Card>
    )
}
