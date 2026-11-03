import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AirplaneTilt, Bed, CaretRight, CheckCircle, Plus } from '@phosphor-icons/react'
import { CATEGORIES, categoryById } from '../data/categories'
import { BudgetBar } from '../components/trips/BudgetRoad'
import { TripTabs } from '../components/trips/TripHeader'
import { useTripActions } from '../components/trips/useTripActions'
import { CategoryTile } from '../components/icons/CategoryIcon'
import { SkyArt } from '../components/shared/SkyArt'
import { ExpenseDetailSheet } from '../components/expenses/ExpenseDetailSheet'
import { ContentSheet, NavHeader, SheetBody, SkyHero } from '../components/shared/Page'
import { Avatar, AvatarStack } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { PhotoCard } from '../components/ui/Cover'
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
  const { person, me } = useStore()
  const { trip, ledger, transfers, settled, expenses } = view
  const { items, dialogs } = useTripActions(view)
  const members = trip.members.map(person).filter(Boolean) as Person[]
  const cur = trip.currency
  const myNet = ledger.net[me.id] ?? 0

  return (
    <>
      <NavHeader title={<span className="sr-only">{trip.name}</span>} back="/" actions={<Menu items={items} label="Trip actions" tone="plain" />} />
      <SkyHero className="pt-2 pb-2">
        <div className="flex items-center gap-4">
          <PhotoCard photo={trip.cover} eager radius={18} className="size-[64px] shrink-0 sm:size-[76px]" />
          <div className="min-w-0">
            <h1 className="text-hero">{trip.name}</h1>
            <p className="mt-1 text-meta text-ink-3">
              {trip.destination} · <span className="whitespace-nowrap">{formatRange(trip.startDate, trip.endDate)}</span>
            </p>
          </div>
        </div>

        {/* The hero figure sits straight on the sky */}
        <div className="mt-10">
          <p className="text-meta font-medium text-ink-3">{expenses.length ? 'Group has spent' : 'Nothing spent yet'}</p>
          <Figure value={ledger.total} currency={cur} animate size="xl" className="mt-1.5" />
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <span className={cx('level num', myNet > 0 ? 'ok' : myNet < 0 ? 'act' : 'quiet')}>
              {myNet > 0 ? `You get back ${formatMoney(myNet, { currency: cur })}` : myNet < 0 ? `You owe ${formatMoney(-myNet, { currency: cur })}` : 'You are all square'}
            </span>
            <Link to={`/trips/${trip.id}/people`} className="press inline-flex items-center gap-2 rounded-full py-0.5 pr-2.5 pl-0.5 hover:bg-well">
              <AvatarStack people={members} size={24} max={4} />
              <span className="text-caption font-medium text-ink-3">
                {members.length} {members.length === 1 ? 'traveller' : 'travellers'}
                {trip.invites.length ? `, ${trip.invites.length} invited` : ''}
              </span>
            </Link>
          </div>
          {trip.budget ? <BudgetBar spent={ledger.total} budget={trip.budget} currency={cur} className="mt-8 max-w-[560px]" /> : null}
        </div>
        <TripTabs view={view} className="mt-10" />
      </SkyHero>

      <ContentSheet>
        <SheetBody className="pt-8">
          <div className="grid gap-x-10 gap-y-14 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0">
              {expenses.length ? (
                <section aria-labelledby="balances">
                  <div className="flex min-h-11 items-center justify-between gap-3 px-0.5">
                    <h2 id="balances" className="text-title">
                      Balances
                    </h2>
                    {settled ? (
                      <span className="level ok">Settled</span>
                    ) : (
                      <Link to={`/trips/${trip.id}/settle`} className="inline-flex h-10 items-center gap-1 text-[14px] font-semibold text-accent-ink">
                        Settle up <CaretRight size={14} weight="bold" aria-hidden />
                      </Link>
                    )}
                  </div>
                  <BalanceList view={view} members={members} />
                  {!settled ? (
                    <p className="mt-3 px-1 text-caption text-ink-3">
                      {transfers.length} {transfers.length === 1 ? 'payment settles' : 'payments settle'} everyone.
                    </p>
                  ) : null}
                </section>
              ) : null}

              <RecentActivity view={view} />
            </div>

            <aside className="flex min-w-0 flex-col gap-10 ">
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

/** Who is owed and who owes: people owed first, then the largest debts. Words carry the meaning. */
function BalanceList({ view, members }: { view: TripView; members: Person[] }) {
  const { ledger, trip } = view
  const sorted = [...members].sort((a, b) => (ledger.net[b.id] ?? 0) - (ledger.net[a.id] ?? 0))
  return (
    <ul className="panel-strong rows mt-3 overflow-hidden rounded-[24px]">
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
    <section aria-labelledby="recent" className={cx(expenses.length && 'mt-14')}>
      <div className="flex min-h-11 items-center justify-between px-0.5">
        <h2 id="recent" className="text-title">
          Recent activity
        </h2>
        {expenses.length ? (
          <Link to={`/trips/${trip.id}/expenses`} className="inline-flex h-10 items-center gap-1 text-[14px] font-semibold text-accent-ink">
            See all {expenses.length} <CaretRight size={14} weight="bold" aria-hidden />
          </Link>
        ) : null}
      </div>
      {feed.length === 0 ? (
        <div className="panel mt-2 flex flex-col items-center rounded-[24px] px-5 py-8 text-center">
          <SkyArt size={96} />
          <p className="mt-3 max-w-[30ch] text-body text-ink-2">Add the first expense when someone pays for something. TripMate works out who owes whom.</p>
          <Button className="mt-4" icon={Plus} onClick={() => openExpense({ tripId: trip.id })}>
            Add expense
          </Button>
        </div>
      ) : (
        <ul className="panel-strong rows mt-3 overflow-hidden rounded-[24px]">
          {feed.map((it) =>
            it.kind === 'expense' ? (
              <li key={it.e.id}>
                <button type="button" onClick={() => setOpen(it.e)} className="flex min-h-[68px] w-full items-center gap-4 px-5 py-3.5 text-left hover:bg-well active:bg-well">
                  <CategoryTile id={it.e.category} size={36} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{it.e.title}</span>
                    <span className="block truncate text-caption text-ink-3">
                      {name(it.e.paidBy)} paid · {fmt.weekday(it.e.date)}
                    </span>
                  </span>
                  <span className="num shrink-0 font-semibold">{formatMoney(it.e.amount, { currency: trip.currency })}</span>
                </button>
              </li>
            ) : (
              <li key={it.p.id} className="flex min-h-[68px] items-center gap-4 px-5 py-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gain-soft text-gain">
                  <CheckCircle size={20} weight="duotone" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {name(it.p.from)} paid {name(it.p.to)}
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
      <h2 id="where" className="flex min-h-11 items-center px-0.5 text-title">
        Where it went
      </h2>
      <div className="panel mt-2 rounded-[24px] p-6">
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
            <p className="figure text-[28px] leading-9">{Math.round((byCat[0].v / ledger.total) * 100)}%</p>
            <p className="text-meta text-ink-2">went on {categoryById[byCat[0].c.id].label.toLowerCase()}</p>
          </div>
        </div>
        <ul className="mt-4 flex flex-col gap-2.5">
          {byCat.map(({ c, v }) => (
            <li key={c.id} className="flex items-center gap-3 text-meta">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: c.tint }} aria-hidden />
              <span className="min-w-0 flex-1 truncate text-ink-2">{c.label}</span>
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
        <div className="panel-strong rows mt-3 overflow-hidden rounded-[24px]">
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
