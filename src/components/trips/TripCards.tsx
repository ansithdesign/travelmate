import { Link } from 'react-router-dom'
import type { TripView } from '../../hooks/useTrip'
import { useStore } from '../../store/store'
import { COVER_LIBRARY } from '../../data/photos'
import type { CurrencyCode, Photo, Trip } from '../../types'
import { cx } from '../../utils/cx'
import { formatRange } from '../../utils/dates'
import { formatMoney } from '../../utils/money'
import { PhotoCard } from '../ui/Cover'
import { phaseLabel } from './status'

/** The two other photos that peek out behind a trip's cover: its journal photos first, then a steady pick from the library. */
function backPhotos(trip: Trip): [Photo, Photo] {
  const own = trip.journal.photos.filter((p) => p.id !== trip.cover?.id)
  const pool = COVER_LIBRARY.filter((p) => p.id !== trip.cover?.id && !own.some((o) => o.id === p.id))
  let h = 0
  for (const c of trip.id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const rest = [...pool.slice(h % pool.length), ...pool.slice(0, h % pool.length)]
  const all = [...own, ...rest]
  return [all[0], all[1]]
}

/**
 * Fanned prints: the cover on top, two more photos from the trip peeking out
 * behind it, each a white print that is slightly rotated. It says the trip has
 * more to see. Prints stay inside the box so nothing stretches the page.
 */
export function Fan({
  trip,
  seed = 0,
  aspect = '4 / 3',
  spread = 1,
  eager,
  children,
  className,
}: {
  trip: Trip
  seed?: number
  aspect?: string
  /** Scales the rotation and offset of the back prints */
  spread?: number
  eager?: boolean
  children?: React.ReactNode
  className?: string
}) {
  const [b1, b2] = backPhotos(trip)
  const print = 'absolute inset-y-0 inset-x-[18px] rounded-[20px] bg-paper p-1.5 shadow-[0_2px_6px_rgba(13,27,42,0.06),0_18px_34px_-16px_rgba(13,27,42,0.3)] transition-transform duration-500 ease-[var(--ease-out-expo)]'
  return (
    <div className={cx('relative w-full', className)} style={{ aspectRatio: aspect }}>
      <div className={print} style={{ transform: `rotate(${-7.5 * spread}deg) translate(${-14 * spread}px, ${5 * spread}px)` }}>
        <PhotoCard photo={b1} seed={seed + 1} radius={14} className="size-full shadow-none" />
      </div>
      <div className={print} style={{ transform: `rotate(${6.5 * spread}deg) translate(${14 * spread}px, ${3 * spread}px)` }}>
        <PhotoCard photo={b2} seed={seed + 2} radius={14} className="size-full shadow-none" />
      </div>
      <div className={cx(print, 'group-hover:-translate-y-0.5')} style={{ transform: 'rotate(-1deg)' }}>
        <PhotoCard photo={trip.cover} seed={seed} eager={eager} radius={14} className="size-full shadow-none">
          {children}
        </PhotoCard>
      </div>
    </div>
  )
}

export function BalanceLine({ net, className, currency }: { net: number; className?: string; currency?: CurrencyCode }) {
  if (net === 0) return <span className={cx('text-ink-3', className)}>All square</span>
  return (
    <span className={cx('num font-semibold', net > 0 ? 'text-gain' : 'text-loss', className)}>
      {net > 0 ? `You get back ${formatMoney(net, { currency })}` : `You owe ${formatMoney(-net, { currency })}`}
    </span>
  )
}

/** The next trip, listing style: the photo carries one badge, the words sit underneath. */
export function FeaturedTrip({ view, seed = 0 }: { view: TripView; seed?: number }) {
  const { me } = useStore()
  const { trip, status, ledger } = view
  const myNet = ledger.net[me.id] ?? 0

  return (
    <Link to={`/trips/${trip.id}`} className="group block" aria-label={`${trip.name}, ${phaseLabel(trip, status)}`}>
      <Fan trip={trip} seed={seed} eager aspect="4 / 3.1" className="transition-transform duration-200 group-active:scale-[0.985]">
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-[13px] font-semibold text-[#0d1b2a] shadow-[0_2px_10px_rgba(13,27,42,0.16)]">
          {phaseLabel(trip, status)}
        </span>
      </Fan>
      <div className="mt-10 flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <h3 className="truncate text-heading">{trip.name}</h3>
          <p className="truncate text-meta text-ink-3">
            {trip.destination} · {formatRange(trip.startDate, trip.endDate)}
          </p>
          <p className="num mt-1 text-meta text-ink-3">
            <span className="font-semibold text-ink">{formatMoney(ledger.total, { currency: trip.currency })}</span>
            {trip.budget ? ` of ${formatMoney(trip.budget, { currency: trip.currency })}` : ''} spent
          </p>
        </div>
        <BalanceLine net={myNet} currency={trip.currency} className="mt-0.5 shrink-0 text-meta" />
      </div>
    </Link>
  )
}

/** Past trip as a photo tile for the mobile scroller. */
export function TripWindowCard({ view, seed = 0 }: { view: TripView; seed?: number }) {
  const { me } = useStore()
  const { trip, status, ledger } = view
  const myNet = ledger.net[me.id] ?? 0
  return (
    <Link to={`/trips/${trip.id}`} className="group block w-[172px] shrink-0 snap-start">
      <Fan trip={trip} seed={seed} aspect="4 / 4.9" spread={0.75} className="transition-transform duration-200 group-active:scale-[0.985]" />
      <p className="mt-7 truncate text-[15px] font-semibold">{trip.name}</p>
      <p className="truncate text-meta text-ink-3">{phaseLabel(trip, status)}</p>
      <p className={cx('num truncate text-meta font-medium', myNet === 0 ? 'text-ink-3' : myNet > 0 ? 'text-gain' : 'text-loss')}>
        {myNet === 0 ? `${formatMoney(ledger.total, { currency: trip.currency })} · settled` : myNet > 0 ? `Owed ${formatMoney(myNet, { currency: trip.currency })}` : `You owe ${formatMoney(-myNet, { currency: trip.currency })}`}
      </p>
    </Link>
  )
}

/** Compact row used inside sheets. */
export function TripRow({ view, seed = 0 }: { view: TripView; seed?: number }) {
  const { me } = useStore()
  const { trip, status, ledger } = view
  const myNet = ledger.net[me.id] ?? 0
  return (
    <Link to={`/trips/${trip.id}`} className="group flex min-h-[64px] items-center gap-3.5 px-3 py-2.5 pr-4 hover:bg-well active:bg-well">
      <PhotoCard photo={trip.cover} seed={seed} radius={12} className="size-11 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{trip.name}</p>
        <p className="truncate text-caption text-ink-3">
          {phaseLabel(trip, status)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="num font-semibold">{formatMoney(ledger.total, { currency: trip.currency })}</p>
        <BalanceLine net={myNet} currency={trip.currency} className="text-caption font-medium" />
      </div>
    </Link>
  )
}

/** Desktop: a past trip as a wide journal card. */
export function PastTripCard({ view, seed = 0 }: { view: TripView; seed?: number }) {
  const { me } = useStore()
  const { trip, ledger } = view
  const myNet = ledger.net[me.id] ?? 0
  return (
    <Link to={`/trips/${trip.id}`} className="panel group flex gap-5 rounded-[28px] p-3 pr-5 transition-transform duration-200 active:scale-[0.985]">
      <PhotoCard photo={trip.cover} seed={seed} radius={18} className="aspect-[4/5] w-[120px] shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col py-2">
        <p className="text-heading">{trip.name}</p>
        <p className="text-meta text-ink-3">
          {formatRange(trip.startDate, trip.endDate)} · {trip.members.length} {trip.members.length === 1 ? 'traveller' : 'travellers'}
        </p>
        {trip.journal.note ? <p className="mt-2 line-clamp-3 text-meta text-ink-2">{trip.journal.note}</p> : null}
        <div className="mt-auto flex items-baseline justify-between gap-3 pt-3">
          <span className="num text-heading font-[650]">{formatMoney(ledger.total, { currency: trip.currency })}</span>
          <BalanceLine net={myNet} currency={trip.currency} className="text-meta" />
        </div>
      </div>
    </Link>
  )
}
