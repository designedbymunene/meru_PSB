import { ValidationError } from './errors'

export function safeParseInt(value: string | undefined | null, fieldName: string): number {
    if (!value) throw new ValidationError(`${fieldName} is required`)
    const parsed = parseInt(value, 10)
    if (isNaN(parsed)) throw new ValidationError(`${fieldName} must be a valid integer`)
    return parsed
}

export function safeParseIntOptional(value: string | undefined | null): number | undefined {
    if (!value) return undefined
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? undefined : parsed
}
