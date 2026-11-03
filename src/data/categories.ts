import type { CategoryId } from '../types'

export interface CategoryMeta {
  id: CategoryId
  label: string
  short: string
  /** Chart colour for this category, picked from the colours of its icon */
  tint: string
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'stay', label: 'Stay', short: 'Stay', tint: '#e8774f' },
  { id: 'food', label: 'Food', short: 'Food', tint: '#8a97a8' },
  { id: 'drinks', label: 'Cafes and drinks', short: 'Drinks', tint: '#c89b6d' },
  { id: 'groceries', label: 'Groceries', short: 'Groceries', tint: '#6fb552' },
  { id: 'cabs', label: 'Cabs and rides', short: 'Cabs', tint: '#f0b429' },
  { id: 'fuel', label: 'Fuel and tolls', short: 'Fuel', tint: '#d94b3d' },
  { id: 'rentals', label: 'Rentals', short: 'Rentals', tint: '#b9803f' },
  { id: 'flights', label: 'Flights', short: 'Flights', tint: '#4a77d4' },
  { id: 'sightseeing', label: 'Sightseeing and entry', short: 'Sights', tint: '#8f7a6a' },
  { id: 'activities', label: 'Activities', short: 'Activities', tint: '#4f9d69' },
  { id: 'shopping', label: 'Shopping', short: 'Shopping', tint: '#e8606a' },
  { id: 'gifts', label: 'Gifts and souvenirs', short: 'Gifts', tint: '#d9486f' },
  { id: 'health', label: 'Health and pharmacy', short: 'Health', tint: '#3aa0a6' },
  { id: 'admin', label: 'Visa, SIM and insurance', short: 'Visa and SIM', tint: '#2f4f9d' },
  { id: 'other', label: 'Other', short: 'Other', tint: '#9aa8b8' },
]

export const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, CategoryMeta>

/** Older saved data used broader categories. Map them onto the current set. */
export const LEGACY_CATEGORY: Record<string, CategoryId> = {
  accommodation: 'stay',
  transport: 'cabs',
}
