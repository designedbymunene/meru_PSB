"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ApplicantProfileWithRelations } from '@/types'

// Profile Detail Component
export function ProfileDetailView({ profile }: { profile: ApplicantProfileWithRelations }) {
    return (
        <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="qualifications">
                    Qualifications ({profile.qualifications.length})
                </TabsTrigger>
                <TabsTrigger value="employment">
                    Employment ({profile.employmentHistory.length})
                </TabsTrigger>
                <TabsTrigger value="professional">
                    Professional ({profile.professionalDetails.length})
                </TabsTrigger>
                <TabsTrigger value="training">
                    Training ({profile.trainingCourses.length})
                </TabsTrigger>
            </TabsList>

            {/* Personal Info */}
            <TabsContent value="personal" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                    <InfoItem label="Full Name" value={profile.applicantName || (profile as any).fullName} />
                    <InfoItem label="ID Number" value={profile.idNumber} />
                    <InfoItem label="Email" value={profile.email} />
                    <InfoItem label="Phone" value={profile.phone} />
                    <InfoItem label="Gender" value={profile.gender} />
                    <InfoItem label="Birth Year" value={profile.birthYear?.toString() || 'Not specified'} />
                    <InfoItem label="Ethnicity" value={profile.ethnicity || 'Not specified'} />
                    <InfoItem label="Home County" value={profile.homeCounty || 'Not specified'} />
                    <InfoItem
                        label="Sub-County"
                        value={profile.homeSubCounty || 'Not specified'}
                    />
                    <InfoItem label="Ward" value={profile.ward || 'Not specified'} />
                    <InfoItem
                        label="Disability/Impairment"
                        value={profile.impairment ? 'Yes' : 'No'}
                    />
                    {profile.impairment && (
                        <InfoItem
                            label="Impairment Details"
                            value={profile.impairmentDetails || 'Not specified'}
                            fullWidth
                        />
                    )}
                    {profile.publicServiceInfo && (
                        <InfoItem
                            label="Public Service Info"
                            value={profile.publicServiceInfo}
                            fullWidth
                        />
                    )}
                    {profile.personalNumber && (
                        <InfoItem label="Personal Number" value={profile.personalNumber} />
                    )}
                </div>
            </TabsContent>

            {/* Qualifications */}
            <TabsContent value="qualifications" className="pt-4">
                {profile.qualifications.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                        No qualifications added
                    </p>
                ) : (
                    <div className="space-y-4">
                        {profile.qualifications.map((qual) => (
                            <Card key={qual.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{qual.course}</CardTitle>
                                        <Badge>{qual.level}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-2">
                                    <InfoItem label="Institution" value={qual.institution} />
                                    <InfoItem label="Grade" value={qual.grade || 'N/A'} />
                                    <InfoItem
                                        label="Year"
                                        value={
                                            qual.yearStart && qual.yearEnd
                                                ? `${qual.yearStart} - ${qual.yearEnd}`
                                                : qual.yearStart?.toString() || 'N/A'
                                        }
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>

            {/* Employment History */}
            <TabsContent value="employment" className="pt-4">
                {profile.employmentHistory.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                        No employment history added
                    </p>
                ) : (
                    <div className="space-y-4">
                        {profile.employmentHistory.map((emp) => (
                            <Card key={emp.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{emp.jobTitle}</CardTitle>
                                        {!emp.endDate && <Badge>Current</Badge>}
                                    </div>
                                    <CardDescription>{emp.organization}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <InfoItem
                                        label="Period"
                                        value={`${emp.startDate} - ${emp.endDate || 'Present'}`}
                                    />
                                    {emp.jobGroup && (
                                        <InfoItem label="Job Group" value={emp.jobGroup} />
                                    )}
                                    {emp.responsibilities && (
                                        <InfoItem
                                            label="Responsibilities"
                                            value={emp.responsibilities}
                                            fullWidth
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>

            {/* Professional Details */}
            <TabsContent value="professional" className="pt-4">
                {profile.professionalDetails.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                        No professional details added
                    </p>
                ) : (
                    <div className="space-y-4">
                        {profile.professionalDetails.map((detail) => (
                            <Card key={detail.id}>
                                <CardContent className="pt-6 grid grid-cols-2 gap-4">
                                    <InfoItem
                                        label="License Type"
                                        value={detail.licenseType}
                                    />
                                    <InfoItem
                                        label="Issuing Body"
                                        value={detail.issuingBody}
                                    />
                                    <InfoItem
                                        label="Registration Number"
                                        value={detail.registrationNumber}
                                    />
                                    <InfoItem
                                        label="Issue Date"
                                        value={detail.issueDate || 'N/A'}
                                    />
                                    <InfoItem
                                        label="Expiry Date"
                                        value={detail.expiryDate || 'N/A'}
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>

            {/* Training Courses */}
            <TabsContent value="training" className="pt-4">
                {profile.trainingCourses.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                        No training courses added
                    </p>
                ) : (
                    <div className="space-y-4">
                        {profile.trainingCourses.map((course) => (
                            <Card key={course.id}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{course.courseName}</CardTitle>
                                    {course.description && (
                                        <CardDescription>{course.description}</CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-2">
                                    <InfoItem
                                        label="Institution"
                                        value={course.institution || 'N/A'}
                                    />
                                    <InfoItem label="Year" value={course.year?.toString() || 'N/A'} />
                                    <InfoItem label="Grade" value={course.grade || 'N/A'} />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>
        </Tabs>
    )
}

// Helper component for displaying info
export function InfoItem({
    label,
    value,
    fullWidth = false,
}: {
    label: string
    value: string
    fullWidth?: boolean
}) {
    return (
        <div className={fullWidth ? 'col-span-2' : ''}>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-sm mt-1">{value}</p>
        </div>
    )
}
