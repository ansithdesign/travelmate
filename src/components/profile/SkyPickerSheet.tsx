import { useEffect, useState, type CSSProperties } from 'react'
import { Check } from '@phosphor-icons/react'
import { SKY_THEMES, skyThemeById, skyVars, type SkyTheme } from '../../data/skyThemes'
import { useStore } from '../../store/store'
import { useSky } from '../../store/sky'
import { cx } from '../../utils/cx'
import { Button } from '../ui/Button'
import { Cover } from '../ui/Cover'
import { ScrollRow } from '../ui/ScrollRow'
import { Sheet } from '../ui/Sheet'
import { useToast } from '../ui/Toast'

const gradient = (t: SkyTheme) => `linear-gradient(180deg, ${t.c[0]}, ${t.c[1]} 55%, ${t.c[2]})`

/** A small Home screen painted with one candidate sky, so you see it before you commit. */
function SkyPreview({ theme }: { theme: SkyTheme }) {
  const { data } = useStore()
  const vars = skyVars(theme) as CSSProperties
  const covers = data.trips.slice(0, 3).map((t) => t.cover)
  return (
    <div className="relative h-[310px] overflow-hidden rounded-[26px] bg-[#f4f7fc] shadow-[0_0_0_1px_rgba(13,27,42,0.08),0_18px_34px_-20px_rgba(13,27,42,0.5)]" style={vars} aria-hidden>
      <div
        className="absolute inset-x-0 top-0 h-[230px] transition-[background] duration-500"
        style={{ background: `linear-gradient(180deg, rgba(8,18,48,calc(var(--sky-scrim) * 0.55)) 0%, rgba(8,18,48,var(--sky-scrim)) 40%, rgba(8,18,48,var(--sky-scrim)) 74%, transparent 100%), radial-gradient(150px 120px at 78% 40px, var(--sun), transparent 70%), linear-gradient(180deg, var(--sky-1), var(--sky-2) 52%, var(--sky-3) 82%, #f4f7fc)` }}
      />
      <span className="absolute top-[96px] -left-10 h-14 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.9),transparent)] blur-[6px]" style={{ opacity: theme.clouds }} />
      <span className="absolute top-[70px] -right-8 h-10 w-40 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.9),transparent)] blur-[6px]" style={{ opacity: theme.clouds }} />
      {Array.from({ length: 18 }, (_, i) => (
        <i key={i} className="absolute rounded-full bg-white" style={{ left: `${(i * 37 + 11) % 97}%`, top: `${(i * 53 + 7) % 60}%`, width: i % 2 ? 3 : 4, height: i % 2 ? 3 : 4, opacity: i % 2 ? 0.45 : 0.65 }} />
      ))}
      <div className="relative px-5 pt-4 text-white">
        <div className="flex items-center justify-between">
          <p className="text-[26px] leading-none font-bold tracking-[-0.04em]">Trips.</p>
          <span className="flex size-[30px] items-center justify-center rounded-full bg-[#c2558d] text-[11px] font-semibold">AK</span>
        </div>
        <div className="mt-3 flex gap-3">
          {[0, 1, 2].map((i) => (
            <span key={i} className="block size-[44px] rounded-full p-[2px]" style={{ background: `conic-gradient(${i === 0 ? '#ffd479' : '#fff'} ${i === 0 ? 230 : 360}deg, rgba(255,255,255,0.3) 0)` }}>
              <Cover photo={covers[i]} seed={i + 1} className="size-full rounded-full border-2 border-[rgba(20,30,70,0.5)]" />
            </span>
          ))}
        </div>
        <p className="mt-3 text-[12px] font-semibold opacity-90">Kashmir in winter · In 39 days</p>
        <p className="num text-[36px] leading-[1.05] font-[650] tracking-[-0.04em]">₹89,200</p>
        <span className="mt-1.5 inline-flex h-6 items-center rounded-full bg-white/22 px-2.5 text-[11px] font-bold">You owe ₹4,300</span>
      </div>
      <div className="absolute inset-x-4 bottom-3 rounded-[18px] bg-white p-3 text-[#0d1b2a] shadow-[0_10px_24px_-12px_rgba(23,63,112,0.35)]">
        <div className="flex items-center gap-2.5">
          <span className="size-7 rounded-full bg-[rgba(53,99,214,0.12)]" />
          <span className="flex-1 text-[13px] font-semibold">Airport pickup</span>
          <span className="num text-[13px] font-[650]">₹1,200</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Choose the sky for the light theme. Tapping a sky only previews it here; the
 * app changes when you press "Use this sky", and Cancel keeps what you had.
 */
export function SkyPickerSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lightSky, setLightSky } = useSky()
  const toast = useToast()
  const [sel, setSel] = useState(lightSky)
  useEffect(() => {
    if (open) setSel(lightSky)
  }, [open, lightSky])
  const theme = skyThemeById(sel)
  const same = sel === lightSky

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Choose a light sky"
      description="Tap a sky to preview it. Nothing changes until you confirm."
      footer={
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="lg"
            disabled={same}
            onClick={() => {
              setLightSky(sel)
              toast.success(`${theme.name} is now your light sky`)
              onClose()
            }}
          >
            {same ? 'Current sky' : 'Use this sky'}
          </Button>
        </div>
      }
    >
      <SkyPreview theme={theme} />

      <div className="mt-4 flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <p className="text-heading">{theme.name}</p>
          <p className="mt-0.5 text-meta text-ink-3">{theme.mood}</p>
        </div>
        <span className={cx('level shrink-0', 'ok')}>Text: readable</span>
      </div>

      <ScrollRow role="radiogroup" aria-label="Light skies" className="-mx-6 mt-5 flex gap-3.5 px-6 pb-2 md:-mx-6">
        {SKY_THEMES.map((t) => {
          const on = t.id === sel
          const cur = t.id === lightSky
          return (
            <button key={t.id} type="button" role="radio" aria-checked={on} onClick={() => setSel(t.id)} className="press w-[76px] shrink-0 text-center">
              <span className={cx('relative block h-[92px] w-[76px] rounded-[20px] transition-[box-shadow,transform] duration-300', on ? 'scale-[1.03] shadow-[0_0_0_2.5px_var(--accent),0_10px_20px_-10px_var(--accent)]' : 'shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]')} style={{ background: gradient(t) }}>
                {on ? (
                  <span className="absolute right-1.5 bottom-1.5 flex size-5 items-center justify-center rounded-full bg-white text-accent">
                    <Check size={12} weight="bold" aria-hidden />
                  </span>
                ) : null}
              </span>
              <span className={cx('mt-1.5 block text-[12px] leading-tight', on ? 'font-bold text-ink' : 'font-medium text-ink-3')}>{t.name}</span>
              {cur ? <span className="block text-[10.5px] font-semibold text-accent-ink">In use</span> : null}
            </button>
          )
        })}
        <span aria-hidden className="w-4 shrink-0" />
      </ScrollRow>
    </Sheet>
  )
}
