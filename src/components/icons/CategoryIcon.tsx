import { AirplaneTilt, Bed, Car, ForkKnife, ShoppingBag, Sparkle, Ticket, type Icon } from '@phosphor-icons/react'
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

/** The category glyph in accent, no container. */
export function CategoryIcon({ id, size = 20, className }: { id: CategoryId; size?: number; className?: string }) {
  const G = GLYPH[id]
  return <G size={size} weight="duotone" className={cx('shrink-0 text-accent', className)} aria-hidden />
}

/**
 * The glyph centred in an accent-soft circle, accent duotone. Category colour
 * is kept for charts only, so lists stay calm. Selected is the midnight fill.
 */
export function CategoryTile({ id, size = 36, className, selected }: { id: CategoryId; size?: number; className?: string; selected?: boolean }) {
  const G = GLYPH[id]
  return (
    <span
      aria-hidden
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full transition-[background-color,color] duration-200',
        selected ? 'luminous' : 'bg-accent-soft text-accent',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <G size={Math.round(size * 0.53)} weight={selected ? 'fill' : 'duotone'} />
    </span>
  )
}
