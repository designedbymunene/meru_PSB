'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2, Plus, Trash2, Edit2, User, Building2, Briefcase, Mail, Phone } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { createProfileSchema, createQualificationSchema, createEmploymentHistorySchema, refereeSchema } from '@meru/shared'
import { 
    useCounties, 
    useConstituencies, 
    useWards, 
    useEthnicities,
    useEducationLevels,
    useEducationGrades,
    useInstitutions,
    useCourses
} from '@/hooks/use-reference-data'
import { useCreateOrUpdateProfile } from '@/hooks/use-applicant-profile'
import { useAuthContext } from '@/hooks/use-auth'
import * as applicantProfileApi from '@/lib/api/applicant-profiles'
import { handleApiError } from '@/lib/api-error-handler'
import type { CreateQualificationInput, CreateEmploymentHistoryInput } from '@/types'

const TOTAL_STEPS = 6

type Step1Data = z.infer<typeof createProfileSchema>
type QualificationData = z.infer<typeof createQualificationSchema>
type EmploymentData = z.infer<typeof createEmploymentHistorySchema>
type RefereeData = z.infer<typeof refereeSchema>

interface MultiStepProfileFormProps {
    onComplete: () => void
}

export function MultiStepProfileForm({ onComplete }: MultiStepProfileFormProps) {
    const { user } = useAuthContext()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [profileData, setProfileData] = useState<Partial<Step1Data>>({
        impairment: false,
        gender: 'Male',
        fullName: user?.fullName || '',
        email: user?.email || '',
        homeCountyId: undefined,
        homeSubCountyId: undefined,
        wardId: undefined,
        ethnicityId: undefined,
    } as Partial<Step1Data>)
    const [qualifications, setQualifications] = useState<QualificationData[]>([])
    const [employmentHistory, setEmploymentHistory] = useState<EmploymentData[]>([])
    const [referees, setReferees] = useState<RefereeData[]>([])

    useEffect(() => {
        if (user) {
            setProfileData(prev => ({
                ...prev,
                fullName: user.fullName || (prev as any)?.fullName,
                email: user.email || (prev as any)?.email,
            }))
        }
    }, [user])

    const createProfile = useCreateOrUpdateProfile()

    const goNext = () => {
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep(currentStep + 1)
        }
    }

    const goBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    return (
        <Card className="w-full max-w-7xl mx-auto shadow-2xl border-none">
            <CardHeader className="space-y-6 pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-3xl font-black text-primary uppercase tracking-tighter italic">Complete Your Profile</CardTitle>
                        <CardDescription className="text-base">
                            Provide your professional details to unlock all features
                        </CardDescription>
                    </div>
                    <div className="text-xs font-black text-white bg-primary px-4 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 uppercase tracking-widest">
                        Step {currentStep} / {TOTAL_STEPS}
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                        className="bg-primary h-full rounded-full transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                        style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-10">
                {currentStep === 1 && (
                    <Step1PersonalInfo
                        data={profileData}
                        onNext={(data) => {
                            setProfileData({ ...profileData, ...data })
                            goNext()
                        }}
                    />
                )}
                {currentStep === 2 && (
                    <Step2LocationInfo
                        data={profileData}
                        onNext={(data) => {
                            setProfileData({ ...profileData, ...data })
                            goNext()
                        }}
                        onBack={goBack}
                    />
                )}
                {currentStep === 3 && (
                    <Step3ContactStatus
                        data={profileData}
                        onNext={(data) => {
                            setProfileData({ ...profileData, ...data })
                            goNext()
                        }}
                        onBack={goBack}
                    />
                )}
                {currentStep === 4 && (
                    <Step4Qualifications
                        qualifications={qualifications}
                        onNext={(quals) => {
                            setQualifications(quals)
                            goNext()
                        }}
                        onBack={goBack}
                    />
                )}
                {currentStep === 5 && (
                    <Step5Employment
                        employmentHistory={employmentHistory}
                        onNext={(emp) => {
                            setEmploymentHistory(emp)
                            goNext()
                        }}
                        onBack={goBack}
                    />
                )}
                {currentStep === 6 && (
                    <Step6Referees
                        referees={referees}
                        onFinalSubmit={(finalReferees) => {
                            setReferees(finalReferees)
                            const finalSubmit = async () => {
                                setIsSubmitting(true)
                                try {
                                    const finalProfileData = {
                                        ...(profileData as any),
                                        fullName: (profileData as any).fullName || user?.fullName,
                                        email: (profileData as any).email || user?.email
                                    } as Step1Data
                                    const profileResponse = await createProfile.mutateAsync(finalProfileData as any)
                                    const profileId = profileResponse.data.id

                                    if (qualifications.length > 0) {
                                        await Promise.all(qualifications.map((q: any) => applicantProfileApi.addQualification(profileId, q)))
                                    }

                                    if (employmentHistory.length > 0) {
                                        await Promise.all(employmentHistory.map((e: any) => applicantProfileApi.addEmploymentHistory(profileId, e)))
                                    }

                                    if (finalReferees.length > 0) {
                                        await Promise.all(finalReferees.map((r: any) => applicantProfileApi.addReferee(profileId, r)))
                                    }

                                    toast.success('Profile setup complete!')
                                    onComplete()
                                } catch (e: any) {
                                    handleApiError(e, 'Error saving profile')
                                } finally {
                                    setIsSubmitting(false)
                                }
                            }
                            finalSubmit()
                        }}
                        onBack={goBack}
                        isLoading={isSubmitting}
                    />
                )}
            </CardContent>
        </Card>
    )
}

function Step1PersonalInfo({
    data,
    onNext,
}: {
    data: Partial<Step1Data>
    onNext: (data: Partial<Step1Data>) => void
}) {
    const { data: ethnicitiesResponse } = useEthnicities()
    const ethnicities = ethnicitiesResponse?.data || []

    type FormData = {
        fullName: string
        idNumber: string
        gender: 'Male' | 'Female' | 'Other'
        dateOfBirth: string
        ethnicityId?: number | null
    }

    const schema = createProfileSchema.pick({
        fullName: true,
        idNumber: true,
        gender: true,
        dateOfBirth: true,
        ethnicityId: true,
    })

    const form = useForm<FormData>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            fullName: (data as any).fullName || '',
            idNumber: (data as any).idNumber || '',
            gender: (data as any).gender as any || 'Male',
            dateOfBirth: (data as any).dateOfBirth || new Date().toISOString().split('T')[0],
            ethnicityId: (data as any).ethnicityId,
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
                <div className="bg-muted/30 p-6 rounded-2xl border-2 border-dashed mb-8">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1 block">Full Name</Label>
                    <p className="text-xl font-bold">{(data as any).fullName || 'Not set'}</p>
                    <input type="hidden" {...form.register('fullName')} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <FormField
                        control={form.control}
                        name="idNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold">ID Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="12345678" className="h-12 text-lg" {...field} />
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
                                <FormLabel className="font-bold">Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 text-lg">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
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
                                <FormLabel className="font-bold">Date of Birth</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        placeholder="YYYY-MM-DD"
                                        className="h-12 text-lg"
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
                                <FormLabel className="font-bold">Ethnicity</FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(parseInt(val))}
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-12 text-lg">
                                            <SelectValue placeholder="Select ethnicity" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {ethnicities.map((ethnicity: any) => (
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

                <div className="flex justify-end pt-10 border-t">
                    <Button type="submit" size="lg" className="rounded-full px-10 h-14 text-lg font-black uppercase tracking-tighter">
                        Save & Continue <ChevronRight className="ml-2 h-6 w-6" />
                    </Button>
                </div>
            </form>
        </Form>
    )
}

function Step2LocationInfo({
    data,
    onNext,
    onBack,
}: {
    data: Partial<Step1Data>
    onNext: (data: Partial<Step1Data>) => void
    onBack: () => void
}) {
    const { data: countiesResponse } = useCounties()
    const counties = countiesResponse?.data || []

    type LocationFormData = {
        homeCountyId?: number | null
        homeSubCountyId?: number | null
        wardId?: number | null
    }

    const schema = createProfileSchema.pick({
        homeCountyId: true,
        homeSubCountyId: true,
        wardId: true,
    })

    const form = useForm<LocationFormData>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            homeCountyId: (data as any).homeCountyId,
            homeSubCountyId: (data as any).homeSubCountyId,
            wardId: (data as any).wardId,
        },
    })

    const selectedCountyId = form.watch('homeCountyId')
    const selectedSubCountyId = form.watch('homeSubCountyId')

    const { data: subCountiesResponse } = useConstituencies(selectedCountyId ?? undefined)
    const subCounties = subCountiesResponse?.data || []

    const { data: wardsResponse } = useWards(selectedSubCountyId ?? undefined)
    const wards = wardsResponse?.data || []

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onNext)} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <FormField
                        control={form.control}
                        name="homeCountyId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold">Home County</FormLabel>
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(parseInt(val))
                                        form.setValue('homeSubCountyId', undefined)
                                        form.setValue('wardId', undefined)
                                    }}
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-12 text-lg">
                                            <SelectValue placeholder="Select county" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {counties.map((county: any) => (
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
                                <FormLabel className="font-bold">Home Sub-County</FormLabel>
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(parseInt(val))
                                        form.setValue('wardId', undefined)
                                    }}
                                    value={field.value?.toString()}
                                    disabled={!selectedCountyId}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-12 text-lg">
                                            <SelectValue placeholder="Select sub-county" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {subCounties.map((sc: any) => (
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
                                <FormLabel className="font-bold">Ward</FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(parseInt(val))}
                                    value={field.value?.toString()}
                                    disabled={!selectedSubCountyId}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-12 text-lg">
                                            <SelectValue placeholder="Select ward" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {wards.map((ward: any) => (
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

                <div className="flex justify-between pt-10 border-t">
                    <Button type="button" variant="ghost" onClick={onBack} size="lg" className="rounded-full px-8 h-14 font-black uppercase tracking-tighter">
                        <ChevronLeft className="mr-2 h-6 w-6" /> Previous
                    </Button>
                    <Button type="submit" size="lg" className="rounded-full px-10 h-14 text-lg font-black uppercase tracking-tighter">
                        Save & Continue <ChevronRight className="ml-2 h-6 w-6" />
                    </Button>
                </div>
            </form>
        </Form>
    )
}

function Step3ContactStatus({
    data,
    onNext,
    onBack,
}: {
    data: Partial<Step1Data>
    onNext: (data: Partial<Step1Data>) => void
    onBack: () => void
}) {
    type ContactFormData = {
        phoneNumber?: string
        email?: string
        impairment?: boolean
        impairmentDetails?: string
        publicServiceInfo?: string
        personalNumber?: string
    }

    const schema = createProfileSchema.pick({
        phoneNumber: true,
        email: true,
        impairment: true,
        impairmentDetails: true,
        publicServiceInfo: true,
        personalNumber: true,
    })

    const form = useForm<ContactFormData>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            phoneNumber: (data as any).phoneNumber || '',
            email: (data as any).email || '',
            impairment: (data as any).impairment || false,
            impairmentDetails: (data as any).impairmentDetails || '',
            publicServiceInfo: (data as any).publicServiceInfo || '',
            personalNumber: (data as any).personalNumber || '',
        },
    })

    const watchImpairment = form.watch('impairment')

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onNext)} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="bg-muted/30 p-6 rounded-2xl border-2 border-dashed">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1 block">Email Address</Label>
                        <p className="text-lg font-bold">{(data as any).email || 'Not set'}</p>
                        <input type="hidden" {...form.register('email')} />
                    </div>

                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold">Phone Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="+254712345678" className="h-12 text-lg" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-6">
                    <FormField
                        control={form.control}
                        name="impairment"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-4 space-y-0 rounded-2xl border-2 p-6 bg-slate-50 dark:bg-slate-900/50">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="h-6 w-6"
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="text-lg font-bold">I have a disability/impairment</FormLabel>
                                    <FormDescription className="text-sm italic">Require special accommodations?</FormDescription>
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
                                    <FormLabel className="font-bold">Impairment Details</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Please describe..." className="min-h-[120px] text-lg" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <div className="grid grid-cols-1 gap-10">
                    <FormField
                        control={form.control}
                        name="publicServiceInfo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold">Public Service Information</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Details about current or previous public service employment..."
                                        className="min-h-[100px] text-lg"
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
                                <FormLabel className="font-bold">Personal Number (if applicable)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Staff Number" className="h-12 text-lg" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-between pt-10 border-t">
                    <Button type="button" variant="ghost" onClick={onBack} size="lg" className="rounded-full px-8 h-14 font-black uppercase tracking-tighter">
                        <ChevronLeft className="mr-2 h-6 w-6" /> Previous
                    </Button>
                    <Button type="submit" size="lg" className="rounded-full px-10 h-14 text-lg font-black uppercase tracking-tighter">
                        Save & Continue <ChevronRight className="ml-2 h-6 w-6" />
                    </Button>
                </div>
            </form>
        </Form>
    )
}

function Step4Qualifications({
    qualifications,
    onNext,
    onBack,
}: {
    qualifications: QualificationData[]
    onNext: (quals: QualificationData[]) => void
    onBack: () => void
}) {
    const [quals, setQuals] = useState<QualificationData[]>(qualifications)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)

    const { data: levelsResponse } = useEducationLevels()
    const levels = levelsResponse?.data || []
    const { data: institutionsResponse } = useInstitutions()
    const institutions = institutionsResponse?.data || []
    const { data: coursesResponse } = useCourses()
    const courses = coursesResponse?.data || []

    const form = useForm<any>({
        resolver: zodResolver(createQualificationSchema) as any,
        defaultValues: {
            level: 'BACHELORS',
            course: '',
            courseId: undefined,
            institution: '',
            institutionId: undefined,
            grade: '',
            yearStart: undefined,
            yearEnd: undefined,
        },
    })

    const selectedLevelCode = form.watch('level')
    const selectedLevelId = levels.find((l: any) => l.code === selectedLevelCode)?.id
    const { data: gradesResponse } = useEducationGrades(selectedLevelId)
    const grades = gradesResponse?.data || []

    const institutionId = form.watch('institutionId')
    const courseId = form.watch('courseId')

    const addQualification = (data: QualificationData) => {
        if (editingIndex !== null) {
            const updated = [...quals]
            updated[editingIndex] = data
            setQuals(updated)
            setEditingIndex(null)
        } else {
            setQuals([...quals, data])
        }
        form.reset({
            level: 'BACHELORS',
            course: '',
            courseId: undefined,
            institution: '',
            institutionId: undefined,
            grade: '',
            yearStart: undefined,
            yearEnd: undefined,
        })
    }

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <Card className="shadow-none border-none bg-transparent">
                    <CardHeader className="px-0">
                        <CardTitle className="text-xl font-bold uppercase tracking-tight">{editingIndex !== null ? "Update Record" : "Add Qualification"}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(addQualification)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="level"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Education Level</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger className="h-12 text-lg"><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {levels.map((l: any) => <SelectItem key={l.id} value={l.code}>{l.name}</SelectItem>)}
                                                    <SelectItem value="OTHER">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="courseId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Course</FormLabel>
                                            <Select onValueChange={val => {
                                                if (val === 'other') { field.onChange(undefined) }
                                                else { const c = courses.find((x: any) => x.id.toString() === val); field.onChange(parseInt(val)); form.setValue('course', c?.name || '') }
                                            }} value={field.value?.toString() || (form.watch('course') ? 'other' : '')}>
                                                <FormControl><SelectTrigger className="h-12 text-lg"><SelectValue placeholder="Select course" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {courses.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                                    <SelectItem value="other">Other (Manual Entry)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                {(!courseId || form.watch('course')) && (
                                    <FormField
                                        control={form.control}
                                        name="course"
                                        render={({ field }) => <FormItem><FormControl><Input placeholder="Enter course name" className="h-12 text-lg" {...field} /></FormControl></FormItem>}
                                    />
                                )}
                                <Button type="submit" variant="secondary" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                                    {editingIndex !== null ? "Update Record" : "Add to List"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Label className="text-xl font-bold uppercase tracking-tight block border-b-2 pb-2">Record Summary ({quals.length})</Label>
                    {quals.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-slate-50/50">
                            <p className="text-muted-foreground font-medium italic">No records added yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {quals.map((q: any, i: number) => (
                                <div key={i} className="group relative flex items-start justify-between p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl hover:border-primary/40 hover:shadow-lg transition-all duration-200 shadow-sm">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-extrabold text-primary uppercase tracking-widest mb-0.5">{q.level}</p>
                                        <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1 truncate">{q.course}</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{q.institution} <span className="text-slate-400 dark:text-slate-500">• {q.yearEnd || 'Present'}</span></p>
                                        {q.grade && <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 font-medium">Grade: <span className="font-bold text-slate-700 dark:text-slate-300">{q.grade}</span></p>}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10" onClick={() => { setEditingIndex(i); form.reset(quals[i]) }}><Edit2 className="h-3.5 w-3.5 text-primary" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => setQuals(quals.filter((_, idx) => idx !== i))}><Trash2 className="h-3.5 w-3.5" /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-10 border-t">
                <Button type="button" variant="ghost" onClick={onBack} size="lg" className="rounded-full px-8 h-14 font-black uppercase tracking-tighter">
                    <ChevronLeft className="mr-2 h-6 w-6" /> Previous
                </Button>
                <Button onClick={() => onNext(quals)} disabled={quals.length === 0} size="lg" className="rounded-full px-10 h-14 text-lg font-black uppercase tracking-tighter">
                    Save & Continue <ChevronRight className="ml-2 h-6 w-6" />
                </Button>
            </div>
        </div>
    )
}

function Step5Employment({
    employmentHistory,
    onNext,
    onBack,
}: {
    employmentHistory: EmploymentData[]
    onNext: (emp: EmploymentData[]) => void
    onBack: () => void
}) {
    const [history, setHistory] = useState<EmploymentData[]>(employmentHistory)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const form = useForm<any>({
        resolver: zodResolver(createEmploymentHistorySchema) as any,
        defaultValues: { jobTitle: '', organization: '', startDate: '', endDate: '', jobGroup: '', responsibilities: '' },
    })

    const addRecord = (data: EmploymentData) => {
        if (editingIndex !== null) { const u = [...history]; u[editingIndex] = data; setHistory(u); setEditingIndex(null) }
        else { setHistory([...history, data]) }
        form.reset({ jobTitle: '', organization: '', startDate: '', endDate: '', jobGroup: '', responsibilities: '' })
    }

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <Card className="shadow-none border-none bg-transparent">
                    <CardHeader className="px-0"><CardTitle className="text-xl font-bold uppercase tracking-tight">{editingIndex !== null ? "Update Experience" : "Add Experience"}</CardTitle></CardHeader>
                    <CardContent className="px-0">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(addRecord)} className="space-y-6">
                                <FormField control={form.control} name="jobTitle" render={({ field }) => <FormItem><FormLabel className="font-bold">Job Title</FormLabel><FormControl><Input className="h-12 text-lg" {...field} /></FormControl></FormItem>} />
                                <FormField control={form.control} name="organization" render={({ field }) => <FormItem><FormLabel className="font-bold">Organization</FormLabel><FormControl><Input className="h-12 text-lg" {...field} /></FormControl></FormItem>} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="startDate" render={({ field }) => <FormItem><FormLabel className="font-bold">Start Date</FormLabel><FormControl><Input type="date" className="h-12 text-lg" {...field} /></FormControl></FormItem>} />
                                    <FormField control={form.control} name="endDate" render={({ field }) => <FormItem><FormLabel className="font-bold">End Date</FormLabel><FormControl><Input type="date" className="h-12 text-lg" {...field} value={field.value || ''} /></FormControl></FormItem>} />
                                </div>
                                <Button type="submit" variant="secondary" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                                    {editingIndex !== null ? "Update Record" : "Add to List"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Label className="text-xl font-bold uppercase tracking-tight block border-b-2 pb-2">Work History ({history.length})</Label>
                    {history.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-slate-50/50"><p className="text-muted-foreground font-medium italic">No experience added yet</p></div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((h: any, i: number) => (
                                <div key={i} className="group relative flex items-start justify-between p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl hover:border-primary/40 hover:shadow-lg transition-all duration-200 shadow-sm">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">{h.jobTitle}</h4>
                                        <p className="text-xs font-extrabold text-primary uppercase tracking-widest mb-2">{h.organization}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{h.startDate} <span className="text-slate-400 dark:text-slate-500">—</span> {h.endDate || 'Present'}</p>
                                        {h.jobGroup && <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 font-medium">Group: <span className="font-bold text-slate-700 dark:text-slate-300">{h.jobGroup}</span></p>}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10" onClick={() => { setEditingIndex(i); form.reset(history[i]) }}><Edit2 className="h-3.5 w-3.5 text-primary" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => setHistory(history.filter((_, idx) => idx !== i))}><Trash2 className="h-3.5 w-3.5" /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-10 border-t">
                <Button type="button" variant="ghost" onClick={onBack} size="lg" className="rounded-full px-8 h-14 font-black uppercase tracking-tighter">
                    <ChevronLeft className="mr-2 h-6 w-6" /> Previous
                </Button>
                <Button onClick={() => onNext(history)} size="lg" className="rounded-full px-10 h-14 text-lg font-black uppercase tracking-tighter">
                    Save & Continue <ChevronRight className="ml-2 h-6 w-6" />
                </Button>
            </div>
        </div>
    )
}

function Step6Referees({
    referees,
    onFinalSubmit,
    onBack,
    isLoading,
}: {
    referees: RefereeData[]
    onFinalSubmit: (referees: RefereeData[]) => void
    onBack: () => void
    isLoading: boolean
}) {
    const [list, setList] = useState<RefereeData[]>(referees)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const form = useForm<any>({
        resolver: zodResolver(refereeSchema) as any,
        defaultValues: { fullName: '', organization: '', designation: '', phoneNumber: '', email: '', relationship: '' },
    })

    const addRecord = (data: RefereeData) => {
        if (editingIndex !== null) { const u = [...list]; u[editingIndex] = data; setList(u); setEditingIndex(null) }
        else { setList([...list, data]) }
        form.reset({ fullName: '', organization: '', designation: '', phoneNumber: '', email: '', relationship: '' })
    }

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <Card className="shadow-none border-none bg-transparent">
                    <CardHeader className="px-0"><CardTitle className="text-xl font-bold uppercase tracking-tight">{editingIndex !== null ? "Update Referee" : "Add Referee"}</CardTitle></CardHeader>
                    <CardContent className="px-0">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(addRecord)} className="space-y-4">
                                <FormField control={form.control} name="fullName" render={({ field }) => <FormItem><FormLabel className="font-bold">Full Name</FormLabel><FormControl><Input className="h-12 text-lg" {...field} /></FormControl></FormItem>} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="organization" render={({ field }) => <FormItem><FormLabel className="font-bold">Organization</FormLabel><FormControl><Input className="h-12 text-lg" {...field} /></FormControl></FormItem>} />
                                    <FormField control={form.control} name="designation" render={({ field }) => <FormItem><FormLabel className="font-bold">Designation</FormLabel><FormControl><Input className="h-12 text-lg" {...field} /></FormControl></FormItem>} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel className="font-bold">Email</FormLabel><FormControl><Input type="email" className="h-12 text-lg" {...field} /></FormControl></FormItem>} />
                                    <FormField control={form.control} name="phoneNumber" render={({ field }) => <FormItem><FormLabel className="font-bold">Phone</FormLabel><FormControl><Input className="h-12 text-lg" {...field} /></FormControl></FormItem>} />
                                </div>
                                <Button type="submit" variant="secondary" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                                    {editingIndex !== null ? "Update Record" : "Add to List"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Label className="text-xl font-bold uppercase tracking-tight block border-b-2 pb-2">Referees ({list.length})</Label>
                    {list.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-slate-50/50"><p className="text-muted-foreground font-medium italic">No referees added yet</p></div>
                    ) : (
                        <div className="space-y-3">
                            {list.map((r: any, i: number) => (
                                <div key={i} className="group relative flex items-start justify-between p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl hover:border-primary/40 hover:shadow-lg transition-all duration-200 shadow-sm">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">{r.fullName}</h4>
                                        <p className="text-xs font-extrabold text-primary uppercase tracking-widest mb-2">{r.designation} <span className="text-slate-400 dark:text-slate-600">@</span> {r.organization}</p>
                                        <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400 font-medium mt-2">
                                            <span className="truncate">{r.email}</span>
                                            <span className="text-slate-400 dark:text-slate-600">•</span>
                                            <span className="whitespace-nowrap">{r.phone}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10" onClick={() => { setEditingIndex(i); form.reset(list[i]) }}><Edit2 className="h-3.5 w-3.5 text-primary" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => setList(list.filter((_, idx) => idx !== i))}><Trash2 className="h-3.5 w-3.5" /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-10 border-t">
                <Button type="button" variant="ghost" onClick={onBack} size="lg" className="rounded-full px-8 h-14 font-black uppercase tracking-tighter" disabled={isLoading}>
                    <ChevronLeft className="mr-2 h-6 w-6" /> Previous
                </Button>
                <Button onClick={() => onFinalSubmit(list)} disabled={isLoading || list.length === 0} size="lg" className="rounded-full px-10 h-14 text-lg font-black uppercase tracking-tighter">
                    {isLoading ? <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Saving...</> : <><CheckCircle2 className="mr-2 h-6 w-6" /> Complete Profile</>}
                </Button>
            </div>
        </div>
    )
}
