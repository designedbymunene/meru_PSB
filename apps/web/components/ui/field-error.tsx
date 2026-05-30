'use client'

import * as React from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useFormField } from './form'
import { cn } from '@/lib/utils'

/**
 * FieldError Component - Enhanced field-level error display
 * Displays validation errors with icons and styling
 */
export function FieldError() {
    const { error, formMessageId } = useFormField()

    if (!error) return null

    return (
        <div
            id={formMessageId}
            className="flex items-center gap-2 mt-2 text-sm font-medium text-destructive"
            role="alert"
            aria-live="polite"
        >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{String(error.message)}</span>
        </div>
    )
}

/**
 * FieldSuccess Component - Shows success state for validation
 * Displays success message when field is valid and touched
 */
interface FieldSuccessProps {
    message?: string
    showOnTouched?: boolean
}

export function FieldSuccess({ message = 'Valid', showOnTouched = false }: FieldSuccessProps) {
    const { error, invalid, isDirty } = useFormField()

    if (error || invalid || (showOnTouched && !isDirty)) return null

    return (
        <div className="flex items-center gap-2 mt-2 text-sm font-medium text-green-600 dark:text-green-500">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{message}</span>
        </div>
    )
}

/**
 * FieldHint Component - Display helper text below form fields
 * Provides context about field expectations
 */
interface FieldHintProps {
    children: React.ReactNode
}

export function FieldHint({ children }: FieldHintProps) {
    const { formDescriptionId } = useFormField()

    return (
        <p
            id={formDescriptionId}
            className="mt-1.5 text-xs text-muted-foreground"
        >
            {children}
        </p>
    )
}

/**
 * FieldWrapper Component - Complete field container with error/success states
 * Handles visual feedback for field validation
 */
interface FieldWrapperProps {
    children: React.ReactNode
    className?: string
}

export function FieldWrapper({ children, className }: FieldWrapperProps) {
    const { error, invalid } = useFormField()

    return (
        <div className={cn(
            'transition-colors',
            invalid && error && 'rounded-md bg-destructive/5 p-3',
            className
        )}>
            {children}
        </div>
    )
}

/**
 * ValidationMessage Component - Displays specific validation feedback
 * Shows contextual messages based on validation rules
 */
interface ValidationMessageProps {
    rule: string
    message: string
}

export function ValidationMessage({ rule, message }: ValidationMessageProps) {
    const { error } = useFormField()

    if (error?.type !== rule) return null

    return (
        <div className="flex items-center gap-2 mt-2 text-sm text-destructive" role="alert">
            <AlertCircle className="h-3 w-3" />
            <span>{message}</span>
        </div>
    )
}
