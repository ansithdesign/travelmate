import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BedDouble, ChevronRight, CircleCheck, Plane, Plus, ScanLine, UserPlus } from 'lucide-react'
import { categoryById, CATEGORIES } from '../data/categories'
import { BudgetRoad } from '../components/trips/BudgetRoad'
import { TripTabs } from '../components/trips/TripHeader'
import { TripMarker } from '../components/trips/TripMarker'
import { useTripActions } from '../components/trips/useTripActions'
import { Avatar, AvatarStack } from '../components/ui/Avatar'
import { Button, IconButton } from '../components/ui/Button'
import { Cover } from '../components/ui/Cover'
import { Menu } from '../components/ui/Menu'
import { Figure } from '../components/ui/Money'
import { useTripView, type TripView } from '../hooks/useTrip'
import { useStore } from '../store/store'
import { useUI } from '../store/ui'
import type { Person } from '../types'
import { cx } from '../utils/cx'
import { fmt, formatRange, isoDate, today } from '../utils/dates'
import { firstName } from '../utils/id'
import { formatMoney } from '../utils/money'
import { NotFound } from './NotFound'
import { useState } from 'react'
import { ExpenseDetailSheet } from '../components/expenses/ExpenseDetailSheet'
import type { Expense } from '../types'

export function TripOverview() {
  const { tripId } = useParams()
  const view = useTripView(tripId)
  if (!view) return <NotFound />
  return <Overview view={view} />
}

function Overview({ view }: { view: TripView }) {
  const navigate = useNavigate()
  const { person, me } = useStore()
  const { openExpense } = useUI()
  const { trip, status, ledger, transfers, settled, expenses } = view
  const { items, dialogs } = useTripActions(view)
  const members = trip.members.map(person).filter(Boolean) as Person[]
  const cur = trip.currency
  const myNet = ledger.net[me.id] ?? 0

  return (
    <div className="pb-12">
      {/* Cover */}
      <div className="mx-auto max-w-[1080px] lg:px-8 lg:pt-8">
        <div className="relative">
          <Cover photo={trip.cover} fallbackLabel={trip.destination} eager className="h-[168px] sm:h-[300px] lg:h-[340px] lg:rounded-lg" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 lg:p-4">
            <IconButton icon={ArrowLeft} label="Back to trips" tone="onImage" onClick={() => navigate('/')} />
            <Menu items={items} label="Trip actions" tone="onImage" />
          </div>
          <TripMarker trip={trip} status={status} size="lg" className="absolute -bottom-6 left-4 sm:left-6 lg:left-8" />
        </div>
      </div>

      {/* Title block */}
      <div className="mx-auto max-w-[1080px] px-4 pt-9 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <h1 className="text-display">{trip.name}</h1>
            <p className="mt-1.5 text-body text-ink-2">
              {trip.destination}
              {trip.region && trip.region !== trip.destination ? `, ${trip.region}` : ''} · {formatRange(trip.startDate, trip.endDate)}
            </p>
          </div>
          <Link to={`/trips/${trip.id}/people`} className="group flex items-center gap-3 rounded-full py-1 pr-3 pl-1 hover:bg-sunken/70">
            <AvatarStack people={members} size={34} max={5} />
            <span className="text-meta font-medium text-ink-2 group-hover:text-ink">
              {members.length} {members.length === 1 ? 'traveller' : 'travellers'}
              {trip.invites.length ? <span className="text-amber-ink">, {trip.invites.length} invited</span> : null}
            </span>
          </Link>
        </div>
      </div>

      <div className="sticky top-0 z-30 mt-4 border-b border-line bg-ground/95 backdrop-blur-[3px]">
        <TripTabs view={view} />
      </div>

      <div className="mx-auto grid max-w-[1080px] gap-x-10 gap-y-10 px-4 pt-5 sm:px-6 sm:pt-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <div className="min-w-0">
          {/* The money statement */}
          <section aria-labelledby="money" className="rounded-md bg-surface p-4 hairline sm:p-6">
            <h2 id="money" className="sr-only">
              Money
            </h2>
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
              <div>
                <p className="text-meta text-ink-2">Group has spent</p>
                <Figure value={ledger.total} currency={cur} className="mt-0.5 block text-[34px] leading-10 sm:text-figure" />
              </div>
              <div className="sm:text-right">
                <p className="hidden text-meta text-ink-2 sm:block">Your position</p>
                <p className={cx('num text-heading sm:mt-1 sm:text-title', myNet > 0 ? 'text-forest' : myNet < 0 ? 'text-brick' : 'text-ink-3')}>
                  {myNet > 0 ? `You get back ${formatMoney(myNet, { currency: cur })}` : myNet < 0 ? `You owe ${formatMoney(-myNet, { currency: cur })}` : 'All square'}
                </p>
                <p className="num mt-0.5 text-meta text-ink-3">
                  You paid {formatMoney(ledger.paid[me.id] ?? 0, { currency: cur })}, your share {formatMoney(ledger.share[me.id] ?? 0, { currency: cur })}
                </p>
              </div>
            </div>
            {trip.budget ? <BudgetRoad spent={ledger.total} budget={trip.budget} currency={cur} className="mt-5" /> : null}

            <div className="mt-1 border-t border-line-soft pt-3">
              <BalanceBars view={view} members={members} />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-meta text-ink-2">
                {expenses.length === 0
                  ? 'No expenses yet.'
                  : settled
                    ? 'Everyone is settled up.'
                    : `${transfers.length} ${transfers.length === 1 ? 'payment' : 'payments'} will settle everyone.`}
              </p>
              {!settled ? (
                <Button size="sm" variant="secondary" iconRight={ArrowRight} onClick={() => navigate(`/trips/${trip.id}/settle`)}>
                  Settle up
                </Button>
              ) : expenses.length ? (
                <span className="inline-flex items-center gap-1.5 text-meta font-medium text-forest">
                  <CircleCheck size={16} aria-hidden /> Settled
                </span>
              ) : null}
            </div>
          </section>

          {/* Actions */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_auto_auto]">
            <Button icon={Plus} size="lg" className="col-span-2 sm:col-span-1" onClick={() => openExpense({ tripId: trip.id })}>
              Add expense
            </Button>
            <Button variant="secondary" size="lg" icon={ScanLine} onClick={() => openExpense({ tripId: trip.id, scan: true })}>
              Scan
            </Button>
            <Button variant="secondary" size="lg" icon={UserPlus} onClick={() => navigate(`/trips/${trip.id}/people`)}>
              Invite
            </Button>
          </div>

          <RecentActivity view={view} />
        </div>

        <aside className="flex min-w-0 flex-col gap-10">
          <WhereItWent view={view} />
          <TripGlance view={view} />
        </aside>
      </div>
      {dialogs}
    </div>
  )
}

/** Diverging bars around zero: right is owed money, left owes money. Words carry the meaning. */
function BalanceBars({ view, members }: { view: TripView; members: Person[] }) {
  const { ledger, trip } = view
  const max = Math.max(1, ...members.map((m) => Math.abs(ledger.net[m.id] ?? 0)))
  return (
    <ul className="flex flex-col">
      {members.map((m) => {
        const net = ledger.net[m.id] ?? 0
        const w = (Math.abs(net) / max) * 50
        return (
          <li key={m.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-4 py-1.5 sm:py-2 sm:grid-cols-[180px_minmax(0,1fr)_150px]">
            <span className="flex min-w-0 items-center gap-2.5">
              <Avatar person={m} size={28} />
              <span className="min-w-0">
                <span className="block truncate text-body font-medium">{m.isYou ? 'You' : firstName(m.name)}</span>
                <span className="num block truncate text-caption text-ink-3">paid {formatMoney(ledger.paid[m.id] ?? 0, { currency: trip.currency })}</span>
              </span>
            </span>
            <span aria-hidden className="relative hidden h-2 sm:block">
              <span className="absolute inset-y-[-4px] left-1/2 w-px bg-line" />
              {net !== 0 ? (
                <span
                  className={cx('absolute inset-y-0 rounded-full', net > 0 ? 'left-1/2 bg-forest' : 'right-1/2 bg-brick/80')}
                  style={{ width: `${Math.max(w, 1.5)}%` }}
                />
              ) : null}
            </span>
            <span className={cx('num text-right text-meta font-medium', net > 0 ? 'text-forest' : net < 0 ? 'text-brick' : 'text-ink-3')}>
              {net > 0 ? `gets back ${formatMoney(net, { currency: trip.currency })}` : net < 0 ? `owes ${formatMoney(-net, { currency: trip.currency })}` : 'settled'}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function RecentActivity({ view }: { view: TripView }) {
  const { trip, expenses, payments } = view
  const { person, me } = useStore()
  const { openExpense } = useUI()
  const [open, setOpen] = useState<Expense | null>(null)
  const { data } = useStore()
  type Item = { kind: 'expense'; date: string; e: Expense } | { kind: 'payment'; date: string; p: (typeof payments)[number] }
  const feed: Item[] = [
    ...expenses.map((e) => ({ kind: 'expense' as const, date: e.date, e })),
    ...payments.map((p) => ({ kind: 'payment' as const, date: p.date, p })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)
  const name = (id: string) => (id === me.id ? 'You' : firstName(person(id)?.name ?? 'Someone'))

  return (
    <section aria-labelledby="recent" className="mt-10">
      <div className="flex items-center justify-between">
        <h2 id="recent" className="text-heading">
          Recent activity
        </h2>
        {expenses.length ? (
          <Link to={`/trips/${trip.id}/expenses`} className="inline-flex h-10 items-center gap-1 text-meta font-medium text-forest hover:underline">
            All {expenses.length} expenses <ChevronRight size={15} aria-hidden />
          </Link>
        ) : null}
      </div>
      {feed.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed border-line px-5 py-8 text-center">
          <p className="text-body text-ink-2">Nothing yet. Add the first expense when someone pays for something.</p>
          <Button className="mt-4" variant="secondary" icon={Plus} onClick={() => openExpense({ tripId: trip.id })}>
            Add expense
          </Button>
        </div>
      ) : (
        <ul className="mt-1 divide-y divide-line-soft">
          {feed.map((it) =>
            it.kind === 'expense' ? (
              <li key={it.e.id}>
                <button type="button" onClick={() => setOpen(it.e)} className="group flex w-full items-center gap-3.5 py-3 text-left">
                  {(() => {
                    const Icon = categoryById[it.e.category].icon
                    return (
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-sunken text-ink-2 group-hover:bg-forest-50 group-hover:text-forest">
                        <Icon size={19} strokeWidth={1.8} aria-hidden />
                      </span>
                    )
                  })()}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">
                      <span className="font-medium">{name(it.e.paidBy)}</span> <span className="text-ink-2">paid for</span> <span className="font-medium">{it.e.title}</span>
                    </span>
                    <span className="block text-meta text-ink-3">
                      {fmt.weekday(it.e.date)}, {fmt.time(it.e.date)}
                    </span>
                  </span>
                  <span className="num shrink-0 font-medium">{formatMoney(it.e.amount, { currency: trip.currency })}</span>
                </button>
              </li>
            ) : (
              <li key={it.p.id} className="flex items-center gap-3.5 py-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-forest-50 text-forest">
                  <CircleCheck size={19} strokeWidth={1.8} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">
                    <span className="font-medium">{name(it.p.from)}</span> <span className="text-ink-2">paid</span> <span className="font-medium">{name(it.p.to)}</span>
                  </span>
                  <span className="block text-meta text-ink-3">Settlement · {fmt.weekday(it.p.date)}</span>
                </span>
                <span className="num shrink-0 font-medium text-forest">{formatMoney(it.p.amount, { currency: trip.currency })}</span>
              </li>
            ),
          )}
        </ul>
      )}
      <ExpenseDetailSheet expense={open ? (data.expenses.find((x) => x.id === open.id) ?? null) : null} onClose={() => setOpen(null)} />
    </section>
  )
}

function WhereItWent({ view }: { view: TripView }) {
  const { expenses, ledger, trip } = view
  if (expenses.length === 0) return null
  const byCat = CATEGORIES.map((c) => ({ c, v: expenses.filter((e) => e.category === c.id).reduce((a, e) => a + e.amount, 0) }))
    .filter((x) => x.v > 0)
    .sort((a, b) => b.v - a.v)
  return (
    <section aria-labelledby="where">
      <h2 id="where" className="text-heading">
        Where it went
      </h2>
      <ul className="mt-3 flex flex-col gap-3.5">
        {byCat.map(({ c, v }) => (
          <li key={c.id}>
            <div className="flex items-baseline justify-between gap-3 text-meta">
              <span className="flex items-center gap-2 text-ink-2">
                <c.icon size={15} strokeWidth={1.9} aria-hidden />
                {c.label}
              </span>
              <span className="num font-medium">{formatMoney(v, { currency: trip.currency })}</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-sunken">
              <div className="h-full rounded-full bg-forest-200" style={{ width: `${(v / ledger.total) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Next bits of logistics, pulled from Details. */
function TripGlance({ view }: { view: TripView }) {
  const { trip, status } = view
  const todayIso = isoDate(today())
  const nextDay = trip.itinerary.find((d) => d.date >= todayIso) ?? trip.itinerary[0]
  const stay = trip.info.find((i) => i.kind === 'stay')
  const travel = trip.info.find((i) => i.kind === 'transport')
  if (!nextDay && !stay && !travel) {
    return (
      <section aria-labelledby="glance">
        <h2 id="glance" className="text-heading">
          Trip details
        </h2>
        <p className="mt-2 text-body text-ink-2">Keep bookings, addresses and a day plan here so nobody digs through chats.</p>
        <Link to={`/trips/${trip.id}/details`} className="mt-3 inline-flex h-10 items-center gap-1 text-meta font-medium text-forest hover:underline">
          Add details <ChevronRight size={15} aria-hidden />
        </Link>
      </section>
    )
  }
  return (
    <section aria-labelledby="glance">
      <div className="flex items-center justify-between">
        <h2 id="glance" className="text-heading">
          {status.phase === 'completed' ? 'The trip' : 'Coming up'}
        </h2>
        <Link to={`/trips/${trip.id}/details`} className="inline-flex h-10 items-center gap-1 text-meta font-medium text-forest hover:underline">
          Details <ChevronRight size={15} aria-hidden />
        </Link>
      </div>
      <ul className="mt-1 divide-y divide-line-soft">
        {travel ? <GlanceRow icon={Plane} title={travel.title} meta={travel.reference ?? travel.subtitle} /> : null}
        {stay ? <GlanceRow icon={BedDouble} title={stay.title} meta={stay.subtitle} /> : null}
      </ul>
      {nextDay ? (
        <div className="mt-4 rounded-md bg-sunken/70 p-4">
          <p className="text-caption font-medium text-ink-3">{fmt.long(nextDay.date)}</p>
          <p className="mt-1 text-meta text-ink">{nextDay.plan}</p>
        </div>
      ) : null}
    </section>
  )
}

function GlanceRow({ icon: Icon, title, meta }: { icon: typeof Plane; title: string; meta?: string }) {
  return (
    <li className="flex items-start gap-3 py-3">
      <Icon size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-ink-3" aria-hidden />
      <span className="min-w-0">
        <span className="block text-meta font-medium">{title}</span>
        {meta ? <span className="block truncate text-caption text-ink-3">{meta}</span> : null}
      </span>
    </li>
  )
}
