'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react'

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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createQualificationSchema } from '@meru/shared'
import {
    useQualifications,
    useAddQualification,
    useUpdateQualification,
    useDeleteQualification,
} from '@/hooks/use-applicant-profile'
import { 
    useEducationLevels, 
    useEducationGrades, 
    useInstitutions, 
    useCourses 
} from '@/hooks/use-reference-data'
import type { Qualification } from '@/types'

interface QualificationsManagerProps {
    profileId: number
}

export function QualificationsManager({ profileId }: QualificationsManagerProps) {
    const { data: response, isLoading } = useQualifications(profileId)
    const qualifications = response?.data || []
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingQualification, setEditingQualification] = useState<Qualification | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    // Reference Queries
    const { data: levelsResponse } = useEducationLevels()
    const levels = levelsResponse?.data || []

    const { data: institutionsResponse } = useInstitutions()
    const institutions = institutionsResponse?.data || []

    const { data: coursesResponse } = useCourses()
    const courses = coursesResponse?.data || []

    const addMutation = useAddQualification(profileId)
    const updateMutation = useUpdateQualification(profileId)
    const deleteMutation = useDeleteQualification(profileId)

    const form = useForm({
        resolver: zodResolver(createQualificationSchema),
        defaultValues: {
            level: 'BACHELORS' as const,
            course: '',
            courseId: undefined as number | undefined,
            institution: '',
            institutionId: undefined as number | undefined,
            grade: '',
            yearStart: undefined as number | undefined,
            yearEnd: undefined as number | undefined,
        },
    })

    const selectedLevelCode = form.watch('level')
    const selectedLevelId = levels.find(l => l.code === selectedLevelCode)?.id

    const { data: gradesResponse } = useEducationGrades(selectedLevelId)
    const grades = gradesResponse?.data || []

    const institutionId = form.watch('institutionId')
    const courseId = form.watch('courseId')

    const onSubmit = async (data: any) => {
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
            form.reset()
        } catch (error) {
            // Error is handled in the mutation
        }
    }

    const handleEdit = (qualification: Qualification) => {
        setEditingQualification(qualification)
        form.reset({
            level: qualification.level as any,
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

    const handleDialogClose = () => {
        setIsDialogOpen(false)
        setEditingQualification(null)
        form.reset()
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Qualifications</CardTitle>
                        <CardDescription>Manage your academic qualifications</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setEditingQualification(null)}>
                                <Plus className="mr-2 h-4 w-4" /> Add Qualification
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingQualification ? 'Edit Qualification' : 'Add Qualification'}
                                </DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="level"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Level *</FormLabel>
                                                    <Select
                                                        onValueChange={(val) => {
                                                            field.onChange(val)
                                                            form.setValue('grade', '')
                                                        }}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select level" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {levels.map((level) => (
                                                                <SelectItem key={level.id} value={level.code}>
                                                                    {level.name}
                                                                </SelectItem>
                                                            ))}
                                                            <SelectItem value="OTHER">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="courseId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Course Name *</FormLabel>
                                                        <Select
                                                            onValueChange={(val) => {
                                                                if (val === 'other') {
                                                                    field.onChange(undefined)
                                                                } else {
                                                                    const course = courses.find(c => c.id.toString() === val)
                                                                    field.onChange(parseInt(val))
                                                                    form.setValue('course', course?.name || '')
                                                                }
                                                            }}
                                                            value={field.value?.toString() || (form.getValues('course') ? 'other' : '')}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select course" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {courses.map((course) => (
                                                                    <SelectItem key={course.id} value={course.id.toString()}>
                                                                        {course.name}
                                                                    </SelectItem>
                                                                ))}
                                                                <SelectItem value="other">Other (Type manually)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {(!courseId || form.watch('course')) && (
                                                <FormField
                                                    control={form.control}
                                                    name="course"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Enter course name"
                                                                    {...field}
                                                                    disabled={!!courseId}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="institutionId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Institution *</FormLabel>
                                                    <Select
                                                        onValueChange={(val) => {
                                                            if (val === 'other') {
                                                                field.onChange(undefined)
                                                            } else {
                                                                const inst = institutions.find(i => i.id.toString() === val)
                                                                field.onChange(parseInt(val))
                                                                form.setValue('institution', inst?.name || '')
                                                            }
                                                        }}
                                                        value={field.value?.toString() || (form.getValues('institution') ? 'other' : '')}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select institution" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {institutions.map((inst) => (
                                                                <SelectItem key={inst.id} value={inst.id.toString()}>
                                                                    {inst.name}
                                                                </SelectItem>
                                                            ))}
                                                            <SelectItem value="other">Other (Type manually)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {(!institutionId || form.watch('institution')) && (
                                            <FormField
                                                control={form.control}
                                                name="institution"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter institution name"
                                                                {...field}
                                                                disabled={!!institutionId}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="grade"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Grade</FormLabel>
                                                    {grades.length > 0 ? (
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select grade" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {grades.map((g) => (
                                                                    <SelectItem key={g.id} value={g.grade}>
                                                                        {g.grade}
                                                                    </SelectItem>
                                                                ))}
                                                                <SelectItem value="OTHER">Other</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <FormControl>
                                                            <Input placeholder="e.g. First Class" {...field} />
                                                        </FormControl>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="yearStart"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Start Year</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="2018"
                                                            {...field}
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e.target.value
                                                                        ? parseInt(e.target.value)
                                                                        : undefined
                                                                )
                                                            }
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
                                                    <FormLabel>End Year</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="2022"
                                                            {...field}
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e.target.value
                                                                        ? parseInt(e.target.value)
                                                                        : undefined
                                                                )
                                                            }
                                                            value={field.value || ''}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleDialogClose}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={addMutation.isPending || updateMutation.isPending}
                                        >
                                            {addMutation.isPending || updateMutation.isPending ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : qualifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No qualifications added yet.</p>
                        <p className="text-sm">Click "Add Qualification" to get started.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Level</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Institution</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Years</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {qualifications.map((qual) => (
                                <TableRow key={qual.id}>
                                    <TableCell>
                                        <Badge variant="secondary">{qual.level}</Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{qual.course}</TableCell>
                                    <TableCell>{qual.institution}</TableCell>
                                    <TableCell>{qual.grade || '-'}</TableCell>
                                    <TableCell>
                                        {qual.yearStart && qual.yearEnd
                                            ? `${qual.yearStart} - ${qual.yearEnd}`
                                            : qual.yearStart || '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(qual)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeletingId(qual.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Qualification</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this qualification? This action cannot be
                                undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    )
}
