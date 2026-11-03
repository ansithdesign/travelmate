import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cx } from '../../utils/cx'

/** Segmented control. Real radio group semantics. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  label: string
  className?: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cx('grid auto-cols-fr grid-flow-col gap-1 rounded-md bg-sunken p-1', className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              const i = options.findIndex((x) => x.value === value)
              if (e.key === 'ArrowRight') onChange(options[(i + 1) % options.length].value)
              if (e.key === 'ArrowLeft') onChange(options[(i - 1 + options.length) % options.length].value)
            }}
            tabIndex={active ? 0 : -1}
            className={cx(
              'h-9 rounded-[9px] px-2 text-meta font-medium transition-[background-color,color,box-shadow] duration-150',
              active ? 'bg-surface text-ink shadow-[0_1px_2px_rgb(27_32_29/0.08),0_0_0_1px_rgb(27_32_29/0.06)]' : 'text-ink-2 hover:text-ink',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Chip({
  active,
  onClick,
  children,
  icon: Icon,
  count,
}: {
  active?: boolean
  onClick?: () => void
  children: ReactNode
  icon?: LucideIcon
  count?: number
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cx(
        'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-meta font-medium whitespace-nowrap transition-colors duration-150',
        active ? 'bg-ink text-white' : 'bg-surface text-ink-2 hairline hover:text-ink',
      )}
    >
      {Icon ? <Icon size={15} strokeWidth={1.9} aria-hidden /> : null}
      {children}
      {count !== undefined ? <span className={cx('num', active ? 'text-white/70' : 'text-ink-3')}>{count}</span> : null}
    </button>
  )
}

export function EmptyState({
  title,
  body,
  action,
  marker,
}: {
  title: string
  body: ReactNode
  action?: ReactNode
  marker?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {marker}
      <h3 className={cx('text-heading', marker && 'mt-5')}>{title}</h3>
      <p className="mt-1.5 max-w-[34ch] text-body text-ink-2">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

/** Section heading row with an optional trailing action. */
export function SectionHeader({ title, action, id }: { title: string; action?: ReactNode; id?: string }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3">
      <h2 id={id} className="text-heading">
        {title}
      </h2>
      {action}
    </div>
  )
}

/** Label / value row, used for bookings, expense detail and receipts. */
export function DetailRow({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cx('flex items-baseline justify-between gap-4 py-3', className)}>
      <dt className="shrink-0 text-meta text-ink-2">{label}</dt>
      <dd className="min-w-0 text-right text-body">{children}</dd>
    </div>
  )
}
