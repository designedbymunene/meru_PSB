import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Edit2, Trash2, Loader2, Briefcase, Calendar, Building2, MapPin } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { createEmploymentHistorySchema } from '@meru/shared'
import {
    useMyEmploymentHistory,
    useAddMyEmploymentHistory,
    useUpdateMyEmploymentHistory,
    useDeleteMyEmploymentHistory,
    useMyProfile,
    useCreateOrUpdateProfile,
} from '@/hooks/use-applicant-profile'
import type { EmploymentHistory } from '@/types'

export function EmploymentHistoryManager() {
    const { data: response, isLoading } = useMyEmploymentHistory()
    const employmentHistory = response?.data || []
    const { data: profileResponse } = useMyProfile()
    const profile = profileResponse?.data
    const updateProfile = useCreateOrUpdateProfile()
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
                if (profile?.hasNoExperience) {
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
                        hasNoExperience: false,
                        hasNoCertificates: profile.hasNoCertificates || false,
                        hasNoMemberships: profile.hasNoMemberships || false,
                        hasNoTrainings: profile.hasNoTrainings || false,
                        hasNoReferees: profile.hasNoReferees || false,
                    })
                }
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
        <div className="space-y-3">
            <div className="flex items-center justify-between bg-muted/20 py-2 px-3.5 rounded-xl border border-dashed border-muted-foreground/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-sm font-bold">Experience List</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            {employmentHistory.length} {employmentHistory.length === 1 ? 'Record' : 'Records'} Added
                        </p>
                    </div>
                </div>
                <ResponsiveDialog
                    open={isDialogOpen}
                    onOpenChange={(open) => {
                        setIsDialogOpen(open)
                        if (!open) { setEditingEmployment(null); form.reset() }
                    }}
                    title={editingEmployment ? 'Edit Experience' : 'Add Experience'}
                    description="Enter your professional work history details below."
                    className="max-w-2xl"
                >
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 pt-1">
                            <div className="grid grid-cols-2 gap-3">
                                <FormField control={form.control} name="jobTitle" render={({ field }) => <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Job Title *</FormLabel><FormControl><Input placeholder="e.g. Software Engineer" className="h-11 rounded-lg" {...field} /></FormControl><FormMessage /></FormItem>} />
                                <FormField control={form.control} name="organization" render={({ field }) => <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Organization *</FormLabel><FormControl><Input placeholder="e.g. ABC Company" className="h-11 rounded-lg" {...field} /></FormControl><FormMessage /></FormItem>} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <FormField control={form.control} name="startDate" render={({ field }) => <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Start Date *</FormLabel><FormControl><Input type="date" className="h-11 rounded-lg" {...field} /></FormControl><FormMessage /></FormItem>} />
                                <FormField control={form.control} name="endDate" render={({ field }) => <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">End Date</FormLabel><FormControl><Input type="date" className="h-11 rounded-lg" {...field} value={field.value || ''} /></FormControl><FormDescription className="text-[10px] mt-1">Leave blank if currently working here</FormDescription><FormMessage /></FormItem>} />
                            </div>
                            <FormField control={form.control} name="jobGroup" render={({ field }) => <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Job Group (Optional)</FormLabel><FormControl><Input placeholder="e.g. L, M, N..." className="h-11 rounded-lg" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="responsibilities" render={({ field }) => <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Responsibilities</FormLabel><FormControl><Textarea placeholder="Describe your key responsibilities and achievements..." rows={3} className="rounded-lg resize-none" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <div className="flex justify-end gap-3 pt-3 border-t mt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending} className="px-8 shadow-lg shadow-primary/20">
                                    {(addMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingEmployment ? 'Update Experience' : 'Save Experience'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </ResponsiveDialog>
                <Button 
                    size="sm" 
                    className="bg-primary shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" 
                    disabled={profile?.hasNoExperience || false}
                    onClick={() => {
                        setEditingEmployment(null)
                        form.reset()
                        setIsDialogOpen(true)
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Experience
                </Button>
            </div>

            {/* Not Included Toggle */}
            {employmentHistory.length === 0 && (
                <div className="flex items-center space-x-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <Checkbox
                        id="hasNoExperience"
                        checked={profile?.hasNoExperience || false}
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
                                hasNoExperience: Boolean(checked),
                                hasNoCertificates: profile.hasNoCertificates || false,
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
                            htmlFor="hasNoExperience"
                            className="text-sm font-semibold cursor-pointer select-none text-slate-700 dark:text-slate-300"
                        >
                            I have no employment history to add
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Check this if you do not hold any professional work experience.
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
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Loading history...</p>
                    </div>
                ) : employmentHistory.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-muted/5 flex flex-col items-center justify-center">
                        <div className="p-4 bg-muted rounded-full mb-4">
                            <Briefcase className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">No experience records yet</h4>
                        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto leading-relaxed">
                            Share your professional journey to help us understand your expertise.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {employmentHistory.map((emp) => (
                            <div key={emp.id} className="group relative flex items-start justify-between p-4 bg-card border rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-300">
                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-base leading-tight text-foreground truncate">{emp.jobTitle}</h3>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="rounded-md font-bold text-[10px] px-2 bg-primary/5 text-primary border-none uppercase tracking-wider">
                                                {emp.organization}
                                            </Badge>
                                            {emp.jobGroup && (
                                                <Badge variant="outline" className="rounded-md font-medium text-[10px] px-2 text-muted-foreground uppercase tracking-wider">
                                                    Group {emp.jobGroup}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[13px] text-muted-foreground">
                                        <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md">
                                            <Calendar className="h-3.5 w-3.5 opacity-60" />
                                            <span>
                                                {format(new Date(emp.startDate), 'MMM yyyy')} — {emp.endDate ? format(new Date(emp.endDate), 'MMM yyyy') : <span className="text-green-600 font-semibold">Present</span>}
                                            </span>
                                        </div>
                                    </div>

                                    {emp.responsibilities && (
                                        <div className="relative mt-2">
                                            <p className="text-sm text-muted-foreground/80 leading-relaxed italic line-clamp-2 pl-4 border-l-2 border-primary/10">
                                                {emp.responsibilities}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => handleEdit(emp)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setDeletingId(emp.id)}>
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
                        <AlertDialogHeader><AlertDialogTitle>Delete Experience</AlertDialogTitle><AlertDialogDescription>Are you sure you want to remove this work experience? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
        </div>
    )
}
