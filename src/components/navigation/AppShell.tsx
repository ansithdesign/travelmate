import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Map, Plus, ReceiptText, UserRound, type LucideIcon } from 'lucide-react'
import { useAllTripViews } from '../../hooks/useTrip'
import { useUI } from '../../store/ui'
import { cx } from '../../utils/cx'
import { fmt } from '../../utils/dates'
import { BrandMark } from '../shared/BrandMark'
import { useStore } from '../../store/store'
import { Avatar } from '../ui/Avatar'

const NAV: { to: string; label: string; icon: LucideIcon; match: (p: string) => boolean }[] = [
  { to: '/', label: 'Trips', icon: Map, match: (p) => p === '/' || p.startsWith('/trips') },
  { to: '/expenses', label: 'Expenses', icon: ReceiptText, match: (p) => p.startsWith('/expenses') },
  { to: '/profile', label: 'Profile', icon: UserRound, match: (p) => p.startsWith('/profile') },
]

export function AppShell() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[264px_1fr]">
      <SideRail pathname={pathname} />
      <main className="min-w-0 pb-[calc(72px+env(safe-area-inset-bottom))] lg:pb-0">
        <Outlet />
      </main>
      <TabBar pathname={pathname} />
    </div>
  )
}

function TabBar({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Primary"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/97 backdrop-blur-[2px] lg:hidden"
    >
      <ul className="mx-auto grid h-[64px] max-w-md grid-cols-3">
        {NAV.map(({ to, label, icon: Icon, match }) => {
          const active = match(pathname)
          return (
            <li key={to}>
              <NavLink
                to={to}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium tracking-[0.01em] transition-colors',
                  active ? 'text-forest' : 'text-ink-3 hover:text-ink',
                )}
              >
                <span className={cx('flex h-7 w-12 items-center justify-center rounded-full transition-colors', active && 'bg-forest-50')}>
                  <Icon size={21} strokeWidth={active ? 2.1 : 1.8} aria-hidden />
                </span>
                {label}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function SideRail({ pathname }: { pathname: string }) {
  const views = useAllTripViews()
  const { openTrip } = useUI()
  const { me } = useStore()
  const active = views
    .filter((v) => v.status.phase !== 'completed')
    .sort((a, b) => a.trip.startDate.localeCompare(b.trip.startDate))
  const recent = views
    .filter((v) => v.status.phase === 'completed')
    .sort((a, b) => b.trip.endDate.localeCompare(a.trip.endDate))
    .slice(0, 4)

  return (
    <aside className="sticky top-0 hidden h-dvh flex-col bg-forest-900 text-[#e9efe9] lg:flex">
      <div className="flex h-[72px] items-center gap-2.5 px-6">
        <BrandMark />
        <span className="text-[17px] font-semibold tracking-[-0.02em] text-white">TripMate</span>
      </div>
      <nav aria-label="Primary" className="px-3">
        <ul className="flex flex-col gap-0.5">
          {NAV.map(({ to, label, icon: Icon, match }) => {
            const on = match(pathname)
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  aria-current={on ? 'page' : undefined}
                  className={cx(
                    'flex h-10 items-center gap-3 rounded-[10px] px-3 text-body font-medium transition-colors',
                    on ? 'bg-white/[0.09] text-white' : 'text-[#b9c8be] hover:bg-white/[0.05] hover:text-white',
                  )}
                >
                  <Icon size={19} strokeWidth={1.8} aria-hidden />
                  {label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-8 min-h-0 flex-1 overflow-y-auto px-3">
        {active.length > 0 ? <RailGroup title="On the way" views={active} pathname={pathname} /> : null}
        {recent.length > 0 ? <RailGroup title="Past trips" views={recent} pathname={pathname} /> : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-white/[0.08] p-4">
        <button
          type="button"
          onClick={() => openTrip()}
          className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-amber text-meta font-semibold text-[#2b1d05] transition-colors hover:bg-[#d69728]"
        >
          <Plus size={17} strokeWidth={2.2} aria-hidden />
          New trip
        </button>
        <NavLink to="/profile" className="flex items-center gap-2.5 rounded-[10px] p-1.5 hover:bg-white/[0.05]">
          <Avatar person={me} size={30} />
          <span className="min-w-0">
            <span className="block truncate text-meta font-medium text-white">{me.name}</span>
            <span className="block truncate text-caption text-[#9fb2a6]">{me.email ?? 'Profile and settings'}</span>
          </span>
        </NavLink>
      </div>
    </aside>
  )
}

function RailGroup({ title, views, pathname }: { title: string; views: ReturnType<typeof useAllTripViews>; pathname: string }) {
  return (
    <div className="mb-6">
      <h3 className="px-3 pb-2 text-caption font-medium text-[#8fa597]">{title}</h3>
      <ul className="flex flex-col gap-0.5">
        {views.map(({ trip }) => {
          const on = pathname.startsWith(`/trips/${trip.id}`)
          return (
            <li key={trip.id}>
              <NavLink
                to={`/trips/${trip.id}`}
                className={cx(
                  'flex items-center gap-3 rounded-[10px] px-3 py-2 transition-colors',
                  on ? 'bg-white/[0.09]' : 'hover:bg-white/[0.05]',
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className={cx('block truncate text-meta font-medium', on ? 'text-white' : 'text-[#dce5de]')}>{trip.name}</span>
                  <span className="block truncate text-caption text-[#8fa597]">{fmt.monthYear(trip.startDate)}</span>
                </span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
