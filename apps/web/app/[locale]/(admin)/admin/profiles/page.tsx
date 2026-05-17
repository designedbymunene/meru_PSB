'use client'

import { useState, useMemo } from 'react'
import { 
    Loader2, 
    Download, 
    Search, 
    Filter, 
    Users, 
    MapPin, 
    GraduationCap, 
    Briefcase, 
    Mail, 
    Phone,
    ShieldAlert,
    UserCircle,
    ArrowUpDown
} from 'lucide-react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DataTable } from '@/components/admin/data-table'
import { useAllApplicantProfiles, useExportProfiles } from '@/hooks/use-applicant-profile'
import type { ApplicantProfileWithRelations, Qualification, EmploymentHistory } from '@/types'
import { formatNumber } from '@/lib/utils'

const getInitials = (name: string) => {
    if (!name) return '??'
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
}

const getHighestQualification = (qualifications: Qualification[]) => {
    if (!qualifications || qualifications.length === 0) return null
    const levelWeight: Record<string, number> = {
        'Level 10 (Doctorate / PhD)': 10,
        'Level 9 (Master\'s Degree)': 9,
        'Level 8 (Postgrad Diploma / Professional Bachelor\'s)': 8,
        'Level 7 (Bachelor\'s Degree / Professional Diploma)': 7,
        'Level 6 (National Diploma / NSC V / HND)': 6,
        'Level 5 (Craft Certificate / NSC IV)': 5,
        'Level 4 (Artisan Certificate / NSC III / GTT I)': 4,
        'Level 3 (Senior Secondary / KCSE / NSC II / GTT II)': 3,
        'Level 2 (Junior Secondary / NSC I / GTT III)': 2,
        'Level 1 (Primary Certificate / Basic Skills)': 1,
        'DOCTORATE': 10,
        'MASTERS': 9,
        'BACHELORS': 7,
        'DIPLOMA': 6,
        'CERTIFICATE': 5,
        'KCSE': 3,
        'KCPE': 1,
    }

    return [...qualifications].sort((a, b) => {
        const weightA = levelWeight[a.level] || 0
        const weightB = levelWeight[b.level] || 0
        return weightB - weightA
    })[0]
}

const getCurrentEmployment = (employment: EmploymentHistory[]) => {
    if (!employment || employment.length === 0) return null
    return employment.find((e) => !e.endDate) || [...employment].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]
}

export default function AdminProfilesPage() {
    const { data: response, isLoading } = useAllApplicantProfiles()
    const profiles = response?.data || []
    const exportMutation = useExportProfiles()

    const [searchQuery, setSearchQuery] = useState('')
    const [genderFilter, setGenderFilter] = useState<string>('all')
    const [impairmentFilter, setImpairmentFilter] = useState<string>('all')

    const columns: ColumnDef<ApplicantProfileWithRelations>[] = [
        {
            accessorKey: 'applicantName',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="-ml-4 h-8"
                    >
                        Applicant
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const name = row.original.applicantName || (row.original as any).fullName
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                            <AvatarFallback className="bg-primary/5 text-primary text-xs">
                                {getInitials(name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm line-clamp-1">{name}</span>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="font-mono">{row.original.idNumber}</span>
                                {row.original.impairment && (
                                    <Badge variant="outline" className="h-4 px-1 text-[10px] border-amber-200 bg-amber-50 text-amber-700">
                                        PWD
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: 'email',
            header: 'Contact Info',
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate max-w-[150px]">{row.original.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{row.original.phone}</span>
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'gender',
            header: 'Bio',
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className="w-fit text-[10px] h-4 px-1.5">
                        {row.original.gender}
                    </Badge>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{row.original.homeCounty || 'N/A'}</span>
                    </div>
                </div>
            )
        },
        {
            id: 'qualification',
            header: 'Top Qualification',
            cell: ({ row }) => {
                const qual = getHighestQualification(row.original.qualifications)
                if (!qual) return <span className="text-muted-foreground text-xs italic">None listed</span>
                return (
                    <div className="flex flex-col gap-0.5 max-w-[200px]">
                        <div className="flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5 text-primary/70" />
                            <span className="text-xs font-medium truncate">{qual.course}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground truncate">{qual.level}</span>
                    </div>
                )
            }
        },
        {
            id: 'employment',
            header: 'Current/Last Job',
            cell: ({ row }) => {
                const emp = getCurrentEmployment(row.original.employmentHistory)
                if (!emp) return <span className="text-muted-foreground text-xs italic">None listed</span>
                return (
                    <div className="flex flex-col gap-0.5 max-w-[200px]">
                        <div className="flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5 text-primary/70" />
                            <span className="text-xs font-medium truncate">{emp.jobTitle}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground truncate">{emp.organization}</span>
                    </div>
                )
            }
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        asChild
                        title="Full Profile"
                    >
                        <Link href={`/admin/profiles/${(row.original as any).userId || row.original.applicantId}`}>
                            <UserCircle className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            )
        }
    ]

    // Filter profiles based on search and filters
    const filteredProfiles = useMemo(() => {
        return profiles.filter((profile) => {
            const query = searchQuery.toLowerCase()
            const name = (profile.applicantName || (profile as any).fullName || '').toLowerCase()
            const email = (profile.email || '').toLowerCase()
            const idNumber = (profile.idNumber || '').toLowerCase()

            const matchesSearch =
                name.includes(query) ||
                email.includes(query) ||
                idNumber.includes(query)

            const matchesGender = genderFilter === 'all' || profile.gender === genderFilter
            const matchesImpairment = impairmentFilter === 'all' || 
                (impairmentFilter === 'yes' ? profile.impairment : !profile.impairment)

            return matchesSearch && matchesGender && matchesImpairment
        })
    }, [profiles, searchQuery, genderFilter, impairmentFilter])

    const handleExport = () => {
        exportMutation.mutate()
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="h-8 w-8 text-primary" />
                        Applicant Profiles
                    </h2>
                    <p className="text-muted-foreground">
                        Manage and review all registered applicant profiles
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleExport} disabled={exportMutation.isPending}>
                        {exportMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-primary/70 font-medium">Total Profiles</CardDescription>
                        <CardTitle className="text-3xl font-bold text-primary">{formatNumber(profiles.length)}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-medium">With Qualifications</CardDescription>
                        <CardTitle className="text-3xl font-bold">
                            {formatNumber(profiles.filter((p) => p.qualifications?.length > 0).length)}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-medium">With Employment</CardDescription>
                        <CardTitle className="text-3xl font-bold">
                            {formatNumber(profiles.filter((p) => p.employmentHistory?.length > 0).length)}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border-amber-200 bg-amber-50/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-amber-700 font-medium flex items-center gap-1.5">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            PWD Profiles
                        </CardDescription>
                        <CardTitle className="text-3xl font-bold text-amber-700">
                            {formatNumber(profiles.filter((p) => p.impairment).length)}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, or ID number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-10"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={genderFilter} onValueChange={setGenderFilter}>
                                <SelectTrigger className="w-[150px] h-10">
                                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Genders</SelectItem>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={impairmentFilter} onValueChange={setImpairmentFilter}>
                                <SelectTrigger className="w-[150px] h-10">
                                    <ShieldAlert className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="PWD Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="yes">PWD Only</SelectItem>
                                    <SelectItem value="no">Non-PWD</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Profiles Table */}
            <div className="mt-4">
                {isLoading ? (
                    <div className="flex justify-center py-20 bg-card border rounded-lg">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                    </div>
                ) : (
                    <DataTable 
                        columns={columns} 
                        data={filteredProfiles} 
                        className="border rounded-lg bg-card"
                    />
                )}
            </div>
        </div>
    )
}
