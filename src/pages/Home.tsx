import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CaretRight, CheckCircle, Plus } from '@phosphor-icons/react'
import { phaseLabel } from '../components/trips/status'
import { BalanceList, TripGlance } from '../components/trips/TripSections'
import { ExpenseDetailSheet } from '../components/expenses/ExpenseDetailSheet'
import { ExpenseRow } from '../components/expenses/ExpenseRow'
import { BrandMark } from '../components/shared/BrandMark'
import { ContentSheet, Dot, SheetBody, SkyHero } from '../components/shared/Page'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Segmented } from '../components/ui/Controls'
import { Cover } from '../components/ui/Cover'
import { Figure } from '../components/ui/Money'
import { useToast } from '../components/ui/Toast'
import { useAllTripViews } from '../hooks/useTrip'
import { useStore } from '../store/store'
import { useUI } from '../store/ui'
import type { Expense, Person } from '../types'
import { cx } from '../utils/cx'
import { fmt, formatRange } from '../utils/dates'
import { firstName } from '../utils/id'
import { formatMoney } from '../utils/money'

type Panel = 'activity' | 'balances' | 'plans'

/** Spend per day for the most recent days that have expenses, oldest first. */
function spendByDay(expenses: Expense[]) {
  const map = new Map<string, number>()
  for (const e of expenses) {
    const d = e.date.slice(0, 10)
    map.set(d, (map.get(d) ?? 0) + e.amount)
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-12)
}

export function Home() {
  const views = useAllTripViews()
  const { me, person, saveTrip } = useStore()
  const { openTrip, openExpense } = useUI()
  const navigate = useNavigate()
  const toast = useToast()
  const [picked, setPicked] = useState<string | null>(null)
  const [panel, setPanel] = useState<Panel>('activity')
  const [open, setOpen] = useState<Expense | null>(null)
  const { data } = useStore()

  // Rail order: what is happening or coming first, then trips that just ended, then the journal.
  const ordered = useMemo(() => {
    const rank = { ongoing: 0, upcoming: 1, ended: 2, completed: 3 } as const
    return [...views].sort((a, b) => rank[a.status.phase] - rank[b.status.phase] || (a.status.phase === 'completed' ? b.trip.endDate.localeCompare(a.trip.endDate) : a.trip.startDate.localeCompare(b.trip.startDate)))
  }, [views])

  if (views.length === 0) return <FirstRun />

  const view = ordered.find((v) => v.trip.id === picked) ?? ordered[0]
  const { trip, status, ledger, expenses, transfers, settled } = view
  const cur = trip.currency
  const myNet = ledger.net[me.id] ?? 0
  const members = trip.members.map(person).filter(Boolean) as Person[]
  const bars = spendByDay(expenses)
  const peak = Math.max(1, ...bars.map(([, v]) => v))
  const peakDay = bars.find(([, v]) => v === peak)

  return (
    <>
      <SkyHero className="pt-[max(28px,env(safe-area-inset-top))] pb-2 lg:pt-12">
        <div className="on-sky">
          <header className="flex items-center justify-between gap-3">
            <h1 className="text-[40px] leading-[1.02] font-semibold tracking-[-0.04em]">
              Trips
              <Dot />
            </h1>
            <Link to="/profile" aria-label="Profile" className="press rounded-full">
              <Avatar person={me} size={40} />
            </Link>
          </header>

          {/* Story rail: each trip is a round cover whose ring fills as the budget is used */}
          <div role="tablist" aria-label="Your trips" className="no-scrollbar -mx-6 mt-8 flex gap-5 overflow-x-auto px-6 py-1 lg:mx-0 lg:px-0">
            <button type="button" onClick={() => openTrip()} className="press group shrink-0 text-center" aria-label="Plan a new trip">
              <span className="flex size-[72px] items-center justify-center rounded-full bg-white/20 text-white">
                <Plus size={26} weight="bold" aria-hidden />
              </span>
              <span className="mt-2 block text-caption font-medium text-ink-3">New</span>
            </button>
            {ordered.map((v, i) => {
              const on = v.trip.id === trip.id
              const ratio = v.trip.budget ? Math.min(1, v.ledger.total / v.trip.budget) : v.status.phase === 'completed' ? 1 : 0.12
              return (
                <button key={v.trip.id} type="button" role="tab" aria-selected={on} onClick={() => setPicked(v.trip.id)} className="press shrink-0 text-center">
                  <span className={cx('relative block size-[72px] rounded-full p-[3px] transition-transform duration-300 ease-[var(--ease-out-expo)]', on && 'scale-[1.08] shadow-[0_0_0_4px_rgba(255,255,255,0.28)]')} style={{ background: `conic-gradient(#fff ${ratio * 360}deg, rgba(255,255,255,0.3) 0)` }}>
                    <Cover photo={v.trip.cover} seed={i + 1} className="size-full rounded-full border-[3px] border-[var(--sky-1)]" />
                    {v.status.phase === 'ongoing' ? (
                      <span className="absolute -top-1 -right-2 flex items-center gap-1 rounded-full bg-[#1f9d63] px-2 py-[3px] text-[10px] leading-none font-bold tracking-wide text-white shadow-[0_2px_8px_rgba(8,60,30,0.4)]">
                        <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-white" />
                        LIVE
                      </span>
                    ) : null}
                  </span>
                  <span className={cx('mt-2 block max-w-[76px] truncate text-caption', on ? 'font-bold text-ink' : 'font-medium text-ink-3')}>{v.trip.name.split(/[ ,]/)[0]}</span>
                  <span aria-hidden className={cx('mx-auto mt-1 block h-[3px] rounded-full bg-white transition-all duration-300', on ? 'w-5 opacity-100' : 'w-0 opacity-0')} />
                </button>
              )
            })}
          </div>

          {/* The selected trip's numbers sit straight on the sky */}
          <div className="mt-7">
            <p className="text-meta font-semibold text-ink-3">
              {trip.name} · {phaseLabel(trip, status)}
            </p>
            <Figure value={ledger.total} currency={cur} size="xl" className="mt-1.5" />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={cx('level num', myNet > 0 ? 'ok' : myNet < 0 ? 'act' : 'quiet')}>
                {myNet > 0 ? `You get back ${formatMoney(myNet, { currency: cur })}` : myNet < 0 ? `You owe ${formatMoney(-myNet, { currency: cur })}` : 'You are all square'}
              </span>
              {trip.budget ? <span className="text-caption font-medium text-ink-3">{Math.round((ledger.total / trip.budget) * 100)}% of budget</span> : null}
            </div>
            {bars.length > 1 ? (
              <div className="mt-6 max-w-[420px]">
                <div className="flex h-[64px] items-end gap-[5px]" role="img" aria-label={`Spend by day, biggest day ${formatMoney(peak, { currency: cur })}`}>
                  {bars.map(([d, v]) => {
                    // Square-root scale so one big day does not flatten every other day
                    const h = 22 + 78 * Math.sqrt(v / peak)
                    return <span key={d} className="max-w-[22px] flex-1 rounded-[7px]" style={{ height: `${h}%`, background: v === peak ? '#fff' : 'rgba(255,255,255,0.38)' }} />
                  })}
                </div>
                {peakDay ? <p className="num mt-2 text-caption text-ink-3">Biggest day: {fmt.dayMonth(peakDay[0])}, {formatMoney(peak, { currency: cur })}</p> : null}
              </div>
            ) : null}
          </div>
        </div>
      </SkyHero>

      <ContentSheet>
        <SheetBody className="pt-8">
          {status.phase === 'ended' ? (
            <div className="panel mb-6 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[28px] p-5">
              <p className="min-w-0 flex-1 text-meta text-ink-2">{trip.name} ended {status.days === 1 ? 'yesterday' : `${status.days} days ago`}. Mark it complete to keep it as a journal.</p>
              <Button
                size="sm"
                variant="secondary"
                icon={CheckCircle}
                iconWeight="duotone"
                onClick={() => {
                  saveTrip({ ...trip, completed: true, completedAt: new Date().toISOString() })
                  toast.success(`${trip.name} marked complete`)
                }}
              >
                Mark complete
              </Button>
            </div>
          ) : null}

          <div className="mx-auto max-w-[680px]">
            <Segmented<Panel>
              label="Trip details"
              value={panel}
              onChange={setPanel}
              options={[
                { value: 'activity', label: 'Activity' },
                { value: 'balances', label: 'Balances' },
                { value: 'plans', label: 'Plans' },
              ]}
            />

            <div className="mt-5">
              {panel === 'activity' ? (
                expenses.length ? (
                  <ul className="panel-strong rows overflow-hidden rounded-[28px]">
                    {expenses.slice(0, 4).map((e) => (
                      <li key={e.id}>
                        <ExpenseRow expense={e} currency={cur} settled={settled} onOpen={() => setOpen(e)} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="panel rounded-[28px] p-6 text-body text-ink-3">No expenses yet. Add the first one when someone pays for something.</p>
                )
              ) : null}
              {panel === 'balances' ? (
                <>
                  <BalanceList view={view} members={members} />
                  <p className="mt-3 px-1 text-caption text-ink-3">{settled ? 'Everyone is settled up.' : `${transfers.length} ${transfers.length === 1 ? 'payment settles' : 'payments settle'} everyone.`}</p>
                </>
              ) : null}
              {panel === 'plans' ? <TripGlance view={view} /> : null}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button size="lg" icon={Plus} onClick={() => openExpense({ tripId: trip.id })} disabled={data.trips.length === 0}>
                Add expense
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate(`/trips/${trip.id}/settle`)}>
                Settle up
              </Button>
            </div>
            <Link to={`/trips/${trip.id}`} className="mt-4 flex h-12 items-center justify-center gap-1 text-[14px] font-semibold text-accent-ink">
              Open {trip.name} <CaretRight size={14} weight="bold" aria-hidden />
            </Link>
            <p className="num mt-1 text-center text-caption text-ink-3">
              {formatRange(trip.startDate, trip.endDate)} · {members.length} {members.length === 1 ? 'traveller' : 'travellers'}
            </p>
          </div>
        </SheetBody>
      </ContentSheet>
      <ExpenseDetailSheet expense={open ? (data.expenses.find((x) => x.id === open.id) ?? null) : null} onClose={() => setOpen(null)} />
    </>
  )
}

function FirstRun() {
  const { me, resetDemo } = useStore()
  const { openTrip } = useUI()
  return (
    <div className="px-4 pt-[max(16px,env(safe-area-inset-top))] lg:px-10 lg:pt-8">
      <section className="tone-ink mx-auto flex min-h-[78dvh] max-w-[560px] flex-col justify-end rounded-[30px] px-6 pt-16 pb-6">
        <BrandMark size={44} />
        <h1 className="mt-6 text-hero">Welcome, {firstName(me.name)}</h1>
        <p className="mt-3 text-body text-white/75">
          Make a trip, invite the people going, and add expenses as they happen. TripMate works out who owes whom, and keeps every trip as a journal when you are home.
        </p>
        <div className="mt-8 flex flex-col gap-2">
          <button type="button" onClick={() => openTrip()} className="press flex h-14 items-center justify-center gap-2 rounded-full bg-white text-base font-semibold text-[#0d1b2a]">
            <Plus size={18} weight="bold" aria-hidden />
            Create your first trip
          </button>
          <button type="button" onClick={resetDemo} className="press flex h-14 items-center justify-center rounded-full bg-white/14 text-base font-semibold text-white backdrop-blur-[16px]">
            Explore sample trips
          </button>
        </div>
      </section>
    </div>
  )
}
