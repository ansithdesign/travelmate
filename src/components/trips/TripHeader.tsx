import { NavLink } from 'react-router-dom'
import { useEffect, useRef, type ReactNode } from 'react'
import type { TripView } from '../../hooks/useTrip'
import { cx } from '../../utils/cx'
import { NavHeader } from '../shared/Page'

/** Trip sections as a scrolling chip row. The current one is the selected midnight chip. */
export function TripTabs({ view, className }: { view: TripView; className?: string }) {
  const { trip, status } = view
  const tabs = [
    { to: `/trips/${trip.id}`, label: 'Overview', end: true },
    { to: `/trips/${trip.id}/expenses`, label: 'Expenses' },
    { to: `/trips/${trip.id}/settle`, label: 'Settle up' },
    { to: `/trips/${trip.id}/details`, label: 'Plans' },
    ...(status.phase === 'completed' ? [{ to: `/trips/${trip.id}/journal`, label: 'Journal' }] : []),
  ]
  const ref = useRef<HTMLElement>(null)
  // Keep the current section visible when the row scrolls on narrow screens.
  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>('[aria-current="page"]')
    if (el && ref.current) ref.current.scrollTo({ left: Math.max(0, el.offsetLeft - ref.current.offsetLeft - (ref.current.clientWidth - el.clientWidth) / 2) })
  }, [trip.id])
  return (
    <nav ref={ref} aria-label="Trip sections" className={cx('no-scrollbar -mx-6 flex gap-2.5 overflow-x-auto px-6 py-1 [mask-image:linear-gradient(90deg,#000_calc(100%-40px),transparent)] sm:mx-0 sm:px-0 sm:[mask-image:none]', className)}>
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            cx(
              'press flex h-9 shrink-0 items-center rounded-full px-4 text-[14px] font-medium whitespace-nowrap',
              isActive ? 'bg-white font-semibold text-[#14224a] shadow-[0_8px_18px_-10px_rgba(8,20,60,0.5)]' : 'bg-white/18 text-white/90 hover:bg-white/25',
            )
          }
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}

/** Sub-screen header for a trip: back to the trip, the trip's name centred, then the section chips. */
export function TripSkyHeader({ view, actions, tabs = true }: { view: TripView; title?: string; actions?: ReactNode; tabs?: boolean }) {
  return (
    <NavHeader title={view.trip.name} back={`/trips/${view.trip.id}`} actions={actions}>
      {tabs ? (
        <div className="mx-auto w-full max-w-[1080px] px-6 pb-3 lg:px-10">
          <TripTabs view={view} />
        </div>
      ) : null}
    </NavHeader>
  )
}
