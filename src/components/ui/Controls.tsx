import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { Icon } from '@phosphor-icons/react'
import { cx } from '../../utils/cx'

/** Segmented control: a fill track with a solid thumb that slides between options. */
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
  const root = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null)
  const i = Math.max(0, options.findIndex((o) => o.value === value))

  useLayoutEffect(() => {
    const el = root.current?.querySelectorAll<HTMLButtonElement>('[role=radio]')[i]
    if (el) setThumb({ x: el.offsetLeft, w: el.offsetWidth })
  }, [i, options.length])

  return (
    <div ref={root} role="radiogroup" aria-label={label} className={cx('relative grid auto-cols-fr grid-flow-col gap-0.5 rounded-full bg-well p-1', className)}>
      {thumb ? (
        <span
          aria-hidden
          className="absolute top-1 bottom-1 rounded-full bg-solid shadow-[0_2px_8px_-2px_rgba(13,27,42,0.12)] transition-[left,width] duration-300 ease-[var(--ease-out-expo)]"
          style={{ left: thumb.x, width: thumb.w }}
        />
      ) : null}
      {options.map((o, idx) => {
        const active = idx === i
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') onChange(options[(i + 1) % options.length].value)
              if (e.key === 'ArrowLeft') onChange(options[(i - 1 + options.length) % options.length].value)
            }}
            className={cx('relative z-[1] min-h-[40px] rounded-full px-2 text-[14px] font-semibold transition-colors duration-200', active ? 'text-ink' : 'text-ink-3 hover:text-ink')}
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
  icon: I,
  leading,
  count,
}: {
  active?: boolean
  onClick?: () => void
  children: ReactNode
  icon?: Icon
  leading?: ReactNode
  count?: number
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cx(
        'press inline-flex h-[42px] shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] font-medium whitespace-nowrap',
        leading && 'pl-1.5',
        active ? 'bg-accent text-[var(--on-accent)] shadow-[0_8px_18px_-10px_var(--accent)]' : 'glass-control text-ink-2 hover:text-ink',
      )}
    >
      {leading}
      {I ? <I size={16} weight="bold" aria-hidden /> : null}
      {children}
      {count !== undefined ? <span className={cx('num', active ? 'opacity-70' : 'text-ink-3')}>{count}</span> : null}
    </button>
  )
}

export function EmptyState({ title, body, action, art }: { title: string; body: ReactNode; action?: ReactNode; art?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
      {art}
      <h3 className="text-title">{title}</h3>
      <p className="-mt-1.5 max-w-[34ch] text-body text-ink-3">{body}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}

export function SectionHeader({ title, action, id, count }: { title: string; action?: ReactNode; id?: string; count?: number }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 px-0.5">
      <h2 id={id} className="text-title">
        {title}
        {count !== undefined ? <span className="num ml-1.5 font-medium text-ink-3">{count}</span> : null}
      </h2>
      {action}
    </div>
  )
}

/** Label / value row used for bookings, expense detail and receipts. */
export function DetailRow({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cx('flex items-baseline justify-between gap-4 py-[11px]', className)}>
      <dt className="shrink-0 text-[14px] text-ink-3">{label}</dt>
      <dd className="num min-w-0 text-right text-[14px] font-semibold">{children}</dd>
    </div>
  )
}
