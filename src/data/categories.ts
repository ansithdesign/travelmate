import { BedDouble, Car, Plane, ShoppingBag, Sparkles, Ticket, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import type { CategoryId } from '../types'

export interface CategoryMeta {
  id: CategoryId
  label: string
  short: string
  icon: LucideIcon
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'accommodation', label: 'Accommodation', short: 'Stay', icon: BedDouble },
  { id: 'food', label: 'Food and drinks', short: 'Food', icon: UtensilsCrossed },
  { id: 'transport', label: 'Transportation', short: 'Transport', icon: Car },
  { id: 'activities', label: 'Activities', short: 'Activities', icon: Ticket },
  { id: 'shopping', label: 'Shopping', short: 'Shopping', icon: ShoppingBag },
  { id: 'flights', label: 'Flights', short: 'Flights', icon: Plane },
  { id: 'other', label: 'Other', short: 'Other', icon: Sparkles },
]

export const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, CategoryMeta>
