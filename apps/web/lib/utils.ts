import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, formatStr: string = 'PPP') {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  try {
    return format(d, formatStr)
  } catch (error) {
    return '-'
  }
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

// Number formatting with thousand separators
export function formatNumber(amount: string | number) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return amount
  return new Intl.NumberFormat('en-KE').format(num)
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

export function getTagColorClasses(color: string) {
  switch (color) {
    case 'blue':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'green':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'red':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'yellow':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    case 'purple':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'gray':
      return 'bg-gray-50 text-gray-700 border-gray-200'
    case 'indigo':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200'
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200'
  }
}
