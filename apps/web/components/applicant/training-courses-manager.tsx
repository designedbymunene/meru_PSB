'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Edit2, Trash2, Loader2, GraduationCap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createTrainingCourseSchema } from '@meru/shared'
import {
    useTrainingCourses,
    useAddTrainingCourse,
    useUpdateTrainingCourse,
    useDeleteTrainingCourse,
} from '@/hooks/use-applicant-profile'
import type { TrainingCourse } from '@/types'

interface TrainingCoursesManagerProps {
    profileId: number
}

export function TrainingCoursesManager({ profileId }: TrainingCoursesManagerProps) {
    const { data: response, isLoading } = useTrainingCourses(profileId)
    const courses = response?.data || []
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editing, setEditing] = useState<TrainingCourse | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const addMutation = useAddTrainingCourse(profileId)
    const updateMutation = useUpdateTrainingCourse(profileId)
    const deleteMutation = useDeleteTrainingCourse(profileId)

    const form = useForm({
        resolver: zodResolver(createTrainingCourseSchema),
        defaultValues: {
            courseName: '',
            description: '',
            grade: '',
            institution: '',
            year: undefined as number | undefined,
            certificatePath: '',
        },
    })

    const onSubmit = async (data: any) => {
        try {
            // Clean up empty optional fields
            const cleanedData = {
                ...data,
                year: data.year || undefined,
            }
            if (editing) {
                await updateMutation.mutateAsync({ courseId: editing.id, data: cleanedData })
            } else {
                await addMutation.mutateAsync(cleanedData)
            }
            setIsDialogOpen(false)
            setEditing(null)
            form.reset()
        } catch (error) { }
    }

    const handleEdit = (course: TrainingCourse) => {
        setEditing(course)
        form.reset({
            courseName: course.courseName,
            description: course.description || '',
            grade: course.grade || '',
            institution: course.institution || '',
            year: course.year || undefined,
            certificatePath: course.certificatePath || '',
        })
        setIsDialogOpen(true)
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Training Courses
                        </CardTitle>
                        <CardDescription>Short courses, certifications, and professional development</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => {
                                setEditing(null)
                                form.reset({
                                    courseName: '',
                                    description: '',
                                    grade: '',
                                    institution: '',
                                    year: undefined,
                                    certificatePath: '',
                                })
                            }}>
                                <Plus className="mr-2 h-4 w-4" /> Add Course
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>{editing ? 'Edit' : 'Add'} Training Course</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="courseName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Course Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Project Management Professional" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="institution"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Institution</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Kenya School of Government" {...field} />
                                                </FormControl>
                                                <FormDescription>Optional</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="year"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Year Completed</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="2023"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                            value={field.value || ''}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="grade"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Grade/Score</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Pass, 85%" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Brief description of the course content..."
                                                        rows={3}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>Optional</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending}>
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
                ) : courses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No training courses added yet.</p>
                        <p className="text-sm mt-1">Add your professional development courses and certifications.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course</TableHead>
                                <TableHead>Institution</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell>
                                        <div>
                                            <span className="font-medium">{course.courseName}</span>
                                            {course.description && (
                                                <p className="text-sm text-muted-foreground truncate max-w-xs">
                                                    {course.description}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{course.institution || '-'}</TableCell>
                                    <TableCell>{course.year || '-'}</TableCell>
                                    <TableCell>{course.grade || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(course)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => setDeletingId(course.id)}>
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
                            <AlertDialogTitle>Delete Training Course</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this training course? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={async () => {
                                    if (deletingId) {
                                        await deleteMutation.mutateAsync(deletingId)
                                        setDeletingId(null)
                                    }
                                }}
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
