"use client"

import { useState } from "react"
import { useDownloads, useCreateDownloadCategory, useUpdateDownloadCategory, useDeleteDownloadCategory, useCreateDownloadFile, useUpdateDownloadFile, useDeleteDownloadFile } from "@/hooks/use-downloads"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash, FileText, Download, Folder, FolderOpen, GripVertical, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CategoryWithFiles } from "@/lib/api/downloads"
import type { DownloadFile } from "@/lib/api/downloads"
import { FileUpload } from "@/components/shared/file-upload"

export default function DownloadsPage() {
    const { data: downloadsData, isLoading } = useDownloads(false)
    const createCategoryMutation = useCreateDownloadCategory()
    const updateCategoryMutation = useUpdateDownloadCategory()
    const deleteCategoryMutation = useDeleteDownloadCategory()
    const createFileMutation = useCreateDownloadFile()
    const updateFileMutation = useUpdateDownloadFile()
    const deleteFileMutation = useDeleteDownloadFile()

    const [selectedCategory, setSelectedCategory] = useState<CategoryWithFiles | null>(null)
    const [selectedFile, setSelectedFile] = useState<DownloadFile | null>(null)
    const [showCategoryDialog, setShowCategoryDialog] = useState(false)
    const [showFileDialog, setShowFileDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'file'; id: number } | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [uploadFile, setUploadFile] = useState<File | null>(null)

    const downloads = downloadsData?.data || []

    const handleSaveCategory = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const categoryData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            icon: formData.get('icon') as string || 'FileText',
            order: parseInt(formData.get('order') as string) || 0,
            isActive: formData.get('isActive') === 'true'
        }

        if (isEditing && selectedCategory) {
            updateCategoryMutation.mutate({
                id: selectedCategory.id,
                data: categoryData
            })
        } else {
            createCategoryMutation.mutate(categoryData)
        }

        setShowCategoryDialog(false)
        setSelectedCategory(null)
        setIsEditing(false)
    }

    const handleSaveFile = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!isEditing && !uploadFile) {
            alert('Please select a file to upload')
            return
        }

        const formData = new FormData(e.currentTarget)

        const fileData = {
            categoryId: parseInt(formData.get('categoryId') as string),
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            order: parseInt(formData.get('order') as string) || 0,
            isActive: formData.get('isActive') === 'true'
        }

        if (isEditing && selectedFile) {
            updateFileMutation.mutate({
                id: selectedFile.id,
                data: fileData,
                file: uploadFile || undefined
            })
        } else {
            createFileMutation.mutate({ file: uploadFile!, data: fileData })
        }

        setShowFileDialog(false)
        setSelectedFile(null)
        setIsEditing(false)
        setUploadFile(null)
    }

    const handleEditCategory = (category: CategoryWithFiles) => {
        setSelectedCategory(category)
        setIsEditing(true)
        setShowCategoryDialog(true)
    }

    const handleEditFile = (file: DownloadFile) => {
        setSelectedFile(file)
        setIsEditing(true)
        setShowFileDialog(true)
    }

    const handleDelete = () => {
        if (!deleteTarget) return

        if (deleteTarget.type === 'category') {
            deleteCategoryMutation.mutate(deleteTarget.id)
        } else {
            deleteFileMutation.mutate(deleteTarget.id)
        }

        setShowDeleteDialog(false)
        setDeleteTarget(null)
    }

    const confirmDelete = (type: 'category' | 'file', id: number) => {
        setDeleteTarget({ type, id })
        setShowDeleteDialog(true)
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Downloads & Resources</h1>
                </div>
                <div className="grid gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-6 bg-muted rounded w-1/3"></div>
                                <div className="h-4 bg-muted rounded w-2/3 mt-2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[1, 2, 3].map((j) => (
                                        <div key={j} className="h-16 bg-muted rounded"></div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Downloads & Resources</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage download categories and files available to applicants
                    </p>
                </div>
                <Button onClick={() => { setIsEditing(false); setShowCategoryDialog(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
            </div>

            {/* Categories and Files */}
            <div className="grid gap-6">
                {downloads.map((category: CategoryWithFiles) => (
                    <Card key={category.id} className="overflow-hidden">
                        <CardHeader className="bg-muted/30">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <FolderOpen className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <CardTitle>{category.title}</CardTitle>
                                            <Badge variant={category.isActive ? 'default' : 'secondary'}>
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <CardDescription className="mt-1">{category.description}</CardDescription>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Order: {category.order} • {category.files?.length || 0} files
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditCategory(category)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => confirmDelete('category', category.id)}
                                    >
                                        <Trash className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {category.files && category.files.length > 0 ? (
                                <div className="space-y-3">
                                    {category.files.map((file) => (
                                        <div
                                            key={file.id}
                                            className="flex items-center justify-between p-4 bg-background rounded-lg border hover:border-primary/50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                                <FileText className="h-8 w-8 text-primary" />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium text-sm">{file.name}</h4>
                                                        {!file.isActive && (
                                                            <Badge variant="secondary" className="text-xs">Inactive</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{file.description}</p>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="text-xs text-muted-foreground">{file.fileSize}</span>
                                                        <span className="text-xs text-muted-foreground">Updated {file.updatedDate}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            <Download className="h-3 w-3 inline mr-1" />
                                                            {file.downloadCount || 0} downloads
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <a href={`${process.env.NEXT_PUBLIC_API_URL || ''}/api/downloads/files/${file.id}/download`} download>
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditFile(file)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => confirmDelete('file', file.id)}
                                                >
                                                    <Trash className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">No files in this category</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={() => { setIsEditing(false); setSelectedFile(null); setShowFileDialog(true); }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Add First File
                                    </Button>
                                </div>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-4"
                                onClick={() => { setIsEditing(false); setSelectedFile(null); setShowFileDialog(true); }}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add File to Category
                            </Button>
                        </CardContent>
                    </Card>
                ))}

                {downloads.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Folder className="h-16 w-16 text-muted-foreground/20 mb-4" />
                            <h3 className="text-lg font-medium mb-2">No download categories yet</h3>
                            <p className="text-sm text-muted-foreground mb-4 text-center">
                                Create categories to organize your downloadable resources
                            </p>
                            <Button onClick={() => { setIsEditing(false); setShowCategoryDialog(true); }}>
                                <Plus className="mr-2 h-4 w-4" /> Create First Category
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Category Dialog */}
            <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Edit Category' : 'Add Category'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Update the category details below.'
                                : 'Create a new category to organize your downloads.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveCategory}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={selectedCategory?.title}
                                    placeholder="e.g., Shortlists"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={selectedCategory?.description}
                                    placeholder="Brief description of this category"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="icon">Icon Name (Lucide)</Label>
                                <Input
                                    id="icon"
                                    name="icon"
                                    defaultValue={selectedCategory?.icon || 'FileText'}
                                    placeholder="FileText"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Use Lucide icon names like: FileText, FolderOpen, Download, etc.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="order">Order</Label>
                                    <Input
                                        id="order"
                                        name="order"
                                        type="number"
                                        defaultValue={selectedCategory?.order || 0}
                                        min="0"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="isActive">Status</Label>
                                    <select
                                        id="isActive"
                                        name="isActive"
                                        defaultValue={selectedCategory?.isActive ? 'true' : 'false'}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCategoryDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                                {isEditing ? 'Update' : 'Create'} Category
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* File Dialog */}
            <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Edit File' : 'Add File'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Update the file details below.'
                                : 'Add a new downloadable file to a category.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveFile}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="categoryId">Category</Label>
                                <select
                                    id="categoryId"
                                    name="categoryId"
                                    defaultValue={selectedFile?.categoryId || selectedCategory?.id}
                                    required
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="">Select a category</option>
                                    {downloads.map((cat: CategoryWithFiles) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">File Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={selectedFile?.name}
                                    placeholder="e.g., General Shortlist"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={selectedFile?.description}
                                    placeholder="Brief description of this file"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Upload File {isEditing ? '(Optional - leave blank to keep current file)' : '*'}</Label>
                                <FileUpload 
                                    value={uploadFile}
                                    onChange={setUploadFile}
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    maxSizeMB={20}
                                    label="Choose or drag document"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="order">Order</Label>
                                    <Input
                                        id="order"
                                        name="order"
                                        type="number"
                                        defaultValue={selectedFile?.order || 0}
                                        min="0"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="isActive">Status</Label>
                                    <select
                                        id="isActive"
                                        name="isActive"
                                        defaultValue={selectedFile?.isActive ? 'true' : 'false'}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowFileDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createFileMutation.isPending || updateFileMutation.isPending}>
                                {isEditing ? 'Update' : 'Add'} File
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteTarget?.type === 'category'
                                ? 'This will delete the category and all its files. This action cannot be undone.'
                                : 'This will delete the file. This action cannot be undone.'}
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
