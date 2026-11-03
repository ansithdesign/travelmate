import type { Person } from '../../types'
import { cx } from '../../utils/cx'
import { initials } from '../../utils/id'

// Sky-light orbs. Each person gets a gradient pair, chosen by id so it never changes.
const ORBS = [
  ['#7cc4ff', '#2f6fe0'],
  ['#ffc58a', '#f2766a'],
  ['#b7a4ff', '#6a5ae0'],
  ['#8ce6cf', '#1f9e8c'],
  ['#ff9fc5', '#d24f8c'],
  ['#ffe08a', '#e59a1a'],
  ['#9fd6ff', '#5b6fe8'],
]

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
  const [a, b] = orbFor(person.id)
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.36)),
        background: `radial-gradient(circle at 32% 28%, rgb(255 255 255 / 0.55) 0%, transparent 42%), linear-gradient(145deg, ${a} 0%, ${b} 100%)`,
        ...style,
      }}
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-[0.02em] text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.25)]',
        ring && 'ring-2',
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
  ringClass = 'ring-white/80',
}: {
  people: Person[]
  max?: number
  size?: number
  className?: string
  ringClass?: string
}) {
  const shown = people.slice(0, max)
  const extra = people.length - shown.length
  const overlap = -Math.round(size * 0.14)
  return (
    <span className={cx('flex items-center', className)} aria-label={people.map((p) => p.name).join(', ')} role="img">
      {shown.map((p, i) => (
        <Avatar key={p.id} person={p} size={size} ring className={ringClass} style={i > 0 ? { marginLeft: overlap } : undefined} />
      ))}
      {extra > 0 ? (
        <span
          style={{ width: size, height: size, marginLeft: overlap }}
          className={cx('inline-flex items-center justify-center rounded-full bg-white/70 text-[11px] font-semibold text-[#0c1736] ring-2', ringClass)}
        >
          +{extra}
        </span>
      ) : null}
    </span>
  )
}
