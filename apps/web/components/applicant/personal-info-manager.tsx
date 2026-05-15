'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createProfileSchema, CreateProfileInput } from '@meru/shared'
import { useMyProfile, useCreateOrUpdateProfile } from '@/hooks/use-applicant-profile'
import { 
    useCounties, 
    useConstituencies, 
    useWards, 
    useEthnicities 
} from '@/hooks/use-reference-data'

interface ReferenceItem {
    id: number
    name: string
}

export function PersonalInfoManager() {
    const { data: profileResponse, isLoading } = useMyProfile()
    const profile = profileResponse?.data
    const updateProfile = useCreateOrUpdateProfile()

    // Location & Reference Queries
    const { data: countiesResponse } = useCounties()
    const counties = (countiesResponse?.data as ReferenceItem[]) || []
    
    const { data: ethnicitiesResponse } = useEthnicities()
    const ethnicities = (ethnicitiesResponse?.data as ReferenceItem[]) || []

    const form = useForm<CreateProfileInput>({
        resolver: zodResolver(createProfileSchema) as any,
        values: profile ? {
            fullName: profile.fullName || '',
            idNumber: profile.idNumber,
            gender: profile.gender as 'Male' | 'Female' | 'Other',
            dateOfBirth: profile.dateOfBirth || new Date().toISOString().split('T')[0],
            ethnicityId: profile.ethnicityId || 0,
            phoneNumber: profile.phoneNumber || '',
            email: profile.email,
            homeCountyId: profile.homeCountyId || 0,
            homeSubCountyId: profile.homeSubCountyId || 0,
            wardId: profile.wardId || 0,
            impairment: profile.impairment,
            impairmentDetails: profile.impairmentDetails || '',
            publicServiceInfo: profile.publicServiceInfo || '',
            personalNumber: profile.personalNumber || '',
            hasNoExperience: profile.hasNoExperience || false,
            hasNoCertificates: profile.hasNoCertificates || false,
            hasNoMemberships: profile.hasNoMemberships || false,
            hasNoTrainings: profile.hasNoTrainings || false,
            hasNoReferees: profile.hasNoReferees || false,
        } : {
            fullName: '',
            idNumber: '',
            gender: 'Male' as const,
            dateOfBirth: new Date().toISOString().split('T')[0],
            ethnicityId: 0,
            phoneNumber: '',
            email: '',
            homeCountyId: 0,
            homeSubCountyId: 0,
            wardId: 0,
            impairment: false,
            impairmentDetails: '',
            publicServiceInfo: '',
            personalNumber: '',
            hasNoExperience: false,
            hasNoCertificates: false,
            hasNoMemberships: false,
            hasNoTrainings: false,
            hasNoReferees: false,
        },
    }) as any

    const selectedCountyId = form.watch('homeCountyId') as number | undefined
    const selectedSubCountyId = form.watch('homeSubCountyId') as number | undefined

    const { data: subCountiesResponse } = useConstituencies(selectedCountyId)
    const subCounties = (subCountiesResponse?.data as ReferenceItem[]) || []

    const { data: wardsResponse } = useWards(selectedSubCountyId)
    const wards = (wardsResponse?.data as ReferenceItem[]) || []

    const watchImpairment = form.watch('impairment')

    const onSubmit = async (data: CreateProfileInput) => {
        await updateProfile.mutateAsync(data)
    }

    // Warn user about unsaved changes before leaving
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (form.formState.isDirty) {
                e.preventDefault()
                e.returnValue = ''
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [form.formState.isDirty])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                {/* Identity Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-5 w-1 bg-primary rounded-full" />
                        <h3 className="text-lg font-bold tracking-tight">Identity & Bio</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground/70">Full Name *</FormLabel>
                                    <FormControl>
                                        <Input className="h-11 rounded-lg border-muted-foreground/20 focus:border-primary/50 transition-colors" placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="idNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground/70">ID Number *</FormLabel>
                                    <FormControl>
                                        <Input className="h-11 rounded-lg border-muted-foreground/20 focus:border-primary/50 transition-colors" placeholder="12345678" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground/70">Gender *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-11 rounded-lg border-muted-foreground/20 focus:border-primary/50 transition-colors">
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground/70">Date of Birth *</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="h-11 rounded-lg border-muted-foreground/20 focus:border-primary/50 transition-colors"
                                            type="date"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="ethnicityId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground/70">Ethnicity *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-11 rounded-lg border-muted-foreground/20 focus:border-primary/50 transition-colors">
                                                <SelectValue placeholder="Select ethnicity" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl">
                                            {ethnicities.map((ethnicity: ReferenceItem) => (
                                                <SelectItem key={ethnicity.id} value={ethnicity.id.toString()}>
                                                    {ethnicity.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Location Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-5 w-1 bg-primary rounded-full" />
                        <h3 className="text-lg font-bold tracking-tight">Home & Residence</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                            control={form.control}
                            name="homeCountyId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground/70">Home County *</FormLabel>
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(parseInt(val))
                                            form.setValue('homeSubCountyId', undefined)
                                            form.setValue('wardId', undefined)
                                        }}
                                        value={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-11 rounded-lg border-muted-foreground/20 focus:border-primary/50 transition-colors">
                                                <SelectValue placeholder="Select county" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl">
                                            {counties.map((county: ReferenceItem) => (
                                                <SelectItem key={county.id} value={county.id.toString()}>
                                                    {county.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="homeSubCountyId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground/70">Sub-County *</FormLabel>
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(parseInt(val))
                                            form.setValue('wardId', undefined)
                                        }}
                                        value={field.value?.toString()}
                                        disabled={!selectedCountyId}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-11 rounded-lg border-muted-foreground/20 focus:border-primary/50 transition-colors">
                                                <SelectValue placeholder="Select sub-county" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl">
                                            {subCounties.map((sc: ReferenceItem) => (
                                                <SelectItem key={sc.id} value={sc.id.toString()}>
                                                    {sc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="wardId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground/70">Ward *</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(parseInt(val))}
                                        value={field.value?.toString()}
                                        disabled={!selectedSubCountyId}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-11 rounded-lg border-muted-foreground/20 focus:border-primary/50 transition-colors">
                                                <SelectValue placeholder="Select ward" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl">
                                            {wards.map((ward: ReferenceItem) => (
                                                <SelectItem key={ward.id} value={ward.id.toString()}>
                                                    {ward.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Contact Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-5 w-1 bg-primary rounded-full" />
                        <h3 className="text-lg font-bold tracking-tight">Contact Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground/70">Phone Number *</FormLabel>
                                    <FormControl>
                                        <Input className="h-11 rounded-lg border-muted-foreground/20 focus:border-primary/50 transition-colors" placeholder="+254712345678" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground/70">Email Address *</FormLabel>
                                    <FormControl>
                                        <Input className="h-11 rounded-lg border-muted-foreground/20 focus:border-primary/50 transition-colors" type="email" placeholder="john@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Supplementary Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-5 w-1 bg-primary rounded-full" />
                        <h3 className="text-lg font-bold tracking-tight">Additional Details</h3>
                    </div>
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="impairment"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-xl border border-muted-foreground/20 p-5 bg-muted/10">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="h-5 w-5 rounded-md border-slate-300 shadow-sm"
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-bold text-slate-900 dark:text-slate-100 cursor-pointer">I have a disability/impairment</FormLabel>
                                        <p className="text-[11px] text-muted-foreground font-medium">This helps us ensure equal opportunity and support.</p>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {watchImpairment && (
                            <FormField
                                control={form.control}
                                name="impairmentDetails"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground/70">Impairment Details</FormLabel>
                                        <FormControl>
                                            <Textarea className="rounded-xl border-muted-foreground/20 min-h-[100px] resize-none" placeholder="Please describe..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="publicServiceInfo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground/70">Public Service History</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="rounded-xl border-muted-foreground/20 min-h-[120px] resize-none"
                                                placeholder="Details about current or previous public service employment..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="personalNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground/70">Personal/Staff Number</FormLabel>
                                        <FormControl>
                                            <Input className="h-11 rounded-lg border-muted-foreground/20 focus:border-primary/50 transition-colors" placeholder="If applicable" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-[10px] mt-1 font-medium">For existing or former public servants</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-8 border-t">
                    <Button type="submit" size="lg" disabled={updateProfile.isPending} className="h-12 px-10 rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all">
                        {updateProfile.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving Changes...
                            </>
                        ) : (
                            'Save All Changes'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
