import { NavLink, useNavigate } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { useEffect, useRef, type ReactNode } from 'react'
import type { TripView } from '../../hooks/useTrip'
import { cx } from '../../utils/cx'
import { IconButton } from '../ui/Button'
import { SkyHero } from '../shared/Page'

/** Trip section tabs, set as glass pills on the sky. */
export function TripTabs({ view, className }: { view: TripView; className?: string }) {
  const { trip, status } = view
  const tabs = [
    { to: `/trips/${trip.id}`, label: 'Overview', end: true },
    { to: `/trips/${trip.id}/expenses`, label: 'Expenses' },
    { to: `/trips/${trip.id}/settle`, label: 'Settle up' },
    { to: `/trips/${trip.id}/people`, label: 'People' },
    { to: `/trips/${trip.id}/details`, label: 'Details' },
    ...(status.phase === 'completed' ? [{ to: `/trips/${trip.id}/journal`, label: 'Journal' }] : []),
  ]
  const ref = useRef<HTMLElement>(null)
  // Keep the current section visible when the strip scrolls on narrow screens.
  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>('[aria-current="page"]')
    if (el && ref.current) ref.current.scrollTo({ left: Math.max(0, el.offsetLeft - 20) })
  }, [trip.id])
  return (
    <nav
      ref={ref}
      aria-label="Trip sections"
      className={cx(
        'no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:w-fit sm:max-w-full sm:gap-1 sm:rounded-full sm:p-1 sm:px-1 sm:[background:linear-gradient(180deg,rgb(255_255_255/0.12),rgb(255_255_255/0.03)),rgb(8_22_76/0.5)] sm:shadow-[inset_0_1px_0_rgb(255_255_255/0.32),inset_0_0_0_1px_rgb(255_255_255/0.16)] sm:backdrop-blur-[18px]',
        className,
      )}
    >
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            cx(
              'press flex h-9 shrink-0 items-center rounded-full px-4 text-meta font-semibold',
              isActive ? 'bg-white text-[#0c1736] shadow-[0_6px_16px_-8px_rgb(8_20_60/0.5)]' : 'glass-control text-white sm:bg-none sm:shadow-none sm:backdrop-blur-none sm:[background:transparent] hover:bg-white/15',
            )
          }
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}

/** Compact sky header for trip sub-pages: back, trip name, page title, tabs. */
export function TripSkyHeader({ view, title, actions }: { view: TripView; title: string; actions?: ReactNode }) {
  const navigate = useNavigate()
  return (
    <SkyHero className="pt-[max(14px,env(safe-area-inset-top))] pb-5 lg:pt-8">
      <div className="flex items-center gap-2">
        <IconButton icon={ArrowLeft} label="Back to trip" tone="sky" onClick={() => navigate(`/trips/${view.trip.id}`)} />
        <div className="min-w-0 flex-1 px-1">
          <p className="text-sky-2 truncate text-meta font-medium">{view.trip.name}</p>
          <h1 className="text-sky truncate text-display leading-8">{title}</h1>
        </div>
        {actions}
      </div>
      <TripTabs view={view} className="mt-5" />
    </SkyHero>
  )
}
