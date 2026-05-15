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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createProfessionalDetailSchema } from '@meru/shared'
import {
    useMyProfessionalDetails,
    useAddMyProfessionalDetail,
    useUpdateMyProfessionalDetail,
    useDeleteMyProfessionalDetail,
} from '@/hooks/use-applicant-profile'
import type { ProfessionalDetail } from '@/types'

export function ProfessionalDetailsManager() {
    const { data: response, isLoading } = useMyProfessionalDetails()
    const details = response?.data || []
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editing, setEditing] = useState<ProfessionalDetail | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const addMutation = useAddMyProfessionalDetail()
    const updateMutation = useUpdateMyProfessionalDetail()
    const deleteMutation = useDeleteMyProfessionalDetail()

    const form = useForm({
        resolver: zodResolver(createProfessionalDetailSchema),
        defaultValues: {
            licenseType: '',
            issuingBody: '',
            registrationNumber: '',
            issueDate: '',
            expiryDate: '',
        },
    })

    const onSubmit = async (data: any) => {
        try {
            if (editing) {
                await updateMutation.mutateAsync({ detailId: editing.id, data })
            } else {
                await addMutation.mutateAsync(data)
            }
            setIsDialogOpen(false)
            setEditing(null)
            form.reset()
        } catch (error) { }
    }

    const handleEdit = (detail: ProfessionalDetail) => {
        setEditing(detail)
        form.reset({
            licenseType: detail.licenseType,
            issuingBody: detail.issuingBody,
            registrationNumber: detail.registrationNumber,
            issueDate: detail.issueDate || '',
            expiryDate: detail.expiryDate || '',
        })
        setIsDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-muted/20 p-4 rounded-xl border border-dashed border-muted-foreground/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Plus className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-sm font-bold">Registration Details</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            {details.length} {details.length === 1 ? 'Detail' : 'Details'} Added
                        </p>
                    </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-primary shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={() => setEditing(null)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Detail
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-2xl">
                        <DialogHeader className="pb-4 border-b">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <Plus className="h-5 w-5 text-primary" />
                                {editing ? 'Edit Professional Detail' : 'Add Professional Detail'}
                            </DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="licenseType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase text-muted-foreground">License / Certificate Type *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Practicing License" className="h-11 rounded-lg" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="issuingBody"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Issuing Body *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Engineers Board of Kenya" className="h-11 rounded-lg" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="registrationNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Registration Number *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. EBK/12345" className="h-11 rounded-lg" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="issueDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Issue Date *</FormLabel>
                                                <FormControl>
                                                    <Input type="date" className="h-11 rounded-lg" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="expiryDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Expiry Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" className="h-11 rounded-lg" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending} className="px-8 shadow-lg shadow-primary/20">
                                        {(addMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {editing ? 'Update Detail' : 'Save Detail'}
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
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Loading details...</p>
                    </div>
                ) : details.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-muted/5 flex flex-col items-center justify-center">
                        <div className="p-4 bg-muted rounded-full mb-4">
                            <Plus className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">No professional details yet</h4>
                        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto leading-relaxed">
                            Add your professional licenses and registrations here.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {details.map((detail) => (
                            <div key={detail.id} className="group relative flex items-start justify-between p-5 bg-card border rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-300">
                                <div className="flex-1 min-w-0 space-y-3">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg leading-tight text-foreground truncate pr-2">{detail.licenseType}</h3>
                                        <p className="text-[13px] text-primary font-bold uppercase tracking-wider">
                                            {detail.issuingBody}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                                        <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                            <span>Reg: {detail.registrationNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 font-medium">
                                            <span>Issued: {detail.issueDate}</span>
                                            {detail.expiryDate && <span> • Expires: {detail.expiryDate}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => handleEdit(detail)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setDeletingId(detail.id)}>
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
                        <AlertDialogTitle>Delete Professional Detail</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this professional detail?
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
