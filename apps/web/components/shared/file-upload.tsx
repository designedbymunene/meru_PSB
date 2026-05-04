'use client'

import { useRef, useState, ChangeEvent } from 'react'
import { UploadCloudIcon, XIcon, FileIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
    value?: File | null
    onChange: (file: File | null) => void
    accept?: string
    maxSizeMB?: number
    label?: string
    error?: string
}

export function FileUpload({
    value,
    onChange,
    accept = '.pdf,.doc,.docx',
    maxSizeMB = 5,
    label = 'Upload File',
    error
}: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [dragActive, setDragActive] = useState(false)

    const handleFile = (file: File) => {
        if (file.size > maxSizeMB * 1024 * 1024) {
            alert(`File size must be less than ${maxSizeMB}MB`)
            return
        }
        onChange(file)
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    return (
        <div className="w-full space-y-2">
            {!value ? (
                <div
                    className={cn(
                        "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors bg-muted/50 hover:bg-muted",
                        dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25",
                        error && "border-destructive/50 bg-destructive/5"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={handleChange}
                    />
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloudIcon className="w-8 h-8 mb-3 text-muted-foreground" />
                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">{label}</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            PDF, DOC up to {maxSizeMB}MB
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <FileIcon className="w-8 h-8 text-primary mr-4" />
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{value.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {(value.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            onChange(null)
                            if (inputRef.current) inputRef.current.value = ''
                        }}
                    >
                        <XIcon className="w-4 h-4" />
                    </Button>
                </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    )
}
