import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { skyThemeById, skyVars, type SkyTheme } from '../../data/skyThemes'
import { useStore } from '../../store/store'
import { useSky } from '../../store/sky'
import { cx } from '../../utils/cx'
import { Button } from '../ui/Button'
import { Cover } from '../ui/Cover'
import { ScrollRow } from '../ui/ScrollRow'
import { Sheet } from '../ui/Sheet'
import { useToast } from '../ui/Toast'

/** The set reads like a day: pale morning light, open daytime blues, dusk, then night. */
const ORDER: { id: string; group: string }[] = [
  { id: 'soft-morning', group: 'Morning' },
  { id: 'arctic-dawn', group: 'Morning' },
  { id: 'dawn-rose', group: 'Morning' },
  { id: 'overcast-winter', group: 'Daytime' },
  { id: 'dusty-periwinkle', group: 'Daytime' },
  { id: 'alpine-blue', group: 'Daytime' },
  { id: 'ocean-steel', group: 'Daytime' },
  { id: 'storm-blue', group: 'Daytime' },
  { id: 'slate-lavender', group: 'Dusk' },
  { id: 'plum-dusk', group: 'Dusk' },
  { id: 'twilight-violet', group: 'Dusk' },
  { id: 'deep-cobalt', group: 'Dusk' },
]
const NIGHT = { id: 'night', name: 'Midnight', mood: 'The dark theme: deep purple with an aurora, falling stars and a few shooting ones.', group: 'Night', c: ['#050214', '#170a38', '#321a5e'] as [string, string, string] }
export const THEME_OPTIONS = [
  ...ORDER.map((o) => ({ ...skyThemeById(o.id), group: o.group })),
  NIGHT,
] as (Omit<SkyTheme, 'clouds'> & { group: string; clouds?: number })[]

export const themeGradient = (t: { c: [string, string, string] }) => `linear-gradient(180deg, ${t.c[0]}, ${t.c[1]} 55%, ${t.c[2]})`

function NightPreview() {
  const { data } = useStore()
  const covers = data.trips.slice(0, 3).map((t) => t.cover)
  return (
    <div className="relative h-[310px] overflow-hidden rounded-[26px] bg-[#0a0520] shadow-[0_0_0_1px_rgba(13,27,42,0.08),0_18px_34px_-20px_rgba(13,27,42,0.5)]" aria-hidden>
      <div className="absolute inset-x-0 top-0 h-[240px]" style={{ background: 'radial-gradient(160px 110px at 80% 50px, rgba(182,156,255,0.35), transparent 70%), radial-gradient(180px 90px at 15% 110px, rgba(244,114,208,0.22), transparent 70%), linear-gradient(180deg, #050214, #170a38 55%, #321a5e 85%, #0a0520)' }} />
      {Array.from({ length: 26 }, (_, i) => (
        <i key={i} className="absolute rounded-full bg-white" style={{ left: `${(i * 41 + 9) % 97}%`, top: `${(i * 47 + 5) % 62}%`, width: i % 3 ? 2 : 3, height: i % 3 ? 2 : 3, opacity: i % 2 ? 0.5 : 0.85 }} />
      ))}
      <span className="absolute top-[40px] left-[30%] h-px w-14 -rotate-[28deg] bg-[linear-gradient(90deg,transparent,#fff)]" />
      <div className="relative px-5 pt-4 text-white">
        <div className="flex items-center justify-between">
          <p className="text-[26px] leading-none font-bold tracking-[-0.04em]">Trips.</p>
          <span className="flex size-[30px] items-center justify-center rounded-full bg-[rgba(8,18,48,0.4)] text-[11px] font-semibold">AK</span>
        </div>
        <div className="mt-3 flex gap-3">
          {[0, 1, 2].map((i) => (
            <span key={i} className="block size-[44px] rounded-full p-[2px]" style={{ background: `conic-gradient(${i === 0 ? '#ffd479' : '#fff'} ${i === 0 ? 230 : 360}deg, rgba(255,255,255,0.3) 0)` }}>
              <Cover photo={covers[i]} seed={i + 1} className="size-full rounded-full border-2 border-[rgba(20,10,60,0.6)]" />
            </span>
          ))}
        </div>
        <p className="mt-3 text-[12px] font-semibold opacity-90">Kashmir in winter · In 39 days</p>
        <p className="num text-[36px] leading-[1.05] font-[650] tracking-[-0.04em]">₹89,200</p>
        <span className="mt-1.5 inline-flex h-6 items-center rounded-full bg-white/15 px-2.5 text-[11px] font-bold">You owe ₹4,300</span>
      </div>
      <div className="absolute inset-x-4 bottom-3 rounded-[18px] bg-[rgba(42,29,86,0.95)] p-3 text-white">
        <div className="flex items-center gap-2.5">
          <span className="size-7 rounded-full bg-[rgba(182,156,255,0.25)]" />
          <span className="flex-1 text-[13px] font-semibold">Airport pickup</span>
          <span className="num text-[13px] font-[650]">₹1,200</span>
        </div>
      </div>
    </div>
  )
}

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
 * Choose the app theme. Light skies run from pale morning to dusk, and the dark
 * night theme closes the row. Tapping one only previews it; "Use this theme"
 * applies it and Cancel keeps what you had.
 */
export function SkyPickerSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lightSky, setLightSky, phase, setChoice } = useSky()
  const toast = useToast()
  const current = phase === 'night' ? 'night' : lightSky
  const [sel, setSel] = useState(current)
  const row = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (open) setSel(current)
  }, [open, current])
  // keep the chosen swatch in view as you move through the row
  useEffect(() => {
    const el = row.current?.querySelector<HTMLElement>('[aria-checked="true"]')
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [sel, open])

  const idx = Math.max(0, THEME_OPTIONS.findIndex((t) => t.id === sel))
  const opt = THEME_OPTIONS[idx]
  const same = sel === current
  const go = (d: number) => setSel(THEME_OPTIONS[(idx + d + THEME_OPTIONS.length) % THEME_OPTIONS.length].id)

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Theme"
      footer={
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="lg"
            disabled={same}
            onClick={() => {
              if (sel === 'night') setChoice('night')
              else {
                setLightSky(sel)
                setChoice('day')
              }
              toast.success(`${opt.name} applied`)
              onClose()
            }}
          >
            {same ? 'In use' : 'Use this theme'}
          </Button>
        </div>
      }
    >
      <div key={sel} className="[animation:fade-in_320ms_ease-out_both]">
        {sel === 'night' ? <NightPreview /> : <SkyPreview theme={skyThemeById(sel)} />}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <p className="text-heading">{opt.name}</p>
          <p className="mt-0.5 text-meta text-ink-3">{opt.mood}</p>
        </div>
        <span className="num shrink-0 pt-1 text-caption font-semibold text-ink-3">
          {opt.group} · {idx + 1}/{THEME_OPTIONS.length}
        </span>
      </div>

      <ScrollRow
        role="radiogroup"
        aria-label="Themes"
        className="-mx-6 mt-5 flex gap-2.5 px-6 md:-mx-6"
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'ArrowRight') go(1)
          if (e.key === 'ArrowLeft') go(-1)
        }}
      >
        <div ref={row} className="flex gap-2.5">
          {THEME_OPTIONS.map((t) => {
            const on = t.id === sel
            return (
              <button key={t.id} type="button" role="radio" aria-checked={on} tabIndex={on ? 0 : -1} aria-label={t.name} onClick={() => setSel(t.id)} className="press shrink-0 text-center">
                <span
                  className={cx('relative block rounded-full transition-[width,height,box-shadow] duration-300 ease-[var(--ease-out-expo)]', on ? 'h-[76px] w-[56px] shadow-[0_0_0_3px_var(--haze),0_0_0_5px_var(--accent)]' : 'h-[60px] w-[44px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]')}
                  style={{ background: themeGradient(t), margin: on ? '0 0' : '8px 6px' }}
                >
                  {t.id === current ? <span className="absolute inset-x-0 bottom-1.5 mx-auto size-1.5 rounded-full bg-white" aria-hidden /> : null}
                </span>
              </button>
            )
          })}
          <span aria-hidden className="w-4 shrink-0" />
        </div>
      </ScrollRow>
    </Sheet>
  )
}
