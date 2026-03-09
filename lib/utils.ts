import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toSafeDate(dateStr?: string | null) {
  if (!dateStr) return null

  const [year, month, day] = dateStr.split('-').map(Number)

  if (!year || !month || !day) {
    throw new Error(`Invalid date format: ${dateStr}`)
  }

  // meio-dia local (anti-timezone bug)
  return new Date(year, month - 1, day, 12, 0, 0)
}

export function createRange<T = number>(
  length: number,
  initializer: (index: number) => T = ((index) => index as T)
): T[] {
  if (!Number.isInteger(length) || length < 0) {
    throw new RangeError(`Invalid range length: ${length}`)
  }
  return Array.from({ length }, (_, index) => initializer(index))
}
