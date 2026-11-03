import { useEffect, useState } from 'react'
import { cx } from '../../utils/cx'
import { Button } from '../ui/Button'
import { Sheet } from '../ui/Sheet'
import { useToast } from '../ui/Toast'
import { EMBLEM_NAMES, PAL, STAMP_NAMES, STYLE_NAMES, WIDE, passportHtml, type Info, type PassportLook } from './passportStyles'

export function PassportScene({ look, info, className }: { look: PassportLook; info: Info; className?: string }) {
  const { card, stamps } = passportHtml(look, info)
  const wide = WIDE.includes(look.sty)
  return (
    <div className={cx('flex items-stretch gap-4', wide && 'flex-col', className)}>
      <div className={wide ? 'w-full' : 'shrink-0'} dangerouslySetInnerHTML={{ __html: card }} />
      <ul className={cx('flex min-w-0 flex-1 items-center justify-between gap-2', wide ? 'flex-row justify-around' : 'flex-col')} aria-label="Places you have been">
        {stamps.map((h, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: h }} />
        ))}
      </ul>
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 px-0.5 text-meta font-semibold text-ink-3">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={cx('press h-10 rounded-full px-4 text-[14px] font-medium', on ? 'bg-accent text-[var(--on-accent)]' : 'bg-well text-ink-2')}>
      {children}
    </button>
  )
}

/** Mix a passport style, colour, stamp shape and emblem. Nothing changes until "Use this passport". */
export function PassportPickerSheet({ open, onClose, look, info, onSave }: { open: boolean; onClose: () => void; look: PassportLook; info: Info; onSave: (l: PassportLook) => void }) {
  const toast = useToast()
  const [sel, setSel] = useState(look)
  useEffect(() => {
    if (open) setSel(look)
  }, [open, look])
  const same = JSON.stringify(sel) === JSON.stringify(look)
  const set = (k: keyof PassportLook, v: number) => setSel((s) => ({ ...s, [k]: v }))

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Passport"
      footer={
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="lg"
            disabled={same}
            onClick={() => {
              onSave(sel)
              toast.success('Passport updated')
              onClose()
            }}
          >
            {same ? 'In use' : 'Use this passport'}
          </Button>
        </div>
      }
    >
      <div className="rounded-[26px] p-5" style={{ background: 'linear-gradient(180deg,#153e6b,#3a74a8 60%,#7aa6cc)' }}>
        <PassportScene look={sel} info={info} />
      </div>
      <Group title="Style">
        {STYLE_NAMES.map((n, i) => (
          <Pill key={n} on={sel.sty === i} onClick={() => set('sty', i)}>
            {n}
          </Pill>
        ))}
      </Group>
      <Group title="Colour">
        {PAL.map((p, i) => (
          <button
            key={p.n}
            type="button"
            aria-pressed={sel.pal === i}
            aria-label={p.n}
            title={p.n}
            onClick={() => set('pal', i)}
            className={cx('press size-10 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)]', sel.pal === i && 'shadow-[0_0_0_3px_var(--haze),0_0_0_5px_var(--accent)]')}
            style={{ background: `linear-gradient(135deg, ${p.a} 50%, ${p.f} 50%)` }}
          />
        ))}
      </Group>
      <Group title="Stamps">
        {STAMP_NAMES.map((n, i) => (
          <Pill key={n} on={sel.stp === i} onClick={() => set('stp', i)}>
            {n}
          </Pill>
        ))}
      </Group>
      <Group title="Emblem">
        {EMBLEM_NAMES.map((n, i) => (
          <Pill key={n} on={sel.emb === i} onClick={() => set('emb', i)}>
            {n}
          </Pill>
        ))}
      </Group>
    </Sheet>
  )
}
