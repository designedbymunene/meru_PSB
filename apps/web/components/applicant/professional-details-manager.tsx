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
            registrationBody: '',
            registrationNumber: '',
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
            registrationBody: detail.registrationBody,
            registrationNumber: detail.registrationNumber,
            expiryDate: detail.expiryDate || '',
        })
        setIsDialogOpen(true)
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Professional Details</CardTitle>
                        <CardDescription>Professional registrations and licenses</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setEditing(null)}>
                                <Plus className="mr-2 h-4 w-4" /> Add Detail
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editing ? 'Edit' : 'Add'} Professional Detail</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="registrationBody"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Registration Body *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Engineers Board of Kenya" {...field} />
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
                                                <FormLabel>Registration Number *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. EBK/12345" {...field} />
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
                                                <FormLabel>Expiry Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
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
                ) : details.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No professional details added yet.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Registration Body</TableHead>
                                <TableHead>Registration Number</TableHead>
                                <TableHead>Expiry Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {details.map((detail) => (
                                <TableRow key={detail.id}>
                                    <TableCell className="font-medium">{detail.registrationBody}</TableCell>
                                    <TableCell>{detail.registrationNumber}</TableCell>
                                    <TableCell>{detail.expiryDate || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(detail)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => setDeletingId(detail.id)}>
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
            </CardContent>
        </Card>
    )
}
