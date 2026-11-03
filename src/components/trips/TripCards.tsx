import { Link } from 'react-router-dom'
import type { TripView } from '../../hooks/useTrip'
import type { CurrencyCode } from '../../types'
import { useStore } from '../../store/store'
import { cx } from '../../utils/cx'
import { formatRange } from '../../utils/dates'
import { formatMoney } from '../../utils/money'
import { AvatarStack } from '../ui/Avatar'
import { Cover } from '../ui/Cover'
import { TripMarker } from './TripMarker'

/** The lead trip on the home screen: a full-bleed photograph with its milestone. */
export function FeaturedTrip({ view }: { view: TripView }) {
  const { person, me } = useStore()
  const { trip, status, ledger } = view
  const members = trip.members.map(person).filter(Boolean) as NonNullable<ReturnType<typeof person>>[]
  const myNet = ledger.net[me.id] ?? 0

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="group block overflow-hidden rounded-lg bg-surface shadow-[0_0_0_1px_var(--color-line)] transition-shadow duration-200 hover:shadow-[0_0_0_1px_var(--color-line),0_10px_28px_-16px_rgb(27_32_29/0.35)]"
    >
      <div className="relative">
        <Cover photo={trip.cover} fallbackLabel={trip.destination} eager className="aspect-[4/3] sm:aspect-[16/9]" imgClassName="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.02]" />
        <TripMarker trip={trip} status={status} size="lg" className="absolute bottom-4 left-4" />
      </div>
      <div className="px-4 pt-4 pb-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-title">{trip.name}</h3>
            <p className="mt-1 text-meta text-ink-2">
              {trip.destination} · <span className="whitespace-nowrap">{formatRange(trip.startDate, trip.endDate)}</span>
            </p>
          </div>
          <AvatarStack people={members} size={30} className="mt-1" />
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-line-soft pt-3.5 text-meta">
          <span className="text-ink-2">
            <span className="num font-medium text-ink">{formatMoney(ledger.total, { currency: trip.currency })}</span>
            {trip.budget ? <> of {formatMoney(trip.budget, { currency: trip.currency })}</> : null} spent
          </span>
          <BalanceLine net={myNet} currency={trip.currency} />
        </div>
      </div>
    </Link>
  )
}

export function BalanceLine({ net, className, currency }: { net: number; className?: string; currency?: CurrencyCode }) {
  if (net === 0) return <span className={cx('text-ink-3', className)}>You are settled</span>
  return (
    <span className={cx('num font-medium', net > 0 ? 'text-forest' : 'text-brick', className)}>
      {net > 0 ? `You get back ${formatMoney(net, { currency })}` : `You owe ${formatMoney(-net, { currency })}`}
    </span>
  )
}

/** Compact row for other trips. */
export function TripRow({ view }: { view: TripView }) {
  const { me } = useStore()
  const { trip, status, ledger } = view
  const myNet = ledger.net[me.id] ?? 0
  return (
    <Link to={`/trips/${trip.id}`} className="group flex items-center gap-4 py-3.5">
      <div className="relative shrink-0">
        <Cover photo={trip.cover} fallbackLabel={trip.destination.slice(0, 1)} className="size-[68px] rounded-md" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="truncate text-heading group-hover:underline group-hover:decoration-line">{trip.name}</h3>
          <span className="num shrink-0 text-body font-medium">{formatMoney(ledger.total, { currency: trip.currency })}</span>
        </div>
        <div className="mt-0.5 flex items-baseline justify-between gap-3 text-meta">
          <span className="truncate text-ink-2">
            {formatRange(trip.startDate, trip.endDate)} · {trip.members.length} {trip.members.length === 1 ? 'traveller' : 'travellers'}
          </span>
          {status.phase === 'completed' || status.phase === 'ended' ? (
            myNet === 0 ? <span className="shrink-0 text-ink-3">Settled</span> : <BalanceLine net={myNet} currency={trip.currency} className="shrink-0" />
          ) : (
            <BalanceLine net={myNet} currency={trip.currency} className="shrink-0" />
          )}
        </div>
      </div>
      <TripMarker trip={trip} status={status} size="sm" className="hidden sm:block" />
    </Link>
  )
}
