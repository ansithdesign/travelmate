import { NavLink, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import type { TripView } from '../../hooks/useTrip'
import { cx } from '../../utils/cx'
import { IconButton } from '../ui/Button'

/** Sticky bar used on trip sub-pages: back, title, and the trip's section tabs. */
export function TripSubnav({ view, title, actions }: { view: TripView; title?: string; actions?: ReactNode }) {
  const navigate = useNavigate()
  const { trip } = view
  return (
    <div className="sticky top-0 z-30 border-b border-line bg-ground/95 backdrop-blur-[3px]">
      <div className="mx-auto flex h-14 max-w-[1080px] items-center gap-1 px-2 sm:px-4 lg:px-8">
        <IconButton icon={ArrowLeft} label="Back to trips" onClick={() => navigate('/')} />
        <div className="min-w-0 flex-1 px-1">
          <p className="truncate text-heading">{title ?? trip.name}</p>
        </div>
        {actions}
      </div>
      <TripTabs view={view} />
    </div>
  )
}

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

  return (
      <nav aria-label="Trip sections" className={cx('no-scrollbar mx-auto flex max-w-[1080px] gap-1 overflow-x-auto px-4 lg:px-8', className)}>
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              cx(
                'relative flex h-10 shrink-0 items-center px-2.5 text-meta font-medium transition-colors',
                isActive ? 'text-ink after:absolute after:inset-x-2.5 after:bottom-0 after:h-[2px] after:rounded-full after:bg-forest' : 'text-ink-3 hover:text-ink',
              )
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
  )
}

/** Page container used under the subnav. */
export function TripPage({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <div className={cx('mx-auto w-full px-4 pt-5 pb-10 sm:px-6 lg:px-8 lg:pt-8', wide ? 'max-w-[1080px]' : 'max-w-[760px]')}>{children}</div>
}
