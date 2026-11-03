import type { CategoryId } from '../../types'
import { useSky } from '../../store/sky'
import { cx } from '../../utils/cx'

// Two artwork sets of the same fifteen icons: the original set for the light theme and the newer set for dark.
const FILES = import.meta.glob('../../assets/categories/*/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const src = (set: 'light' | 'dark', id: CategoryId) => FILES[`../../assets/categories/${set}/${id}.png`]

/** A category icon with no container and no shadow. */
export function CategoryIcon({ id, size = 24, className }: { id: CategoryId; size?: number; className?: string }) {
  const { phase } = useSky()
  return <img src={src(phase === 'night' ? 'dark' : 'light', id)} alt="" aria-hidden width={size} height={size} draggable={false} className={cx('shrink-0 select-none object-contain', className)} />
}

/**
 * The icon at list size. Unselected it stands free on the page; selected it
 * lifts onto a soft accent pad so the choice is clear without an outline.
 */
export function CategoryTile({ id, size = 36, className, selected }: { id: CategoryId; size?: number; className?: string; selected?: boolean }) {
  return (
    <span
      aria-hidden
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-[28%] transition-[background-color,transform] duration-300 ease-[var(--ease-out-expo)]',
        selected && 'scale-105 bg-accent-soft',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <CategoryIcon id={id} size={Math.round(size * (selected ? 0.9 : 1))} />
    </span>
  )
}
