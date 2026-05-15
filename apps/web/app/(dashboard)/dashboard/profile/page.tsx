'use client'

import { Loader2, User, GraduationCap, Briefcase, ScrollText, BookOpen, Users, UserCheck, ArrowRight, FileUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { useMyProfile, useMyReferees } from '@/hooks/use-applicant-profile'
import { useMyDocuments } from '@/hooks/use-documents'
import { 
    PersonalInfoManager,
    QualificationsManager, 
    EmploymentHistoryManager, 
    ProfessionalDetailsManager, 
    ProfessionalMembershipsManager, 
    TrainingCoursesManager, 
    ProfileCompletion, 
    RefereesManager,
    DocumentsManager
} from '@/components/applicant'

export default function ProfilePage() {
    const { data: profileResponse, isLoading } = useMyProfile()
    const { data: refereesResponse } = useMyReferees()
    const { data: documentsResponse } = useMyDocuments()
    
    const profile = profileResponse?.data
    const refereesCount = refereesResponse?.data?.length || 0
    const documentsCount = documentsResponse?.data?.length || 0

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const sections = [
        {
            id: 'personal',
            title: 'Personal Information',
            description: 'Identity, contact and demographic details',
            icon: User,
            component: <PersonalInfoManager />,
            summary: profile ? `${profile.fullName || 'No name set'}` : 'Not started',
            status: profile ? 'completed' : 'pending',
            required: true
        },
        {
            id: 'qualifications',
            title: 'Qualifications',
            description: 'Academic and professional certifications',
            icon: GraduationCap,
            component: <QualificationsManager />,
            summary: profile ? `${profile.qualifications?.length || 0} qualifications added` : 'Complete personal info first',
            disabled: !profile,
            required: true
        },
        {
            id: 'employment',
            title: 'Employment History',
            description: 'Work experience and responsibilities',
            icon: Briefcase,
            component: <EmploymentHistoryManager />,
            summary: profile ? `${profile.employmentHistory?.length || 0} records added` : 'Complete personal info first',
            disabled: !profile,
            required: true
        },
        {
            id: 'training',
            title: 'Training Courses',
            description: 'Short courses and workshops',
            icon: BookOpen,
            component: <TrainingCoursesManager />,
            summary: profile ? `${profile.trainingCourses?.length || 0} courses added` : 'Complete personal info first',
            disabled: !profile,
            required: true
        },
        {
            id: 'professional',
            title: 'Professional Details',
            description: 'Licenses and registrations',
            icon: ScrollText,
            component: <ProfessionalDetailsManager />,
            summary: profile ? `${profile.professionalDetails?.length || 0} details added` : 'Complete personal info first',
            disabled: !profile,
            required: false
        },
        {
            id: 'memberships',
            title: 'Memberships',
            description: 'Professional bodies and associations',
            icon: Users,
            component: <ProfessionalMembershipsManager />,
            summary: profile ? `${profile.professionalMemberships?.length || 0} memberships added` : 'Complete personal info first',
            disabled: !profile,
            required: false
        },
        {
            id: 'referees',
            title: 'Referees',
            description: 'Professional and personal references',
            icon: UserCheck,
            component: <RefereesManager />,
            summary: profile ? `${refereesCount} referees added` : 'Complete personal info first',
            disabled: !profile,
            required: false
        },
        {
            id: 'uploads',
            title: 'Uploads',
            description: 'ID, CV and other supporting documents',
            icon: FileUp,
            component: <DocumentsManager />,
            summary: profile ? `${documentsCount} documents uploaded` : 'Complete personal info first',
            disabled: !profile,
            required: false
        }
    ]

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-muted-foreground">Manage your applicant profile and credentials</p>
                </div>
                <div className="w-full md:w-80">
                    <ProfileCompletion profile={profile} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section) => (
                    <Sheet key={section.id}>
                        <SheetTrigger asChild>
                            <Card className={`group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-md ${section.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <section.icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={section.required ? "default" : "outline"} className={section.required ? "text-[10px] uppercase tracking-wider px-2 py-0" : "text-[10px] uppercase tracking-wider px-2 py-0 text-blue-600 border-blue-200 bg-blue-50/50"}>
                                            {section.required ? "Required" : "Optional"}
                                        </Badge>
                                        <Button variant="ghost" size="icon" className="group-hover:text-primary transition-colors h-8 w-8" disabled={section.disabled}>
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className="text-lg mb-1">{section.title}</CardTitle>
                                    <CardDescription className="line-clamp-1 mb-4">{section.description}</CardDescription>
                                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <div className={`h-1.5 w-1.5 rounded-full ${section.disabled ? 'bg-slate-300' : 'bg-green-500'}`} />
                                        {section.summary}
                                    </div>
                                </CardContent>
                            </Card>
                        </SheetTrigger>
                        {!section.disabled && (
                            <SheetContent className="w-full sm:max-w-[750px] p-0 flex flex-col h-full border-l shadow-2xl overflow-hidden">
                                <div className="bg-muted/30 border-b p-6 pt-10">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                            <section.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <SheetTitle className="text-2xl font-bold tracking-tight">
                                                {section.title}
                                            </SheetTitle>
                                            <SheetDescription className="text-sm font-medium opacity-80">
                                                {section.description}
                                            </SheetDescription>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto px-6 py-8">
                                    {section.component}
                                </div>
                            </SheetContent>
                        )}
                    </Sheet>
                ))}
            </div>
        </div>
    )
}
