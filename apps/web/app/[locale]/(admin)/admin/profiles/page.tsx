'use client'

import { useMemo, Suspense, useState } from 'react'
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
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Key,
    Trash2,
    Copy
} from 'lucide-react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { useQueryState, parseAsInteger, parseAsString } from 'nuqs'

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
import { useAllApplicantProfiles, useExportProfiles, useProfileStats } from '@/hooks/use-applicant-profile'
import { useDeleteUser, useGenerateTempPassword } from '@/hooks/use-users'
import type { ApplicantProfileWithRelations, Qualification, EmploymentHistory } from '@/types'
import { formatNumber } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'

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

function AdminProfilesPageContent() {
    const [search, setSearch] = useQueryState('search', parseAsString.withDefault('').withOptions({ shallow: false, throttleMs: 500 }))
    const [gender, setGender] = useQueryState('gender', parseAsString.withDefault('all').withOptions({ shallow: false }))
    const [impairment, setImpairment] = useQueryState('impairment', parseAsString.withDefault('all').withOptions({ shallow: false }))
    const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1).withOptions({ shallow: false }))
    const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10).withOptions({ shallow: false }))

    const filters = useMemo(() => ({
        searchTerm: search || undefined,
        gender: gender === 'all' ? undefined : gender as any,
        impairment: impairment === 'all' ? undefined : (impairment === 'yes' ? 'true' : 'false'),
        page: page.toString(),
        limit: limit.toString()
    }), [search, gender, impairment, page, limit])

    const { data: response, isLoading } = useAllApplicantProfiles(filters)
    const profiles = response?.data || []
    const pagination = response?.pagination
    const { data: statsResponse, isLoading: isLoadingStats } = useProfileStats()
    const stats = statsResponse?.data
    const exportMutation = useExportProfiles()

    const deleteUser = useDeleteUser()
    const generateTempPassword = useGenerateTempPassword()

    const [userToDelete, setUserToDelete] = useState<{ id: number; fullName: string } | null>(null)
    const [tempPasswordData, setTempPasswordData] = useState<{ fullName: string; tempPassword: string } | null>(null)

    const handleDeleteUser = async () => {
        if (!userToDelete) return
        try {
            await deleteUser.mutateAsync(userToDelete.id)
            setUserToDelete(null)
        } catch (error) {}
    }

    const handleGenerateTempPassword = async (userId: number, fullName: string) => {
        try {
            const result = await generateTempPassword.mutateAsync(userId)
            if (result.success && result.data) {
                setTempPasswordData({ fullName, tempPassword: (result.data as any).tempPassword })
            }
        } catch (error) {}
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard')
    }

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
                const name = row.original.fullName || (row.original as any).applicantName
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
                        <span>{row.original.phoneNumber}</span>
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
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{row.original.dateOfBirth}</span>
                    </div>
                </div>
            )
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const userId = (row.original as any).userId || row.original.id
                const fullName = row.original.fullName || (row.original as any).applicantName
                
                return (
                    <div className="flex items-center justify-end gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-primary hover:bg-primary/10"
                            asChild
                        >
                            <Link href={`/admin/profiles/${userId}`}>
                                <UserCircle className="h-4 w-4" />
                                View
                            </Link>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl">
                                <DropdownMenuLabel>User Management</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleGenerateTempPassword(userId, fullName)} className="cursor-pointer rounded-lg">
                                    <Key className="mr-2 h-4 w-4" />
                                    Generate Temp Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    onClick={() => setUserToDelete({ id: userId, fullName: fullName })}
                                    className="cursor-pointer text-red-600 focus:text-red-600 rounded-lg"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Applicant Data
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            }
        }
    ]

    const handleExport = () => {
        exportMutation.mutate(filters)
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
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
                        <CardDescription className="text-primary/70 font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Total Profiles
                        </CardDescription>
                        {isLoadingStats ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary/40 mt-2" />
                        ) : (
                            <CardTitle className="text-3xl font-bold text-primary">{formatNumber(stats?.totalProfiles || 0)}</CardTitle>
                        )}
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-medium flex items-center gap-2">
                            <UserCircle className="h-4 w-4 text-blue-500" />
                            Male Applicants
                        </CardDescription>
                        {isLoadingStats ? (
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mt-2" />
                        ) : (
                            <CardTitle className="text-3xl font-bold">{formatNumber(stats?.maleProfiles || 0)}</CardTitle>
                        )}
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-medium flex items-center gap-2">
                            <UserCircle className="h-4 w-4 text-pink-500" />
                            Female Applicants
                        </CardDescription>
                        {isLoadingStats ? (
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mt-2" />
                        ) : (
                            <CardTitle className="text-3xl font-bold">{formatNumber(stats?.femaleProfiles || 0)}</CardTitle>
                        )}
                    </CardHeader>
                </Card>
                <Card className="border-amber-200 bg-amber-50/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-amber-700 font-medium flex items-center gap-1.5">
                            <ShieldAlert className="h-4 w-4" />
                            PWD Applicants
                        </CardDescription>
                        {isLoadingStats ? (
                            <Loader2 className="h-8 w-8 animate-spin text-amber-700/40 mt-2" />
                        ) : (
                            <CardTitle className="text-3xl font-bold text-amber-700">{formatNumber(stats?.pwdProfiles || 0)}</CardTitle>
                        )}
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
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value)
                                        setPage(1)
                                    }}
                                    className="pl-10 h-10"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={gender} onValueChange={(val) => {
                                setGender(val)
                                setPage(1)
                            }}>
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

                            <Select value={impairment} onValueChange={(val) => {
                                setImpairment(val)
                                setPage(1)
                            }}>
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
            <div className="mt-4 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-20 bg-card border rounded-lg">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                    </div>
                ) : (
                    <>
                        <DataTable 
                            columns={columns} 
                            data={profiles} 
                            className="border rounded-lg bg-card"
                            manualPagination
                        />
                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between px-2 py-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {formatNumber((page - 1) * limit + 1)} to {formatNumber(Math.min(page * limit, pagination?.total || 0))} of {formatNumber(pagination?.total || 0)} entries
                            </div>
                            <div className="flex items-center space-x-6 lg:space-x-8">
                                <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium">Rows per page</p>
                                    <Select
                                        value={limit.toString()}
                                        onValueChange={(value) => {
                                            setLimit(Number(value))
                                            setPage(1)
                                        }}
                                    >
                                        <SelectTrigger className="h-8 w-[70px]">
                                            <SelectValue placeholder={limit.toString()} />
                                        </SelectTrigger>
                                        <SelectContent side="top">
                                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                                    {pageSize}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                    Page {page} of {pagination?.totalPages || 1}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={!pagination?.hasPrev}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={!pagination?.hasNext}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the applicant account and all associated profile data for <span className="font-bold text-foreground">{userToDelete?.fullName}</span>.
                            This action cannot be undone and will remove all documents, applications, and personal records.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteUser}
                            className="bg-red-600 hover:bg-red-700 rounded-xl"
                        >
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={!!tempPasswordData} onOpenChange={(open) => !open && setTempPasswordData(null)}>
                <DialogContent className="rounded-2xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Temporary Password Generated</DialogTitle>
                        <DialogDescription>
                            A temporary password has been generated for <span className="font-bold text-foreground">{tempPasswordData?.fullName}</span>.
                            Please copy it and share it securely with the applicant.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 mt-4">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="temp-password" title="Temporary Password" className="sr-only">
                                Password
                            </Label>
                            <Input
                                id="temp-password"
                                defaultValue={tempPasswordData?.tempPassword}
                                readOnly
                                className="rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-mono text-center text-lg tracking-wider"
                            />
                        </div>
                        <Button 
                            type="button" 
                            size="icon" 
                            onClick={() => copyToClipboard(tempPasswordData?.tempPassword || '')}
                            className="rounded-xl h-12 w-12"
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setTempPasswordData(null)}
                            className="rounded-xl w-full sm:w-auto"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default function AdminProfilesPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
            </div>
        }>
            <AdminProfilesPageContent />
        </Suspense>
    )
}
