'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Edit2, Trash2, Loader2, GraduationCap, Calendar, Award, School, Check, ChevronsUpDown, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { 
    createQualificationSchema, 
    type Qualification, 
    type QualificationInput,
    KCSE_GRADES,
    TVET_GRADES,
    UNIVERSITY_GRADES,
    LEGACY_LEVEL_MAP,
    formatKNQFLevel
} from '@meru/shared'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
    useMyQualifications,
    useAddMyQualification,
    useUpdateMyQualification,
    useDeleteMyQualification,
    useMyProfile,
    useCreateOrUpdateProfile,
} from '@/hooks/use-applicant-profile'
import { 
    useEducationLevels, 
    useEducationGrades, 
    useInstitutions, 
    useCourses 
} from '@/hooks/use-reference-data'

const LEGACY_CODE_TO_KNQF_CODE: Record<string, string> = {
    'DOCTORATE': 'KNQF_LEVEL_10',
    'MASTERS': 'KNQF_LEVEL_9',
    'POSTGRAD_DIPLOMA': 'KNQF_LEVEL_8',
    'BACHELORS': 'KNQF_LEVEL_7',
    'HIGHER_DIPLOMA': 'KNQF_LEVEL_6',
    'DIPLOMA': 'KNQF_LEVEL_6',
    'CERTIFICATE': 'KNQF_LEVEL_5',
    'KCSE': 'KNQF_LEVEL_3',
    'KCPE': 'KNQF_LEVEL_1',
}

export function QualificationsManager() {
    const { data: response, isLoading } = useMyQualifications()
    const qualifications = response?.data || []
    const { data: profileResponse } = useMyProfile()
    const profile = profileResponse?.data
    const updateProfile = useCreateOrUpdateProfile()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingQualification, setEditingQualification] = useState<Qualification | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [showOtherLevelInput, setShowOtherLevelInput] = useState(false)
    const [courseSearchOpen, setCourseSearchOpen] = useState(false)
    const [institutionSearchOpen, setInstitutionSearchOpen] = useState(false)

    const { data: levelsResponse } = useEducationLevels()
    const levels = (levelsResponse?.data as any[]) || []
    const filteredLevels = levels

    const { data: institutionsResponse } = useInstitutions()
    const institutions = (institutionsResponse?.data as any[]) || []
    const { data: coursesResponse } = useCourses()
    const courses = (coursesResponse?.data as any[]) || []

    const addMutation = useAddMyQualification()
    const updateMutation = useUpdateMyQualification()
    const deleteMutation = useDeleteMyQualification()

    const form = useForm<any>({
        resolver: zodResolver(createQualificationSchema),
        defaultValues: {
            level: 'KNQF_LEVEL_7',
            course: '',
            institution: '',
            grade: '',
            yearStart: undefined,
            yearEnd: null,
            stillStudying: false,
        },
    })


    const selectedLevelCode = form.watch('level')
    
    const isLevel1To4 = (levelCode: string) => {
        return ['KNQF_LEVEL_1', 'KNQF_LEVEL_2', 'KNQF_LEVEL_3', 'KNQF_LEVEL_4'].includes(levelCode)
    }

    const isSchoolLevel = selectedLevelCode === 'KCPE' || selectedLevelCode === 'KCSE' || isLevel1To4(selectedLevelCode)
    const isOtherLevel = selectedLevelCode === 'OTHER' || (!levels.some(l => l.code === selectedLevelCode) && selectedLevelCode !== '')

    const selectedLevelId = levels.find(l => l.code === selectedLevelCode)?.id
    const { data: gradesResponse } = useEducationGrades(selectedLevelId)
    const grades = gradesResponse?.data || []

    // Helper to get fallback grades based on the selected level
    const getFallbackGrades = (levelCode: string) => {
        const normalizedLevel = (LEGACY_LEVEL_MAP as any)[levelCode] || levelCode;
        
        if (normalizedLevel.includes('Level 3') || levelCode === 'KCSE' || levelCode === 'KCPE') {
            return [...KCSE_GRADES]
        }
        if (normalizedLevel.match(/Level [456]/) || ['DIPLOMA', 'CERTIFICATE'].includes(levelCode)) {
            // For TVET, we prioritize the Class (Distinction, Credit, Pass)
            return [...TVET_GRADES]
        }
        if (normalizedLevel.match(/Level (7|8|9|10)/) || ['BACHELORS', 'MASTERS', 'DOCTORATE'].includes(levelCode)) {
            return [...UNIVERSITY_GRADES]
        }
        return ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E', 'Pass', 'Credit', 'Distinction']
    }

    // Ensure displayGrades are unique to prevent React key errors
    const displayGrades = (isLevel1To4(selectedLevelCode)
        ? ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E']
        : Array.from(new Set(
            grades.length > 0 
                ? grades.map((g: any) => g.grade) 
                : getFallbackGrades(selectedLevelCode)
        )) as string[]).filter(g => !['1', '2', '3', '4', '5', '6', '7'].includes(String(g).trim()))

    const onSubmit = async (data: QualificationInput) => {
        try {
            if (editingQualification) {
                await updateMutation.mutateAsync({
                    qualId: editingQualification.id,
                    data,
                })
            } else {
                if (profile?.hasNoCertificates) {
                    await updateProfile.mutateAsync({
                        fullName: profile.fullName || '',
                        idNumber: profile.idNumber || '',
                        gender: (profile.gender as 'Male' | 'Female' | 'Other') || 'Male',
                        dateOfBirth: profile.dateOfBirth || '',
                        ethnicityId: profile.ethnicityId || 0,
                        phoneNumber: profile.phoneNumber || '',
                        email: profile.email || '',
                        homeCountyId: profile.homeCountyId || 0,
                        homeSubCountyId: profile.homeSubCountyId || 0,
                        wardId: profile.wardId || 0,
                        impairment: profile.impairment || false,
                        impairmentDetails: profile.impairmentDetails || '',
                        publicServiceInfo: profile.publicServiceInfo || '',
                        personalNumber: profile.personalNumber || '',
                        hasNoExperience: profile.hasNoExperience || false,
                        hasNoCertificates: false,
                        hasNoMemberships: profile.hasNoMemberships || false,
                        hasNoTrainings: profile.hasNoTrainings || false,
                        hasNoReferees: profile.hasNoReferees || false,
                    })
                }
                await addMutation.mutateAsync(data)
            }
            setIsDialogOpen(false)
            setEditingQualification(null)
            setShowOtherLevelInput(false)
            form.reset()
        } catch (error) { }
    }

    const handleEdit = (qualification: Qualification) => {
        setEditingQualification(qualification)
        const levelCode = LEGACY_CODE_TO_KNQF_CODE[qualification.level] || qualification.level
        const isStandardLevel = filteredLevels.some(l => l.code === levelCode)
        setShowOtherLevelInput(!isStandardLevel)
        
        form.reset({
            level: levelCode,
            course: qualification.course,
            courseId: qualification.courseId || undefined,
            institution: qualification.institution,
            institutionId: qualification.institutionId || undefined,
            grade: qualification.grade || '',
            yearStart: qualification.yearStart || undefined,
            yearEnd: qualification.yearEnd || undefined,
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async () => {
        if (deletingId) {
            await deleteMutation.mutateAsync(deletingId)
            setDeletingId(null)
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between bg-muted/20 py-2 px-3.5 rounded-xl border border-dashed border-muted-foreground/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-sm font-bold">Academic Records</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            {qualifications.length} {qualifications.length === 1 ? 'Qualification' : 'Qualifications'} Added
                        </p>
                    </div>
                </div>
                <Sheet open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) { 
                        setEditingQualification(null)
                        setShowOtherLevelInput(false)
                        form.reset() 
                    }
                }}>
                    <SheetTrigger asChild>
                        <Button 
                            size="sm" 
                            className="bg-primary shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            disabled={profile?.hasNoCertificates || false}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Qualification
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-md border-l border-slate-200 dark:border-slate-800 p-0 flex flex-col" side="right">
                        <SheetHeader className="py-4 px-5 border-b border-slate-100 dark:border-slate-800 text-left">
                            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                                <GraduationCap className="h-6 w-6 text-primary" />
                                {editingQualification ? 'Edit Qualification' : 'Add New Qualification'}
                            </SheetTitle>
                            <SheetDescription className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                Enter your academic details below. All information is handled securely.
                            </SheetDescription>
                        </SheetHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
                                <div className="flex-1 overflow-y-auto py-4 px-5 space-y-3">
                                    {/* Level & Course Section */}
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-l-2 border-primary/30 pl-2">Level & Course</h4>
                                        <div className="space-y-3">
                                            <FormField
                                                control={form.control}
                                                name="level"
                                                render={({ field }) => (
                                                    <FormItem className="w-full">
                                                        <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Qualification Level *</FormLabel>
                                                        <Select 
                                                            onValueChange={(val) => { 
                                                                if (val === 'OTHER') {
                                                                    setShowOtherLevelInput(true)
                                                                    field.onChange('')
                                                                } else {
                                                                    setShowOtherLevelInput(false)
                                                                    field.onChange(val)
                                                                    
                                                                    // Dynamic course value setting for school levels
                                                                    if (val === 'KCPE' || val === 'KNQF_LEVEL_1') {
                                                                        form.setValue('course', 'Primary Education')
                                                                        form.setValue('courseId', undefined)
                                                                    } else if (val === 'KCSE' || val === 'KNQF_LEVEL_3' || val === 'KNQF_LEVEL_2') {
                                                                        form.setValue('course', 'Secondary Education')
                                                                        form.setValue('courseId', undefined)
                                                                    } else if (val === 'KNQF_LEVEL_4') {
                                                                        form.setValue('course', 'Certificate')
                                                                        form.setValue('courseId', undefined)
                                                                    } else {
                                                                        form.setValue('course', '')
                                                                        form.setValue('courseId', undefined)
                                                                    }
                                                                }
                                                                form.setValue('grade', '') 
                                                            }} 
                                                            value={filteredLevels.some(l => l.code === field.value) ? field.value : (showOtherLevelInput ? 'OTHER' : field.value)}
                                                        >
                                                            <FormControl><SelectTrigger className="h-11 rounded-lg"><SelectValue placeholder="Select level" /></SelectTrigger></FormControl>
                                                            <SelectContent className="rounded-xl">
                                                                {filteredLevels.map((level) => <SelectItem key={level.id} value={level.code}>{level.name}</SelectItem>)}
                                                                <SelectItem value="OTHER">Other / Custom Level</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        {showOtherLevelInput && (
                                                            <div className="mt-2.5 animate-in fade-in slide-in-from-top-2">
                                                                <Input 
                                                                    placeholder="Enter custom level (e.g. Higher Diploma)" 
                                                                    className="h-11 rounded-lg"
                                                                    value={field.value} 
                                                                    onChange={field.onChange}
                                                                />
                                                            </div>
                                                        )}
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {!isLevel1To4(selectedLevelCode) && (
                                                <div className="space-y-3">
                                                    {!(form.watch('level') === 'KCPE' || form.watch('level') === 'KCSE') && (
                                                    <FormField
                                                        control={form.control}
                                                        name="courseId"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-col">
                                                                <FormLabel className="text-xs font-bold uppercase text-muted-foreground mb-2">Course / Field of Study *</FormLabel>
                                                                <Popover open={courseSearchOpen} onOpenChange={setCourseSearchOpen}>
                                                                    <PopoverTrigger asChild>
                                                                        <FormControl>
                                                                            <Button
                                                                                variant="outline"
                                                                                role="combobox"
                                                                                className={cn(
                                                                                    "w-full h-11 justify-between font-normal rounded-lg",
                                                                                    !field.value && !form.watch('course') && "text-muted-foreground"
                                                                                )}
                                                                                disabled={isSchoolLevel}
                                                                            >
                                                                                <span className="truncate">
                                                                                    {field.value
                                                                                        ? courses.find((c) => c.id === field.value)?.name
                                                                                        : form.watch('course') || "Select course"}
                                                                                </span>
                                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                            </Button>
                                                                        </FormControl>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl overflow-hidden shadow-2xl border-none ring-1 ring-border">
                                                                        <Command>
                                                                            <CommandInput placeholder="Search course..." className="h-11" />
                                                                            <CommandList>
                                                                                <CommandEmpty>
                                                                                    <div className="p-4 text-sm text-center">
                                                                                        <p className="mb-2 text-muted-foreground">No predefined course found.</p>
                                                                                        <Button 
                                                                                            variant="secondary" 
                                                                                            size="sm"
                                                                                            className="rounded-lg h-8"
                                                                                            onClick={() => {
                                                                                                field.onChange(undefined)
                                                                                                setCourseSearchOpen(false)
                                                                                            }}
                                                                                        >
                                                                                            Enter Manually
                                                                                        </Button>
                                                                                    </div>
                                                                                </CommandEmpty>
                                                                                <CommandGroup>
                                                                                    {courses.map((c) => (
                                                                                        <CommandItem
                                                                                            value={c.name}
                                                                                            key={c.id}
                                                                                            onSelect={() => {
                                                                                                field.onChange(c.id)
                                                                                                form.setValue('course', c.name)
                                                                                                setCourseSearchOpen(false)
                                                                                            }}
                                                                                            className="h-10 rounded-md"
                                                                                        >
                                                                                            <Check
                                                                                                className={cn(
                                                                                                    "mr-2 h-4 w-4 text-primary",
                                                                                                    c.id === field.value ? "opacity-100" : "opacity-0"
                                                                                                )}
                                                                                            />
                                                                                            {c.name}
                                                                                        </CommandItem>
                                                                                    ))}
                                                                                </CommandGroup>
                                                                            </CommandList>
                                                                        </Command>
                                                                    </PopoverContent>
                                                                </Popover>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    )}

                                                    {!(form.watch('level') === 'KCPE' || form.watch('level') === 'KCSE') && !form.watch('courseId') && (
                                                        <FormField
                                                            control={form.control}
                                                            name="course"
                                                            render={({ field }) => (
                                                                <FormItem className="animate-in fade-in slide-in-from-top-1">
                                                                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Manual Course Entry</FormLabel>
                                                                    <FormControl><Input placeholder="Enter your full course name" className="h-11 rounded-lg" {...field} /></FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                {/* Institution Section */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-l-2 border-primary/30 pl-2">Institution</h4>
                                    <FormField
                                        control={form.control}
                                        name="institutionId"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-xs font-bold uppercase text-muted-foreground mb-2">School / University / College *</FormLabel>
                                                {isSchoolLevel ? (
                                                    <FormControl>
                                                        <Input 
                                                            className="h-11 rounded-lg"
                                                            placeholder={
                                                                selectedLevelCode === 'KNQF_LEVEL_1' || selectedLevelCode === 'KCPE' 
                                                                    ? "Enter primary school name" 
                                                                    : selectedLevelCode === 'KNQF_LEVEL_2'
                                                                    ? "Enter junior secondary school name"
                                                                    : selectedLevelCode === 'KNQF_LEVEL_3' || selectedLevelCode === 'KCSE'
                                                                    ? "Enter secondary school name"
                                                                    : "Enter artisan school name"
                                                            } 
                                                            value={form.watch('institution') || ''}
                                                            onChange={(e) => {
                                                                field.onChange(undefined)
                                                                form.setValue('institution', e.target.value)
                                                            }}
                                                        />
                                                    </FormControl>
                                                ) : (
                                                    <Popover open={institutionSearchOpen} onOpenChange={setInstitutionSearchOpen}>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant="outline"
                                                                    role="combobox"
                                                                    className={cn(
                                                                        "w-full h-11 justify-between font-normal rounded-lg",
                                                                        !field.value && !form.watch('institution') && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    <span className="truncate">
                                                                        {field.value
                                                                            ? institutions.find((i) => i.id === field.value)?.name
                                                                            : form.watch('institution') || "Select institution"}
                                                                    </span>
                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl overflow-hidden shadow-2xl border-none ring-1 ring-border">
                                                            <Command>
                                                                <CommandInput placeholder="Search institution..." className="h-11" />
                                                                <CommandList>
                                                                    <CommandEmpty>
                                                                        <div className="p-4 text-sm text-center">
                                                                            <p className="mb-2 text-muted-foreground">No institution found.</p>
                                                                            <Button 
                                                                                variant="secondary" 
                                                                                size="sm"
                                                                                className="rounded-lg h-8"
                                                                                onClick={() => {
                                                                                    field.onChange(undefined)
                                                                                    setInstitutionSearchOpen(false)
                                                                                }}
                                                                            >
                                                                                Enter Manually
                                                                            </Button>
                                                                        </div>
                                                                    </CommandEmpty>
                                                                    <CommandGroup>
                                                                        {institutions.map((i) => (
                                                                            <CommandItem
                                                                                value={i.name}
                                                                                key={i.id}
                                                                                onSelect={() => {
                                                                                    field.onChange(i.id)
                                                                                    form.setValue('institution', i.name)
                                                                                    setInstitutionSearchOpen(false)
                                                                                }}
                                                                                className="h-10 rounded-md"
                                                                            >
                                                                                <Check
                                                                                    className={cn(
                                                                                        "mr-2 h-4 w-4 text-primary",
                                                                                        i.id === field.value ? "opacity-100" : "opacity-0"
                                                                                    )}
                                                                                />
                                                                                {i.name}
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {!form.watch('institutionId') && !isSchoolLevel && (
                                        <FormField
                                            control={form.control}
                                            name="institution"
                                            render={({ field }) => (
                                                <FormItem className="animate-in fade-in slide-in-from-top-1">
                                                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Manual Institution Entry</FormLabel>
                                                    <FormControl><Input placeholder="Enter institution name" className="h-11 rounded-lg" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>

                                {/* Grade & Years Section */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-l-2 border-primary/30 pl-2">Performance & Duration</h4>
                                    <div className="space-y-3">
                                        <div className="w-full">
                                            <FormField
                                                control={form.control}
                                                name="grade"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Grade / Score *</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger className="h-11 rounded-lg"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                            <SelectContent className="rounded-xl">
                                                                {displayGrades.map((g: string) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                                                <SelectItem value="OTHER">Other / Custom</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <FormField 
                                                control={form.control} 
                                                name="yearStart" 
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Start Year</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                type="number" 
                                                                className="h-11 rounded-lg"
                                                                placeholder="e.g. 2018"
                                                                {...field} 
                                                                onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} 
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
                                                        <FormLabel className="text-xs font-bold uppercase text-muted-foreground">End Year</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                type="number" 
                                                                className="h-11 rounded-lg"
                                                                placeholder="e.g. 2022"
                                                                {...field} 
                                                                onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} 
                                                                value={field.value || ''} 
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} 
                                            />
                                        </div>
                                    </div>
                                </div>
                                </div>

                                <div className="py-3 px-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex gap-3 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] mt-auto">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 h-10 rounded-xl font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-[2] h-10 rounded-xl font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all"
                                        disabled={addMutation.isPending || updateMutation.isPending}
                                    >
                                        {(addMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {editingQualification ? 'Update Qualification' : 'Save Qualification'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Not Included Toggle */}
            {qualifications.length === 0 && (
                <div className="flex items-center space-x-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <Checkbox
                        id="hasNoCertificates"
                        checked={profile?.hasNoCertificates || false}
                        onCheckedChange={async (checked) => {
                            if (!profile) return
                            await updateProfile.mutateAsync({
                                fullName: profile.fullName || '',
                                idNumber: profile.idNumber || '',
                                gender: (profile.gender as 'Male' | 'Female' | 'Other') || 'Male',
                                dateOfBirth: profile.dateOfBirth || '',
                                ethnicityId: profile.ethnicityId || 0,
                                phoneNumber: profile.phoneNumber || '',
                                email: profile.email || '',
                                homeCountyId: profile.homeCountyId || 0,
                                homeSubCountyId: profile.homeSubCountyId || 0,
                                wardId: profile.wardId || 0,
                                impairment: profile.impairment || false,
                                impairmentDetails: profile.impairmentDetails || '',
                                publicServiceInfo: profile.publicServiceInfo || '',
                                personalNumber: profile.personalNumber || '',
                                hasNoExperience: profile.hasNoExperience || false,
                                hasNoCertificates: Boolean(checked),
                                hasNoMemberships: profile.hasNoMemberships || false,
                                hasNoTrainings: profile.hasNoTrainings || false,
                                hasNoReferees: profile.hasNoReferees || false,
                            })
                        }}
                        disabled={updateProfile.isPending}
                        className="h-5 w-5 rounded-md"
                    />
                    <div className="grid gap-1.5 leading-none">
                        <Label
                            htmlFor="hasNoCertificates"
                            className="text-sm font-semibold cursor-pointer select-none text-slate-700 dark:text-slate-300"
                        >
                            I have no academic history to add
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Check this if you do not hold any academic qualifications.
                        </p>
                    </div>
                    {updateProfile.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary ml-auto" />
                    )}
                </div>
            )}

            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Loading records...</p>
                    </div>
                ) : qualifications.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-muted/5 flex flex-col items-center justify-center">
                        <div className="p-4 bg-muted rounded-full mb-4">
                            <GraduationCap className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">No academic records yet</h4>
                        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto leading-relaxed">
                            Add your educational background to complete your professional profile.
                        </p>
                    </div>
                ) : (
                    <div className="max-h-[calc(100vh-380px)] overflow-y-auto pr-2 -mr-2">
                        <div className="grid grid-cols-1 gap-3 pt-1 pb-3">
                            {qualifications.map((qual) => (
                                <div key={qual.id} className="group relative flex items-start justify-between p-4 bg-card border rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-300">
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                                <GraduationCap className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1 space-y-1.5">
                                                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight break-words">{qual.course}</h3>
                                                <div className="flex flex-wrap gap-1.5">
                                                    <Badge variant="secondary" className="font-semibold text-[10px] px-2 bg-primary/5 text-primary border-none uppercase tracking-wider h-auto py-0.5 whitespace-normal break-words max-w-full">
                                                        {formatKNQFLevel(qual.level)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 pl-[52px]">
                                            <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-medium break-words">
                                                <School className="h-3.5 w-3.5 opacity-60 flex-shrink-0" />
                                                <span>{qual.institution}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 font-bold uppercase tracking-wider">
                                                    <Calendar className="h-3.5 w-3.5 opacity-60" />
                                                    <span>{qual.yearStart} - {qual.yearEnd || 'Present'}</span>
                                                </div>
                                                {qual.grade && (
                                                    <Badge variant="outline" className="text-[10px] py-0 h-5 border-slate-200 dark:border-slate-700 font-bold uppercase bg-slate-50 dark:bg-slate-900">
                                                        <Award className="h-3 w-3 mr-1 opacity-60" />
                                                        {qual.grade}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 ml-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => handleEdit(qual)}><Edit2 className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setDeletingId(qual.id)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Qualification</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to delete this qualification? This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
