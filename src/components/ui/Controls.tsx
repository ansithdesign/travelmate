import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { Icon } from '@phosphor-icons/react'
import { cx } from '../../utils/cx'

/** Segmented control with a glass thumb that slides between options. */
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
    <div ref={root} role="radiogroup" aria-label={label} className={cx('relative grid auto-cols-fr grid-flow-col rounded-full bg-well p-1', className)}>
      {thumb ? (
        <span
          aria-hidden
          className="absolute top-1 bottom-1 rounded-full bg-panel-strong shadow-[0_1px_2px_rgb(var(--t-shadow)/0.1),0_6px_16px_-8px_rgb(var(--t-shadow)/0.35),inset_0_0_0_1px_var(--color-line)] transition-[left,width] duration-500 ease-[var(--ease-glide)]"
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
            className={cx('relative z-[1] h-9 rounded-full px-2 text-meta font-semibold transition-colors duration-200', active ? 'text-ink' : 'text-ink-3 hover:text-ink-2')}
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
        'press inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-meta font-semibold whitespace-nowrap',
        leading && 'pl-1.5',
        active
          ? 'bg-ink text-ink-inverse shadow-[0_8px_18px_-10px_rgb(var(--t-shadow)/0.6)]'
          : 'bg-panel-strong text-ink-2 shadow-[inset_0_0_0_1px_var(--color-line)] hover:text-ink',
      )}
    >
      {leading}
      {I ? <I size={16} weight="bold" aria-hidden /> : null}
      {children}
      {count !== undefined ? <span className={cx('num', active ? 'opacity-60' : 'text-ink-3')}>{count}</span> : null}
    </button>
  )
}

export function EmptyState({ title, body, action, art }: { title: string; body: ReactNode; action?: ReactNode; art?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      {art}
      <h3 className={cx('text-heading', art && 'mt-4')}>{title}</h3>
      <p className="mt-1.5 max-w-[34ch] text-body text-ink-2">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function SectionHeader({ title, action, id, count }: { title: string; action?: ReactNode; id?: string; count?: number }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3">
      <h2 id={id} className="text-heading">
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
    <div className={cx('flex items-baseline justify-between gap-4 py-3', className)}>
      <dt className="shrink-0 text-meta text-ink-2">{label}</dt>
      <dd className="min-w-0 text-right text-body">{children}</dd>
    </div>
  )
}
