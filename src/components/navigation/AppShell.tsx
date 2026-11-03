import { NavLink, Outlet, useLocation, useMatch } from 'react-router-dom'
import { Coins, House, Plus, Receipt, UserCircle, type Icon } from '@phosphor-icons/react'
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
        <main className="flex min-h-dvh min-w-0 flex-col pb-[calc(124px+env(safe-area-inset-bottom))] lg:pt-2 lg:pb-10">
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
 * A bar with four tabs and a raised Add button in the middle. Tapping Add opens
 * the expense form opens straight away. Tapping the current tab scrolls to the top.
 */
function TabBar({ pathname }: { pathname: string }) {
  const { openExpense } = useUI()
  const { data } = useStore()
  const views = useAllTripViews()
  const tripMatch = useMatch('/trips/:tripId/*')
  const tripId = tripMatch?.params.tripId
  const settleTrip = tripId ?? views.find((v) => v.status.phase !== 'completed')?.trip.id ?? views[0]?.trip.id
  const settleTo = settleTrip ? `/trips/${settleTrip}/settle` : '/'
  const onSettle = pathname.endsWith('/settle')

  const items = [
    { to: '/', label: 'Trips', icon: House, on: !onSettle && (pathname === '/' || pathname.startsWith('/trips')) },
    { to: '/expenses', label: 'Expenses', icon: Receipt, on: pathname.startsWith('/expenses') },
    null,
    { to: settleTo, label: 'Settle', icon: Coins, on: onSettle },
    { to: '/profile', label: 'Profile', icon: UserCircle, on: pathname.startsWith('/profile') },
  ]

  return (
    <div className="lg:hidden">
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
        aria-label="Add expense"
        disabled={data.trips.length === 0}
        onClick={() => openExpense({ tripId })}
        className="cta press fixed bottom-[calc(46px+env(safe-area-inset-bottom))] left-1/2 z-40 flex size-[66px] -translate-x-1/2 items-center justify-center rounded-full ring-[6px] ring-[var(--haze)] disabled:opacity-50"
      >
        <Plus size={30} weight="bold" aria-hidden />
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
