import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { RatingLevel } from '@/types/audit'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function scoreToColor(score: number): string {
  if (score >= 85) return '#22c55e'
  if (score >= 70) return '#84cc16'
  if (score >= 50) return '#eab308'
  if (score >= 30) return '#f97316'
  return '#ef4444'
}

export function ratingToColor(rating: RatingLevel): string {
  const map: Record<RatingLevel, string> = {
    excellent: 'text-green-400 bg-green-400/10 border-green-400/20',
    good:      'text-lime-400 bg-lime-400/10 border-lime-400/20',
    fair:      'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    poor:      'text-orange-400 bg-orange-400/10 border-orange-400/20',
    critical:  'text-red-400 bg-red-400/10 border-red-400/20',
  }
  return map[rating]
}

export function ratingToBorder(rating: RatingLevel): string {
  const map: Record<RatingLevel, string> = {
    excellent: 'border-green-500/30',
    good:      'border-lime-500/30',
    fair:      'border-yellow-500/30',
    poor:      'border-orange-500/30',
    critical:  'border-red-500/30',
  }
  return map[rating]
}

export function priorityColor(priority: 'high' | 'medium' | 'low'): string {
  const map = {
    high:   'text-red-400 bg-red-400/10 border-red-400/20',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    low:    'text-blue-400 bg-blue-400/10 border-blue-400/20',
  }
  return map[priority]
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}
