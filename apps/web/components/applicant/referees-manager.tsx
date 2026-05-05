import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Edit2, Trash2, Loader2, User, Mail, Phone, Building2, Briefcase } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { refereeSchema } from '@meru/shared'
import {
    useMyReferees,
    useAddMyReferee,
    useUpdateMyReferee,
    useDeleteMyReferee,
} from '@/hooks/use-applicant-profile'
import type { RefereeInput } from '@meru/shared'

export function RefereesManager() {
    const { data: response, isLoading } = useMyReferees()
    const referees = response?.data || []
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingReferee, setEditingReferee] = useState<any | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const addMutation = useAddMyReferee()
    const updateMutation = useUpdateMyReferee()
    const deleteMutation = useDeleteMyReferee()

    const form = useForm<RefereeInput>({
        resolver: zodResolver(refereeSchema),
        defaultValues: {
            fullName: '',
            organization: '',
            designation: '',
            phone: '',
            email: '',
            relationship: '',
        },
    })

    const onSubmit = async (data: RefereeInput) => {
        try {
            if (editingReferee) {
                await updateMutation.mutateAsync({
                    refereeId: editingReferee.id,
                    data,
                })
            } else {
                await addMutation.mutateAsync(data)
            }
            setIsDialogOpen(false)
            setEditingReferee(null)
            form.reset()
        } catch (error) { }
    }

    const handleEdit = (referee: any) => {
        setEditingReferee(referee)
        form.reset({
            fullName: referee.fullName,
            organization: referee.organization,
            designation: referee.designation,
            phone: referee.phone,
            email: referee.email,
            relationship: referee.relationship || '',
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
                        <CardTitle className="text-xl font-bold">Professional Referees</CardTitle>
                        <CardDescription>People who can vouch for your professional work</CardDescription>
                    </div>
                    <ResponsiveDialog
                        open={isDialogOpen}
                        onOpenChange={(open) => {
                            setIsDialogOpen(open)
                            if (!open) {
                                setEditingReferee(null)
                                form.reset()
                            }
                        }}
                        title={editingReferee ? 'Edit Referee' : 'Add New Referee'}
                        className="max-w-md"
                    >
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Dr. Jane Smith" className="h-12 text-lg" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="organization"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Organization *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Company Name" className="h-12 text-lg" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="designation"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Designation *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Job Title" className="h-12 text-lg" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email *</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="jane@example.com" className="h-12 text-lg" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="+254..." className="h-12 text-lg" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="relationship"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Relationship (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Former Supervisor" className="h-12 text-lg" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsDialogOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={addMutation.isPending || updateMutation.isPending}
                                        >
                                            {(addMutation.isPending || updateMutation.isPending) && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            {editingReferee ? 'Update' : 'Save'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </ResponsiveDialog>
                        <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => {
                            setEditingReferee(null)
                            form.reset()
                            setIsDialogOpen(true)
                        }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Referee
                        </Button>
                    </div>
            </CardHeader>
            <CardContent className="px-0">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                    </div>
                ) : referees.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
                        <User className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground">No referees added yet.</p>
                        <Button
                            variant="link"
                            className="mt-2"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            Add your first referee
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {referees.map((ref) => (
                            <div
                                key={ref.id}
                                className="group relative flex items-start justify-between p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl hover:border-primary/40 hover:shadow-lg transition-all duration-200 shadow-sm"
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">{ref.fullName}</h3>
                                    <p className="text-xs font-extrabold text-primary uppercase tracking-widest mb-2">
                                        {ref.relationship || 'Professional Referee'}
                                    </p>
                                    <div className="space-y-1.5 mt-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <Briefcase className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                            <span className="truncate">{ref.designation}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <Building2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                            <span className="truncate">{ref.organization}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                            <span className="truncate">{ref.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                            <span>{ref.phone}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg hover:bg-primary/10"
                                        onClick={() => handleEdit(ref)}
                                    >
                                        <Edit2 className="h-3.5 w-3.5 text-primary" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                                        onClick={() => setDeletingId(ref.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Referee</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to remove {referees.find(r => r.id === deletingId)?.fullName} from your referees? This action cannot be undone.
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
