import { useLayoutEffect, useRef, useState } from 'react'
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
  return (
    <>
      <Sky />
      <div className="min-h-dvh lg:pl-[296px]">
        <SideRail pathname={pathname} />
        <main className="min-w-0 lg:pt-2">
          <ErrorBoundary resetKey={pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
        <TabBar pathname={pathname} />
      </div>
    </>
  )
}

/** Floating glass capsule with a sliding indicator, plus a separate add button. */
function TabBar({ pathname }: { pathname: string }) {
  const { openExpense } = useUI()
  const { data } = useStore()
  const tripMatch = useMatch('/trips/:tripId/*')
  const list = useRef<HTMLUListElement>(null)
  const active = NAV.findIndex((n) => n.match(pathname))
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null)

  useLayoutEffect(() => {
    const el = list.current?.children[active] as HTMLElement | undefined
    if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth })
  }, [active])

  return (
    <div className="safe-bottom pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-end justify-center gap-3 px-4 pb-3 lg:hidden">
      <nav aria-label="Primary" className="glass-bar pointer-events-auto rounded-full p-1.5">
        <ul ref={list} className="relative flex">
          {pill && active >= 0 ? (
            <span
              aria-hidden
              className="absolute top-0 bottom-0 rounded-full bg-accent-soft shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-accent)_18%,transparent)] transition-[left,width] duration-500 ease-[var(--ease-glide)]"
              style={{ left: pill.x, width: pill.w }}
            />
          ) : null}
          {NAV.map(({ to, label, icon: I }, i) => {
            const on = i === active
            return (
              <li key={to} className="relative">
                <NavLink
                  to={to}
                  aria-current={on ? 'page' : undefined}
                  className={cx('press flex h-[52px] w-[76px] flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-semibold', on ? 'text-accent' : 'text-ink-3 hover:text-ink')}
                >
                  <I size={24} weight={on ? 'fill' : 'regular'} aria-hidden />
                  {label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
      <button
        type="button"
        aria-label="Add expense"
        disabled={data.trips.length === 0}
        onClick={() => openExpense({ tripId: tripMatch?.params.tripId })}
        className="press pointer-events-auto flex size-[64px] items-center justify-center rounded-full text-white disabled:opacity-50 bg-[radial-gradient(circle_at_35%_25%,#8fbaff_0%,#3b7bff_45%,#1d4fd8_100%)] shadow-[inset_0_1px_0_rgb(255_255_255/0.5),inset_0_-4px_10px_rgb(10_30_110/0.35),0_14px_30px_-10px_rgb(29_79_216/0.75)]"
      >
        <Plus size={28} weight="bold" aria-hidden />
      </button>
    </div>
  )
}

/** Desktop: a floating dark-glass rail over the sky. */
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
    <aside className="on-sky fixed top-4 bottom-4 left-4 z-30 hidden w-[264px] flex-col overflow-hidden rounded-[30px] bg-[#0a1640]/30 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18),inset_0_0_0_1px_rgb(255_255_255/0.12),0_24px_60px_-24px_rgb(4_10_40/0.6)] backdrop-blur-2xl backdrop-saturate-150 lg:flex">
      <div className="flex h-[76px] items-center gap-3 px-6">
        <BrandMark size={32} />
        <div>
          <p className="text-[17px] leading-5 font-semibold tracking-[-0.02em]">TripMate</p>
          <p className="text-caption text-white/65">{SKY_LABEL[phase]} sky</p>
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
                  className={cx('press flex h-11 items-center gap-3 rounded-full px-4 text-body font-semibold', on ? 'bg-white text-[#0c1736] shadow-[0_8px_22px_-10px_rgb(0_0_0/0.4)]' : 'text-white/85 hover:bg-white/10')}
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
          className="luminous press flex h-11 items-center justify-center gap-2 rounded-full text-meta font-semibold disabled:opacity-50"
        >
          <Plus size={17} weight="bold" aria-hidden />
          Add expense
        </button>
        <button type="button" onClick={() => openTrip()} className="press flex h-11 items-center justify-center gap-2 rounded-full bg-white/12 text-meta font-semibold text-white hover:bg-white/20">
          New trip
        </button>
        <NavLink to="/profile" className="mt-1 flex items-center gap-3 rounded-[20px] p-2 hover:bg-white/10">
          <Avatar person={me} size={34} />
          <span className="min-w-0">
            <span className="block truncate text-meta font-semibold">{me.name}</span>
            <span className="block truncate text-caption text-white/65">{me.email ?? 'Profile and settings'}</span>
          </span>
        </NavLink>
      </div>
    </aside>
  )
}

function RailGroup({ title, views, pathname }: { title: string; views: ReturnType<typeof useAllTripViews>; pathname: string }) {
  return (
    <div className="mb-6">
      <h3 className="px-4 pb-2 text-caption font-semibold text-white/60">{title}</h3>
      <ul className="flex flex-col gap-0.5">
        {views.map(({ trip }, i) => {
          const on = pathname.startsWith(`/trips/${trip.id}`)
          return (
            <li key={trip.id}>
              <NavLink to={`/trips/${trip.id}`} className={cx('press flex items-center gap-3 rounded-[18px] px-2 py-1.5', on ? 'bg-white/16' : 'hover:bg-white/8')}>
                <PhotoCard photo={trip.cover} seed={i + 1} radius={10} className="size-9 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-meta font-semibold">{trip.name}</span>
                  <span className="block truncate text-caption text-white/60">{fmt.monthYear(trip.startDate)}</span>
                </span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
