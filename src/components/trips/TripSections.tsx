import { Link } from 'react-router-dom'
import { AirplaneTilt, Bed, CaretRight } from '@phosphor-icons/react'
import type { TripView } from '../../hooks/useTrip'
import type { Person } from '../../types'
import { cx } from '../../utils/cx'
import { fmt, isoDate, today } from '../../utils/dates'
import { firstName } from '../../utils/id'
import { formatMoney } from '../../utils/money'
import { Avatar } from '../ui/Avatar'

/** Who is owed and who owes: people owed first, then the largest debts. Words carry the meaning. */
export function BalanceList({ view, members }: { view: TripView; members: Person[] }) {
  const { ledger, trip } = view
  const sorted = [...members].sort((a, b) => (ledger.net[b.id] ?? 0) - (ledger.net[a.id] ?? 0))
  return (
    <ul className="panel-strong rows mt-3 overflow-hidden rounded-[28px]">
      {sorted.map((m) => {
        const net = ledger.net[m.id] ?? 0
        return (
          <li key={m.id} className="flex min-h-[68px] items-center gap-4 px-5 py-3.5">
            <Avatar person={m} size={36} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{m.isYou ? 'You' : firstName(m.name)}</span>
              <span className="num block truncate text-caption text-ink-3">Paid {formatMoney(ledger.paid[m.id] ?? 0, { currency: trip.currency })}</span>
            </span>
            <span className={cx('num shrink-0 text-right text-[14px] font-semibold', net > 0 ? 'text-gain' : net < 0 ? 'text-loss' : 'text-ink-3')}>
              {net > 0 ? `gets back ${formatMoney(net, { currency: trip.currency })}` : net < 0 ? `owes ${formatMoney(-net, { currency: trip.currency })}` : 'settled'}
            </span>
          </li>
        )
      })}
    </ul>
  )
}


export function TripGlance({ view }: { view: TripView }) {
  const { trip, status } = view
  const todayIso = isoDate(today())
  const nextDay = trip.itinerary.find((d) => d.date >= todayIso) ?? trip.itinerary[0]
  const stay = trip.info.find((i) => i.kind === 'stay')
  const travel = trip.info.find((i) => i.kind === 'transport')
  return (
    <section aria-labelledby="glance">
      <div className="flex min-h-11 items-center justify-between px-0.5">
        <h2 id="glance" className="text-title">
          {status.phase === 'completed' ? 'The trip' : 'Coming up'}
        </h2>
        <Link to={`/trips/${trip.id}/details`} className="inline-flex h-10 items-center gap-1 text-[14px] font-semibold text-accent-ink">
          Plans <CaretRight size={14} weight="bold" aria-hidden />
        </Link>
      </div>
      {!nextDay && !stay && !travel ? (
        <p className="mt-2 text-body text-ink-2">Keep bookings, addresses and a day plan here so nobody digs through chats.</p>
      ) : (
        <div className="panel-strong rows mt-3 overflow-hidden rounded-[28px]">
          {travel ? <GlanceRow icon={AirplaneTilt} title={travel.title} meta={travel.reference ?? travel.subtitle} /> : null}
          {stay ? <GlanceRow icon={Bed} title={stay.title} meta={stay.subtitle} /> : null}
          {nextDay ? (
            <div className="px-4 py-3.5">
              <p className="text-caption font-semibold text-accent-ink">{fmt.long(nextDay.date)}</p>
              <p className="mt-1 text-meta text-ink">{nextDay.plan}</p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}

function GlanceRow({ icon: I, title, meta }: { icon: typeof Bed; title: string; meta?: string }) {
  return (
    <div className="flex min-h-[68px] items-center gap-4 px-5 py-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
        <I size={19} weight="duotone" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold">{title}</span>
        {meta ? <span className="block truncate text-caption text-ink-3">{meta}</span> : null}
      </span>
    </div>
  )
}
