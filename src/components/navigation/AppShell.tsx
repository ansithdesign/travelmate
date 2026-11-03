import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useMatch } from 'react-router-dom'
import { Coins, House, Plus, Receipt, UserCircle, type Icon } from '@phosphor-icons/react'
import type { CategoryId } from '../../types'
import { CategoryIcon } from '../icons/CategoryIcon'
import { useAllTripViews } from '../../hooks/useTrip'
import { useStore } from '../../store/store'
import { useUI } from '../../store/ui'
import { useSky, SKY_LABEL } from '../../store/sky'
import { cx } from '../../utils/cx'
import { fmt } from '../../utils/dates'
import { BrandMark } from '../shared/BrandMark'
import { Avatar } from '../ui/Avatar'
import { PhotoCard } from '../ui/Cover'
import { Sky } from '../sky/Sky'
import { ErrorBoundary } from '../shared/ErrorBoundary'

const NAV: { to: string; label: string; icon: Icon; match: (p: string) => boolean }[] = [
  { to: '/', label: 'Trips', icon: House, match: (p) => p === '/' || p.startsWith('/trips') },
  { to: '/expenses', label: 'Expenses', icon: Receipt, match: (p) => p.startsWith('/expenses') },
  { to: '/profile', label: 'Profile', icon: UserCircle, match: (p) => p.startsWith('/profile') },
]

export function AppShell() {
  const { pathname } = useLocation()
  // Top-level screens and the trip overview get the full sky; sub-screens get the shorter soft band.
  const soft = /^\/trips\/[^/]+\/.+/.test(pathname) || pathname.startsWith('/join')
  return (
    <>
      <Sky soft={soft} />
      <div className="min-h-dvh lg:pl-[296px]">
        <SideRail pathname={pathname} />
        <main className="min-w-0 pb-[calc(124px+env(safe-area-inset-bottom))] lg:pt-2 lg:pb-10">
          <ErrorBoundary resetKey={pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
        <TabBar pathname={pathname} />
      </div>
    </>
  )
}

const ARC: { id: CategoryId; label: string; angle: number }[] = [
  { id: 'food', label: 'Food', angle: -70 },
  { id: 'cabs', label: 'Cabs', angle: -35 },
  { id: 'drinks', label: 'Drinks', angle: 0 },
  { id: 'stay', label: 'Stay', angle: 35 },
  { id: 'activities', label: 'Activities', angle: 70 },
]

/**
 * A bar with four tabs and a raised Add button in the middle. Tapping Add fans
 * the most common categories out in an arc: tap one and the expense form opens
 * with it chosen. Tapping the current tab scrolls to the top.
 */
function TabBar({ pathname }: { pathname: string }) {
  const { openExpense } = useUI()
  const { data } = useStore()
  const views = useAllTripViews()
  const tripMatch = useMatch('/trips/:tripId/*')
  const [fan, setFan] = useState(false)
  const tripId = tripMatch?.params.tripId
  const settleTrip = tripId ?? views.find((v) => v.status.phase !== 'completed')?.trip.id ?? views[0]?.trip.id
  const settleTo = settleTrip ? `/trips/${settleTrip}/settle` : '/'
  const onSettle = pathname.endsWith('/settle')

  useEffect(() => setFan(false), [pathname])
  useEffect(() => {
    if (!fan) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setFan(false)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [fan])

  const items = [
    { to: '/', label: 'Trips', icon: House, on: !onSettle && (pathname === '/' || pathname.startsWith('/trips')) },
    { to: '/expenses', label: 'Expenses', icon: Receipt, on: pathname.startsWith('/expenses') },
    null,
    { to: settleTo, label: 'Settle', icon: Coins, on: onSettle },
    { to: '/profile', label: 'Profile', icon: UserCircle, on: pathname.startsWith('/profile') },
  ]

  return (
    <div className="lg:hidden">
      {fan ? (
        <>
          <button type="button" aria-label="Close" onClick={() => setFan(false)} className="fixed inset-0 z-40 bg-[rgba(8,20,40,0.42)] backdrop-blur-[3px] [animation:fade-in_200ms_ease-out_both]" />
          <p className="pointer-events-none fixed inset-x-0 bottom-[calc(330px+env(safe-area-inset-bottom))] z-50 text-center text-[14px] font-semibold text-white [animation:fade-in_300ms_ease-out_both]">Pick a category, then type the amount</p>
          {ARC.map((c, i) => {
            const r = 168
            const rad = (c.angle * Math.PI) / 180
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setFan(false)
                  openExpense({ tripId, category: c.id })
                }}
                className="fixed z-50 flex w-[72px] flex-col items-center text-center [animation:pop_360ms_var(--ease-out-expo)_both]"
                style={{ left: `calc(50% + ${r * Math.sin(rad) - 36}px)`, bottom: `calc(${100 + r * Math.cos(rad) - 36}px + env(safe-area-inset-bottom))`, animationDelay: `${i * 35}ms` }}
              >
                <span className="flex size-[72px] items-center justify-center rounded-full bg-[var(--haze)] shadow-[var(--shadow-float)]">
                  <CategoryIcon id={c.id} size={50} />
                </span>
                <span className="mt-1.5 text-caption font-semibold text-white">{c.label}</span>
              </button>
            )
          })}
        </>
      ) : null}

      <nav aria-label="Primary" className="tab-material safe-bottom fixed inset-x-0 bottom-0 z-40">
        <ul className="mx-auto grid h-[84px] max-w-[520px] grid-cols-5 items-start px-2 pt-2">
          {items.map((it, i) =>
            it ? (
              <li key={it.to + it.label}>
                <NavLink
                  to={it.to}
                  aria-label={it.label}
                  aria-current={it.on ? 'page' : undefined}
                  onClick={() => it.on && window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className={cx('relative flex min-h-14 flex-col items-center gap-[3px] pt-2 text-[11px] outline-none transition-colors duration-200 focus-visible:text-accent', it.on ? 'font-semibold text-accent' : 'font-medium text-ink-3 hover:text-ink-2')}
                >
                  {it.on ? <span aria-hidden className="absolute top-[-8px] h-[3px] w-9 rounded-b-full bg-accent" /> : null}
                  <it.icon size={24} weight={it.on ? 'fill' : 'regular'} aria-hidden />
                  {it.label}
                </NavLink>
              </li>
            ) : (
              <li key={`gap-${i}`} aria-hidden />
            ),
          )}
        </ul>
      </nav>

      <button
        type="button"
        aria-label={fan ? 'Close add menu' : 'Add expense'}
        aria-expanded={fan}
        disabled={data.trips.length === 0}
        onClick={() => setFan((v) => !v)}
        className="press fixed bottom-[calc(46px+env(safe-area-inset-bottom))] left-1/2 z-[60] flex size-[66px] -translate-x-1/2 items-center justify-center rounded-full shadow-[0_0_0_6px_var(--haze),0_14px_26px_-8px_rgba(15,34,56,0.55)] transition-[background-color,color] duration-200 disabled:opacity-50"
        style={fan ? { background: 'var(--haze)', color: 'var(--ink)' } : { background: 'var(--midnight)', color: '#fff' }}
      >
        <Plus size={30} weight="bold" aria-hidden className={cx('transition-transform duration-300 ease-[var(--ease-out-expo)]', fan && 'rotate-45')} />
      </button>
    </div>
  )
}

/** Desktop: a frosted glass rail on the sky. */
function SideRail({ pathname }: { pathname: string }) {
  const views = useAllTripViews()
  const { openTrip, openExpense } = useUI()
  const { me, data } = useStore()
  const { phase } = useSky()
  const tripMatch = useMatch('/trips/:tripId/*')
  const active = views.filter((v) => v.status.phase !== 'completed').sort((a, b) => a.trip.startDate.localeCompare(b.trip.startDate))
  const recent = views
    .filter((v) => v.status.phase === 'completed')
    .sort((a, b) => b.trip.endDate.localeCompare(a.trip.endDate))
    .slice(0, 4)

  return (
    <aside className="panel-strong fixed top-4 bottom-4 left-4 z-30 hidden w-[264px] flex-col overflow-hidden rounded-[26px] lg:flex">
      <div className="flex h-[76px] items-center gap-3 px-6">
        <BrandMark size={32} />
        <div>
          <p className="text-[17px] leading-5 font-semibold tracking-[-0.02em]">TripMate</p>
          <p className="text-caption text-ink-3">{SKY_LABEL[phase]} theme</p>
        </div>
      </div>
      <nav aria-label="Primary" className="px-3">
        <ul className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: I, match }) => {
            const on = match(pathname)
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  aria-current={on ? 'page' : undefined}
                  className={cx('press flex h-11 items-center gap-3 rounded-full px-4 text-body font-semibold', on ? 'luminous' : 'text-ink-2 hover:bg-well')}
                >
                  <I size={21} weight={on ? 'fill' : 'regular'} aria-hidden />
                  {label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-7 min-h-0 flex-1 overflow-y-auto px-3">
        {active.length > 0 ? <RailGroup title="Coming up" views={active} pathname={pathname} /> : null}
        {recent.length > 0 ? <RailGroup title="Past trips" views={recent} pathname={pathname} /> : null}
      </div>

      <div className="flex flex-col gap-2 p-3">
        <button
          type="button"
          disabled={data.trips.length === 0}
          onClick={() => openExpense({ tripId: tripMatch?.params.tripId })}
          className="luminous press flex h-12 items-center justify-center gap-2 rounded-full text-[14px] font-semibold disabled:opacity-50"
        >
          <Plus size={17} weight="bold" aria-hidden />
          Add expense
        </button>
        <button type="button" onClick={() => openTrip()} className="glass-control press flex h-12 items-center justify-center gap-2 rounded-full text-[14px] font-semibold hover:bg-solid">
          New trip
        </button>
        <NavLink to="/profile" className="mt-1 flex items-center gap-3 rounded-[20px] p-2 hover:bg-well">
          <Avatar person={me} size={34} />
          <span className="min-w-0">
            <span className="block truncate text-meta font-semibold">{me.name}</span>
            <span className="block truncate text-caption text-ink-3">{me.email ?? 'Profile and settings'}</span>
          </span>
        </NavLink>
      </div>
    </aside>
  )
}

function RailGroup({ title, views, pathname }: { title: string; views: ReturnType<typeof useAllTripViews>; pathname: string }) {
  return (
    <div className="mb-6">
      <h3 className="px-4 pb-2 text-meta font-medium text-ink-3">{title}</h3>
      <ul className="flex flex-col gap-0.5">
        {views.map(({ trip }, i) => {
          const on = pathname.startsWith(`/trips/${trip.id}`)
          return (
            <li key={trip.id}>
              <NavLink to={`/trips/${trip.id}`} className={cx('press flex items-center gap-3 rounded-[18px] px-2 py-1.5', on ? 'bg-accent-soft' : 'hover:bg-well')}>
                <PhotoCard photo={trip.cover} seed={i + 1} radius={10} className="size-9 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-meta font-semibold">{trip.name}</span>
                  <span className="block truncate text-caption text-ink-3">{fmt.monthYear(trip.startDate)}</span>
                </span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
