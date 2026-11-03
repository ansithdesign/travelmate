import { AirplaneTilt, Bed, Car, ForkKnife, ShoppingBag, Sparkle, Ticket, type Icon } from '@phosphor-icons/react'
import { categoryById } from '../../data/categories'
import type { CategoryId } from '../../types'
import { cx } from '../../utils/cx'

const GLYPH: Record<CategoryId, Icon> = {
  accommodation: Bed,
  food: ForkKnife,
  transport: Car,
  activities: Ticket,
  shopping: ShoppingBag,
  flights: AirplaneTilt,
  other: Sparkle,
}

/** The category glyph in its colour, no container. */
export function CategoryIcon({ id, size = 20, className }: { id: CategoryId; size?: number; className?: string }) {
  const G = GLYPH[id]
  return <G size={size} weight="duotone" color={categoryById[id].tint} className={cx('shrink-0', className)} aria-hidden />
}

/** The glyph centred in a soft circle tinted with the category colour. Filled when selected. */
export function CategoryTile({ id, size = 44, className, selected }: { id: CategoryId; size?: number; className?: string; selected?: boolean }) {
  const tint = categoryById[id].tint
  const G = GLYPH[id]
  return (
    <span
      aria-hidden
      className={cx('inline-flex shrink-0 items-center justify-center rounded-full transition-[background-color,box-shadow] duration-300', className)}
      style={{
        width: size,
        height: size,
        background: selected ? tint : `color-mix(in oklab, ${tint} 16%, transparent)`,
        boxShadow: selected ? `0 8px 18px -8px ${tint}` : undefined,
      }}
    >
      <G size={Math.round(size * 0.48)} weight={selected ? 'fill' : 'duotone'} color={selected ? '#fff' : tint} />
    </span>
  )
}
