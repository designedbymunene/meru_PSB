'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2, GraduationCap, School, Calendar, Award, Briefcase, Edit2, Trash2 } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { createProfileSchema, createQualificationSchema, createEmploymentHistorySchema, createTrainingCourseSchema, formatKNQFLevel } from '@meru/shared'
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
import type { RegisterInput } from '@/types'

const TOTAL_STEPS = 5

type Step1Data = z.infer<typeof createProfileSchema>
type QualificationData = z.infer<typeof createQualificationSchema>
type EmploymentData = z.infer<typeof createEmploymentHistorySchema>
type TrainingData = z.infer<typeof createTrainingCourseSchema>

interface MultiStepProfileFormProps {
    onComplete: () => void
    initialRegistrationData?: RegisterInput
}

function buildInitialProfileData(
    user: ReturnType<typeof useAuthContext>['user'],
    registration: RegisterInput | undefined
): Partial<Step1Data> {
    const firstName = registration?.firstName?.trim() || ''
    const lastName = registration?.lastName?.trim() || ''

    return {
        impairment: false,
        gender: 'Male',
        fullName: registration ? `${firstName} ${lastName}`.trim() : user?.fullName || '',
        idNumber: registration?.nationalId || '',
        email: registration?.email || user?.email || '',
        phoneNumber: registration?.phoneNumber || user?.phoneNumber || '',
        homeCountyId: undefined,
        homeSubCountyId: undefined,
        wardId: undefined,
        ethnicityId: undefined,
    }
}

export function MultiStepProfileForm({ onComplete, initialRegistrationData }: MultiStepProfileFormProps) {
    const { user } = useAuthContext()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [profileData, setProfileData] = useState<Partial<Step1Data>>(() =>
        buildInitialProfileData(user, initialRegistrationData)
    )
    const [qualifications, setQualifications] = useState<QualificationData[]>([])
    const [employmentHistory, setEmploymentHistory] = useState<EmploymentData[]>([])
    const [trainingCourses, setTrainingCourses] = useState<TrainingData[]>([])

    useEffect(() => {
        setProfileData(buildInitialProfileData(user, initialRegistrationData))
    }, [user, initialRegistrationData])

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
        <Card className="w-full max-w-5xl mx-auto shadow-sm border-t-4 border-t-primary rounded-md">
            <CardHeader className="space-y-4  border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Citizen Profile Registration</CardTitle>
                        <CardDescription className="text-slate-500">
                            Please provide your official details to complete your registration
                        </CardDescription>
                    </div>
                    <div className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                        Step {currentStep} of {TOTAL_STEPS}
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-sm h-2 border border-slate-200 overflow-hidden">
                    <div
                        className="bg-primary h-full transition-all duration-500 ease-in-out"
                        style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-0">
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
                    <Step3Qualifications
                        data={profileData}
                        qualifications={qualifications}
                        onNext={(result) => {
                            const { qualifications: quals, profilePatch } = result
                            setProfileData((prev) => ({ ...prev, ...profilePatch }))
                            setQualifications(quals)
                            goNext()
                        }}
                        onBack={goBack}
                    />
                )}
                {currentStep === 4 && (
                    <Step4Employment
                        data={profileData}
                        employmentHistory={employmentHistory}
                        onNext={(result) => {
                            const { employmentHistory: emp, profilePatch } = result
                            setProfileData((prev) => ({ ...prev, ...profilePatch }))
                            setEmploymentHistory(emp)
                            goNext()
                        }}
                        onBack={goBack}
                    />
                )}
                {currentStep === 5 && (
                    <Step5TrainingCourses
                        data={profileData}
                        trainingCourses={trainingCourses}
                        onFinalSubmit={(result) => {
                            const { trainingCourses: finalTrainingCourses, profilePatch } = result
                            setProfileData((prev) => ({ ...prev, ...profilePatch }))
                            setTrainingCourses(finalTrainingCourses)
                            const finalSubmit = async () => {
                                setIsSubmitting(true)
                                try {
                                    const finalProfileData = {
                                        ...(profileData as any),
                                        fullName: (profileData as any).fullName || user?.fullName,
                                        email: (profileData as any).email || user?.email,
                                        phoneNumber: (profileData as any).phoneNumber || user?.phoneNumber,
                                        ...profilePatch,
                                    } as Step1Data
                                    const profileResponse = await createProfile.mutateAsync(finalProfileData as any)
                                    const profileId = profileResponse.data.id

                                    if (qualifications.length > 0) {
                                        await Promise.all(qualifications.map((q: any) => applicantProfileApi.addQualification(profileId, q)))
                                    }

                                    if (employmentHistory.length > 0) {
                                        await Promise.all(employmentHistory.map((e: any) => applicantProfileApi.addEmploymentHistory(profileId, e)))
                                    }

                                    if (finalTrainingCourses.length > 0) {
                                        await Promise.all(finalTrainingCourses.map((course: any) => applicantProfileApi.addTrainingCourse(profileId, course)))
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
        ethnicityId?: number
        impairment?: boolean
        impairmentDetails?: string
    }

    const schema = createProfileSchema.pick({
        fullName: true,
        idNumber: true,
        gender: true,
        dateOfBirth: true,
        ethnicityId: true,
        impairment: true,
        impairmentDetails: true,
    })

    const form = useForm<FormData>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            fullName: (data as any).fullName || '',
            idNumber: (data as any).idNumber || '',
            gender: (data as any).gender as any || 'Male',
            dateOfBirth: (data as any).dateOfBirth || '',
            ethnicityId: (data as any).ethnicityId || undefined,
            impairment: (data as any).impairment || false,
            impairmentDetails: (data as any).impairmentDetails || '',
        },
    })

    const watchImpairment = form.watch('impairment')

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl mb-6">
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Legal Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your full legal name" className="text-lg font-bold bg-white border-2 focus-visible:ring-primary/20 h-14" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="idNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold text-slate-700">National ID Number <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter ID number" className="h-12 bg-white rounded-md" {...field} />
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
                                <FormLabel className="font-semibold text-slate-700">Gender <span className="text-destructive">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 bg-white rounded-md">
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
                                <FormLabel className="font-semibold text-slate-700">Date of Birth <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        className="h-12 bg-white rounded-md"
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
                                <FormLabel className="font-semibold text-slate-700">Ethnicity <span className="text-destructive">*</span></FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(parseInt(val))}
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-12 bg-white rounded-md">
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

                <div className="space-y-4 border border-slate-200 rounded-xl p-6 bg-white mt-6 shadow-sm">
                    <FormField
                        control={form.control}
                        name="impairment"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-4 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="h-6 w-6"
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="text-base font-bold text-slate-900">I have a disability or impairment</FormLabel>
                                    <FormDescription className="text-sm text-slate-500 font-medium">Check this box if you require special accommodations.</FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />

                    {watchImpairment && (
                        <FormField
                            control={form.control}
                            name="impairmentDetails"
                            render={({ field }) => (
                                <FormItem className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <FormLabel className="font-semibold text-slate-700">Impairment Details <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Please specify the nature of your impairment..." className="min-h-[100px] rounded-xl border-2 focus-visible:ring-primary/20" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <div className="flex justify-end pt-8 border-t border-slate-100 mt-10">
                    <Button type="submit" size="lg" className="rounded-xl font-bold px-8 h-12 shadow-lg hover:shadow-xl transition-all">
                        Save & Continue <ChevronRight className="ml-2 h-5 w-5" />
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
        homeCountyId?: number
        homeSubCountyId?: number
        wardId?: number
    }

    const schema = createProfileSchema.pick({
        homeCountyId: true,
        homeSubCountyId: true,
        wardId: true,
    })

    const form = useForm<LocationFormData>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            homeCountyId: (data as any).homeCountyId || undefined,
            homeSubCountyId: (data as any).homeSubCountyId || undefined,
            wardId: (data as any).wardId || undefined,
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
            <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 mb-8">
                    <h3 className="text-2xl font-bold text-slate-900">Location Details</h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">Choose the county, sub-county, and ward that match your home area.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="homeCountyId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold text-slate-700">Home County <span className="text-destructive">*</span></FormLabel>
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(parseInt(val))
                                        form.setValue('homeSubCountyId', undefined)
                                        form.setValue('wardId', undefined)
                                    }}
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-12 bg-white rounded-md">
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
                                <FormLabel className="font-semibold text-slate-700">Home Sub-County <span className="text-destructive">*</span></FormLabel>
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(parseInt(val))
                                        form.setValue('wardId', undefined)
                                    }}
                                    value={field.value?.toString()}
                                    disabled={!selectedCountyId}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-12 bg-white rounded-md">
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
                                <FormLabel className="font-semibold text-slate-700">Ward <span className="text-destructive">*</span></FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(parseInt(val))}
                                    value={field.value?.toString()}
                                    disabled={!selectedSubCountyId}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-12 bg-white rounded-md">
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

                <div className="flex justify-between pt-8 border-t border-slate-100 mt-10">
                    <Button type="button" variant="outline" onClick={onBack} className="rounded-xl font-bold px-8 h-12">
                        <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                    </Button>
                    <Button type="submit" className="rounded-xl font-bold px-8 h-12 shadow-lg">
                        Save & Continue <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </form>
        </Form>
    )
}


function Step3Qualifications({
    data,
    qualifications,
    onNext,
    onBack,
}: {
    data: Partial<Step1Data>
    qualifications: QualificationData[]
    onNext: (result: { qualifications: QualificationData[]; profilePatch: Partial<Step1Data> }) => void
    onBack: () => void
}) {
    const [quals, setQuals] = useState<QualificationData[]>(qualifications)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [noAcademicHistory, setNoAcademicHistory] = useState(Boolean((data as any).hasNoCertificates))

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
            setNoAcademicHistory(false)
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
        <div className="space-y-8">
            <Card className="border border-slate-200 shadow-sm rounded-2xl">
                <CardHeader className="border-b bg-slate-50/80 py-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold text-slate-900">Academic History</CardTitle>
                            <CardDescription className="text-slate-500">Add your formal education and qualifications.</CardDescription>
                        </div>
                        <div className="text-sm font-semibold text-slate-600 bg-white border rounded-full px-3 py-1">
                            {quals.length} record{quals.length === 1 ? '' : 's'} added
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {quals.length === 0 && (
                        <div className="mb-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 flex flex-row items-center space-x-3">
                            <Checkbox
                                id="hasNoCertificates"
                                checked={noAcademicHistory}
                                onCheckedChange={(checked) => {
                                    setNoAcademicHistory(checked === true)
                                }}
                            />
                            <div className="space-y-1 leading-none">
                                <Label htmlFor="hasNoCertificates" className="font-semibold text-slate-900">I have no academic history to add</Label>
                                <p className="text-sm text-slate-500">Use this if you do not have certificates, diplomas, or other academic records to enter right now.</p>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-8">
                        <Card className="shadow-none border border-slate-200 rounded-2xl">
                            <CardHeader className="bg-white border-b border-slate-200 py-4">
                                <CardTitle className="text-lg font-bold text-slate-800">{editingIndex !== null ? "Edit Academic Record" : "Add Academic Record"}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(addQualification)} className="space-y-5">
                                        <FormField
                                            control={form.control}
                                            name="level"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-semibold text-slate-700">Education Level</FormLabel>
                                                    <Select onValueChange={(val) => {
                                                        field.onChange(val)
                                                        form.setValue('grade', '')
                                                    }} value={field.value}>
                                                        <FormControl><SelectTrigger className="rounded-xl"><SelectValue placeholder="Select education level" /></SelectTrigger></FormControl>
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
                                                    <FormLabel className="font-semibold text-slate-700">Course / Programme</FormLabel>
                                                    <Select onValueChange={val => {
                                                        if (val === 'other') { field.onChange(undefined) }
                                                        else { const c = courses.find((x: any) => x.id.toString() === val); field.onChange(parseInt(val)); form.setValue('course', c?.name || '') }
                                                    }} value={field.value?.toString() || (form.watch('course') ? 'other' : '')}>
                                                        <FormControl><SelectTrigger className="rounded-xl"><SelectValue placeholder="Select course" /></SelectTrigger></FormControl>
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
                                                render={({ field }) => <FormItem><FormControl><Input placeholder="Enter specific course name" className="rounded-xl" {...field} /></FormControl></FormItem>}
                                            />
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="institution"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold text-slate-700">Institution</FormLabel>
                                                        <FormControl><Input placeholder="Institution name" className="rounded-xl" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="grade"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold text-slate-700">Grade / Score</FormLabel>
                                                        {grades.length > 0 ? (
                                                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                                                <FormControl>
                                                                    <SelectTrigger className="rounded-xl">
                                                                        <SelectValue placeholder="Select grade" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {grades.map((g: any) => (
                                                                        <SelectItem key={g.id} value={g.grade}>
                                                                            {g.grade}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        ) : (
                                                            <FormControl>
                                                                <Input placeholder="e.g. Pass, B+, 85%" className="rounded-xl" {...field} value={field.value || ''} />
                                                            </FormControl>
                                                        )}
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="yearStart"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold text-slate-700">Start Year</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="2019" className="rounded-xl" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="yearEnd"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold text-slate-700">End Year</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="2023" className="rounded-xl" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <Button type="submit" variant="secondary" className="w-full rounded-xl font-semibold border border-slate-300">
                                            {editingIndex !== null ? "Save Changes" : "Add Record"}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 -mr-2 [scrollbar-width:thin]">
                            {quals.length === 0 ? (
                                <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                    <div className="max-w-sm">
                                        <p className="font-semibold text-slate-900">No academic records yet</p>
                                        <p className="mt-2 text-sm text-slate-500">Use the form to add each qualification, or mark that you have no academic history to continue.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4 pt-1 pb-4">
                                    {quals.map((q: any, i: number) => (
                                        <div key={i} className="group relative flex items-start justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-300">
                                            <div className="flex-1 min-w-0 space-y-3">
                                                <div className="flex items-start gap-4">
                                                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                                        <GraduationCap className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1 space-y-1.5">
                                                        <h4 className="font-bold text-slate-900 text-lg leading-tight break-words">{q.course}</h4>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            <Badge variant="secondary" className="font-semibold text-[10px] px-2 bg-primary/5 text-primary border-none uppercase tracking-wider h-auto py-0.5 whitespace-normal break-words max-w-full">
                                                                {formatKNQFLevel(q.level)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3 pl-[60px]">
                                                    <div className="flex items-center gap-2 text-[13px] text-slate-600 font-medium break-words">
                                                        <School className="h-3.5 w-3.5 opacity-60 flex-shrink-0" />
                                                        <span>{q.institution}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                                                            <Calendar className="h-3.5 w-3.5 opacity-60" />
                                                            <span>{q.yearStart} - {q.yearEnd || 'Present'}</span>
                                                        </div>
                                                        {q.grade && (
                                                            <Badge variant="outline" className="text-[10px] py-0 h-5 border-slate-200 font-bold uppercase bg-slate-50">
                                                                <Award className="h-3 w-3 mr-1 opacity-60" />
                                                                {q.grade}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 ml-4 flex-shrink-0">
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => { setEditingIndex(i); form.reset(quals[i]) }}><Edit2 className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setQuals(quals.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between pt-6 border-t border-slate-100 mt-8">
                <Button type="button" variant="outline" onClick={onBack} className="rounded-xl font-bold px-8 h-12">
                    <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                </Button>
                <Button onClick={() => onNext({ qualifications: quals, profilePatch: { hasNoCertificates: noAcademicHistory } })} disabled={!noAcademicHistory && quals.length === 0} className="rounded-xl font-bold px-8 h-12 shadow-lg">
                    Save & Continue <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}

function Step4Employment({
    data,
    employmentHistory,
    onNext,
    onBack,
}: {
    data: Partial<Step1Data>
    employmentHistory: EmploymentData[]
    onNext: (result: { employmentHistory: EmploymentData[]; profilePatch: Partial<Step1Data> }) => void
    onBack: () => void
}) {
    const [history, setHistory] = useState<EmploymentData[]>(employmentHistory)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [noExperience, setNoExperience] = useState(Boolean((data as any).hasNoExperience))
    const form = useForm<any>({
        resolver: zodResolver(createEmploymentHistorySchema) as any,
        defaultValues: { jobTitle: '', organization: '', startDate: '', endDate: '', jobGroup: '', responsibilities: '' },
    })

    const addRecord = (data: EmploymentData) => {
        if (editingIndex !== null) { const u = [...history]; u[editingIndex] = data; setHistory(u); setEditingIndex(null) }
        else {
            setHistory([...history, data])
            setNoExperience(false)
        }
        form.reset({ jobTitle: '', organization: '', startDate: '', endDate: '', jobGroup: '', responsibilities: '' })
    }

    return (
        <div className="space-y-8">
            <Card className="border border-slate-200 shadow-sm rounded-2xl">
                <CardHeader className="border-b bg-slate-50/80 py-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold text-slate-900">Employment History</CardTitle>
                            <CardDescription className="text-slate-500">Add your previous roles, organizations, and dates.</CardDescription>
                        </div>
                        <div className="text-sm font-semibold text-slate-600 bg-white border rounded-full px-3 py-1">
                            {history.length} record{history.length === 1 ? '' : 's'} added
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {history.length === 0 && (
                        <div className="mb-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 flex flex-row items-center space-x-3">
                            <Checkbox
                                id="hasNoExperience"
                                checked={noExperience}
                                onCheckedChange={(checked) => {
                                    setNoExperience(checked === true)
                                }}
                            />
                            <div className="space-y-1 leading-none">
                                <Label htmlFor="hasNoExperience" className="font-semibold text-slate-900">I have no employment history to add</Label>
                                <p className="text-sm text-slate-500">Use this if you have never worked before or do not want to list previous roles.</p>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-8">
                        <Card className="shadow-none border border-slate-200 rounded-2xl">
                            <CardHeader className="bg-white border-b border-slate-200 py-4">
                                <CardTitle className="text-lg font-bold text-slate-800">{editingIndex !== null ? "Edit Employment Record" : "Add Employment Record"}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(addRecord)} className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="jobTitle" render={({ field }) => <FormItem><FormLabel className="font-semibold text-slate-700">Official Job Title</FormLabel><FormControl><Input className="rounded-xl" {...field} /></FormControl></FormItem>} />
                                            <FormField control={form.control} name="organization" render={({ field }) => <FormItem><FormLabel className="font-semibold text-slate-700">Organization / Department</FormLabel><FormControl><Input className="rounded-xl" {...field} /></FormControl></FormItem>} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="startDate" render={({ field }) => <FormItem><FormLabel className="font-semibold text-slate-700">Start Date</FormLabel><FormControl><Input type="date" className="rounded-xl" {...field} /></FormControl></FormItem>} />
                                            <FormField control={form.control} name="endDate" render={({ field }) => <FormItem><FormLabel className="font-semibold text-slate-700">End Date</FormLabel><FormControl><Input type="date" className="rounded-xl" {...field} value={field.value || ''} /></FormControl></FormItem>} />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="responsibilities"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-semibold text-slate-700">Key Responsibilities</FormLabel>
                                                    <FormControl>
                                                        <Textarea className="min-h-[120px] rounded-xl" placeholder="Briefly describe your main duties and achievements." {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" variant="secondary" className="w-full rounded-xl font-semibold border border-slate-300">
                                            {editingIndex !== null ? "Save Changes" : "Add Record"}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>

                        <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2 -mr-2 [scrollbar-width:thin]">
                            {history.length === 0 ? (
                                <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                    <div className="max-w-sm">
                                        <p className="font-semibold text-slate-900">No employment history yet</p>
                                        <p className="mt-2 text-sm text-slate-500">Add your previous jobs or mark that you have no experience to continue.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4 pt-1 pb-4">
                                    {history.map((h: any, i: number) => (
                                        <div key={i} className="group relative flex items-start justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-300">
                                            <div className="flex-1 min-w-0 space-y-3">
                                                <div className="flex items-start gap-4">
                                                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                                        <Briefcase className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1 space-y-1.5">
                                                        <h4 className="font-bold text-slate-900 text-lg leading-tight break-words">{h.jobTitle}</h4>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            <Badge variant="secondary" className="rounded-md font-bold text-[10px] px-2 bg-primary/5 text-primary border-none uppercase tracking-wider">
                                                                {h.organization}
                                                            </Badge>
                                                            {h.jobGroup && (
                                                                <Badge variant="outline" className="rounded-md font-medium text-[10px] px-2 text-muted-foreground uppercase tracking-wider">
                                                                    Group {h.jobGroup}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3 pl-[60px]">
                                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                                                        <Calendar className="h-3.5 w-3.5 opacity-60" />
                                                        <span>{h.startDate} — {h.endDate || 'Present'}</span>
                                                    </div>
                                                    {h.responsibilities && (
                                                        <p className="text-sm text-slate-500 leading-relaxed italic line-clamp-2 pl-4 border-l-2 border-primary/10 break-words">
                                                            {h.responsibilities}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 ml-4 flex-shrink-0">
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => { setEditingIndex(i); form.reset(history[i]) }}><Edit2 className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setHistory(history.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between pt-6 border-t border-slate-100 mt-8">
                <Button type="button" variant="outline" onClick={onBack} className="rounded-xl font-bold px-8 h-12">
                    <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                </Button>
                <Button onClick={() => onNext({ employmentHistory: history, profilePatch: { hasNoExperience: noExperience } })} disabled={!noExperience && history.length === 0} className="rounded-xl font-bold px-8 h-12 shadow-lg">
                    Save & Continue <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}

function Step5TrainingCourses({
    data,
    trainingCourses,
    onFinalSubmit,
    onBack,
    isLoading,
}: {
    data: Partial<Step1Data>
    trainingCourses: TrainingData[]
    onFinalSubmit: (result: { trainingCourses: TrainingData[]; profilePatch: Partial<Step1Data> }) => void
    onBack: () => void
    isLoading: boolean
}) {
    const [list, setList] = useState<TrainingData[]>(trainingCourses)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [noTraining, setNoTraining] = useState(Boolean((data as any).hasNoTrainings))
    const form = useForm<any>({
        resolver: zodResolver(createTrainingCourseSchema) as any,
        defaultValues: {
            courseName: '',
            description: '',
            grade: '',
            institution: '',
            year: undefined,
            certificatePath: '',
        },
    })

    const addRecord = (record: TrainingData) => {
        if (editingIndex !== null) {
            const updated = [...list]
            updated[editingIndex] = record
            setList(updated)
            setEditingIndex(null)
        } else {
            setList([...list, record])
            setNoTraining(false)
        }
        form.reset({
            courseName: '',
            description: '',
            grade: '',
            institution: '',
            year: undefined,
            certificatePath: '',
        })
    }

    return (
        <div className="space-y-8">
            <Card className="border border-slate-200 shadow-sm rounded-2xl">
                <CardHeader className="border-b bg-slate-50/80 py-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold text-slate-900">Training Courses</CardTitle>
                            <CardDescription className="text-slate-500">Add short courses, certifications, and professional training.</CardDescription>
                        </div>
                        <div className="text-sm font-semibold text-slate-600 bg-white border rounded-full px-3 py-1">
                            {list.length} course{list.length === 1 ? '' : 's'} added
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {list.length === 0 && (
                        <div className="mb-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 flex flex-row items-center space-x-3">
                            <Checkbox
                                id="hasNoTrainings"
                                checked={noTraining}
                                onCheckedChange={(checked) => {
                                    setNoTraining(checked === true)
                                }}
                            />
                            <div className="space-y-1 leading-none">
                                <Label htmlFor="hasNoTrainings" className="font-semibold text-slate-900">I have no training courses to add</Label>
                                <p className="text-sm text-slate-500">Use this if you do not have any short courses or certificates to list right now.</p>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-8">
                        <Card className="shadow-none border border-slate-200 rounded-2xl">
                            <CardHeader className="bg-white border-b border-slate-200 py-4">
                                <CardTitle className="text-lg font-bold text-slate-800">{editingIndex !== null ? 'Edit Training Course' : 'Add Training Course'}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(addRecord)} className="space-y-5">
                                        <FormField
                                            control={form.control}
                                            name="courseName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-semibold text-slate-700">Course Name</FormLabel>
                                                    <FormControl><Input className="rounded-xl" placeholder="e.g. Project Management Professional" {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="institution"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold text-slate-700">Institution</FormLabel>
                                                        <FormControl><Input className="rounded-xl" placeholder="e.g. Kenya School of Government" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="year"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold text-slate-700">Year Completed</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="2023"
                                                                className="rounded-xl"
                                                                {...field}
                                                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                                value={field.value || ''}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="grade"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold text-slate-700">Grade / Score</FormLabel>
                                                        <FormControl><Input className="rounded-xl" placeholder="e.g. Pass, 85%" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="certificatePath"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-semibold text-slate-700">Certificate Reference</FormLabel>
                                                        <FormControl><Input className="rounded-xl" placeholder="Optional file path or ref" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-semibold text-slate-700">Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea className="min-h-[120px] rounded-xl" placeholder="Briefly describe the course focus or outcome." {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" variant="secondary" className="w-full rounded-xl font-semibold border border-slate-300">
                                            {editingIndex !== null ? 'Save Changes' : 'Add Record'}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 -mr-2 [scrollbar-width:thin]">
                            {list.length === 0 ? (
                                <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                    <div className="max-w-sm">
                                        <p className="font-semibold text-slate-900">No training courses yet</p>
                                        <p className="mt-2 text-sm text-slate-500">Add short courses or mark that you have no trainings to continue.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4 pt-1 pb-4">
                                    {list.map((course: any, i: number) => (
                                        <div key={i} className="group relative flex items-start justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-300">
                                            <div className="flex-1 min-w-0 space-y-3">
                                                <div className="flex items-start gap-4">
                                                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                                        <GraduationCap className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1 space-y-1.5">
                                                        <h4 className="font-bold text-slate-900 text-lg leading-tight break-words">{course.courseName}</h4>
                                                        <p className="text-[13px] text-slate-600 font-medium flex items-center gap-1.5 break-words">
                                                            <School className="h-3.5 w-3.5 opacity-60 flex-shrink-0" />
                                                            {course.institution || 'No institution set'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3 pl-[60px]">
                                                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                                                        {course.year && (
                                                            <div className="flex items-center gap-1.5 bg-slate-50 border px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                                <Calendar className="h-3 w-3 opacity-60" />
                                                                <span>Completed in {course.year}</span>
                                                            </div>
                                                        )}
                                                        {course.grade && (
                                                            <Badge variant="outline" className="rounded-md font-bold text-[10px] px-2 text-primary border-primary/20 uppercase tracking-wider h-5 bg-primary/5">
                                                                <Award className="h-3 w-3 mr-1 opacity-60 text-primary" />
                                                                {course.grade}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {course.description && (
                                                        <p className="text-sm text-slate-500 leading-relaxed italic line-clamp-2 border-l-2 border-primary/10 pl-3 break-words">
                                                            {course.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 ml-4 flex-shrink-0">
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => { setEditingIndex(i); form.reset(list[i]) }}><Edit2 className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setList(list.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between pt-6 border-t border-slate-100 mt-8">
                <Button type="button" variant="outline" onClick={onBack} className="rounded-xl font-bold px-8 h-12" disabled={isLoading}>
                    <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                </Button>
                <Button onClick={() => onFinalSubmit({ trainingCourses: list, profilePatch: { hasNoTrainings: noTraining } })} disabled={isLoading || (!noTraining && list.length === 0)} className="rounded-xl font-bold px-8 h-12 shadow-lg">
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><CheckCircle2 className="mr-2 h-4 w-4" /> Submit Profile Registration</>}
                </Button>
            </div>
        </div>
    )
}
