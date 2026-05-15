"use client"

import { useProfileByUserId } from "@/hooks/use-applicant-profile"
import { use } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Mail, Phone, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { ProfileDetailView } from "@/components/admin/profile-detail-view"
import { Separator } from "@/components/ui/separator"

export default function AdminProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const userId = parseInt(id, 10)

    const { data: response, isLoading, error } = useProfileByUserId(userId)
    const profile = response?.data
    const profileName = profile?.applicantName || (profile as any)?.fullName

    if (isLoading) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center gap-2 mb-6">
                    <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
                <div className="grid gap-6 md:grid-cols-12">
                    <Skeleton className="md:col-span-4 h-[400px] w-full rounded-2xl" />
                    <Skeleton className="md:col-span-8 h-[600px] w-full rounded-2xl" />
                </div>
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="flex-1 p-8 pt-6">
                <Button variant="ghost" asChild className="mb-6">
                    <Link href="/admin/profiles">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Profiles
                    </Link>
                </Button>
                <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
                    <User className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profile Not Found</h3>
                    <p className="text-muted-foreground mt-2">The requested applicant profile could not be found or has not been completed.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" asChild className="rounded-xl">
                    <Link href="/admin/profiles">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Profiles
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Applicant Summary Card */}
                <Card className="md:col-span-4 h-fit border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-primary/5 p-8 flex flex-col items-center text-center">
                        <div className="h-24 w-24 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-sm mb-4">
                            <span className="text-2xl font-black text-primary">
                                {profileName?.substring(0, 2).toUpperCase()}
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{profileName}</h2>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Applicant Profile</p>
                    </div>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight">Email Address</span>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{profile.email}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight">Phone Number</span>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{profile.phone || 'Not provided'}</span>
                                </div>
                            </div>

                            <Separator className="bg-slate-100 dark:bg-slate-800" />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight block mb-1">ID Number</span>
                                    <span className="text-sm font-bold">{profile.idNumber}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight block mb-1">Gender</span>
                                    <span className="text-sm font-bold">{profile.gender}</span>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full rounded-xl font-bold h-11" asChild>
                            <Link href={`/admin/applications?search=${encodeURIComponent(profileName || '')}`}>
                                View Applications
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Detailed Profile View */}
                <div className="md:col-span-8">
                    <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <CardHeader className="border-b border-slate-50 dark:border-slate-800/60 pb-4">
                            <CardTitle className="text-xl">Full Professional Profile</CardTitle>
                            <CardDescription className="font-medium text-slate-500">Complete curriculum vitae and professional details</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ProfileDetailView profile={profile} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
