import { NavLink, Outlet, useLocation, useMatch } from 'react-router-dom'
import { Coins, House, Plus, Receipt, UserCircle } from '@phosphor-icons/react'
import { useAllTripViews } from '../../hooks/useTrip'
import { useStore } from '../../store/store'
import { useUI } from '../../store/ui'
import { cx } from '../../utils/cx'
import { Sky } from '../sky/Sky'
import { ErrorBoundary } from '../shared/ErrorBoundary'

export function AppShell() {
  const { pathname } = useLocation()
  // Top-level screens and the trip overview get the full sky; sub-screens get the shorter soft band.
  const soft = /^\/trips\/[^/]+\/.+/.test(pathname) || pathname.startsWith('/join')
  return (
    <>
      <Sky soft={soft} />
      <div className="min-h-dvh">
        <main className="flex min-h-dvh min-w-0 flex-col pb-[calc(124px+env(safe-area-inset-bottom))]">
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
    <div>
      <nav aria-label="Primary" className="tab-material safe-bottom fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2">
        <ul className="mx-auto grid h-[84px] max-w-[520px] grid-cols-5 items-start px-2 pt-2">
          {items.map((it, i) =>
            it ? (
              <li key={it.to + it.label}>
                <NavLink
                  to={it.to}
                  aria-label={it.label}
                  aria-current={it.on ? 'page' : undefined}
                  onClick={() => it.on && window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className={cx('relative flex min-h-14 flex-col items-center gap-[3px] pt-2 text-[11px] outline-none transition-colors duration-200 focus-visible:text-accent', it.on ? 'font-semibold text-ink' : 'font-medium text-ink-3 hover:text-ink-2')}
                >
                  <span className={cx('flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-300', it.on ? 'bg-accent-soft text-accent' : '')}>
                    <it.icon size={23} weight={it.on ? 'fill' : 'regular'} aria-hidden />
                  </span>
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
