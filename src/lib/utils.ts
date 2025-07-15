import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utilities
export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = new Date(date)
  
  if (format === 'relative') {
    return formatRelativeTime(d)
  }
  
  const options: Intl.DateTimeFormatOptions = format === 'long' 
    ? { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    : { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }
  
  return d.toLocaleDateString('en-US', options)
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInSeconds < 60) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return formatDate(date, 'short')
}

// Number utilities
export function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
  return num.toString()
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// String utilities
export function truncateString(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function sanitizeString(str: string): string {
  return str.replace(/[<>&"']/g, (char) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#39;'
    }
    return entities[char] || char
  })
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

export function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i
  return domainRegex.test(domain)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

// URL utilities
export function buildSearchUrl(query: string, type: string, filters?: Record<string, any>): string {
  const params = new URLSearchParams()
  params.set('q', query)
  params.set('type', type)
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value))
      }
    })
  }
  
  return `/search?${params.toString()}`
}

export function parseSearchParams(searchParams: URLSearchParams) {
  return {
    query: searchParams.get('q') || '',
    type: searchParams.get('type') || 'email',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '25'),
    sort: searchParams.get('sort') || 'relevance',
    filters: Object.fromEntries(
      Array.from(searchParams.entries())
        .filter(([key]) => !['q', 'type', 'page', 'limit', 'sort'].includes(key))
    )
  }
}

// Security utilities
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@')
  if (!username || !domain) return email
  
  const maskedUsername = username.length > 2 
    ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
    : username
    
  return `${maskedUsername}@${domain}`
}

export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length < 10) return phone
  
  const masked = cleaned.slice(0, 3) + '*'.repeat(cleaned.length - 6) + cleaned.slice(-3)
  return masked
}

export function maskIP(ip: string): string {
  if (isValidIP(ip)) {
    const parts = ip.split('.')
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.*.${parts[3]}`
    }
  }
  return ip
}

// Color utilities for severity
export function getSeverityColor(severity: string): string {
  const colors = {
    low: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
    medium: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950',
    high: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950',
    critical: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950'
  }
  return colors[severity as keyof typeof colors] || colors.medium
}

export function getStatusColor(status: string): string {
  const colors = {
    active: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
    inactive: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950',
    pending: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950',
    error: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950'
  }
  return colors[status.toLowerCase() as keyof typeof colors] || colors.inactive
}

// Local Storage utilities
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error)
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Array utilities
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const value = String(item[key])
    groups[value] = groups[value] || []
    groups[value].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}

export function isApiError(error: any): error is { response: { data: { message: string } } } {
  return error?.response?.data?.message
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const result = document.execCommand('copy')
      textArea.remove()
      return result
    }
  } catch {
    return false
  }
}

// Generate random ID
export function generateId(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
