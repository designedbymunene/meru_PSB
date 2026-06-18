"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    User, 
    GraduationCap, 
    Briefcase, 
    ShieldCheck, 
    BookOpen, 
    FileText,
    ExternalLink,
    MapPin,
    Mail,
    Phone,
    Info,
    Users,
    Building2,
    Calendar as CalendarIcon,
    Loader2
} from 'lucide-react'
import { ClipboardList } from 'lucide-react'
import type { ApplicantProfileWithRelations, ApplicationWithRelations } from '@/types'
import { formatNumber, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { formatKNQFLevel } from '@meru/shared'
import { useAllApplications } from '@/hooks/use-applications'
import Link from 'next/link'
import { ApplicationStatusBadge } from './application-status-badge'
import { format } from 'date-fns'

// Profile Detail Component
export function ProfileDetailView({ profile }: { profile: ApplicantProfileWithRelations }) {
    const { data: appsResponse, isLoading: isLoadingApps } = useAllApplications({
        applicantId: profile.applicantId?.toString(),
        offset: '0',
        order: 'desc',
        sortBy: 'appliedAt',
        limit: '50'
    })
    const applicantApplications = Array.isArray(appsResponse?.data) 
        ? appsResponse.data 
        : (appsResponse?.data as any)?.data || []

    return (
        <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full h-auto p-1 bg-muted/50">
                <TabsTrigger value="personal" className="py-2 gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">Personal</span>
                </TabsTrigger>
                <TabsTrigger value="qualifications" className="py-2 gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span className="hidden md:inline">Education</span>
                    <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1">{profile.qualifications.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="employment" className="py-2 gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="hidden md:inline">Experience</span>
                    <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1">{profile.employmentHistory.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="professional" className="py-2 gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="hidden md:inline">Prof.</span>
                    <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1">{profile.professionalDetails.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="training" className="py-2 gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden md:inline">Training</span>
                    <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1">{profile.trainingCourses.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="referees" className="py-2 gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden md:inline">Referees</span>
                    <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1">{profile.referees?.length || 0}</Badge>
                </TabsTrigger>
                <TabsTrigger value="applications" className="py-2 gap-2">
                    <ClipboardList className="h-4 w-4" />
                    <span className="hidden md:inline">Apps</span>
                    <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1">{applicantApplications.length}</Badge>
                </TabsTrigger>
            </TabsList>

            {/* ... Personal Info ... */}
            <TabsContent value="personal" className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InfoItem 
                        icon={<User className="h-4 w-4" />} 
                        label="Full Name" 
                        value={profile.applicantName || (profile as any).fullName} 
                    />
                    <InfoItem 
                        icon={<FileText className="h-4 w-4" />} 
                        label="ID Number" 
                        value={profile.idNumber} 
                    />
                    <InfoItem 
                        icon={<Mail className="h-4 w-4" />} 
                        label="Email" 
                        value={profile.email} 
                    />
                    <InfoItem 
                        icon={<Phone className="h-4 w-4" />} 
                        label="Phone" 
                        value={profile.phone || profile.phoneNumber} 
                    />
                    <InfoItem 
                        label="Gender" 
                        value={profile.gender} 
                    />
                    <InfoItem 
                        label="Birth Year" 
                        value={profile.birthYear?.toString() || (profile.dateOfBirth ? profile.dateOfBirth.split('-')[0] : null) || 'Not specified'} 
                    />
                    <InfoItem 
                        label="Ethnicity" 
                        value={(profile.ethnicity as any)?.name || profile.ethnicity || 'Not specified'} 
                    />
                    <InfoItem 
                        icon={<MapPin className="h-4 w-4" />}
                        label="County" 
                        value={(profile.homeCounty as any)?.name || profile.homeCounty || 'Not specified'} 
                    />
                    <InfoItem
                        label="Sub-County"
                        value={(profile.homeSubCounty as any)?.name || profile.homeSubCounty || 'Not specified'}
                    />
                    <InfoItem label="Ward" value={(profile.ward as any)?.name || profile.ward || 'Not specified'} />
                    <InfoItem
                        label="PWD Status"
                        value={profile.impairment ? 'Registered PWD' : 'None'}
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

            {/* ... Qualifications ... */}
            <TabsContent value="qualifications" className="pt-6">
                {profile.qualifications.length === 0 ? (
                    <EmptyDetailState message="No educational qualifications added" />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.qualifications.map((qual) => (
                            <Card key={qual.id} className="overflow-hidden border-slate-100 dark:border-slate-800">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <CardTitle className="text-sm font-bold line-clamp-2 leading-tight">
                                            {qual.course}
                                        </CardTitle>
                                        <Badge variant="outline" className="shrink-0 text-[10px] h-5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                            {formatKNQFLevel(qual.level)}
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-xs">{qual.institution}</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <InfoItem label="Grade" value={qual.grade || 'N/A'} compact />
                                    <InfoItem
                                        label="Period"
                                        value={
                                            qual.yearStart && qual.yearEnd
                                                ? `${qual.yearStart} - ${qual.yearEnd}`
                                                : qual.yearStart?.toString() || 'N/A'
                                        }
                                        compact
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>

            {/* ... Employment History ... */}
            <TabsContent value="employment" className="pt-6">
                {profile.employmentHistory.length === 0 ? (
                    <EmptyDetailState message="No employment history added" />
                ) : (
                    <div className="space-y-4">
                        {profile.employmentHistory.map((emp) => (
                            <Card key={emp.id} className="overflow-hidden border-slate-100 dark:border-slate-800">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <CardTitle className="text-base font-bold">{emp.jobTitle}</CardTitle>
                                            <CardDescription className="font-medium text-primary">{emp.organization}</CardDescription>
                                        </div>
                                        {!emp.endDate && (
                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                                                Current
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <InfoItem
                                            label="Period"
                                            value={`${formatDate(emp.startDate, 'MMM yyyy')} - ${emp.endDate ? formatDate(emp.endDate, 'MMM yyyy') : 'Present'}`}
                                            compact
                                        />
                                        {emp.jobGroup && (
                                            <InfoItem label="Job Group" value={emp.jobGroup} compact />
                                        )}
                                    </div>
                                    {emp.responsibilities && (
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Responsibilities</p>
                                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {emp.responsibilities}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>

            {/* ... Professional Details ... */}
            <TabsContent value="professional" className="pt-6">
                {profile.professionalDetails.length === 0 ? (
                    <EmptyDetailState message="No professional details or certifications added" />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.professionalDetails.map((detail) => (
                            <Card key={detail.id} className="overflow-hidden border-slate-100 dark:border-slate-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold">{detail.licenseType}</CardTitle>
                                    <CardDescription className="text-xs">{detail.issuingBody}</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <InfoItem
                                        label="Reg No."
                                        value={detail.registrationNumber}
                                        compact
                                    />
                                    <InfoItem
                                        label="Validity"
                                        value={`${detail.issueDate ? formatDate(detail.issueDate, 'MMM yyyy') : 'N/A'} - ${detail.expiryDate ? formatDate(detail.expiryDate, 'MMM yyyy') : 'Permanent'}`}
                                        compact
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>

            {/* ... Training Courses ... */}
            <TabsContent value="training" className="pt-6">
                {profile.trainingCourses.length === 0 ? (
                    <EmptyDetailState message="No additional training courses added" />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.trainingCourses.map((course) => (
                            <Card key={course.id} className="overflow-hidden border-slate-100 dark:border-slate-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold">{course.courseName}</CardTitle>
                                    <CardDescription className="text-xs">{course.institution || 'N/A'}</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <InfoItem label="Year" value={course.year?.toString() || 'N/A'} compact />
                                    <InfoItem label="Grade" value={course.grade || 'N/A'} compact />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>

            {/* ... Referees ... */}
            <TabsContent value="referees" className="pt-6">
                {!profile.referees || profile.referees.length === 0 ? (
                    <EmptyDetailState message="No referees added by this applicant" />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.referees.map((ref) => (
                            <Card key={ref.id} className="overflow-hidden border-slate-100 dark:border-slate-800">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <CardTitle className="text-base font-bold">{ref.fullName}</CardTitle>
                                            <CardDescription className="font-medium text-primary">
                                                {ref.designation} at {ref.organization}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <InfoItem label="Phone" value={ref.phone} compact icon={<Phone className="h-3.5 w-3.5" />} />
                                    <InfoItem label="Email" value={ref.email} compact icon={<Mail className="h-3.5 w-3.5" />} />
                                    <InfoItem label="Relationship" value={ref.relationship || 'N/A'} compact />
                                    {ref.address && (
                                        <InfoItem label="Address" value={ref.address} compact fullWidth />
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>

            {/* Applications Tab */}
            <TabsContent value="applications" className="pt-6">
                {isLoadingApps ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium">Loading applications...</p>
                    </div>
                ) : applicantApplications.length === 0 ? (
                    <EmptyDetailState message="No applications submitted by this applicant" />
                ) : (
                    <div className="space-y-3">
                        {applicantApplications.map((app: ApplicationWithRelations) => (
                            <Link key={app.id} href={`/admin/applications/${app.id}`} className="block group">
                                <Card className="overflow-hidden border-slate-100 dark:border-slate-800 group-hover:border-primary/30 transition-all shadow-sm group-hover:shadow-md">
                                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                                                <ClipboardList className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-primary transition-colors">
                                                    {app.vacancy?.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-[10px] h-5 py-0 bg-slate-50 dark:bg-slate-900 font-mono">
                                                        {app.vacancy?.advertisementNumber}
                                                    </Badge>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                                        <Building2 className="h-3 w-3" />
                                                        <span className="truncate max-w-[120px]">{app.vacancy?.department?.name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Applied Date</p>
                                                <div className="flex items-center gap-1.5 text-xs font-semibold">
                                                    <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                                                    {format(new Date(app.appliedAt), 'MMM d, yyyy')}
                                                </div>
                                            </div>
                                            <ApplicationStatusBadge status={app.status} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </TabsContent>
        </Tabs>
    )
}



function EmptyDetailState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-muted/20 border-dashed">
            <Info className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    )
}

// Helper component for displaying info
export function InfoItem({
    label,
    value,
    icon,
    fullWidth = false,
    compact = false,
}: {
    label: string
    value?: string | null
    icon?: React.ReactNode
    fullWidth?: boolean
    compact?: boolean
}) {
    return (
        <div className={fullWidth ? 'col-span-full' : ''}>
            <div className="flex items-center gap-2 mb-1">
                {icon && <span className="text-muted-foreground/70">{icon}</span>}
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{label}</p>
            </div>
            <p className={compact ? "text-sm font-medium truncate" : "text-sm font-medium"}>
                {value || 'Not specified'}
            </p>
        </div>
    )
}
