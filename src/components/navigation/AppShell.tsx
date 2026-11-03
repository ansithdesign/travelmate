import { NavLink, Outlet, useLocation, useMatch } from 'react-router-dom'
import { House, Plus, Receipt, UserCircle, type Icon } from '@phosphor-icons/react'
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
        <main className="min-w-0 pb-[calc(112px+env(safe-area-inset-bottom))] lg:pt-2 lg:pb-10">
          <ErrorBoundary resetKey={pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
        <TabBar pathname={pathname} />
      </div>
    </>
  )
}

/**
 * A floating glass dock of three tabs: the current one expands into a pill with
 * its label, the others stay as quiet icons. Add expense is its own floating
 * button beside the dock. Tapping the current tab scrolls to the top.
 */
function TabBar({ pathname }: { pathname: string }) {
  const { openExpense } = useUI()
  const { data } = useStore()
  const tripMatch = useMatch('/trips/:tripId/*')
  const active = NAV.findIndex((n) => n.match(pathname))

  const tab = ({ to, label, icon: I }: (typeof NAV)[number], i: number) => {
    const on = i === active
    return (
      <NavLink
        key={to}
        to={to}
        aria-label={label}
        aria-current={on ? 'page' : undefined}
        onClick={() => {
          if (on) window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        className={cx(
          'press flex h-12 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/40 text-[14px] font-semibold transition-[background-color,color,padding] duration-300 ease-[var(--ease-out-expo)]',
          on ? 'bg-accent-soft pr-4 pl-3 text-accent-ink max-[359px]:px-0 max-[359px]:w-11' : 'w-11 text-ink-3 hover:text-ink',
        )}
      >
        <I size={24} weight={on ? 'fill' : 'regular'} aria-hidden className="shrink-0" />
        <span className={cx('overflow-hidden whitespace-nowrap transition-[max-width,margin,opacity] duration-300 ease-[var(--ease-out-expo)]', on ? 'ml-2 max-w-[84px] opacity-100 max-[359px]:hidden' : 'ml-0 max-w-0 opacity-0')}>{label}</span>
      </NavLink>
    )
  }

  return (
    <div className="safe-bottom pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-end justify-between gap-3 px-4 pb-3 lg:hidden">
      <nav aria-label="Primary" className="glass-bar pointer-events-auto flex h-16 min-w-0 items-center gap-0.5 rounded-full p-2">
        {NAV.map((n, i) => tab(n, i))}
      </nav>
      <button
        type="button"
        aria-label="Add expense"
        disabled={data.trips.length === 0}
        onClick={() => openExpense({ tripId: tripMatch?.params.tripId })}
        className="group press pointer-events-auto relative flex size-14 shrink-0 items-center justify-center rounded-full text-white min-[390px]:size-16 shadow-[0_14px_30px_-10px_rgba(15,34,56,0.55),0_2px_6px_rgba(15,34,56,0.18)] disabled:opacity-50"
        style={{ background: 'radial-gradient(120% 120% at 30% 15%, #2d5f9a 0%, var(--midnight) 55%, #0a1626 100%)' }}
      >
        <span aria-hidden className="absolute inset-[3px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.16),transparent_55%)]" />
        <Plus size={26} weight="bold" aria-hidden className="relative transition-transform duration-300 ease-[var(--ease-out-expo)] group-active:rotate-90" />
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
