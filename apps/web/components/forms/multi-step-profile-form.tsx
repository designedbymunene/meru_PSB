'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2, Plus, Trash2, Edit2 } from 'lucide-react'
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
import { createProfileSchema, createQualificationSchema, createEmploymentHistorySchema } from '@meru/shared'
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

const TOTAL_STEPS = 5

type Step1Data = z.infer<typeof createProfileSchema>
type QualificationData = z.infer<typeof createQualificationSchema>
type EmploymentData = z.infer<typeof createEmploymentHistorySchema>

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
        applicantName: user?.fullName || '',
        email: user?.email || '',
        homeCountyId: undefined,
        homeSubCountyId: undefined,
        wardId: undefined,
        ethnicityId: undefined,
    })
    const [qualifications, setQualifications] = useState<QualificationData[]>([])
    const [employmentHistory, setEmploymentHistory] = useState<EmploymentData[]>([])

    // Update profile data when user context is available
    useEffect(() => {
        if (user) {
            setProfileData(prev => ({
                ...prev,
                applicantName: user.fullName || prev.applicantName,
                email: user.email || prev.email,
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
        <Card className="w-full max-w-7xl mx-auto shadow-lg">
            <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold text-primary">Complete Your Profile</CardTitle>
                        <CardDescription>
                            Please provide your details to finish setting up your account
                        </CardDescription>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                        Step {currentStep} of {TOTAL_STEPS}
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-primary h-2 rounded-full transition-all duration-500 ease-in-out"
                        style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-8">
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
                        onFinalSubmit={(finalEmployment) => {
                            setEmploymentHistory(finalEmployment)
                            const finalSubmit = async () => {
                                setIsSubmitting(true)
                                try {
                                    // Ensure we have name/email from state or fallback to user context
                                    const finalProfileData = {
                                        ...profileData,
                                        applicantName: profileData.applicantName || user?.fullName,
                                        email: profileData.email || user?.email
                                    }
                                    const profileResponse = await createProfile.mutateAsync(finalProfileData as Step1Data)
                                    const profileId = profileResponse.data.id

                                    if (qualifications.length > 0) {
                                        await Promise.all(qualifications.map(q => applicantProfileApi.addQualification(profileId, q)))
                                    }

                                    if (finalEmployment.length > 0) {
                                        await Promise.all(finalEmployment.map(e => applicantProfileApi.addEmploymentHistory(profileId, e)))
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

    const schema = createProfileSchema.pick({
        applicantName: true,
        idNumber: true,
        gender: true,
        birthYear: true,
        ethnicityId: true,
    })

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            applicantName: data.applicantName || '',
            idNumber: data.idNumber || '',
            gender: data.gender || 'Male',
            birthYear: data.birthYear || new Date().getFullYear() - 25,
            ethnicityId: data.ethnicityId,
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Personal Details</h3>
                    <CardDescription>Basic information to identify you.</CardDescription>
                </div>

                {/* Name displayed as static text to avoid redundancy */}
                <div className="bg-muted/30 p-4 rounded-lg border mb-6">
                    <Label className="text-sm text-muted-foreground">Applicant Name</Label>
                    <p className="text-lg font-medium">{data.applicantName || 'Not set'}</p>
                    {/* Hidden input to ensure it is submitted if needed */}
                    <input type="hidden" {...form.register('applicantName')} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        control={form.control}
                        name="idNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ID Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="12345678" {...field} />
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
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
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
                        name="birthYear"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Birth Year</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="1995"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                                <FormLabel>Ethnicity</FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(parseInt(val))}
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select ethnicity" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {ethnicities.map((ethnicity) => (
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

                <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg">
                        Next Step <ChevronRight className="ml-2 h-4 w-4" />
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

    const schema = createProfileSchema.pick({
        homeCountyId: true,
        homeSubCountyId: true,
        wardId: true,
    })

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            homeCountyId: data.homeCountyId,
            homeSubCountyId: data.homeSubCountyId,
            wardId: data.wardId,
        },
    })

    const selectedCountyId = form.watch('homeCountyId')
    const selectedSubCountyId = form.watch('homeSubCountyId')

    const { data: subCountiesResponse } = useConstituencies(selectedCountyId)
    const subCounties = subCountiesResponse?.data || []

    const { data: wardsResponse } = useWards(selectedSubCountyId)
    const wards = wardsResponse?.data || []

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Location Details</h3>
                    <CardDescription>Where are you currently located?</CardDescription>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        control={form.control}
                        name="homeCountyId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Home County</FormLabel>
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(parseInt(val))
                                        form.setValue('homeSubCountyId', undefined)
                                        form.setValue('wardId', undefined)
                                    }}
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select county" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {counties.map((county) => (
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
                                <FormLabel>Home Sub-County</FormLabel>
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(parseInt(val))
                                        form.setValue('wardId', undefined)
                                    }}
                                    value={field.value?.toString()}
                                    disabled={!selectedCountyId}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select sub-county" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {subCounties.map((sc) => (
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
                                <FormLabel>Ward</FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(parseInt(val))}
                                    value={field.value?.toString()}
                                    disabled={!selectedSubCountyId}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select ward" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {wards.map((ward) => (
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

                    <div className="flex justify-between pt-4">

                    <Button type="button" variant="outline" onClick={onBack} size="lg">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button type="submit" size="lg">
                        Next Step <ChevronRight className="ml-2 h-4 w-4" />
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
    const schema = createProfileSchema.pick({
        phone: true,
        email: true,
        impairment: true,
        impairmentDetails: true,
        publicServiceInfo: true,
        personalNumber: true,
    })

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            phone: data.phone || '',
            email: data.email || '',
            impairment: data.impairment || false,
            impairmentDetails: data.impairmentDetails || '',
            publicServiceInfo: data.publicServiceInfo || '',
            personalNumber: data.personalNumber || '',
        },
    })

    const watchImpairment = form.watch('impairment')

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Contact & Professional Status</h3>
                    <CardDescription>How we can reach you and your service history.</CardDescription>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Email displayed as static text */}
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <div className="flex w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            {data.email || 'Not set'}
                        </div>
                        <input type="hidden" {...form.register('email')} />
                    </div>

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="+254712345678" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4 pt-2">
                    <FormField
                        control={form.control}
                        name="impairment"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-6 bg-muted/30">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>I have a disability/impairment</FormLabel>
                                    <FormDescription>Check this if you require special accommodations</FormDescription>
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
                                    <FormLabel>Impairment Details</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Please describe your impairment..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <div className="space-y-4 pt-2">
                    <FormField
                        control={form.control}
                        name="publicServiceInfo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Public Service Information</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Details about current or previous public service employment..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    If you are or were a public servant, please provide details
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="personalNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Personal Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Personal/Staff number if applicable" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-between pt-6">
                    <Button type="button" variant="outline" onClick={onBack} size="lg">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button type="submit" size="lg">
                        Next Step <ChevronRight className="ml-2 h-4 w-4" />
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

    // Reference Queries
    const { data: levelsResponse } = useEducationLevels()
    const levels = levelsResponse?.data || []

    const { data: institutionsResponse } = useInstitutions()
    const institutions = institutionsResponse?.data || []

    const { data: coursesResponse } = useCourses()
    const courses = coursesResponse?.data || []

    const form = useForm<QualificationData>({
        resolver: zodResolver(createQualificationSchema),
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
    const selectedLevelId = levels.find(l => l.code === selectedLevelCode)?.id

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
            toast.success('Qualification updated')
        } else {
            setQuals([...quals, data])
            toast.success('Qualification added')
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

    const removeQualification = (index: number) => {
        setQuals(quals.filter((_, i) => i !== index))
    }

    const editQualification = (index: number) => {
        setEditingIndex(index)
        const q = quals[index]
        form.reset({
            ...q,
            courseId: (q as any).courseId || undefined,
            institutionId: (q as any).institutionId || undefined,
        })
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Academic Qualifications</h3>
                <CardDescription>
                    Add at least one qualification.
                </CardDescription>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Form */}
                <Card className={editingIndex !== null ? "border-primary/50 h-fit" : "h-fit"}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{editingIndex !== null ? "Edit Qualification" : "New Qualification"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(addQualification)} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="level"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Level</FormLabel>
                                                <Select onValueChange={(val) => {
                                                    field.onChange(val)
                                                    form.setValue('grade', '')
                                                }} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select level" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {levels.map((level) => (
                                                            <SelectItem key={level.id} value={level.code}>
                                                                {level.name}
                                                            </SelectItem>
                                                        ))}
                                                        <SelectItem value="OTHER">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="courseId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Course Name *</FormLabel>
                                                    <Select
                                                        onValueChange={(val) => {
                                                            if (val === 'other') {
                                                                field.onChange(undefined)
                                                            } else {
                                                                const course = courses.find(c => c.id.toString() === val)
                                                                field.onChange(parseInt(val))
                                                                form.setValue('course', course?.name || '')
                                                            }
                                                        }}
                                                        value={field.value?.toString() || (form.watch('course') ? 'other' : '')}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select course" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {courses.map((course) => (
                                                                <SelectItem key={course.id} value={course.id.toString()}>
                                                                    {course.name}
                                                                </SelectItem>
                                                            ))}
                                                            <SelectItem value="other">Other (Type manually)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {(!courseId || form.watch('course')) && (
                                            <FormField
                                                control={form.control}
                                                name="course"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter course name"
                                                                {...field}
                                                                disabled={!!courseId}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="institutionId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Institution *</FormLabel>
                                                    <Select
                                                        onValueChange={(val) => {
                                                            if (val === 'other') {
                                                                field.onChange(undefined)
                                                            } else {
                                                                const inst = institutions.find(i => i.id.toString() === val)
                                                                field.onChange(parseInt(val))
                                                                form.setValue('institution', inst?.name || '')
                                                            }
                                                        }}
                                                        value={field.value?.toString() || (form.watch('institution') ? 'other' : '')}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select institution" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {institutions.map((inst) => (
                                                                <SelectItem key={inst.id} value={inst.id.toString()}>
                                                                    {inst.name}
                                                                </SelectItem>
                                                            ))}
                                                            <SelectItem value="other">Other (Type manually)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {(!institutionId || form.watch('institution')) && (
                                            <FormField
                                                control={form.control}
                                                name="institution"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter institution name"
                                                                {...field}
                                                                disabled={!!institutionId}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="grade"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Grade</FormLabel>
                                                {grades.length > 0 ? (
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select grade" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {grades.map((g) => (
                                                                <SelectItem key={g.id} value={g.grade}>
                                                                    {g.grade}
                                                                </SelectItem>
                                                            ))}
                                                            <SelectItem value="OTHER">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <FormControl>
                                                        <Input placeholder="e.g. First Class" {...field} />
                                                    </FormControl>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="yearStart"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="2018"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="yearEnd"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="2022"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button type="submit" variant="secondary" className="w-full mt-2">
                                    {editingIndex !== null ? (
                                        <>Update Qualification</>
                                    ) : (
                                        <><Plus className="w-4 h-4 mr-2" /> Add Qualification</>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Right Column: List */}
                <div className="space-y-4">
                    <Label className="text-base font-semibold">Added Qualifications ({quals.length})</Label>
                    {quals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/20">
                            <p className="text-sm">No qualifications added yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {quals.map((qual, index) => (
                                <div key={index} className="p-4 bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-primary/90">{qual.level}</p>
                                            <p className="font-medium">{qual.course}</p>
                                            <p className="text-sm text-muted-foreground mt-1">{qual.institution}</p>
                                            <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                                                <span>{qual.yearStart} - {qual.yearEnd || 'Present'}</span>
                                                {qual.grade && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{qual.grade}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => editQualification(index)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => removeQualification(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-6 border-t mt-4">
                <Button type="button" variant="outline" onClick={onBack} size="lg">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                    type="button"
                    onClick={() => onNext(quals)}
                    disabled={quals.length === 0}
                    size="lg"
                >
                    Next Step <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

function Step5Employment({
    employmentHistory,
    onFinalSubmit,
    onBack,
    isLoading,
}: {
    employmentHistory: EmploymentData[]
    onFinalSubmit: (employment: EmploymentData[]) => void
    onBack: () => void
    isLoading: boolean
}) {
    const [employment, setEmployment] = useState<EmploymentData[]>(employmentHistory)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)

    const form = useForm<EmploymentData>({
        resolver: zodResolver(createEmploymentHistorySchema),
        defaultValues: {
            jobTitle: '',
            organization: '',
            startDate: '',
            endDate: '',
            jobGroup: '',
            responsibilities: '',
        },
    })

    const addEmployment = (data: EmploymentData) => {
        if (editingIndex !== null) {
            const updated = [...employment]
            updated[editingIndex] = data
            setEmployment(updated)
            setEditingIndex(null)
            toast.success('Employment updated')
        } else {
            setEmployment([...employment, data])
            toast.success('Employment added')
        }
        form.reset({
            jobTitle: '',
            organization: '',
            startDate: '',
            endDate: '',
            jobGroup: '',
            responsibilities: '',
        })
    }

    const removeEmployment = (index: number) => {
        setEmployment(employment.filter((_, i) => i !== index))
    }

    const editEmployment = (index: number) => {
        setEditingIndex(index)
        form.reset(employment[index])
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Employment History</h3>
                <CardDescription>
                    Add your previous experience.
                </CardDescription>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form */}
                <Card className={editingIndex !== null ? "border-primary/50 h-fit lg:col-span-2" : "h-fit lg:col-span-2"}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{editingIndex !== null ? "Edit Employment" : "New Employment"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(addEmployment)} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="jobTitle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Job Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Software Engineer" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="organization"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Organization</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. ABC Company" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Date</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-xs">Leave blank if current</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="jobGroup"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job Group (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. M5" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="responsibilities"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Responsibilities</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Describe your key responsibilities..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" variant="secondary" className="w-full mt-2">
                                    {editingIndex !== null ? 'Update Employment' : (
                                        <><Plus className="w-4 h-4 mr-2" /> Add Employment</>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Right Column: List */}
                <div className="space-y-4 lg:col-span-1">
                    <Label className="text-base font-semibold">Experience ({employment.length})</Label>
                    {employment.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/20">
                            <p className="text-sm">No employment history added.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                            {employment.map((emp, index) => (
                                <div key={index} className="p-4 bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-primary/90">{emp.jobTitle}</p>
                                            <p className="font-medium text-foreground">{emp.organization}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {emp.startDate} - {emp.endDate || 'Present'}
                                            </p>
                                            {emp.jobGroup && (
                                                <p className="text-xs text-muted-foreground mt-1">Job Group: {emp.jobGroup}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => editEmployment(index)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => removeEmployment(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-6 border-t mt-4">
                <Button type="button" variant="outline" onClick={onBack} size="lg" disabled={isLoading}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                    type="button"
                    onClick={() => onFinalSubmit(employment)}
                    disabled={isLoading}
                    size="lg"
                    className="min-w-[150px]"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Complete Profile
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
