import type { CategoryId } from '../types'

export interface CategoryMeta {
  id: CategoryId
  label: string
  short: string
  /** Chart colour for this category, from the sky palette */
  tint: string
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'accommodation', label: 'Accommodation', short: 'Stay', tint: '#ff7a5c' },
  { id: 'food', label: 'Food and drinks', short: 'Food', tint: '#ffa53d' },
  { id: 'transport', label: 'Transportation', short: 'Transport', tint: '#3b82f6' },
  { id: 'activities', label: 'Activities', short: 'Activities', tint: '#f25f8a' },
  { id: 'shopping', label: 'Shopping', short: 'Shopping', tint: '#c052d6' },
  { id: 'flights', label: 'Flights', short: 'Flights', tint: '#22b8cf' },
  { id: 'other', label: 'Other', short: 'Other', tint: '#eab308' },
]

export const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, CategoryMeta>
