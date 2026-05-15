'use client'

import { useState } from 'react'
import { Upload, FileText, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMyDocuments, useUploadDocument, useDeleteDocument } from '@/hooks/use-documents'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

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

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !documentType) return

        uploadMutation.mutate({ file, documentType }, {
            onSuccess: () => {
                setFile(null)
                setDocumentType('')
                // Reset file input
                const fileInput = document.getElementById('file-upload') as HTMLInputElement
                if (fileInput) fileInput.value = ''
            }
        })
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
                                <Label htmlFor="file-upload" className="text-xs font-bold uppercase text-muted-foreground/80 ml-1">Choose File *</Label>
                                <Input 
                                    id="file-upload" 
                                    type="file" 
                                    accept=".pdf,.jpg,.jpeg,.png" 
                                    className="h-11 rounded-xl bg-card border-muted-foreground/20 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer pt-2"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    required
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
                                className="group relative flex items-center justify-between p-4 bg-card border rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="p-3 rounded-xl bg-primary/5 text-primary border border-primary/10">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-foreground truncate">{doc.documentType}</p>
                                        <p className="text-[11px] text-muted-foreground truncate opacity-70 uppercase tracking-tight font-medium">
                                            {doc.originalName}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                                    onClick={() => deleteMutation.mutate(doc.id)}
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
