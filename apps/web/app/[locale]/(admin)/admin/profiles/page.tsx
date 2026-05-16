'use client'

import { useState } from 'react'
import { Loader2, Download, Search, Eye, Filter, Users } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAllApplicantProfiles, useExportProfiles } from '@/hooks/use-applicant-profile'
import type { ApplicantProfileWithRelations } from '@/types'
import { ProfileDetailView } from '@/components/admin/profile-detail-view'
import { formatNumber } from '@/lib/utils'

export default function AdminProfilesPage() {
    const { data: response, isLoading } = useAllApplicantProfiles()
    const profiles = response?.data || []
    const exportMutation = useExportProfiles()

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedProfile, setSelectedProfile] = useState<ApplicantProfileWithRelations | null>(null)
    const [genderFilter, setGenderFilter] = useState<string>('all')

    // Filter profiles based on search and filters
    const filteredProfiles = profiles.filter((profile) => {
        const query = searchQuery.toLowerCase()
        const name = (profile.applicantName || (profile as any).fullName || '').toLowerCase()
        const email = (profile.email || '').toLowerCase()
        const idNumber = (profile.idNumber || '').toLowerCase()

        const matchesSearch =
            name.includes(query) ||
            email.includes(query) ||
            idNumber.includes(query)

        const matchesGender = genderFilter === 'all' || profile.gender === genderFilter

        return matchesSearch && matchesGender
    })

    const handleExport = () => {
        exportMutation.mutate()
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Users className="h-8 w-8" />
                        Applicant Profiles
                    </h1>
                    <p className="text-muted-foreground">
                        View and manage all applicant profiles
                    </p>
                </div>
                <Button onClick={handleExport} disabled={exportMutation.isPending}>
                    {exportMutation.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" />
                            Export to CSV
                        </>
                    )}
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Profiles</CardDescription>
                        <CardTitle className="text-3xl">{formatNumber(profiles.length)}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>With Qualifications</CardDescription>
                        <CardTitle className="text-3xl">
                            {formatNumber(profiles.filter((p) => p.qualifications.length > 0).length)}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>With Employment</CardDescription>
                        <CardTitle className="text-3xl">
                            {formatNumber(profiles.filter((p) => p.employmentHistory.length > 0).length)}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>With Disability</CardDescription>
                        <CardTitle className="text-3xl">
                            {formatNumber(profiles.filter((p) => p.impairment).length)}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Search and Filter</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, or ID number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={genderFilter} onValueChange={setGenderFilter}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Filter by gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Genders</SelectItem>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Profiles Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        All Profiles ({formatNumber(filteredProfiles.length)})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredProfiles.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            {searchQuery || genderFilter !== 'all' ? (
                                <p>No profiles match your search criteria.</p>
                            ) : (
                                <p>No applicant profiles found.</p>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>ID Number</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Gender</TableHead>
                                        <TableHead>Qualifications</TableHead>
                                        <TableHead>Employment</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProfiles.map((profile) => (
                                        <TableRow key={profile.id}>
                                            <TableCell className="font-medium">
                                                {profile.applicantName || (profile as any).fullName}
                                                {profile.impairment && (
                                                    <Badge
                                                        variant="outline"
                                                        className="ml-2 text-xs"
                                                    >
                                                        PWD
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{profile.idNumber}</TableCell>
                                            <TableCell className="text-sm">
                                                {profile.email}
                                            </TableCell>
                                            <TableCell>{profile.phone}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{profile.gender}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {profile.qualifications.length}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {profile.employmentHistory.length}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setSelectedProfile(profile)}
                                                        title="Quick View"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        title="Full View"
                                                    >
                                                        <Link href={`/admin/profiles/${(profile as any).userId || profile.applicantId}`}>
                                                            <Users className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Profile Detail Dialog */}
            <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Profile: {selectedProfile?.applicantName}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedProfile && <ProfileDetailView profile={selectedProfile} />}
                </DialogContent>
            </Dialog>
        </div>
    )
}
