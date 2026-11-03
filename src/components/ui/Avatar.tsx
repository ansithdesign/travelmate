import type { Person } from '../../types'
import { cx } from '../../utils/cx'
import { initials } from '../../utils/id'

// Flat, calm fills from the series palette. Each person keeps one, chosen by id.
const ORBS = ['#1f6fd6', '#c2558d', '#9c6f12', '#6a5bd8', '#1f857f', '#4f6278', '#2b7fd4']

function orbFor(id: string) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return ORBS[h % ORBS.length]
}

export function Avatar({
  person,
  size = 36,
  ring,
  className,
  style,
}: {
  person: Pick<Person, 'id' | 'name'>
  size?: number
  ring?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  const fill = orbFor(person.id)
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.36)),
        background: fill,
        ...style,
      }}
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-[0.02em] text-white',
        ring && 'ring-[1.5px]',
        className,
      )}
    >
      {initials(person.name)}
    </span>
  )
}

export function AvatarStack({
  people,
  max = 4,
  size = 28,
  className,
  ringClass = 'ring-[var(--haze)]',
}: {
  people: Person[]
  max?: number
  size?: number
  className?: string
  ringClass?: string
}) {
  const shown = people.slice(0, max)
  const extra = people.length - shown.length
  const overlap = 3
  return (
    <span className={cx('flex items-center', className)} aria-label={people.map((p) => p.name).join(', ')} role="img">
      {shown.map((p, i) => (
        <Avatar key={p.id} person={p} size={size} ring className={ringClass} style={i > 0 ? { marginLeft: overlap } : undefined} />
      ))}
      {extra > 0 ? (
        <span
          style={{ width: size, height: size, marginLeft: overlap }}
          className={cx('inline-flex items-center justify-center rounded-full bg-solid text-[11px] font-semibold text-ink-2 ring-[1.5px]', ringClass)}
        >
          +{extra}
        </span>
      ) : null}
    </span>
  )
}
