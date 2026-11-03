import type { Person } from '../../types'
import { cx } from '../../utils/cx'
import { initials } from '../../utils/id'

// Muted tints drawn from the stone, forest and amber palette. Assigned by id, not at random.
const TINTS = [
  'bg-forest-100 text-forest-900',
  'bg-amber-100 text-[#5c3d08]',
  'bg-[#e4dfd3] text-[#3f3a2e]',
  'bg-[#dfe6e8] text-[#24383d]',
  'bg-[#efdcd5] text-[#5a2a1e]',
  'bg-[#e3e0ee] text-[#33304a]',
]

function tintFor(id: string) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return TINTS[h % TINTS.length]
}

export function Avatar({ person, size = 36, ring, className, style }: { person: Pick<Person, 'id' | 'name'>; size?: number; ring?: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.34)), ...style }}
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-[0.01em]',
        tintFor(person.id),
        ring && 'ring-2 ring-surface',
        className,
      )}
    >
      {initials(person.name)}
    </span>
  )
}

export function AvatarStack({ people, max = 4, size = 28, className, on = 'ground' }: { people: Person[]; max?: number; size?: number; className?: string; on?: 'ground' | 'surface' }) {
  const ringColor = on === 'ground' ? 'ring-ground' : 'ring-surface'
  const shown = people.slice(0, max)
  const extra = people.length - shown.length
  return (
    <span className={cx('flex items-center', className)} aria-label={people.map((p) => p.name).join(', ')} role="img">
      {shown.map((p, i) => (
        <Avatar key={p.id} person={p} size={size} ring className={ringColor} style={i > 0 ? { marginLeft: -Math.round(size * 0.22) } : undefined} />
      ))}
      {extra > 0 ? (
        <span
          style={{ width: size, height: size, marginLeft: -Math.round(size * 0.22) }}
          className={`inline-flex items-center justify-center rounded-full bg-sunken text-[11px] font-semibold text-ink-2 ring-2 ${ringColor}`}
        >
          +{extra}
        </span>
      ) : null}
    </span>
  )
}
