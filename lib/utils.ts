import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n)
}

export function formatPercent(val: number, total: number): string {
  if (!total) return '0%'
  return ((val / total) * 100).toFixed(1) + '%'
}

export function apiError(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

export function apiSuccess<T>(data: T, status = 200) {
  return Response.json(data, { status })
}

const RATE_LIMIT = new Map<string, { count: number; resetAt: number }>()
export function rateLimit(ip: string, max = 60, windowMs = 60_000): boolean {
  const now = Date.now()
  const entry = RATE_LIMIT.get(ip)
  if (!entry || now > entry.resetAt) {
    RATE_LIMIT.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= max) return false
  entry.count++
  return true
}

/** Convert yes/no/true/false/1/0 → boolean */
export function toBool(v: string | undefined): boolean {
  if (!v) return false
  return ['yes', 'true', '1', 'y'].includes(v.toLowerCase().trim())
}

/** Safe integer parse */
export function toInt(v: string | undefined, fallback = 0): number {
  const n = parseInt(v ?? '', 10)
  return isNaN(n) ? fallback : n
}

/** Safe float parse */
export function toFloat(v: string | undefined): number | null {
  if (!v || v.trim() === '') return null
  const n = parseFloat(v)
  return isNaN(n) ? null : n
}

/** Normalise gender */
export function normaliseGender(v: string): 'MALE' | 'FEMALE' | 'OTHER' {
  const s = v.toLowerCase().trim()
  if (s === 'male'   || s === 'm' || s === 'boy')  return 'MALE'
  if (s === 'female' || s === 'f' || s === 'girl') return 'FEMALE'
  return 'OTHER'
}

/** Normalise HPV status */
export function normaliseHPVStatus(v: string): 'VACCINATED' | 'PENDING' | 'DUE' | 'NOT_ELIGIBLE' {
  const s = v.toLowerCase().trim()
  if (s === 'vaccinated' || s === 'done' || s === 'yes' || s === '1') return 'VACCINATED'
  if (s === 'due') return 'DUE'
  if (s === 'not_eligible' || s === 'not eligible') return 'NOT_ELIGIBLE'
  return 'PENDING'
}
