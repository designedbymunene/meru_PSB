import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: string | Date, formatStr = 'MMM dd, yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatStr)
}

export function formatDateTime(date: string | Date) {
  return formatDate(date, 'MMM dd, yyyy HH:mm')
}

export function formatRelativeTime(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

// formatDateForAPI - Format date for API requests (YYYY-MM-DD)
export function formatDateForApi(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

// Currency formatting
export function formatCurrency(amount: string | number, currency = 'KES') {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
  }).format(num)
}

// Salary range formatting
export function formatSalaryRange(min: string, max: string) {
  return `${formatCurrency(min)} - ${formatCurrency(max)}`
}

// Truncate text
export function truncate(text: string, length: number) {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}
