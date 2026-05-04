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
import { createProfessionalMembershipSchema } from '@meru/shared'
import {
    useProfessionalMemberships,
    useAddProfessionalMembership,
    useUpdateProfessionalMembership,
    useDeleteProfessionalMembership,
} from '@/hooks/use-applicant-profile'
import type { ProfessionalMembership } from '@/types'

interface ProfessionalMembershipsManagerProps {
    profileId: number
}

export function ProfessionalMembershipsManager({ profileId }: ProfessionalMembershipsManagerProps) {
    const { data: response, isLoading } = useProfessionalMemberships(profileId)
    const memberships = response?.data || []
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editing, setEditing] = useState<ProfessionalMembership | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const addMutation = useAddProfessionalMembership(profileId)
    const updateMutation = useUpdateProfessionalMembership(profileId)
    const deleteMutation = useDeleteProfessionalMembership(profileId)

    const form = useForm({
        resolver: zodResolver(createProfessionalMembershipSchema),
        defaultValues: {
            membershipBody: '',
            registrationNumber: '',
            membershipType: '',
            expiryDate: '',
        },
    })

    const onSubmit = async (data: any) => {
        try {
            if (editing) {
                await updateMutation.mutateAsync({ membershipId: editing.id, data })
            } else {
                await addMutation.mutateAsync(data)
            }
            setIsDialogOpen(false)
            setEditing(null)
            form.reset()
        } catch (error) { }
    }

    const handleEdit = (membership: ProfessionalMembership) => {
        setEditing(membership)
        form.reset({
            membershipBody: membership.membershipBody,
            registrationNumber: membership.registrationNumber || '',
            membershipType: membership.membershipType,
            expiryDate: membership.expiryDate || '',
        })
        setIsDialogOpen(true)
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Professional Memberships</CardTitle>
                        <CardDescription>Professional body memberships (e.g., LSK, EBK, KMPDC)</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => {
                                setEditing(null)
                                form.reset({
                                    membershipBody: '',
                                    registrationNumber: '',
                                    membershipType: '',
                                    expiryDate: '',
                                })
                            }}>
                                <Plus className="mr-2 h-4 w-4" /> Add Membership
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editing ? 'Edit' : 'Add'} Professional Membership</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="membershipBody"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Membership Body *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Kenya Medical Practitioners Council" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="membershipType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Membership Type *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Full, Associate, Student" {...field} />
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
                                                <FormLabel>Membership/Registration Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. B1158" {...field} />
                                                </FormControl>
                                                <FormDescription>Optional</FormDescription>
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
                ) : memberships.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No professional memberships added yet.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Body</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Number</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {memberships.map((membership) => (
                                <TableRow key={membership.id}>
                                    <TableCell className="font-medium">{membership.membershipBody}</TableCell>
                                    <TableCell>{membership.membershipType}</TableCell>
                                    <TableCell>{membership.registrationNumber || '-'}</TableCell>
                                    <TableCell>{membership.expiryDate || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(membership)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => setDeletingId(membership.id)}>
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
                            <AlertDialogTitle>Delete Membership</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this membership?
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
