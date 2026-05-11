import { format, differenceInDays, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ─── Class name merger (no clsx dependency) ─────────────────────────────────

type ClassValue = string | undefined | null | false | 0

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ')
}

// ─── Date formatting ─────────────────────────────────────────────────────────

/**
 * Format a date string or Date object.
 * @param date   ISO string or Date
 * @param fmt    date-fns format string (default: 'dd/MM/yyyy')
 */
export function formatDate(date: string | Date, fmt = 'dd/MM/yyyy'): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(d)) return '—'
    return format(d, fmt, { locale: ptBR })
  } catch {
    return '—'
  }
}

// ─── Number formatting ────────────────────────────────────────────────────────

/**
 * Format a number with thousand separators and optional decimal places.
 */
export function formatNumber(n: number, decimals = 0): string {
  if (Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)
}

// ─── Status colours ───────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  // Stock / generic
  ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
  INACTIVE: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
  COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  ON_HOLD: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400',
  // Receiving
  SCHEDULED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400',
  RECEIVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
  PARTIAL: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400',
  // Shipping
  PICKING: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-400',
  PACKED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-400',
  SHIPPED: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-400',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
  // Tasks
  TODO: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  DONE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
  BLOCKED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  // Divergences
  OPEN: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  RESOLVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
  INVESTIGATING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400',
}

/**
 * Return Tailwind badge classes for a given status string.
 */
export function getStatusColor(status: string): string {
  return (
    STATUS_COLORS[status.toUpperCase()] ??
    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  )
}

// ─── Priority colours ─────────────────────────────────────────────────────────

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  CRITICAL: 'bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-300',
}

/**
 * Return Tailwind badge classes for a given priority string.
 */
export function getPriorityColor(priority: string): string {
  return (
    PRIORITY_COLORS[priority.toUpperCase()] ??
    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  )
}

// ─── Expiry helpers ───────────────────────────────────────────────────────────

/**
 * Return the number of days between today and the given expiry date.
 * Negative values mean the product has already expired.
 */
export function getDaysUntilExpiry(date: string): number {
  try {
    const expiry = parseISO(date)
    if (!isValid(expiry)) return 0
    return differenceInDays(expiry, new Date())
  } catch {
    return 0
  }
}

/**
 * Classify an expiry timeline into an alert level.
 * - 'expired'  : already past expiry (days < 0)
 * - 'danger'   : 0–30 days remaining
 * - 'warning'  : 31–90 days remaining
 * - 'ok'       : > 90 days remaining
 */
export function getExpiryAlertLevel(days: number): 'ok' | 'warning' | 'danger' | 'expired' {
  if (days < 0) return 'expired'
  if (days <= 30) return 'danger'
  if (days <= 90) return 'warning'
  return 'ok'
}

// ─── String helpers ───────────────────────────────────────────────────────────

/**
 * Truncate a string to at most `n` characters, appending "…" if truncated.
 */
export function truncate(str: string, n: number): string {
  if (str.length <= n) return str
  return str.slice(0, n - 1) + '…'
}
