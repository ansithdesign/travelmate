import type { CategoryId } from '../../types'
import { cx } from '../../utils/cx'

// The category artwork: flat-lit 3D objects on transparent backgrounds, used exactly as drawn.
const FILES = import.meta.glob('../../assets/categories/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const SRC = (id: CategoryId) => FILES[`../../assets/categories/${id}.png`]

/** A category icon with no container and no shadow. */
export function CategoryIcon({ id, size = 24, className }: { id: CategoryId; size?: number; className?: string }) {
  return <img src={SRC(id)} alt="" aria-hidden width={size} height={size} draggable={false} className={cx('shrink-0 select-none object-contain', className)} />
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
