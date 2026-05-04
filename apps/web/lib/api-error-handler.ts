import { AxiosError } from '@meru/shared'
import { toast } from 'sonner'

export function handleApiError(error: any, fallbackMessage = 'An error occurred') {
    console.error(error)

    if (error instanceof AxiosError && error.response) {
        const { data, status } = error.response

        // Handle validation errors (400)
        if (status === 400 && data?.error?.code === 'VALIDATION_ERROR') {
            const details = data.error.details

            if (details && typeof details === 'object') {
                // Flatten Zod error object into a list of messages
                const messages: string[] = []

                // Handle standard Zod "fieldErrors" structure
                if ('fieldErrors' in details) {
                    const fieldErrors = (details as any).fieldErrors
                    Object.entries(fieldErrors).forEach(([field, errors]) => {
                        if (Array.isArray(errors)) {
                            errors.forEach(err => messages.push(`${field}: ${err}`))
                        }
                    })
                }
                // Handle array of issues (sometimes Zod flatten returns this)
                else {
                    Object.entries(details).forEach(([key, value]) => {
                        messages.push(`${key}: ${value}`)
                    })
                }

                if (messages.length > 0) {
                    // Show the first few errors to avoid screen clutter
                    const displayMessage = messages.slice(0, 3).join('\n')
                    const remaining = messages.length - 3

                    toast.error('Validation Error', {
                        description: remaining > 0
                            ? `${displayMessage}\nAnd ${remaining} more errors...`
                            : displayMessage,
                        duration: 5000
                    })
                    return
                }
            }

            // Fallback if details structure isn't as expected but we have a message
            toast.error(data.error.message || fallbackMessage)
            return
        }

        // Handle conflict errors (409) - e.g. duplicate ID
        if (status === 409) {
            toast.error('Conflict', {
                description: data?.error?.message || 'Resource already exists'
            })
            return
        }

        // Handle other API errors with a message
        if (data?.error?.message) {
            toast.error('Error', {
                description: data.error.message
            })
            return
        }
    }

    // Network errors or other unknown errors
    toast.error('Error', {
        description: error?.message || fallbackMessage
    })
}
