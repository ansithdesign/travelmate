import { NavLink, useNavigate } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { useEffect, useRef, type ReactNode } from 'react'
import type { TripView } from '../../hooks/useTrip'
import { cx } from '../../utils/cx'
import { IconButton } from '../ui/Button'
import { SkyHero } from '../shared/Page'

/** Trip section tabs: quiet text on the sky, the current one in white with a short bar beneath. */
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
    if (el && ref.current) ref.current.scrollTo({ left: Math.max(0, el.offsetLeft - ref.current.offsetLeft - (ref.current.clientWidth - el.clientWidth) / 2) })
  }, [trip.id])
  return (
    <nav
      ref={ref}
      aria-label="Trip sections"
      className={cx('no-scrollbar -mx-5 flex gap-6 overflow-x-auto px-5 max-sm:[mask-image:linear-gradient(90deg,transparent_0,#000_22px,#000_calc(100%-28px),transparent)] sm:mx-0 sm:gap-7 sm:px-0', className)}
    >
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            cx(
              'relative flex h-11 shrink-0 items-center text-body font-semibold transition-colors duration-200',
              'after:absolute after:inset-x-0 after:bottom-0 after:mx-auto after:h-[3px] after:rounded-full after:bg-white after:transition-[width,opacity] after:duration-300',
              isActive ? 'text-sky after:w-5 after:opacity-100' : 'text-white/70 [text-shadow:0_1px_8px_rgb(8_22_70/0.35)] after:w-0 after:opacity-0 hover:text-white',
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
      <TripTabs view={view} className="mt-3" />
    </SkyHero>
  )
}
