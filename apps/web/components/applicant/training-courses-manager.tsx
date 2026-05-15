'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Edit2, Trash2, Loader2, GraduationCap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
    useMyTrainingCourses,
    useAddMyTrainingCourse,
    useUpdateMyTrainingCourse,
    useDeleteMyTrainingCourse,
} from '@/hooks/use-applicant-profile'
import type { TrainingCourse } from '@/types'

export function TrainingCoursesManager() {
    const { data: response, isLoading } = useMyTrainingCourses()
    const trainingCourses = response?.data || []
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editing, setEditing] = useState<TrainingCourse | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const addMutation = useAddMyTrainingCourse()
    const updateMutation = useUpdateMyTrainingCourse()
    const deleteMutation = useDeleteMyTrainingCourse()


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
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-muted/20 p-4 rounded-xl border border-dashed border-muted-foreground/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-sm font-bold">Course History</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            {trainingCourses.length} {trainingCourses.length === 1 ? 'Course' : 'Courses'} Added
                        </p>
                    </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-primary shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={() => {
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
                    <DialogContent className="sm:max-w-[500px] rounded-2xl">
                        <DialogHeader className="pb-4 border-b">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-primary" />
                                {editing ? 'Edit Course' : 'Add Course'}
                            </DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="courseName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Course Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Project Management Professional" className="h-11 rounded-lg" {...field} />
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
                                            <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Institution</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Kenya School of Government" className="h-11 rounded-lg" {...field} />
                                            </FormControl>
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
                                                <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Year Completed</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="2023"
                                                        className="h-11 rounded-lg"
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
                                                <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Grade/Score</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Pass, 85%" className="h-11 rounded-lg" {...field} />
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
                                            <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Brief description of the course content..."
                                                    rows={3}
                                                    className="rounded-lg resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending} className="px-8 shadow-lg shadow-primary/20">
                                        {(addMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {editing ? 'Update Course' : 'Save Course'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Loading history...</p>
                    </div>
                ) : trainingCourses.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-muted/5 flex flex-col items-center justify-center">
                        <div className="p-4 bg-muted rounded-full mb-4">
                            <GraduationCap className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">No courses added yet</h4>
                        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto leading-relaxed">
                            List your certifications and short courses to boost your profile.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {trainingCourses.map((course: any) => (
                            <div key={course.id} className="group relative flex items-start justify-between p-5 bg-card border rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-300">
                                <div className="flex-1 min-w-0 space-y-3">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg leading-tight text-foreground truncate pr-2">{course.courseName}</h3>
                                        <p className="text-[13px] text-muted-foreground font-medium flex items-center gap-1.5">
                                            <GraduationCap className="h-3.5 w-3.5 opacity-60" />
                                            {course.institution || 'No institution set'}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                                        {course.year && (
                                            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                                <span>Completed in {course.year}</span>
                                            </div>
                                        )}
                                        {course.grade && (
                                            <Badge variant="outline" className="rounded-md font-bold text-[10px] px-2 text-primary border-primary/20 uppercase tracking-wider h-5 bg-primary/5">
                                                Result: {course.grade}
                                            </Badge>
                                        )}
                                    </div>

                                    {course.description && (
                                        <p className="text-sm text-muted-foreground/70 leading-relaxed italic line-clamp-2 border-l-2 border-primary/10 pl-3">
                                            {course.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => handleEdit(course)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setDeletingId(course.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
        </div>
    )
}
