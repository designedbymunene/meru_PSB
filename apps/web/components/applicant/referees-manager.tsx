import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Edit2, Trash2, Loader2, User, Mail, Phone, Building2, Briefcase } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
        <div className="space-y-3">
            <div className="flex items-center justify-between bg-muted/20 py-2 px-3.5 rounded-xl border border-dashed border-muted-foreground/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <User className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-sm font-bold">Referee List</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            {referees.length} {referees.length === 1 ? 'Referee' : 'Referees'} Added
                        </p>
                    </div>
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
                    description="Provide details for someone who can vouch for your professional work."
                    className="max-w-md"
                >
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 pt-1">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Full Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Dr. Jane Smith" className="h-11 rounded-lg" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name="organization"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Organization *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Company Name" className="h-11 rounded-lg" {...field} />
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
                                            <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Designation *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Job Title" className="h-11 rounded-lg" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Email *</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="jane@example.com" className="h-11 rounded-lg" {...field} />
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
                                            <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Phone *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+254..." className="h-11 rounded-lg" {...field} />
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
                                        <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Relationship (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Former Supervisor" className="h-11 rounded-lg" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-3 pt-3 border-t mt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending} className="px-8 shadow-lg shadow-primary/20">
                                    {(addMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingReferee ? 'Update Referee' : 'Save Referee'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </ResponsiveDialog>
                <Button size="sm" className="bg-primary shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={() => {
                    setEditingReferee(null)
                    form.reset()
                    setIsDialogOpen(true)
                }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Referee
                </Button>
            </div>

            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Loading referees...</p>
                    </div>
                ) : referees.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-muted/5 flex flex-col items-center justify-center">
                        <div className="p-4 bg-muted rounded-full mb-4">
                            <User className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">No referees yet</h4>
                        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto leading-relaxed">
                            Professional references help build credibility for your applications.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {referees.map((ref) => (
                            <div key={ref.id} className="group relative flex items-start justify-between p-4 bg-card border rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-300">
                                <div className="flex-1 min-w-0 space-y-2.5">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-base leading-tight text-foreground truncate pr-2">{ref.fullName}</h3>
                                        <Badge variant="secondary" className="rounded-md font-bold text-[10px] px-2 bg-primary/5 text-primary border-none uppercase tracking-wider h-5">
                                            {ref.relationship || 'Professional Referee'}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
                                        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                                            <Briefcase className="h-3.5 w-3.5 opacity-60 shrink-0" />
                                            <span className="truncate">{ref.designation}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                                            <Building2 className="h-3.5 w-3.5 opacity-60 shrink-0" />
                                            <span className="truncate">{ref.organization}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                                            <Mail className="h-3.5 w-3.5 opacity-60 shrink-0" />
                                            <span className="truncate">{ref.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                                            <Phone className="h-3.5 w-3.5 opacity-60 shrink-0" />
                                            <span>{ref.phone}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => handleEdit(ref)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setDeletingId(ref.id)}>
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
        </div>
    )
}
