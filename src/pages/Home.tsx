import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretRight, MagnifyingGlass, Plus, X } from '@phosphor-icons/react'
import { phaseLabel } from '../components/trips/status'
import { DotMap, fitView, project } from '../components/home/WorldMap'
import { BrandMark } from '../components/shared/BrandMark'
import { Cover } from '../components/ui/Cover'
import { coordsFor } from '../data/destinations'
import { useAllTripViews } from '../hooks/useTrip'
import { useStore } from '../store/store'
import { useUI } from '../store/ui'
import { cx } from '../utils/cx'
import { firstName } from '../utils/id'

const NAV_H = 96

/** Nudge markers apart so close trips (two in the same region) can each be tapped. */
function spread(pts: [number, number][], w: number): [number, number][] {
  const p = pts.map(([x, y]) => [x, y] as [number, number])
  for (let it = 0; it < 40; it++) {
    for (let i = 0; i < p.length; i++) {
      for (let j = i + 1; j < p.length; j++) {
        const dx = p[j][0] - p[i][0]
        const dy = p[j][1] - p[i][1]
        const d = Math.hypot(dx, dy) || 0.01
        if (d < 46) {
          const push = (46 - d) / 2
          const ux = dx === 0 && dy === 0 ? 1 : dx / d
          const uy = dx === 0 && dy === 0 ? 0 : dy / d
          p[i][0] -= ux * push
          p[i][1] -= uy * push
          p[j][0] += ux * push
          p[j][1] += uy * push
        }
      }
    }
  }
  return p.map(([x, y]) => [Math.min(Math.max(x, 40), w - 40), y])
}

export function Home() {
  const views = useAllTripViews()
  const { openTrip } = useUI()
  const navigate = useNavigate()
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 390, h: 760 })
  const [picked, setPicked] = useState<string | null>(null)
  const [list, setList] = useState(false)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    setSize({ w: el.clientWidth, h: el.clientHeight })
    ro.observe(el)
    return () => ro.disconnect()
  }, [views.length])

  // Newest at the top: what is coming up first, then the journal.
  const ordered = useMemo(() => [...views].sort((a, b) => b.trip.startDate.localeCompare(a.trip.startDate)), [views])

  if (views.length === 0) return <FirstRun />

  const placed = ordered
    .map((v) => ({ v, at: v.trip.lat !== undefined && v.trip.lon !== undefined ? { lat: v.trip.lat, lon: v.trip.lon } : coordsFor(v.trip.destination) }))
    .filter((x): x is { v: (typeof ordered)[number]; at: { lat: number; lon: number } } => !!x.at)
  const chosen = ordered.find((v) => v.trip.id === picked)
  const mapTop = 88
  const peekTop = size.h - NAV_H - (chosen ? 150 : 150)
  const mapH = Math.max(220, peekTop - mapTop - 20)
  const view = fitView(placed.map((x) => x.at), size.w, mapH)
  const open = (id: string) => navigate(`/trips/${id}`)

  return (
    <div ref={box} className="relative -mb-[calc(124px+env(safe-area-inset-bottom))] h-dvh overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,var(--sky-2),var(--sky-3)_60%,var(--sky-2))]" />
      <div className="absolute left-0" style={{ top: mapTop, width: size.w, height: mapH }}>
        <DotMap view={view} />
        {spread(placed.map(({ at }) => project(view, at.lon, at.lat)), size.w).map(([x, y], i) => {
          const { v } = placed[i]
          const on = v.trip.id === picked
          const sz = on ? 52 : 38
          return (
            <button
              key={v.trip.id}
              type="button"
              onClick={() => (on ? open(v.trip.id) : (setPicked(v.trip.id), setList(false)))}
              aria-label={on ? `Open ${v.trip.name}` : v.trip.name}
              aria-pressed={on}
              className="press absolute -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-300"
              style={{ left: x, top: y, zIndex: on ? 5 : 1 }}
            >
              <span
                className={cx('block overflow-hidden rounded-full transition-[width,height,box-shadow] duration-300 ease-[var(--ease-out-expo)]', on ? 'shadow-[0_0_0_3px_#ffd479,0_10px_20px_-6px_rgba(5,20,50,0.7)]' : 'shadow-[0_0_0_3px_#fff,0_8px_16px_-6px_rgba(5,20,50,0.6)]')}
                style={{ width: sz, height: sz }}
              >
                <Cover photo={v.trip.cover} seed={i + 1} className="size-full rounded-full" />
              </span>
            </button>
          )
        })}
      </div>

      {/* A floating pill on top: what this page is, and a way to add a trip */}
      <div className="absolute inset-x-4 top-[max(18px,env(safe-area-inset-top))] z-[6] flex h-[50px] items-center gap-2.5 rounded-full bg-panel-strong pr-1.5 pl-[18px] shadow-[var(--shadow-float)]">
        <MagnifyingGlass size={18} weight="bold" className="shrink-0 text-ink-2" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14.5px] leading-[18px] font-semibold">Your trips</span>
          <span className="block truncate text-[12px] leading-[14px] text-ink-3">
            {ordered.length} {ordered.length === 1 ? 'trip' : 'trips'} · anywhere
          </span>
        </span>
        <button type="button" onClick={() => openTrip()} aria-label="Plan a new trip" className="press flex size-[38px] shrink-0 items-center justify-center rounded-full bg-well text-ink">
          <Plus size={17} weight="bold" aria-hidden />
        </button>
      </div>

      {/* The sheet over the map */}
      <div
        className="absolute inset-x-0 bottom-0 z-[5] overflow-hidden rounded-t-[28px] bg-haze shadow-[0_-18px_40px_-22px_rgba(5,20,50,0.55)] transition-[top] duration-500 ease-[var(--ease-out-expo)]"
        style={{ top: list ? 92 : peekTop }}
      >
        <button type="button" onClick={() => setList((l) => !l)} aria-label={list ? 'Lower the sheet' : 'Lift the sheet'} aria-expanded={list} className="flex w-full justify-center pt-2.5 pb-2">
          <span className="h-[5px] w-10 rounded-full bg-line-strong" />
        </button>
        <p className="mb-2.5 text-center text-[14.5px] font-bold">{chosen && !list ? chosen.trip.destination : `${ordered.length} ${ordered.length === 1 ? 'trip' : 'trips'}`}</p>
        <div className={cx('absolute inset-x-0 top-[62px] bottom-0 no-scrollbar', list ? 'overflow-y-auto' : 'overflow-hidden')}>
          {list ? (
            <ul className="px-[18px] pb-[160px]">
              {ordered.map((v, i) => (
                <li key={v.trip.id}>
                  <button type="button" onClick={() => open(v.trip.id)} className="press mb-[18px] block w-full text-left">
                    <span className="relative block h-[196px] overflow-hidden rounded-[24px]">
                      <Cover photo={v.trip.cover} seed={i + 1} className="size-full" />
                      <span className="absolute top-3 right-3 flex size-[34px] items-center justify-center rounded-full bg-white/90 text-[#14224a]">
                        <CaretRight size={14} weight="bold" aria-hidden />
                      </span>
                    </span>
                    <span className="block px-0.5 pt-2.5">
                      <span className="block text-[16px] font-semibold">{v.trip.name}</span>
                      <span className="block text-[13.5px] text-ink-3">
                        {v.trip.destination} · {phaseLabel(v.trip, v.status)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : chosen ? (
            <div className="px-4">
              <div className="panel-strong flex items-center gap-3 rounded-[24px] p-2.5">
                <button type="button" onClick={() => open(chosen.trip.id)} className="press flex min-w-0 flex-1 items-center gap-3 text-left" aria-label={`Open ${chosen.trip.name}`}>
                  <Cover photo={chosen.trip.cover} seed={1} className="size-[72px] shrink-0 rounded-[18px]" />
                  <span className="min-w-0">
                    <span className="block truncate text-[16px] font-semibold">{chosen.trip.name}</span>
                    <span className="block truncate text-[13px] text-ink-3">
                      {chosen.trip.destination} · {phaseLabel(chosen.trip, chosen.status)}
                    </span>
                  </span>
                </button>
                <button type="button" onClick={() => setPicked(null)} aria-label="Close" className="press flex size-8 shrink-0 items-center justify-center self-start rounded-full bg-well">
                  <X size={14} weight="bold" aria-hidden />
                </button>
              </div>
            </div>
          ) : (
            <div className="px-[18px]">
              <Cover photo={ordered[0].trip.cover} seed={1} className="h-[120px] rounded-[24px]" />
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setList((l) => !l)}
        className="press absolute left-1/2 z-[7] flex h-11 -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-[18px] text-[14px] font-semibold whitespace-nowrap text-[var(--on-ink)] shadow-[0_14px_26px_-10px_rgba(5,20,50,0.7)]"
        style={{ top: list ? size.h - NAV_H - 62 : peekTop - 58 }}
      >
        {list ? 'Map' : 'List'}
      </button>
    </div>
  )
}

function FirstRun() {
  const { me, resetDemo } = useStore()
  const { openTrip } = useUI()
  return (
    <div className="px-4 pt-[max(16px,env(safe-area-inset-top))] lg:px-10 lg:pt-8">
      <section className="tone-ink mx-auto flex min-h-[78dvh] max-w-[560px] flex-col justify-end rounded-[30px] px-6 pt-16 pb-6">
        <BrandMark size={44} />
        <h1 className="mt-6 text-hero">Welcome, {firstName(me.name)}</h1>
        <p className="mt-3 text-body text-white/75">
          Make a trip, invite the people going, and add expenses as they happen. TripMate works out who owes whom, and keeps every trip as a journal when you are home.
        </p>
        <div className="mt-8 flex flex-col gap-2">
          <button type="button" onClick={() => openTrip()} className="press flex h-14 items-center justify-center gap-2 rounded-full bg-white text-base font-semibold text-[#0d1b2a]">
            <Plus size={18} weight="bold" aria-hidden />
            Create your first trip
          </button>
          <button type="button" onClick={resetDemo} className="press flex h-14 items-center justify-center rounded-full bg-white/14 text-base font-semibold text-white backdrop-blur-[16px]">
            Explore sample trips
          </button>
        </div>
      </section>
    </div>
  )
}
