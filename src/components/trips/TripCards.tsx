import { Link } from 'react-router-dom'
import { CaretRight } from '@phosphor-icons/react'
import type { TripView } from '../../hooks/useTrip'
import { useStore } from '../../store/store'
import type { CurrencyCode, Person } from '../../types'
import { cx } from '../../utils/cx'
import { formatRange } from '../../utils/dates'
import { formatMoney } from '../../utils/money'
import { AvatarStack } from '../ui/Avatar'
import { Window } from '../ui/Cover'
import { useCountUp } from '../ui/Money'
import { countdown, phaseLabel } from './status'

export function BalanceLine({ net, className, currency, onSky }: { net: number; className?: string; currency?: CurrencyCode; onSky?: boolean }) {
  if (net === 0) return <span className={cx(onSky ? 'text-sky-2' : 'text-ink-3', className)}>All square</span>
  return (
    <span className={cx('num font-semibold', onSky ? 'text-white' : net > 0 ? 'text-gain' : 'text-loss', className)}>
      {net > 0 ? `You get back ${formatMoney(net, { currency })}` : `You owe ${formatMoney(-net, { currency })}`}
    </span>
  )
}

/**
 * The next trip, seen through the cabin window, with its countdown set in
 * huge light numerals on the sky.
 */
export function FeaturedTrip({ view, seed = 0 }: { view: TripView; seed?: number }) {
  const { person, me } = useStore()
  const { trip, status, ledger } = view
  const members = trip.members.map(person).filter(Boolean) as Person[]
  const myNet = ledger.net[me.id] ?? 0
  const cd = countdown(status)
  const n = useCountUp(Number(cd.value) || 0, 1400)

  return (
    <Link to={`/trips/${trip.id}`} className="group block" aria-label={`${trip.name}, ${phaseLabel(trip, status)}`}>
      <div className="grid grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)] items-center gap-5 sm:gap-8">
        <Window
          photo={trip.cover}
          seed={seed}
          eager
          className="aspect-[0.76] w-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-1 group-hover:rotate-[-1deg]"
        />
        <div className="min-w-0">
          <p className="text-sky-2 text-meta font-medium">{cd.pre}</p>
          <p className="text-sky num -mt-1 text-[clamp(84px,24vw,128px)] leading-[0.95] font-extralight tracking-[-0.06em]">{Math.round(n)}</p>
          <p className="text-sky-2 text-heading font-medium">{cd.post}</p>
          <div className="mt-4 h-px w-12 bg-white/40" />
          <h3 className="text-sky mt-4 text-title">{trip.name}</h3>
          <p className="text-sky-2 mt-0.5 text-meta">{formatRange(trip.startDate, trip.endDate)}</p>
          <AvatarStack people={members} size={28} className="mt-3" ringClass="ring-white/70" />
        </div>
      </div>
      <div className="glass-control mt-6 flex items-center justify-between gap-3 rounded-full py-2.5 pr-3 pl-5 text-meta text-white">
        <span className="num text-sky-2 truncate">
          <span className="font-semibold text-white">{formatMoney(ledger.total, { currency: trip.currency })}</span>
          {trip.budget ? ` of ${formatMoney(trip.budget, { currency: trip.currency })}` : ''} spent
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <BalanceLine net={myNet} currency={trip.currency} onSky />
          <CaretRight size={14} weight="bold" className="transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  )
}

/** A small cabin window for the past-trips row. */
export function TripWindowCard({ view, seed = 0 }: { view: TripView; seed?: number }) {
  const { me } = useStore()
  const { trip, status, ledger } = view
  const myNet = ledger.net[me.id] ?? 0
  return (
    <Link to={`/trips/${trip.id}`} className="group block w-[150px] shrink-0 snap-start lg:w-[200px]">
      <Window photo={trip.cover} seed={seed} shade={0.1} className="aspect-[0.8] w-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1" />
      <p className="mt-3 truncate text-body font-semibold">{trip.name}</p>
      <p className="truncate text-meta text-ink-3">{phaseLabel(trip, status)}</p>
      <p className={cx('num mt-0.5 truncate text-meta font-medium', myNet === 0 ? 'text-ink-3' : myNet > 0 ? 'text-gain' : 'text-loss')}>
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
    <Link to={`/trips/${trip.id}`} className="press group flex items-center gap-4 rounded-[22px] p-2 pr-3 hover:bg-well">
      <Window photo={trip.cover} seed={seed} shade={0} className="aspect-[0.8] w-[54px] shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-semibold">{trip.name}</p>
        <p className="truncate text-meta text-ink-3">
          {phaseLabel(trip, status)} · {formatRange(trip.startDate, trip.endDate)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="num text-body font-semibold">{formatMoney(ledger.total, { currency: trip.currency })}</p>
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
    <Link to={`/trips/${trip.id}`} className="panel group flex gap-5 rounded-[28px] p-4 transition-shadow hover:shadow-[inset_0_0_0_1px_var(--color-line-strong),0_18px_40px_-22px_rgb(var(--t-shadow)/0.5)]">
      <Window photo={trip.cover} seed={seed} shade={0.1} className="aspect-[0.8] w-[132px] shrink-0 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1" />
      <div className="flex min-w-0 flex-1 flex-col py-1">
        <p className="text-title">{trip.name}</p>
        <p className="text-meta text-ink-3">
          {formatRange(trip.startDate, trip.endDate)} · {trip.members.length} {trip.members.length === 1 ? 'traveller' : 'travellers'}
        </p>
        {trip.journal.note ? <p className="mt-2 line-clamp-3 text-meta text-ink-2">{trip.journal.note}</p> : null}
        <div className="mt-auto flex items-baseline justify-between gap-3 pt-3">
          <span className="num text-heading">{formatMoney(ledger.total, { currency: trip.currency })}</span>
          <BalanceLine net={myNet} currency={trip.currency} className="text-meta" />
        </div>
      </div>
    </Link>
  )
}
