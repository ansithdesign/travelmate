import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CaretRight, CheckCircle, Plus } from '@phosphor-icons/react'
import { phaseLabel } from '../components/trips/status'
import { CategoryIcon } from '../components/icons/CategoryIcon'
import { ExpenseDetailSheet } from '../components/expenses/ExpenseDetailSheet'
import { ExpenseRow } from '../components/expenses/ExpenseRow'
import { BrandMark } from '../components/shared/BrandMark'
import { ContentSheet, Dot, SheetBody, SkyHero } from '../components/shared/Page'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { ScrollRow } from '../components/ui/ScrollRow'
import { Cover } from '../components/ui/Cover'
import { Figure } from '../components/ui/Money'
import { useToast } from '../components/ui/Toast'
import { useAllTripViews } from '../hooks/useTrip'
import { useStore } from '../store/store'
import { useUI } from '../store/ui'
import type { CategoryId, Expense } from '../types'
import { cx } from '../utils/cx'
import { firstName } from '../utils/id'
import { formatMoney } from '../utils/money'

/** The categories offered on Home for one-tap adding. */
const QUICK: { id: CategoryId; label: string }[] = [
  { id: 'food', label: 'Food' },
  { id: 'cabs', label: 'Cabs' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'groceries', label: 'Groceries' },
  { id: 'stay', label: 'Stay' },
  { id: 'activities', label: 'Activities' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'other', label: 'Other' },
]

export function Home() {
  const views = useAllTripViews()
  const { me, saveTrip } = useStore()
  const { openTrip, openExpense } = useUI()
  const navigate = useNavigate()
  const toast = useToast()
  const [picked, setPicked] = useState<string | null>(null)
  const [open, setOpen] = useState<Expense | null>(null)
  const { data } = useStore()

  // Rail order: what is happening or coming first, then trips that just ended, then the journal.
  const ordered = useMemo(() => {
    const rank = { ongoing: 0, upcoming: 1, ended: 2, completed: 3 } as const
    return [...views].sort((a, b) => rank[a.status.phase] - rank[b.status.phase] || (a.status.phase === 'completed' ? b.trip.endDate.localeCompare(a.trip.endDate) : a.trip.startDate.localeCompare(b.trip.startDate)))
  }, [views])

  if (views.length === 0) return <FirstRun />

  const view = ordered.find((v) => v.trip.id === picked) ?? ordered[0]
  const { trip, status, ledger, expenses, settled } = view
  const cur = trip.currency
  const myNet = ledger.net[me.id] ?? 0
  const others = ordered.filter((v) => v.trip.id !== trip.id)

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
              <Avatar
                person={me}
                size={42}
                className="backdrop-blur-[10px] tracking-[0.04em] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_6px_16px_-8px_rgba(5,12,34,0.6)]"
                style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.2), rgba(8,18,48,0.42) 70%)', fontSize: 14 }}
              />
            </Link>
          </header>

          {/* Story rail: each trip is a round cover whose ring fills as the budget is used.
              The selected trip's ring turns gold and its name gets an underline. */}
          <ScrollRow role="tablist" aria-label="Your trips" className="-mx-6 mt-7 flex gap-5 px-6 lg:mx-0 lg:px-0">
            <button type="button" onClick={() => openTrip()} className="press shrink-0 text-center" aria-label="Plan a new trip">
              <span className="flex size-[72px] items-center justify-center rounded-full bg-[rgba(8,18,48,0.34)] text-white">
                <Plus size={26} weight="bold" aria-hidden />
              </span>
              <span className="mt-2 block text-caption font-medium text-ink-3">New</span>
              <span aria-hidden className="mt-1 block h-[3px]" />
            </button>
            {ordered.map((v, i) => {
              const on = v.trip.id === trip.id
              const ratio = v.trip.budget ? Math.min(1, v.ledger.total / v.trip.budget) : v.status.phase === 'completed' ? 1 : 0.12
              const ring = on ? '#ffd479' : '#ffffff'
              return (
                <button key={v.trip.id} type="button" role="tab" aria-selected={on} onClick={() => (on ? navigate(`/trips/${v.trip.id}`) : setPicked(v.trip.id))} className="press shrink-0 text-center" aria-label={on ? `Open ${v.trip.name}` : v.trip.name}>
                  <span className="relative block size-[72px] rounded-full p-[3px]" style={{ background: `conic-gradient(${ring} ${ratio * 360}deg, rgba(255,255,255,0.3) 0)` }}>
                    <Cover photo={v.trip.cover} seed={i + 1} className="size-full rounded-full border-[3px] border-[var(--sky-1)]" />
                    {v.status.phase === 'ongoing' ? (
                      <span className="absolute -top-1 right-0 flex items-center gap-1 rounded-full bg-[#1f9d63] px-2 py-[3px] text-[10px] leading-none font-bold tracking-wide text-white shadow-[0_2px_8px_rgba(8,60,30,0.4)]">
                        <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-white" />
                        LIVE
                      </span>
                    ) : null}
                  </span>
                  <span className={cx('mt-2 block max-w-[76px] truncate text-caption', on ? 'font-bold text-ink' : 'font-medium text-ink-3')}>{v.trip.name.split(/[ ,]/)[0]}</span>
                  <span aria-hidden className={cx('mx-auto mt-1 block h-[3px] w-5 rounded-full bg-[#ffd479] transition-opacity duration-300', on ? 'opacity-100' : 'opacity-0')} />
                </button>
              )
            })}
            <span aria-hidden className="w-4 shrink-0" />
          </ScrollRow>

          {/* The selected trip's numbers sit straight on the sky */}
          <div className="mt-7">
            <Link to={`/trips/${trip.id}`} className="press -ml-1 flex w-fit max-w-full items-center gap-2.5 rounded-full py-1 pr-2 pl-1 text-meta leading-none font-semibold text-ink-3 hover:text-ink">
              <span className="truncate leading-5">
                {trip.name} · {phaseLabel(trip, status)}
              </span>
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/25 text-white">
                <CaretRight size={12} weight="bold" aria-hidden />
              </span>
            </Link>
            <Figure value={ledger.total} currency={cur} size="xl" className="mt-1.5" />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={cx('level num', myNet > 0 ? 'ok' : myNet < 0 ? 'act' : 'quiet')}>
                {myNet > 0 ? `You get back ${formatMoney(myNet, { currency: cur })}` : myNet < 0 ? `You owe ${formatMoney(-myNet, { currency: cur })}` : 'You are all square'}
              </span>
              {trip.budget ? <span className="text-caption font-medium text-ink-3">{Math.round((ledger.total / trip.budget) * 100)}% of budget</span> : null}
            </div>
          </div>
        </div>

        {/* Add in one tap: category icons that open the expense form with that category chosen */}
        <section aria-labelledby="quick-add" className="panel mt-7 rounded-[30px] p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="quick-add" className="text-heading">
              Add in one tap
            </h2>
            <span className="text-caption text-ink-3">then type the amount</span>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-x-1 gap-y-4">
            {QUICK.map((c) => (
              <button key={c.id} type="button" onClick={() => openExpense({ tripId: trip.id, category: c.id })} className="press flex flex-col items-center gap-1.5 rounded-[18px] py-1 text-center">
                <CategoryIcon id={c.id} size={44} />
                <span className="text-[12px] font-medium text-ink-2">{c.label}</span>
              </button>
            ))}
          </div>
        </section>
      </SkyHero>

      <ContentSheet>
        <SheetBody className="pt-4">
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

          <div className="mx-auto flex max-w-[680px] flex-col gap-9">
            <section aria-labelledby="just-in">
              <div className="flex min-h-11 items-center justify-between gap-3 px-0.5">
                <h2 id="just-in" className="text-title">
                  Just in
                </h2>
                {expenses.length ? (
                  <Link to={`/trips/${trip.id}/expenses`} className="inline-flex h-10 items-center gap-1 text-[14px] font-semibold text-accent-ink">
                    See all {expenses.length} <CaretRight size={14} weight="bold" aria-hidden />
                  </Link>
                ) : null}
              </div>
              {expenses.length ? (
                <ul className="panel-strong rows mt-3 overflow-hidden rounded-[28px]">
                  {expenses.slice(0, 3).map((e) => (
                    <li key={e.id}>
                      <ExpenseRow expense={e} currency={cur} settled={settled} onOpen={() => setOpen(e)} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="panel mt-3 rounded-[28px] p-6 text-body text-ink-3">Nothing yet. Tap a category above when someone pays for something.</p>
              )}
            </section>

            {others.length ? (
              <section aria-labelledby="other-trips">
                <h2 id="other-trips" className="px-0.5 text-meta font-semibold text-ink-3">
                  Other trips
                </h2>
                <ScrollRow className="-mx-6 mt-3 flex gap-2.5 px-6">
                  {others.map((v) => {
                    const n = v.ledger.net[me.id] ?? 0
                    const note = v.status.phase === 'completed' && v.settled ? 'settled' : n < 0 ? `owe ${formatMoney(-n, { currency: v.trip.currency, round: true })}` : n > 0 ? `owed ${formatMoney(n, { currency: v.trip.currency, round: true })}` : phaseLabel(v.trip, v.status)
                    return (
                      <Link key={v.trip.id} to={`/trips/${v.trip.id}`} className="glass-control press inline-flex h-12 shrink-0 items-center rounded-full px-5 text-[14px] font-medium whitespace-nowrap">
                        {v.trip.name.split(/[ ,]/)[0]} · {note}
                      </Link>
                    )
                  })}
                  <span aria-hidden className="w-6 shrink-0" />
                </ScrollRow>
              </section>
            ) : null}
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
