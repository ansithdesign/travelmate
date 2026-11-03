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
    if (el && ref.current) ref.current.scrollTo({ left: el.offsetLeft - ref.current.clientWidth / 2 + el.clientWidth / 2 })
  }, [trip.id])
  return (
    <nav
      ref={ref}
      aria-label="Trip sections"
      className={cx(
        'no-scrollbar glass-control flex w-fit max-w-full gap-1 overflow-x-auto rounded-full p-1 max-sm:[mask-image:linear-gradient(90deg,transparent_0,#000_14px,#000_calc(100%-22px),transparent)]',
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
              isActive ? 'bg-white text-[#0c1736] shadow-[0_6px_16px_-8px_rgb(8_20_60/0.5)]' : 'text-sky-2 hover:bg-white/15',
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
