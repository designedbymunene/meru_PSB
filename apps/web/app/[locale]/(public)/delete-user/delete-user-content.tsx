'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail, ShieldAlert, CheckCircle, Smartphone, UserX, AlertTriangle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import apiClient from '@/lib/api/client'
import { Logo } from '@/components/shared/logo'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// Define validation schemas locally for self-containment
const requestSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    nationalId: z.string().min(5, 'National ID or Passport number must be at least 5 characters'),
})

const confirmSchema = z.object({
    otp: z.string().length(6, 'Verification code must be exactly 6 digits').regex(/^\d+$/, 'Code must contain numbers only'),
})

type RequestSchemaType = z.infer<typeof requestSchema>
type ConfirmSchemaType = z.infer<typeof confirmSchema>

export default function DeleteUserContent() {
    const [step, setStep] = useState<'request' | 'confirm' | 'success'>('request')
    const [email, setEmail] = useState('')
    const [nationalId, setNationalId] = useState('')
    const [isPending, setIsPending] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const requestForm = useForm<RequestSchemaType>({
        resolver: zodResolver(requestSchema),
        defaultValues: {
            email: '',
            nationalId: '',
        },
    })

    const confirmForm = useForm<ConfirmSchemaType>({
        resolver: zodResolver(confirmSchema),
        defaultValues: {
            otp: '',
        },
    })

    // Handle initial deletion request (sends OTP)
    async function onRequestSubmit(data: RequestSchemaType) {
        setIsPending(true)
        setErrorMessage(null)
        try {
            await apiClient.post('/auth/delete-request', {
                email: data.email,
                nationalId: data.nationalId,
            })
            setEmail(data.email)
            setNationalId(data.nationalId)
            toast.success('Verification code sent to your email')
            setStep('confirm')
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || error?.message || 'Failed to submit request. Please check your credentials.'
            setErrorMessage(errorMsg)
            toast.error(errorMsg)
        } finally {
            setIsPending(false)
        }
    }

    // Handle OTP verification and deletion confirmation
    async function onConfirmSubmit(data: ConfirmSchemaType) {
        setIsPending(true)
        setErrorMessage(null)
        try {
            await apiClient.post('/auth/delete-confirm', {
                email,
                otp: data.otp,
            })
            toast.success('Account and data deleted successfully')
            setStep('success')
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || error?.message || 'Invalid verification code. Please try again.'
            setErrorMessage(errorMsg)
            toast.error(errorMsg)
        } finally {
            setIsPending(false)
        }
    }

    // Handle resending OTP code
    async function resendCode() {
        setIsPending(true)
        setErrorMessage(null)
        try {
            await apiClient.post('/auth/delete-request', {
                email,
                nationalId,
            })
            toast.success('A new verification code has been sent')
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || error?.message || 'Failed to resend code'
            setErrorMessage(errorMsg)
            toast.error(errorMsg)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
                <div className="flex justify-center mb-3">
                    <Logo size="lg" variant="icon" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                    Data Control & Account Deletion
                </h1>
                <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Manage your data preferences for the <span className="font-semibold text-primary">Meru County PSB</span> mobile application and recruitment portal.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Side: Information Policy & Guidelines */}
                <div className="lg:col-span-7 space-y-6">
                    <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-100/50 dark:bg-slate-800/50 border-b">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                Data Safety & Deletion Policy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4 text-sm leading-relaxed">
                            <p>
                                Under the <strong>Kenya Data Protection Act, 2019</strong> and Google Play Store policies, users of the <strong>Meru County PSB</strong> app (developed by <strong>Meru County Public Service Board</strong>) have the right to request deletion of their account and associated personal data.
                            </p>
                            
                            <div>
                                <h3 className="font-bold text-foreground mb-2">1. Types of Data Permanently Deleted</h3>
                                <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                                    <li><strong>Personal Profile:</strong> Full name, gender, date of birth, ethnicity, and profile picture (avatar).</li>
                                    <li><strong>Contact Details:</strong> Registered email address, phone number, and physical/postal addresses.</li>
                                    <li><strong>Credentials:</strong> Account password, active session tokens, and security settings.</li>
                                    <li><strong>App Notifications:</strong> Push tokens, notifications preferences, and device information.</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-foreground mb-2">2. Data Retained for Audit & Regulatory Compliance</h3>
                                <p className="text-muted-foreground mb-2">
                                    Pursuant to the <strong>County Governments Act, 2012</strong> and public auditing rules, certain data must be retained to maintain the integrity of public service recruitments:
                                </p>
                                <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                                    <li><strong>Application Records:</strong> Historical job applications submitted, including qualifications, documents, and referee records.</li>
                                    <li><strong>Recruitment Outcomes:</strong> Shortlisting history, interview scores, panel member feedback, and board resolutions.</li>
                                    <li><strong>Retention Period:</strong> These records are legally retained in a secure, read-only audit archive for <strong>6 years</strong>, after which they are permanently purged. This data is strictly excluded from active profiling and portal access.</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-200 dark:border-amber-950 bg-amber-50/20 dark:bg-amber-950/10 shadow-sm">
                        <CardContent className="pt-6 flex gap-4 items-start">
                            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-amber-900 dark:text-amber-400 text-sm mb-1">Important Notice</h3>
                                <p className="text-xs text-amber-800/95 dark:text-amber-400/90 leading-relaxed">
                                    Deleting your account is permanent. You will immediately lose access to the <strong>Meru County PSB Mobile App</strong> and web portal. If you decide to apply for future jobs, you will need to register a brand new account and build your CV again.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side: Interactive Deletion Form */}
                <div className="lg:col-span-5">
                    {step === 'request' && (
                        <Card className="shadow-lg border-red-100 dark:border-red-950/40">
                            <CardHeader className="space-y-1 pb-4">
                                <div className="inline-flex p-2 bg-red-50 dark:bg-red-950/40 rounded-lg w-fit text-red-600 dark:text-red-400 mb-2">
                                    <UserX className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-xl font-bold">Request Account Deletion</CardTitle>
                                <CardDescription>
                                    Verify your identity to receive a deletion confirmation code.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {errorMessage && (
                                    <Alert variant="destructive" className="mb-4">
                                        <ShieldAlert className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{errorMessage}</AlertDescription>
                                    </Alert>
                                )}

                                <Form {...requestForm}>
                                    <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
                                        <FormField
                                            control={requestForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem id="email">
                                                    <FormLabel>Registered Email Address</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                type="email"
                                                                placeholder="name@domain.com"
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

                                        <FormField
                                            control={requestForm.control}
                                            name="nationalId"
                                            render={({ field }) => (
                                                <FormItem id="nationalId">
                                                    <FormLabel>National ID / Passport Number</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                placeholder="Enter ID or Passport Number"
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

                                        <Button 
                                            type="submit" 
                                            className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors mt-2" 
                                            disabled={isPending}
                                        >
                                            {isPending ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Sending code...
                                                </>
                                            ) : (
                                                <>
                                                    Request Deletion Code
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                            <CardFooter className="border-t bg-slate-50/50 dark:bg-slate-900/50 py-4 flex justify-between text-xs text-muted-foreground">
                                <span>Need assistance?</span>
                                <Link href="/support" className="text-primary hover:underline font-semibold">
                                    Contact Support
                                </Link>
                            </CardFooter>
                        </Card>
                    )}

                    {step === 'confirm' && (
                        <Card className="shadow-lg border-red-200 dark:border-red-950/40">
                            <CardHeader className="space-y-1 pb-4">
                                <div className="inline-flex p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg w-fit text-amber-600 dark:text-amber-400 mb-2">
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-xl font-bold">Confirm Deletion</CardTitle>
                                <CardDescription>
                                    We sent a 6-digit code to <strong className="text-foreground">{email}</strong>. Enter it below to confirm permanent deletion.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {errorMessage && (
                                    <Alert variant="destructive" className="mb-4">
                                        <ShieldAlert className="h-4 w-4" />
                                        <AlertTitle>Verification Failed</AlertTitle>
                                        <AlertDescription>{errorMessage}</AlertDescription>
                                    </Alert>
                                )}

                                <Form {...confirmForm}>
                                    <form onSubmit={confirmForm.handleSubmit(onConfirmSubmit)} className="space-y-4">
                                        <FormField
                                            control={confirmForm.control}
                                            name="otp"
                                            render={({ field }) => (
                                                <FormItem id="otp">
                                                    <FormLabel>Verification Code (6 Digits)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="text"
                                                            maxLength={6}
                                                            placeholder="000000"
                                                            className="text-center text-2xl tracking-[0.5em] font-mono h-12"
                                                            disabled={isPending}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button 
                                            type="submit" 
                                            className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors" 
                                            disabled={isPending}
                                        >
                                            {isPending ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Deleting account...
                                                </>
                                            ) : (
                                                'Permanently Delete My Account'
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                                
                                <div className="mt-4 flex flex-col gap-2 items-center text-xs">
                                    <button 
                                        onClick={resendCode} 
                                        className="text-primary hover:underline flex items-center gap-1 font-semibold"
                                        disabled={isPending}
                                    >
                                        <RefreshCw className="h-3 w-3 animate-none" />
                                        Resend Code
                                    </button>
                                    <button 
                                        onClick={() => setStep('request')} 
                                        className="text-muted-foreground hover:underline"
                                        disabled={isPending}
                                    >
                                        Cancel and Go Back
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {step === 'success' && (
                        <Card className="shadow-lg border-green-100 dark:border-green-950/40 text-center py-6">
                            <CardContent className="space-y-4 pt-6">
                                <div className="inline-flex p-3 bg-green-50 dark:bg-green-950/40 rounded-full text-green-600 dark:text-green-400 mb-2">
                                    <CheckCircle className="h-12 w-12" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-400">
                                    Request Confirmed
                                </CardTitle>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                                    Your account and all associated personal data have been successfully deleted from the <strong>Meru County PSB</strong> recruitment system.
                                </p>
                                <div className="bg-slate-50 dark:bg-slate-900 border rounded-lg p-4 text-xs text-left space-y-2 max-w-sm mx-auto mt-4">
                                    <h4 className="font-bold text-foreground">Summary of actions:</h4>
                                    <p className="text-muted-foreground">• Personal profile & settings: <strong>Deleted</strong></p>
                                    <p className="text-muted-foreground">• Uploaded documents & files: <strong>Purged</strong></p>
                                    <p className="text-muted-foreground">• Application history: <strong>Archived for audit logs (6 years)</strong></p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-center border-t pt-6">
                                <Link href="/" className="inline-flex items-center text-sm font-semibold text-primary hover:underline">
                                    Return to Home Page
                                </Link>
                            </CardFooter>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
