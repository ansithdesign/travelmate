import type { CategoryId } from '../types'

export interface CategoryMeta {
  id: CategoryId
  label: string
  short: string
  /** Chart colour for this category, from the sky palette */
  tint: string
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'accommodation', label: 'Accommodation', short: 'Stay', tint: '#f26b4f' },
  { id: 'food', label: 'Food and drinks', short: 'Food', tint: '#e8930c' },
  { id: 'transport', label: 'Transportation', short: 'Transport', tint: '#3b82f6' },
  { id: 'activities', label: 'Activities', short: 'Activities', tint: '#e2507f' },
  { id: 'shopping', label: 'Shopping', short: 'Shopping', tint: '#a855f7' },
  { id: 'flights', label: 'Flights', short: 'Flights', tint: '#0ea5c6' },
  { id: 'other', label: 'Other', short: 'Other', tint: '#7c8aa5' },
]

export const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, CategoryMeta>
