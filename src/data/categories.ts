import type { CategoryId } from '../types'

export interface CategoryMeta {
  id: CategoryId
  label: string
  short: string
  /** Chart colour for this category, from the Under the Sky series palette */
  tint: string
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'accommodation', label: 'Accommodation', short: 'Stay', tint: '#1f6fd6' },
  { id: 'food', label: 'Food and drinks', short: 'Food', tint: '#e46aa6' },
  { id: 'transport', label: 'Transportation', short: 'Transport', tint: '#c9922a' },
  { id: 'activities', label: 'Activities', short: 'Activities', tint: '#6a5bd8' },
  { id: 'shopping', label: 'Shopping', short: 'Shopping', tint: '#2aa5a0' },
  { id: 'flights', label: 'Flights', short: 'Flights', tint: '#8fc6fb' },
  { id: 'other', label: 'Other', short: 'Other', tint: '#9aa8b8' },
]

export const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, CategoryMeta>
