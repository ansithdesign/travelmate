import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Plus, Scan } from '@phosphor-icons/react'
import { FeaturedTrip, TripRow, TripWindowCard } from '../components/trips/TripCards'
import { Button } from '../components/ui/Button'
import { Window } from '../components/ui/Cover'
import { Avatar } from '../components/ui/Avatar'
import { BrandMark } from '../components/shared/BrandMark'
import { ContentSheet, SheetBody, SkyHero } from '../components/shared/Page'
import { useAllTripViews, type TripView } from '../hooks/useTrip'
import { useStore } from '../store/store'
import { useUI } from '../store/ui'
import { useToast } from '../components/ui/Toast'
import { greeting, parseDate, tripLength } from '../utils/dates'
import { firstName } from '../utils/id'
import { formatMoney } from '../utils/money'
import { cx } from '../utils/cx'

export function Home() {
  const views = useAllTripViews()
  const { me, saveTrip } = useStore()
  const { openTrip, openExpense } = useUI()
  const toast = useToast()

  if (views.length === 0) return <FirstRun />

  const active = views
    .filter((v) => v.status.phase === 'upcoming' || v.status.phase === 'ongoing')
    .sort((a, b) => (a.status.phase === 'ongoing' ? -1 : b.status.phase === 'ongoing' ? 1 : a.trip.startDate.localeCompare(b.trip.startDate)))
  const ended = views.filter((v) => v.status.phase === 'ended')
  const past = views.filter((v) => v.status.phase === 'completed').sort((a, b) => b.trip.endDate.localeCompare(a.trip.endDate))
  const lead = active[0]

  return (
    <>
      <SkyHero className="pt-[max(14px,env(safe-area-inset-top))] pb-8 lg:pt-8">
        <header className="flex items-center justify-between gap-3 lg:hidden">
          <span className="flex items-center gap-2.5">
            <BrandMark size={30} />
            <span className="text-sky text-heading">TripMate</span>
          </span>
          <Button size="sm" variant="sky" icon={Plus} onClick={() => openTrip()}>
            New trip
          </Button>
        </header>

        <h1 className="text-sky mt-8 text-hero lg:mt-2">
          {greeting()},<br className="sm:hidden" /> {firstName(me.name)}
        </h1>
        <YearLine views={views} />

        <div className="mt-8 lg:max-w-[640px]">
          {lead ? (
            <>
              <FeaturedTrip view={lead} />
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <Button variant="white" size="lg" icon={Plus} onClick={() => openExpense({ tripId: lead.trip.id })}>
                  Add expense
                </Button>
                <Button variant="sky" size="lg" icon={Scan} iconWeight="bold" onClick={() => openExpense({ tripId: lead.trip.id, scan: true })}>
                  Scan receipt
                </Button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] items-center gap-6">
              <Window seed={2} shade={0.4} className="aspect-[0.76] w-full" />
              <div>
                <p className="text-sky text-title">Nothing booked yet</p>
                <p className="text-sky-2 mt-1 text-body">Start a trip and the money, plans and people land in one place.</p>
                <Button className="mt-4" variant="white" icon={Plus} onClick={() => openTrip()}>
                  Plan a trip
                </Button>
              </div>
            </div>
          )}
        </div>
      </SkyHero>

      <ContentSheet>
        <SheetBody>
          {ended.map((v) => (
            <div key={v.trip.id} className="panel mb-6 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[22px] p-4">
              <p className="min-w-0 flex-1 text-meta text-ink-2">
                <Link to={`/trips/${v.trip.id}`} className="font-semibold text-ink hover:underline">
                  {v.trip.name}
                </Link>{' '}
                ended {v.status.days === 1 ? 'yesterday' : `${v.status.days} days ago`}. Mark it complete to keep it as a journal.
              </p>
              <Button
                size="sm"
                variant="secondary"
                icon={CheckCircle}
                iconWeight="duotone"
                onClick={() => {
                  saveTrip({ ...v.trip, completed: true, completedAt: new Date().toISOString() })
                  toast.success(`${v.trip.name} marked complete`)
                }}
              >
                Mark complete
              </Button>
            </div>
          ))}

          <div className="grid gap-x-10 gap-y-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <OutstandingSummary views={views} />

            {active.length > 1 ? (
              <section aria-labelledby="coming-up">
                <h2 id="coming-up" className="text-heading">
                  Also coming up
                </h2>
                <div className="mt-2 -mx-2 flex flex-col">
                  {active.slice(1).map((v, i) => (
                    <TripRow key={v.trip.id} view={v} seed={i + 2} />
                  ))}
                </div>
              </section>
            ) : null}

            <section aria-labelledby="past-trips" className="lg:col-span-2">
              <div className="flex items-baseline justify-between">
                <h2 id="past-trips" className="text-heading">
                  Past trips
                </h2>
                <span className="num text-meta text-ink-3">{past.length}</span>
              </div>
              {past.length ? (
                <div className="no-scrollbar -mx-5 mt-4 flex snap-x gap-5 overflow-x-auto px-5 pb-2 sm:-mx-7 sm:px-7 lg:mx-0 lg:px-0">
                  {past.map((v, i) => (
                    <TripWindowCard key={v.trip.id} view={v} seed={i + 1} />
                  ))}
                </div>
              ) : (
                <p className="mt-2 max-w-[48ch] text-body text-ink-2">Finished trips become journal pages here, with what they cost and how they settled.</p>
              )}
            </section>
          </div>
        </SheetBody>
      </ContentSheet>
    </>
  )
}

/** One calm sentence instead of a stat-card row. */
function YearLine({ views }: { views: TripView[] }) {
  const { me } = useStore()
  const year = new Date().getFullYear()
  const thisYear = views.filter((v) => parseDate(v.trip.startDate).getFullYear() === year && v.trip.currency === 'INR')
  const myShare = thisYear.reduce((a, v) => a + (v.ledger.share[me.id] ?? 0), 0)
  const days = thisYear.filter((v) => v.status.phase !== 'upcoming').reduce((a, v) => a + tripLength(v.trip.startDate, v.trip.endDate), 0)
  if (thisYear.length === 0) return <p className="text-sky-2 mt-2 text-body">Every trip, every expense, every memory, in one place.</p>
  return (
    <p className="text-sky-2 mt-2 max-w-[44ch] text-body">
      {year} so far: <span className="num font-semibold text-white">{formatMoney(myShare, { round: true })}</span> your share across{' '}
      <span className="num font-semibold text-white">{thisYear.length}</span> {thisYear.length === 1 ? 'trip' : 'trips'}
      {days ? (
        <>
          , <span className="num font-semibold text-white">{days}</span> days away.
        </>
      ) : (
        '.'
      )}
    </p>
  )
}

function OutstandingSummary({ views }: { views: TripView[] }) {
  const { me, person } = useStore()
  const rows = views
    .flatMap((v) =>
      v.transfers
        .filter((t) => t.from === me.id || t.to === me.id)
        .map((t) => ({ trip: v.trip, other: person(t.from === me.id ? t.to : t.from), amount: t.from === me.id ? -t.amount : t.amount })),
    )
    .filter((r) => r.other)
  if (rows.length === 0) return null
  return (
    <section aria-labelledby="to-settle">
      <h2 id="to-settle" className="text-heading">
        To settle
      </h2>
      <ul className="panel mt-3 divide-y divide-line overflow-hidden rounded-[24px]">
        {rows.map((r, i) => (
          <li key={i}>
            <Link to={`/trips/${r.trip.id}/settle`} className="group flex items-center gap-3 px-4 py-3.5 hover:bg-well">
              <Avatar person={r.other!} size={40} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{r.amount > 0 ? `${firstName(r.other!.name)} owes you` : `You owe ${firstName(r.other!.name)}`}</span>
                <span className="block truncate text-meta text-ink-3">{r.trip.name}</span>
              </span>
              <span className={cx('num shrink-0 text-heading', r.amount > 0 ? 'text-gain' : 'text-loss')}>{formatMoney(Math.abs(r.amount), { currency: r.trip.currency })}</span>
              <ArrowRight size={16} weight="bold" className="shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function FirstRun() {
  const { me, resetDemo } = useStore()
  const { openTrip } = useUI()
  return (
    <SkyHero className="flex min-h-[86dvh] flex-col justify-center py-12">
      <div className="mx-auto w-full max-w-[460px]">
        <Window seed={1} shade={0.3} eager className="mx-auto aspect-[0.76] w-[56%]" />
        <h1 className="text-sky mt-10 text-hero">Welcome aboard, {firstName(me.name)}</h1>
        <p className="text-sky-2 mt-3 text-body">
          Make a trip, invite the people going, and add expenses as they happen. TripMate works out who owes whom, and keeps every trip as a journal when you are home.
        </p>
        <div className="mt-8 flex flex-col gap-2.5">
          <Button size="lg" variant="white" icon={Plus} onClick={() => openTrip()}>
            Create your first trip
          </Button>
          <Button size="lg" variant="sky" onClick={resetDemo}>
            Explore sample trips
          </Button>
        </div>
      </div>
    </SkyHero>
  )
}
