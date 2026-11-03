import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AirplaneTilt, ArrowLeft, ArrowRight, Bed, CaretRight, CheckCircle, Plus, Scan, UserPlus } from '@phosphor-icons/react'
import { CATEGORIES, categoryById } from '../data/categories'
import { FlightPath } from '../components/trips/BudgetRoad'
import { TripTabs } from '../components/trips/TripHeader'
import { phaseLabel } from '../components/trips/status'
import { useTripActions } from '../components/trips/useTripActions'
import { CategoryIcon, CategoryTile } from '../components/icons/CategoryIcon'
import { ExpenseDetailSheet } from '../components/expenses/ExpenseDetailSheet'
import { ContentSheet, SheetBody, SkyHero } from '../components/shared/Page'
import { Avatar, AvatarStack } from '../components/ui/Avatar'
import { Button, IconButton } from '../components/ui/Button'
import { Window } from '../components/ui/Cover'
import { Menu } from '../components/ui/Menu'
import { Figure } from '../components/ui/Money'
import { useTripView, type TripView } from '../hooks/useTrip'
import { useStore } from '../store/store'
import { useUI } from '../store/ui'
import type { Expense, Person } from '../types'
import { cx } from '../utils/cx'
import { fmt, formatRange, isoDate, today } from '../utils/dates'
import { firstName } from '../utils/id'
import { formatMoney } from '../utils/money'
import { NotFound } from './NotFound'

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
    <>
      <SkyHero className="pt-[max(12px,env(safe-area-inset-top))] pb-4 lg:pt-8 lg:pb-5">
        <div className="flex items-center justify-between">
          <IconButton icon={ArrowLeft} label="Back to trips" tone="sky" onClick={() => navigate('/')} />
          <Menu items={items} label="Trip actions" tone="sky" />
        </div>
        <div className="mt-3 flex items-end gap-4 sm:gap-6">
          <Window photo={trip.cover} eager shade={0.12} className="aspect-[0.78] w-[96px] shrink-0 sm:w-[132px]" />
          <div className="min-w-0 pb-1">
            <h1 className="text-sky text-display sm:text-hero">{trip.name}</h1>
            <p className="text-sky-2 mt-1 text-meta sm:text-body">
              {trip.destination} · <span className="whitespace-nowrap">{formatRange(trip.startDate, trip.endDate)}</span>
            </p>
            <Link to={`/trips/${trip.id}/people`} className="mt-2.5 inline-flex items-center gap-2 rounded-full py-0.5 pr-2 hover:bg-white/10">
              <AvatarStack people={members} size={28} max={5} />
              <span className="text-sky-2 text-caption font-semibold">
                {phaseLabel(trip, status)}
                {trip.invites.length ? ` · ${trip.invites.length} invited` : ''}
              </span>
            </Link>
          </div>
        </div>
        <TripTabs view={view} className="mt-4" />
      </SkyHero>

      <ContentSheet>
        <SheetBody className="pt-4 sm:pt-5">
          <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0">
              {/* The money statement */}
              <section aria-labelledby="money" className="panel rounded-[28px] px-4 py-4 sm:p-6">
                <h2 id="money" className="sr-only">
                  Money
                </h2>
                <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                  <div>
                    <p className="text-meta font-medium text-ink-2">Group has spent</p>
                    <Figure value={ledger.total} currency={cur} animate className="mt-1" />
                  </div>
                  <div className="sm:pb-1 sm:text-right">
                    <p className={cx('num text-heading', myNet > 0 ? 'text-gain' : myNet < 0 ? 'text-loss' : 'text-ink-3')}>
                      {myNet > 0 ? `You get back ${formatMoney(myNet, { currency: cur })}` : myNet < 0 ? `You owe ${formatMoney(-myNet, { currency: cur })}` : 'You are all square'}
                    </p>
                    <p className="num text-caption text-ink-3">
                      You paid {formatMoney(ledger.paid[me.id] ?? 0, { currency: cur })} · your share {formatMoney(ledger.share[me.id] ?? 0, { currency: cur })}
                    </p>
                  </div>
                </div>
                {trip.budget ? <FlightPath spent={ledger.total} budget={trip.budget} currency={cur} className="mt-3" /> : null}

                <div className="mt-3 border-t border-line pt-1.5">
                  <BalanceBars view={view} members={members} />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-meta text-ink-2">
                    {expenses.length === 0
                      ? 'No expenses yet.'
                      : settled
                        ? 'Everyone is settled up.'
                        : `${transfers.length} ${transfers.length === 1 ? 'payment settles' : 'payments settle'} everyone.`}
                  </p>
                  {!settled ? (
                    <Button size="sm" variant="secondary" iconRight={ArrowRight} onClick={() => navigate(`/trips/${trip.id}/settle`)}>
                      Settle up
                    </Button>
                  ) : expenses.length ? (
                    <span className="inline-flex items-center gap-1.5 text-meta font-semibold text-gain">
                      <CheckCircle size={18} weight="fill" aria-hidden /> Settled
                    </span>
                  ) : null}
                </div>
              </section>

              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-[1fr_auto_auto]">
                <Button icon={Plus} size="lg" className="col-span-2 sm:col-span-1" onClick={() => openExpense({ tripId: trip.id })}>
                  Add expense
                </Button>
                <Button variant="secondary" size="lg" icon={Scan} onClick={() => openExpense({ tripId: trip.id, scan: true })}>
                  Scan
                </Button>
                <Button variant="secondary" size="lg" icon={UserPlus} onClick={() => navigate(`/trips/${trip.id}/people`)}>
                  Invite
                </Button>
              </div>

              <RecentActivity view={view} />
            </div>

            <aside className="flex min-w-0 flex-col gap-9">
              <WhereItWent view={view} />
              <TripGlance view={view} />
            </aside>
          </div>
        </SheetBody>
      </ContentSheet>
      {dialogs}
    </>
  )
}

/** Who is owed and who owes, people owed first, then the largest debts. Diverging bars around zero; words carry the meaning. */
function BalanceBars({ view, members }: { view: TripView; members: Person[] }) {
  const { ledger, trip } = view
  const sorted = [...members].sort((a, b) => (ledger.net[b.id] ?? 0) - (ledger.net[a.id] ?? 0))
  const max = Math.max(1, ...members.map((m) => Math.abs(ledger.net[m.id] ?? 0)))
  return (
    <ul className="flex flex-col">
      {sorted.map((m) => {
        const net = ledger.net[m.id] ?? 0
        const w = (Math.abs(net) / max) * 50
        return (
          <li key={m.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-[5px] sm:grid-cols-[170px_minmax(0,1fr)_150px] sm:gap-4 sm:py-[7px]">
            <span className="flex min-w-0 items-center gap-2.5">
              <Avatar person={m} size={30} />
              <span className="min-w-0">
                <span className="block truncate text-meta font-semibold">{m.isYou ? 'You' : firstName(m.name)}</span>
                <span className="num block truncate text-caption text-ink-3">paid {formatMoney(ledger.paid[m.id] ?? 0, { currency: trip.currency })}</span>
              </span>
            </span>
            <span aria-hidden className="relative hidden h-2 sm:block">
              <span className="absolute inset-y-[-5px] left-1/2 w-px bg-line-strong" />
              {net !== 0 ? (
                <span
                  className={cx('absolute inset-y-0 rounded-full', net > 0 ? 'left-1/2 bg-[linear-gradient(90deg,#34d3a4,#0b8a6a)]' : 'right-1/2 bg-[linear-gradient(270deg,#ff8a9a,#d6364a)]')}
                  style={{ width: `${Math.max(w, 1.5)}%` }}
                />
              ) : null}
            </span>
            <span className={cx('num text-right text-meta font-semibold', net > 0 ? 'text-gain' : net < 0 ? 'text-loss' : 'text-ink-3')}>
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
  const { person, me, data } = useStore()
  const { openExpense } = useUI()
  const [open, setOpen] = useState<Expense | null>(null)
  type Item = { kind: 'expense'; date: string; e: Expense } | { kind: 'payment'; date: string; p: (typeof payments)[number] }
  const feed: Item[] = [...expenses.map((e) => ({ kind: 'expense' as const, date: e.date, e })), ...payments.map((p) => ({ kind: 'payment' as const, date: p.date, p }))]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)
  const name = (id: string) => (id === me.id ? 'You' : firstName(person(id)?.name ?? 'Someone'))

  return (
    <section aria-labelledby="recent" className="mt-9">
      <div className="flex items-center justify-between">
        <h2 id="recent" className="text-heading">
          Recent activity
        </h2>
        {expenses.length ? (
          <Link to={`/trips/${trip.id}/expenses`} className="inline-flex h-10 items-center gap-1 rounded-full px-3 text-meta font-semibold text-accent hover:bg-accent-soft">
            All {expenses.length} <CaretRight size={14} weight="bold" aria-hidden />
          </Link>
        ) : null}
      </div>
      {feed.length === 0 ? (
        <div className="panel mt-3 flex flex-col items-center rounded-[24px] px-5 py-8 text-center">
          <CategoryIcon id="other" size={48} />
          <p className="mt-3 text-body text-ink-2">Nothing yet. Add the first expense when someone pays for something.</p>
          <Button className="mt-4" icon={Plus} onClick={() => openExpense({ tripId: trip.id })}>
            Add expense
          </Button>
        </div>
      ) : (
        <ul className="panel mt-3 divide-y divide-line overflow-hidden rounded-[24px]">
          {feed.map((it) =>
            it.kind === 'expense' ? (
              <li key={it.e.id}>
                <button type="button" onClick={() => setOpen(it.e)} className="flex w-full items-center gap-3.5 px-4 py-3 text-left hover:bg-well">
                  <CategoryTile id={it.e.category} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-meta">
                      <span className="font-semibold">{name(it.e.paidBy)}</span> <span className="text-ink-2">paid for</span> <span className="font-semibold">{it.e.title}</span>
                    </span>
                    <span className="block text-caption text-ink-3">
                      {fmt.weekday(it.e.date)}, {fmt.time(it.e.date)}
                    </span>
                  </span>
                  <span className="num shrink-0 font-semibold">{formatMoney(it.e.amount, { currency: trip.currency })}</span>
                </button>
              </li>
            ) : (
              <li key={it.p.id} className="flex items-center gap-3.5 px-4 py-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-gain-soft text-gain">
                  <CheckCircle size={24} weight="duotone" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-meta">
                    <span className="font-semibold">{name(it.p.from)}</span> <span className="text-ink-2">paid</span> <span className="font-semibold">{name(it.p.to)}</span>
                  </span>
                  <span className="block text-caption text-ink-3">Settlement · {fmt.weekday(it.p.date)}</span>
                </span>
                <span className="num shrink-0 font-semibold text-gain">{formatMoney(it.p.amount, { currency: trip.currency })}</span>
              </li>
            ),
          )}
        </ul>
      )}
      <ExpenseDetailSheet expense={open ? (data.expenses.find((x) => x.id === open.id) ?? null) : null} onClose={() => setOpen(null)} />
    </section>
  )
}

/** A soft ring chart of categories with the category objects as legend. */
function WhereItWent({ view }: { view: TripView }) {
  const { expenses, ledger, trip } = view
  if (expenses.length === 0) return null
  const byCat = CATEGORIES.map((c) => ({ c, v: expenses.filter((e) => e.category === c.id).reduce((a, e) => a + e.amount, 0) }))
    .filter((x) => x.v > 0)
    .sort((a, b) => b.v - a.v)
  const R = 46
  const C = 2 * Math.PI * R
  let acc = 0
  return (
    <section aria-labelledby="where">
      <h2 id="where" className="text-heading">
        Where it went
      </h2>
      <div className="panel mt-3 rounded-[24px] p-5">
        <div className="flex items-center gap-5">
          <svg viewBox="0 0 120 120" className="size-[112px] shrink-0 -rotate-90" aria-hidden>
            <circle cx="60" cy="60" r={R} fill="none" className="stroke-well" strokeWidth="14" />
            {byCat.map(({ c, v }) => {
              const len = (v / ledger.total) * C
              const el = (
                <circle key={c.id} cx="60" cy="60" r={R} fill="none" stroke={c.tint} strokeWidth="14" strokeDasharray={`${Math.max(len - 2, 0.5)} ${C}`} strokeDashoffset={-acc} strokeLinecap="butt" />
              )
              acc += len
              return el
            })}
          </svg>
          <div className="min-w-0">
            <p className="num text-[34px] leading-10 font-extralight tracking-[-0.04em]">{Math.round((byCat[0].v / ledger.total) * 100)}%</p>
            <p className="text-meta text-ink-2">went on {categoryById[byCat[0].c.id].label.toLowerCase()}</p>
          </div>
        </div>
        <ul className="mt-4 flex flex-col gap-2.5">
          {byCat.map(({ c, v }) => (
            <li key={c.id} className="flex items-center gap-3 text-meta">
              <CategoryIcon id={c.id} size={26} />
              <span className="min-w-0 flex-1 truncate text-ink-2">{c.label}</span>
              <span className="size-2 rounded-full" style={{ background: c.tint }} aria-hidden />
              <span className="num w-[78px] text-right font-semibold">{formatMoney(v, { currency: trip.currency })}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function TripGlance({ view }: { view: TripView }) {
  const { trip, status } = view
  const todayIso = isoDate(today())
  const nextDay = trip.itinerary.find((d) => d.date >= todayIso) ?? trip.itinerary[0]
  const stay = trip.info.find((i) => i.kind === 'stay')
  const travel = trip.info.find((i) => i.kind === 'transport')
  return (
    <section aria-labelledby="glance">
      <div className="flex items-center justify-between">
        <h2 id="glance" className="text-heading">
          {status.phase === 'completed' ? 'The trip' : 'Coming up'}
        </h2>
        <Link to={`/trips/${trip.id}/details`} className="inline-flex h-10 items-center gap-1 rounded-full px-3 text-meta font-semibold text-accent hover:bg-accent-soft">
          Details <CaretRight size={14} weight="bold" aria-hidden />
        </Link>
      </div>
      {!nextDay && !stay && !travel ? (
        <p className="mt-2 text-body text-ink-2">Keep bookings, addresses and a day plan here so nobody digs through chats.</p>
      ) : (
        <div className="panel mt-3 overflow-hidden rounded-[24px]">
          {travel ? <GlanceRow icon={AirplaneTilt} title={travel.title} meta={travel.reference ?? travel.subtitle} /> : null}
          {stay ? <GlanceRow icon={Bed} title={stay.title} meta={stay.subtitle} /> : null}
          {nextDay ? (
            <div className="bg-[linear-gradient(135deg,rgb(96_165_250/0.14),rgb(255_180_140/0.14))] p-4">
              <p className="text-caption font-semibold text-accent">{fmt.long(nextDay.date)}</p>
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
    <div className="flex items-start gap-3 border-b border-line px-4 py-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
        <I size={19} weight="duotone" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-meta font-semibold">{title}</span>
        {meta ? <span className="block truncate text-caption text-ink-3">{meta}</span> : null}
      </span>
    </div>
  )
}
