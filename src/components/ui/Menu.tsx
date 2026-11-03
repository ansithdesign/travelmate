import { useEffect, useId, useRef, useState } from 'react'
import { DotsThree, type Icon } from '@phosphor-icons/react'
import { cx } from '../../utils/cx'
import { IconButton } from './Button'

export interface MenuItem {
  label: string
  icon?: Icon
  onSelect: () => void
  danger?: boolean
}

/** Glass popover menu with full keyboard support. */
export function Menu({ items, label = 'More actions', tone = 'plain' }: { items: MenuItem[]; label?: string; tone?: 'plain' | 'sky' | 'panel' }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const id = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    if (open) refs.current[active]?.focus()
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
        icon={DotsThree}
        label={label}
        tone={tone}
        size={22}
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
              root.current?.querySelector<HTMLButtonElement>('button')?.focus()
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
          className="glass-bar off-sky absolute top-[calc(100%+8px)] right-0 z-40 min-w-[224px] origin-top-right overflow-hidden rounded-[22px] p-1.5 text-ink [animation:pop_260ms_var(--ease-glide)]"
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
                'flex h-11 w-full items-center gap-3 rounded-[14px] px-3 text-left text-body font-medium outline-none hover:bg-well focus-visible:bg-well',
                it.danger ? 'text-loss' : 'text-ink',
              )}
            >
              {it.icon ? <it.icon size={19} weight="duotone" aria-hidden /> : null}
              {it.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
