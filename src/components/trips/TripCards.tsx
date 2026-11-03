import { Link } from 'react-router-dom'
import type { TripView } from '../../hooks/useTrip'
import { useStore } from '../../store/store'
import type { CurrencyCode } from '../../types'
import { cx } from '../../utils/cx'
import { formatRange } from '../../utils/dates'
import { formatMoney } from '../../utils/money'
import { PhotoCard } from '../ui/Cover'
import { phaseLabel } from './status'

/** A photo in a white frame with a slight tilt, like a print set down on the table. */
export function Framed({ children, tilt = 0, className }: { children: React.ReactNode; tilt?: number; className?: string }) {
  return (
    <div
      className={cx('rounded-[24px] bg-[var(--frame)] p-1.5 shadow-[0_2px_6px_rgba(13,27,42,0.06),0_18px_34px_-16px_rgba(13,27,42,0.28)] backdrop-blur-[10px] transition-transform duration-300 ease-[var(--ease-out-expo)]', className)}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {children}
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
      <Framed tilt={-1.2} className="group-active:scale-[0.985]">
        <PhotoCard photo={trip.cover} seed={seed} eager radius={18} className="aspect-[4/3] w-full shadow-none sm:aspect-[16/10]">
          <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-[13px] font-semibold text-[#0d1b2a] shadow-[0_2px_10px_rgba(13,27,42,0.16)]">
            {phaseLabel(trip, status)}
          </span>
        </PhotoCard>
      </Framed>
      <div className="mt-5 flex items-start justify-between gap-3 px-0.5">
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
      <Framed tilt={seed % 2 ? 1.6 : -1.6} className="group-active:scale-[0.985]">
        <PhotoCard photo={trip.cover} seed={seed} radius={18} className="aspect-[4/5] w-full shadow-none" />
      </Framed>
      <p className="mt-4 truncate text-[15px] font-semibold">{trip.name}</p>
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
