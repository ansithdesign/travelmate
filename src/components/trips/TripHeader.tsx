import { NavLink, useLocation } from 'react-router-dom'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { TripView } from '../../hooks/useTrip'
import { cx } from '../../utils/cx'
import { NavHeader } from '../shared/Page'

/** Trip sections as one glass track. A white thumb slides to the current section. */
export function TripTabs({ view, className, tone = 'sky' }: { view: TripView; className?: string; tone?: 'sky' | 'page' }) {
  const { trip, status } = view
  const tabs = [
    { to: `/trips/${trip.id}`, label: 'Overview', end: true },
    { to: `/trips/${trip.id}/expenses`, label: 'Expenses' },
    { to: `/trips/${trip.id}/settle`, label: 'Settle up' },
    { to: `/trips/${trip.id}/details`, label: 'Plans' },
    ...(status.phase === 'completed' ? [{ to: `/trips/${trip.id}/journal`, label: 'Journal' }] : []),
  ]
  const ref = useRef<HTMLElement>(null)
  const { pathname } = useLocation()
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null)
  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current?.querySelector<HTMLElement>('[aria-current="page"]')
      setThumb(el ? { x: el.offsetLeft, w: el.offsetWidth } : null)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (ref.current) ro.observe(ref.current)
    return () => ro.disconnect()
  }, [pathname, tabs.length])
  const many = tabs.length > 4
  return (
    <nav
      ref={ref}
      aria-label="Trip sections"
      className={cx('relative grid auto-cols-fr grid-flow-col rounded-full p-1', tone === 'sky' ? 'bg-[rgba(8,18,48,0.42)] [backdrop-filter:blur(18px)_saturate(1.4)]' : 'bg-well', className)}
    >
      {thumb ? (
        <span
          aria-hidden
          className="absolute top-1 bottom-1 rounded-full bg-white shadow-[0_1px_2px_rgba(8,20,60,0.12),0_6px_16px_-8px_rgba(8,20,60,0.5)] transition-[left,width] duration-[420ms] ease-[var(--ease-out-expo)]"
          style={{ left: thumb.x, width: thumb.w }}
        />
      ) : null}
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            cx(
              'relative z-[1] flex h-9 min-w-0 items-center justify-center rounded-full px-1 font-semibold whitespace-nowrap transition-colors duration-300',
              many ? 'text-[12.5px]' : 'text-[13.5px]',
              isActive ? 'text-[#14224a] [text-shadow:none]' : tone === 'sky' ? 'text-white/85 hover:text-white' : 'text-ink-2 hover:text-ink',
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
