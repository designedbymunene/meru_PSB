'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Edit2, Trash2, Loader2, GraduationCap, Calendar, Award, School, Check, ChevronsUpDown, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
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
import { createQualificationSchema, type Qualification, type QualificationInput } from '@meru/shared'
import {
    useMyQualifications,
    useAddMyQualification,
    useUpdateMyQualification,
    useDeleteMyQualification,
} from '@/hooks/use-applicant-profile'
import { 
    useEducationLevels, 
    useEducationGrades, 
    useInstitutions, 
    useCourses 
} from '@/hooks/use-reference-data'

export function QualificationsManager() {
    const { data: response, isLoading } = useMyQualifications()
    const qualifications = response?.data || []
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingQualification, setEditingQualification] = useState<Qualification | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [showOtherLevelInput, setShowOtherLevelInput] = useState(false)
    const [courseSearchOpen, setCourseSearchOpen] = useState(false)
    const [institutionSearchOpen, setInstitutionSearchOpen] = useState(false)

    const { data: levelsResponse } = useEducationLevels()
    const levels = (levelsResponse?.data as any[]) || []
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
            level: 'BACHELORS',
            course: '',
            institution: '',
            grade: '',
            yearStart: undefined,
            yearEnd: null,
            stillStudying: false,
        },
    })


    const selectedLevelCode = form.watch('level')
    const isSchoolLevel = selectedLevelCode === 'KCPE' || selectedLevelCode === 'KCSE'
    const isOtherLevel = selectedLevelCode === 'OTHER' || (!levels.some(l => l.code === selectedLevelCode) && selectedLevelCode !== '')

    const selectedLevelId = levels.find(l => l.code === selectedLevelCode)?.id
    const { data: gradesResponse } = useEducationGrades(selectedLevelId)
    const grades = gradesResponse?.data || []

    // Default grades if none found in DB
    const defaultGrades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E', 'Pass', 'Credit', 'Distinction']
    const displayGrades = grades.length > 0 ? grades.map((g: any) => g.grade) : defaultGrades

    const onSubmit = async (data: QualificationInput) => {
        try {
            if (editingQualification) {
                await updateMutation.mutateAsync({
                    qualId: editingQualification.id,
                    data,
                })
            } else {
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
        const isStandardLevel = levels.some(l => l.code === qualification.level)
        setShowOtherLevelInput(!isStandardLevel)
        
        form.reset({
            level: qualification.level,
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
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold">Academic Qualifications</CardTitle>
                        <CardDescription>Your educational background and certificates</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open)
                        if (!open) { 
                            setEditingQualification(null)
                            setShowOtherLevelInput(false)
                            form.reset() 
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-primary">
                                <Plus className="mr-2 h-4 w-4" /> Add Qualification
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingQualification ? 'Edit Qualification' : 'Add Qualification'}</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="level"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Qualification Level *</FormLabel>
                                                    <Select 
                                                        onValueChange={(val) => { 
                                                            if (val === 'OTHER') {
                                                                setShowOtherLevelInput(true)
                                                                field.onChange('')
                                                            } else {
                                                                setShowOtherLevelInput(false)
                                                                field.onChange(val)
                                                                // Reset course if school level
                                                                if (val === 'KCPE') form.setValue('course', 'Primary Education')
                                                                if (val === 'KCSE') form.setValue('course', 'Secondary Education')
                                                            }
                                                            form.setValue('grade', '') 
                                                        }} 
                                                        value={levels.some(l => l.code === field.value) ? field.value : (showOtherLevelInput ? 'OTHER' : field.value)}
                                                    >
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {levels.map((level) => <SelectItem key={level.id} value={level.code}>{level.name}</SelectItem>)}
                                                            <SelectItem value="OTHER">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {showOtherLevelInput && (
                                                        <div className="mt-2">
                                                            <Input 
                                                                placeholder="Enter qualification level (e.g. Postgraduate)" 
                                                                value={field.value} 
                                                                onChange={field.onChange}
                                                            />
                                                        </div>
                                                    )}
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="courseId"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col justify-end">
                                                    <FormLabel className="mb-2">Course/Field of Study *</FormLabel>
                                                    <Popover open={courseSearchOpen} onOpenChange={setCourseSearchOpen}>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant="outline"
                                                                    role="combobox"
                                                                    className={cn(
                                                                        "w-full justify-between font-normal",
                                                                        !field.value && !form.watch('course') && "text-muted-foreground"
                                                                    )}
                                                                    disabled={isSchoolLevel}
                                                                >
                                                                    {field.value
                                                                        ? courses.find((c) => c.id === field.value)?.name
                                                                        : form.watch('course') || "Select course"}
                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Search course..." />
                                                                <CommandList>
                                                                    <CommandEmpty>
                                                                        <div className="p-2 text-sm">
                                                                            No course found.
                                                                            <Button 
                                                                                variant="link" 
                                                                                className="h-auto p-0 px-1 text-primary"
                                                                                onClick={() => {
                                                                                    field.onChange(undefined)
                                                                                    setCourseSearchOpen(false)
                                                                                }}
                                                                            >
                                                                                Enter manually
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
                                                                            >
                                                                                <Check
                                                                                    className={cn(
                                                                                        "mr-2 h-4 w-4",
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
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {!form.watch('courseId') && !isSchoolLevel && (
                                        <FormField
                                            control={form.control}
                                            name="course"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Manual Course Entry</FormLabel>
                                                    <FormControl><Input placeholder="Enter course name" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <FormField
                                        control={form.control}
                                        name="institutionId"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="mb-2">Institution *</FormLabel>
                                                {isSchoolLevel ? (
                                                    <FormControl>
                                                        <Input 
                                                            placeholder={selectedLevelCode === 'KCPE' ? "Enter primary school name" : "Enter secondary school name"} 
                                                            value={form.watch('institution')}
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
                                                                        "w-full justify-between font-normal",
                                                                        !field.value && !form.watch('institution') && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value
                                                                        ? institutions.find((i) => i.id === field.value)?.name
                                                                        : form.watch('institution') || "Select institution"}
                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Search institution..." />
                                                                <CommandList>
                                                                    <CommandEmpty>
                                                                        <div className="p-2 text-sm">
                                                                            No institution found.
                                                                            <Button 
                                                                                variant="link" 
                                                                                className="h-auto p-0 px-1 text-primary"
                                                                                onClick={() => {
                                                                                    field.onChange(undefined)
                                                                                    setInstitutionSearchOpen(false)
                                                                                }}
                                                                            >
                                                                                Enter manually
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
                                                                            >
                                                                                <Check
                                                                                    className={cn(
                                                                                        "mr-2 h-4 w-4",
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
                                                <FormItem>
                                                    <FormLabel>Manual Institution Entry</FormLabel>
                                                    <FormControl><Input placeholder="Enter institution name" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="grade"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Grade *</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Grade" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {displayGrades.map((g: string) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                                            <SelectItem value="OTHER">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField control={form.control} name="yearStart" render={({ field }) => <FormItem><FormLabel>Start Year</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} value={field.value || ''} /></FormControl></FormItem>} />
                                        <FormField control={form.control} name="yearEnd" render={({ field }) => <FormItem><FormLabel>End Year</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} value={field.value || ''} /></FormControl></FormItem>} />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                        <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending}>
                                            {(addMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {editingQualification ? 'Update' : 'Save'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                {isLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary/50" /></div>
                ) : qualifications.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
                        <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground">No qualifications added yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {qualifications.map((qual) => (
                            <div key={qual.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><GraduationCap className="h-5 w-5 text-primary" /></div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-slate-100">{qual.course}</h3>
                                            <p className="text-xs font-black text-primary uppercase tracking-widest">{qual.level}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleEdit(qual)}><Edit2 className="h-3.5 w-3.5" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive" onClick={() => setDeletingId(qual.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <School className="h-4 w-4 text-slate-400" />
                                        <span>{qual.institution}</span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>{qual.yearStart} - {qual.yearEnd || 'Present'}</span>
                                        </div>
                                        {qual.grade && (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                                                <Award className="h-3.5 w-3.5" />
                                                <Badge variant="outline" className="text-[10px] py-0 h-4 border-slate-300 font-black uppercase">{qual.grade}</Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete Qualification</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete this qualification? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    )
}
