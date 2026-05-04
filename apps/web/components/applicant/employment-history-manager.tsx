'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Edit2, Trash2, Loader2, Briefcase } from 'lucide-react'
import { format } from 'date-fns'

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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createEmploymentHistorySchema } from '@meru/shared'
import {
    useEmploymentHistory,
    useAddEmploymentHistory,
    useUpdateEmploymentHistory,
    useDeleteEmploymentHistory,
} from '@/hooks/use-applicant-profile'
import { useJobGroups } from '@/hooks/use-job-groups'
import type { EmploymentHistory } from '@/types'

interface EmploymentHistoryManagerProps {
    profileId: number
}

export function EmploymentHistoryManager({ profileId }: EmploymentHistoryManagerProps) {
    const { data: response, isLoading } = useEmploymentHistory(profileId)
    const employmentHistory = response?.data || []
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingEmployment, setEditingEmployment] = useState<EmploymentHistory | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const { data: jobGroupsResponse } = useJobGroups()
    const jobGroups = jobGroupsResponse?.data || []

    const addMutation = useAddEmploymentHistory(profileId)
    const updateMutation = useUpdateEmploymentHistory(profileId)
    const deleteMutation = useDeleteEmploymentHistory(profileId)

    const form = useForm({
        resolver: zodResolver(createEmploymentHistorySchema),
        defaultValues: {
            jobTitle: '',
            jobTitleId: undefined as number | undefined,
            organization: '',
            organizationId: undefined as number | undefined,
            startDate: '',
            endDate: '' as string | null,
            jobGroup: '',
            jobGroupId: undefined as number | undefined,
            responsibilities: '',
        },
    })

    const onSubmit = async (data: any) => {
        try {
            const payload = {
                ...data,
                endDate: data.endDate || null,
            }

            if (editingEmployment) {
                await updateMutation.mutateAsync({
                    employmentId: editingEmployment.id,
                    data: payload,
                })
            } else {
                await addMutation.mutateAsync(payload)
            }
            setIsDialogOpen(false)
            setEditingEmployment(null)
            form.reset()
        } catch (error) {
            // Error is handled in the mutation
        }
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

    const handleDialogClose = () => {
        setIsDialogOpen(false)
        setEditingEmployment(null)
        form.reset()
    }

    const isCurrent = (employment: EmploymentHistory) => !employment.endDate

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Employment History</CardTitle>
                        <CardDescription>Manage your work experience</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setEditingEmployment(null)}>
                                <Plus className="mr-2 h-4 w-4" /> Add Employment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingEmployment ? 'Edit Employment' : 'Add Employment'}
                                </DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="jobTitle"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Job Title *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Software Engineer" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="organizationId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Organization *</FormLabel>
                                                    {/* Using institutions list as a proxy for organizations for now */}
                                                    {/* In a real scenario, this would be a dedicated organizations table */}
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value?.toString()}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select organization" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="other">Other (Type manually)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {(!form.watch('organizationId') || form.watch('organization')) && (
                                            <FormField
                                                control={form.control}
                                                name="organization"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="Enter organization name" {...field} />
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
                                            name="startDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Start Date *</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="endDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>End Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormDescription>Leave blank if current</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="jobGroupId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Job Group</FormLabel>
                                                    <Select
                                                        onValueChange={(val) => {
                                                            const jg = jobGroups.find(j => j.id.toString() === val)
                                                            field.onChange(parseInt(val))
                                                            form.setValue('jobGroup', jg?.code || '')
                                                        }}
                                                        value={field.value?.toString()}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select job group" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {jobGroups.map((jg) => (
                                                                <SelectItem key={jg.id} value={jg.id.toString()}>
                                                                    {jg.code} - {jg.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="responsibilities"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Responsibilities</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Describe your key responsibilities..."
                                                        rows={4}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={handleDialogClose}>
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
                ) : employmentHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No employment history added yet.</p>
                        <p className="text-sm">Click "Add Employment" to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Timeline View */}
                        <div className="relative pl-8 space-y-6">
                            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-muted" />
                            {employmentHistory.map((emp) => (
                                <div key={emp.id} className="relative">
                                    <div className="absolute -left-6 top-2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                                    <Card className="hover:shadow-md transition-shadow">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold text-lg">{emp.jobTitle}</h3>
                                                        {isCurrent(emp) && (
                                                            <Badge variant="default">Current</Badge>
                                                        )}
                                                        {emp.jobGroup && (
                                                            <Badge variant="outline">{emp.jobGroup}</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-muted-foreground flex items-center gap-2 mb-2">
                                                        <Briefcase className="h-4 w-4" />
                                                        {emp.organization}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mb-3">
                                                        {emp.startDate} - {emp.endDate || 'Present'}
                                                    </p>
                                                    {emp.responsibilities && (
                                                        <p className="text-sm mt-2 text-muted-foreground whitespace-pre-line">
                                                            {emp.responsibilities}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(emp)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDeletingId(emp.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Employment Record</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this employment record? This action cannot be
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
