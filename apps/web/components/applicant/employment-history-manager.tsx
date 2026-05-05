import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Edit2, Trash2, Loader2, Briefcase, Calendar, Building2, MapPin } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ResponsiveDialog } from '@/components/shared/responsive-dialog/responsive-dialog'
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createEmploymentHistorySchema } from '@meru/shared'
import {
    useMyEmploymentHistory,
    useAddMyEmploymentHistory,
    useUpdateMyEmploymentHistory,
    useDeleteMyEmploymentHistory,
} from '@/hooks/use-applicant-profile'
import type { EmploymentHistory } from '@/types'

export function EmploymentHistoryManager() {
    const { data: response, isLoading } = useMyEmploymentHistory()
    const employmentHistory = response?.data || []
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingEmployment, setEditingEmployment] = useState<EmploymentHistory | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const addMutation = useAddMyEmploymentHistory()
    const updateMutation = useUpdateMyEmploymentHistory()
    const deleteMutation = useDeleteMyEmploymentHistory()

    const form = useForm({
        resolver: zodResolver(createEmploymentHistorySchema),
        defaultValues: {
            jobTitle: '',
            organization: '',
            startDate: '',
            endDate: '',
            jobGroup: '',
            responsibilities: '',
        },
    })

    const onSubmit = async (data: any) => {
        try {
            if (editingEmployment) {
                await updateMutation.mutateAsync({
                    employmentId: editingEmployment.id,
                    data,
                })
            } else {
                await addMutation.mutateAsync(data)
            }
            setIsDialogOpen(false)
            setEditingEmployment(null)
            form.reset()
        } catch (error) { }
    }

    const handleEdit = (employment: EmploymentHistory) => {
        setEditingEmployment(employment)
        form.reset({
            jobTitle: employment.jobTitle,
            organization: employment.organization,
            startDate: employment.startDate,
            endDate: employment.endDate || '',
            jobGroup: employment.jobGroup || '',
            responsibilities: employment.responsibilities || '',
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
                        <CardTitle className="text-xl font-bold">Employment History</CardTitle>
                        <CardDescription>Your professional work experience</CardDescription>
                    </div>
                    <ResponsiveDialog
                        open={isDialogOpen}
                        onOpenChange={(open) => {
                            setIsDialogOpen(open)
                            if (!open) { setEditingEmployment(null); form.reset() }
                        }}
                        title={editingEmployment ? 'Edit Experience' : 'Add Experience'}
                        className="max-w-2xl"
                    >
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="jobTitle" render={({ field }) => <FormItem><FormLabel>Job Title *</FormLabel><FormControl><Input placeholder="e.g. Software Engineer" className="h-12 text-lg" {...field} /></FormControl><FormMessage /></FormItem>} />
                                        <FormField control={form.control} name="organization" render={({ field }) => <FormItem><FormLabel>Organization *</FormLabel><FormControl><Input placeholder="e.g. ABC Company" className="h-12 text-lg" {...field} /></FormControl><FormMessage /></FormItem>} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="startDate" render={({ field }) => <FormItem><FormLabel>Start Date *</FormLabel><FormControl><Input type="date" className="h-12 text-lg" {...field} /></FormControl><FormMessage /></FormItem>} />
                                        <FormField control={form.control} name="endDate" render={({ field }) => <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" className="h-12 text-lg" {...field} value={field.value || ''} /></FormControl><FormDescription className="text-[10px]">Leave blank if current</FormDescription><FormMessage /></FormItem>} />
                                    </div>
                                    <FormField control={form.control} name="jobGroup" render={({ field }) => <FormItem><FormLabel>Job Group (Optional)</FormLabel><FormControl><Input placeholder="e.g. L, M, N..." className="h-12 text-lg" {...field} /></FormControl><FormMessage /></FormItem>} />
                                    <FormField control={form.control} name="responsibilities" render={({ field }) => <FormItem><FormLabel>Responsibilities</FormLabel><FormControl><Textarea placeholder="Describe your key responsibilities..." rows={4} {...field} /></FormControl><FormMessage /></FormItem>} />
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                        <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending}>
                                            {(addMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {editingEmployment ? 'Update' : 'Save'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </ResponsiveDialog>
                        <Button size="sm" className="bg-primary" onClick={() => {
                            setEditingEmployment(null)
                            form.reset()
                            setIsDialogOpen(true)
                        }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Experience
                        </Button>
                    </div>
            </CardHeader>
            <CardContent className="px-0">
                {isLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary/50" /></div>
                ) : employmentHistory.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
                        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground">No work experience added yet.</p>
                    </div>
                ) : (
                        <div className="space-y-3">
                            {employmentHistory.map((emp) => (
                                <div key={emp.id} className="group relative flex items-start justify-between p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl hover:border-primary/40 hover:shadow-lg transition-all duration-200 shadow-sm">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">{emp.jobTitle}</h3>
                                        <p className="text-xs font-extrabold text-primary uppercase tracking-widest mb-2">{emp.organization}</p>
                                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                            <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" /><span>{format(new Date(emp.startDate), 'MMM yyyy')} — {emp.endDate ? format(new Date(emp.endDate), 'MMM yyyy') : 'Present'}</span></div>
                                            {emp.jobGroup && <div className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-slate-400" /><span>Group: {emp.jobGroup}</span></div>}
                                        </div>
                                        {emp.responsibilities && <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 italic border-l-2 border-primary/20 pl-3 mt-3">{emp.responsibilities}</p>}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10" onClick={() => handleEdit(emp)}><Edit2 className="h-3.5 w-3.5 text-primary" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => setDeletingId(emp.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                )}
                <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete Experience</AlertDialogTitle><AlertDialogDescription>Are you sure you want to remove this work experience? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    )
}
