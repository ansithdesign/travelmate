import { useEffect, useId, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { MoreHorizontal } from 'lucide-react'
import { cx } from '../../utils/cx'
import { IconButton } from './Button'

export interface MenuItem {
  label: string
  icon?: LucideIcon
  onSelect: () => void
  danger?: boolean
}

export function Menu({ items, label = 'More actions', tone = 'plain' }: { items: MenuItem[]; label?: string; tone?: 'plain' | 'onImage' }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const id = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    if (!open) return
    refs.current[active]?.focus()
  }, [open, active])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div ref={root} className="relative">
      <IconButton
        icon={MoreHorizontal}
        label={label}
        tone={tone}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          setActive(0)
          setOpen((o) => !o)
        }}
      />
      {open ? (
        <div
          id={id}
          role="menu"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false)
              ;(root.current?.querySelector('button') as HTMLButtonElement | null)?.focus()
            }
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => (a + 1) % items.length)
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => (a - 1 + items.length) % items.length)
            }
            if (e.key === 'Tab') setOpen(false)
          }}
          className="absolute top-[calc(100%+6px)] right-0 z-40 min-w-[220px] overflow-hidden rounded-md bg-surface py-1.5 shadow-pop hairline [animation:rise_180ms_var(--ease-out-expo)]"
        >
          {items.map((it, i) => (
            <button
              key={it.label}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="menuitem"
              tabIndex={i === active ? 0 : -1}
              onClick={() => {
                setOpen(false)
                it.onSelect()
              }}
              className={cx(
                'flex h-11 w-full items-center gap-3 px-4 text-left text-body outline-none hover:bg-ground focus-visible:bg-ground',
                it.danger ? 'text-brick' : 'text-ink',
              )}
            >
              {it.icon ? <it.icon size={18} strokeWidth={1.8} className={it.danger ? '' : 'text-ink-2'} aria-hidden /> : null}
              {it.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
