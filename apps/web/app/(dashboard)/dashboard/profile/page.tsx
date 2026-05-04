'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, User, MapPin, Phone } from 'lucide-react'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createProfileSchema } from '@meru/shared'
import { useMyProfile, useCreateOrUpdateProfile } from '@/hooks/use-applicant-profile'
import { 
    useCounties, 
    useConstituencies, 
    useWards, 
    useEthnicities 
} from '@/hooks/use-reference-data'
import { QualificationsManager, EmploymentHistoryManager, ProfessionalDetailsManager, ProfessionalMembershipsManager, TrainingCoursesManager, ProfileCompletion } from '@/components/applicant'

export default function ProfilePage() {
    const { data: profileResponse, isLoading } = useMyProfile()
    const profile = profileResponse?.data
    const updateProfile = useCreateOrUpdateProfile()

    // Location & Reference Queries
    const { data: countiesResponse } = useCounties()
    const counties = countiesResponse?.data || []
    
    const { data: ethnicitiesResponse } = useEthnicities()
    const ethnicities = ethnicitiesResponse?.data || []

    const form = useForm({
        resolver: zodResolver(createProfileSchema),
        values: profile ? {
            applicantName: profile.applicantName,
            idNumber: profile.idNumber,
            gender: profile.gender as 'Male' | 'Female' | 'Other',
            birthYear: profile.birthYear,
            ethnicityId: profile.ethnicityId || undefined,
            phone: profile.phone,
            email: profile.email,
            homeCountyId: profile.homeCountyId || undefined,
            homeSubCountyId: profile.homeSubCountyId || undefined,
            wardId: profile.wardId || undefined,
            impairment: profile.impairment,
            impairmentDetails: profile.impairmentDetails || '',
            publicServiceInfo: profile.publicServiceInfo || '',
            personalNumber: profile.personalNumber || '',
        } : {
            applicantName: '',
            idNumber: '',
            gender: 'Male' as const,
            birthYear: new Date().getFullYear() - 25,
            ethnicityId: undefined,
            phone: '',
            email: '',
            homeCountyId: undefined,
            homeSubCountyId: undefined,
            wardId: undefined,
            impairment: false,
            impairmentDetails: '',
            publicServiceInfo: '',
            personalNumber: '',
        },
    })

    const selectedCountyId = form.watch('homeCountyId')
    const selectedSubCountyId = form.watch('homeSubCountyId')

    const { data: subCountiesResponse } = useConstituencies(selectedCountyId)
    const subCounties = subCountiesResponse?.data || []

    const { data: wardsResponse } = useWards(selectedSubCountyId)
    const wards = wardsResponse?.data || []

    const watchImpairment = form.watch('impairment')

    const onSubmit = async (data: any) => {
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

    // if (!profile) check removed to allow creation


    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold">My Profile</h1>
                    <p className="text-muted-foreground">Manage your applicant profile and credentials</p>
                </div>
                <div className="w-full md:w-80">
                    <ProfileCompletion profile={profileResponse?.data} />
                </div>
            </div>

            <Tabs defaultValue="personal" className="space-y-6">
                <TabsList className="grid grid-cols-6 w-full lg:w-auto">
                    <TabsTrigger value="personal">
                        <User className="h-4 w-4 mr-2" />
                        Personal
                    </TabsTrigger>
                    <TabsTrigger value="qualifications" disabled={!profile}>Qualifications</TabsTrigger>
                    <TabsTrigger value="professional" disabled={!profile}>Professional</TabsTrigger>
                    <TabsTrigger value="training" disabled={!profile}>Training</TabsTrigger>
                    <TabsTrigger value="memberships" disabled={!profile}>Memberships</TabsTrigger>
                    <TabsTrigger value="employment" disabled={!profile}>Employment</TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent value="personal">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your personal details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="applicantName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="John Doe" {...field} />
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
                                                    <FormLabel>ID Number *</FormLabel>
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
                                                    <FormLabel>Gender *</FormLabel>
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
                                                    <FormLabel>Birth Year *</FormLabel>
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
                                                        onValueChange={field.onChange}
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

                                    {/* Location */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium flex items-center gap-2">
                                            <MapPin className="h-5 w-5" />
                                            Location
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    </div>

                                    {/* Contact */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium flex items-center gap-2">
                                            <Phone className="h-5 w-5" />
                                            Contact Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Phone Number *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="+254712345678" {...field} />
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
                                                        <FormLabel>Email Address *</FormLabel>
                                                        <FormControl>
                                                            <Input type="email" placeholder="john@example.com" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Additional Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Additional Information</h3>

                                        <FormField
                                            control={form.control}
                                            name="impairment"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>I have a disability/impairment</FormLabel>
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
                                                            <Textarea placeholder="Please describe..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        <FormField
                                            control={form.control}
                                            name="publicServiceInfo"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Public Service Information</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Details about current or previous public service employment..."
                                                            rows={3}
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

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={updateProfile.isPending}>
                                            {updateProfile.isPending ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Qualifications Tab */}
                <TabsContent value="qualifications">
                    {profile && <QualificationsManager profileId={profile.id} />}
                </TabsContent>

                {/* Professional Details Tab */}
                <TabsContent value="professional">
                    {profile && <ProfessionalDetailsManager profileId={profile.id} />}
                </TabsContent>

                {/* Training Courses Tab */}
                <TabsContent value="training">
                    {profile && <TrainingCoursesManager profileId={profile.id} />}
                </TabsContent>

                {/* Professional Memberships Tab */}
                <TabsContent value="memberships">
                    {profile && <ProfessionalMembershipsManager profileId={profile.id} />}
                </TabsContent>

                {/* Employment History Tab */}
                <TabsContent value="employment">
                    {profile && <EmploymentHistoryManager profileId={profile.id} />}
                </TabsContent>
            </Tabs>
        </div>
    )
}
