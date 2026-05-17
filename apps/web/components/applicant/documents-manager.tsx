'use client'

import { useState } from 'react'
import { Upload, FileText, Trash2, Loader2, Download, ImageIcon, FileIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMyDocuments, useUploadDocument, useDeleteDocument } from '@/hooks/use-documents'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileUpload } from '@/components/shared/file-upload'
import { format } from 'date-fns'
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogTrigger 
} from '@/components/ui/alert-dialog'
import { downloadDocument } from '@/lib/api/documents'

const DOCUMENT_TYPES = [
    { value: 'ID Card', label: 'ID Card / Passport' },
    { value: 'CV', label: 'Curriculum Vitae (CV)' },
    { value: 'Academic Certificate', label: 'Academic Certificate' },
    { value: 'Professional Certificate', label: 'Professional Certificate' },
    { value: 'Other', label: 'Other Supporting Document' },
]

export function DocumentsManager() {
    const { data: response, isLoading } = useMyDocuments()
    const uploadMutation = useUploadDocument()
    const deleteMutation = useDeleteDocument()

    const [file, setFile] = useState<File | null>(null)
    const [documentType, setDocumentType] = useState<string>('')
    const [isDownloading, setIsDownloading] = useState<number | null>(null)

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !documentType) return

        uploadMutation.mutate({ file, documentType }, {
            onSuccess: () => {
                setFile(null)
                setDocumentType('')
            }
        })
    }

    const handleDownload = async (id: number, filename: string, originalName: string) => {
        try {
            setIsDownloading(id)
            await downloadDocument(id, originalName)
        } catch (error) {
            console.error('Download failed', error)
        } finally {
            setIsDownloading(null)
        }
    }

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />
        if (mimeType.includes('image')) return <ImageIcon className="h-5 w-5 text-blue-500" />
        return <FileIcon className="h-5 w-5 text-gray-500" />
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const documents = response?.data || []

    return (
        <div className="space-y-8">
            <Card className="border-none shadow-sm bg-muted/20 border-dashed ring-1 ring-border rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Upload className="h-5 w-5" />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-bold">Upload New Document</h4>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                    PDF, JPG or PNG (Max 5MB)
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="doc-type" className="text-xs font-bold uppercase text-muted-foreground/80 ml-1">Document Category *</Label>
                                <Select value={documentType} onValueChange={setDocumentType} required>
                                    <SelectTrigger id="doc-type" className="h-11 rounded-xl bg-card border-muted-foreground/20">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {DOCUMENT_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground/80 ml-1">Choose File *</Label>
                                <FileUpload 
                                    value={file}
                                    onChange={setFile}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    maxSizeMB={5}
                                    label="Choose or drag document"
                                />
                            </div>
                        </div>
                        <Button 
                            type="submit" 
                            disabled={!file || !documentType || uploadMutation.isPending}
                            className="w-full h-11 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                        >
                            {uploadMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className="mr-2 h-4 w-4" />
                            )}
                            Start Secure Upload
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Your Document Vault</h3>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 border-muted-foreground/20">
                        {documents.length} Files
                    </Badge>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Accessing vault...</p>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-muted/5 flex flex-col items-center justify-center">
                        <div className="p-4 bg-muted rounded-full mb-4">
                            <FileText className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Your vault is empty</h4>
                        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto leading-relaxed">
                            Upload your ID, CV, and certificates to support your applications.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {documents.map((doc) => (
                            <div 
                                key={doc.id} 
                                className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card border rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-300 gap-4"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="p-3 rounded-xl bg-primary/5 text-primary border border-primary/10">
                                        {getFileIcon(doc.mimeType)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="font-bold text-sm text-foreground truncate">{doc.documentType}</p>
                                            <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-bold uppercase tracking-tighter">
                                                {doc.status}
                                            </Badge>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground truncate opacity-70 uppercase tracking-tight font-medium">
                                            {doc.originalName} • {formatFileSize(doc.fileSize)}
                                        </p>
                                        <p className="text-[9px] text-muted-foreground/60 font-medium">
                                            Uploaded on {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 rounded-xl gap-2 text-xs font-semibold"
                                        onClick={() => handleDownload(doc.id, doc.filename, doc.originalName)}
                                        disabled={isDownloading === doc.id}
                                    >
                                        {isDownloading === doc.id ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Download className="h-3.5 w-3.5" />
                                        )}
                                        Download
                                    </Button>
                                    
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-2xl">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete <span className="font-bold text-foreground">"{doc.originalName}"</span>? This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                                <AlertDialogAction 
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                                                    onClick={() => deleteMutation.mutate(doc.id)}
                                                >
                                                    Delete Permanently
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
