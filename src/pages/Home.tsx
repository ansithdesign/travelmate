import { Link } from 'react-router-dom'
import { Plus, ReceiptText, ScanLine } from 'lucide-react'
import { FeaturedTrip, TripRow } from '../components/trips/TripCards'
import { Button } from '../components/ui/Button'
import { Milestone } from '../components/ui/Milestone'
import { useAllTripViews, type TripView } from '../hooks/useTrip'
import { useStore } from '../store/store'
import { useUI } from '../store/ui'
import { greeting, parseDate, tripLength } from '../utils/dates'
import { firstName } from '../utils/id'
import { formatMoney } from '../utils/money'
import { useToast } from '../components/ui/Toast'
import { BrandMark } from '../components/shared/BrandMark'

export function Home() {
  const views = useAllTripViews()
  const { me, saveTrip } = useStore()
  const { openTrip, openExpense } = useUI()
  const toast = useToast()

  const active = views
    .filter((v) => v.status.phase === 'upcoming' || v.status.phase === 'ongoing')
    .sort((a, b) => (a.status.phase === 'ongoing' ? -1 : b.status.phase === 'ongoing' ? 1 : a.trip.startDate.localeCompare(b.trip.startDate)))
  const ended = views.filter((v) => v.status.phase === 'ended')
  const past = views.filter((v) => v.status.phase === 'completed').sort((a, b) => b.trip.endDate.localeCompare(a.trip.endDate))
  const lead = active[0]
  const restActive = active.slice(1)

  if (views.length === 0) return <FirstRun />

  return (
    <div className="mx-auto w-full max-w-[1080px] px-4 pt-5 pb-12 sm:px-6 lg:px-8 lg:pt-10">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 lg:hidden">
          <BrandMark size={24} onDark={false} />
          <span className="text-heading">TripMate</span>
        </div>
        <Button size="sm" variant="secondary" icon={Plus} onClick={() => openTrip()} className="lg:hidden">
          New trip
        </Button>
      </header>

      <h1 className="mt-6 text-display lg:mt-0">
        {greeting()}, {firstName(me.name)}
      </h1>
      <YearLine views={views} />

      <div className="mt-7 grid gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {ended.map((v) => (
            <div key={v.trip.id} className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md bg-surface px-4 py-3 hairline">
              <p className="min-w-0 flex-1 text-meta text-ink-2">
                <Link to={`/trips/${v.trip.id}`} className="font-medium text-ink hover:underline">
                  {v.trip.name}
                </Link>{' '}
                ended {v.status.days === 1 ? 'yesterday' : `${v.status.days} days ago`}. Mark it complete to keep it in your journal.
              </p>
              <Button
                size="sm"
                variant="quiet"
                onClick={() => {
                  saveTrip({ ...v.trip, completed: true, completedAt: new Date().toISOString() })
                  toast.success(`${v.trip.name} marked complete`)
                }}
              >
                Mark complete
              </Button>
            </div>
          ))}

          {lead ? (
            <section aria-labelledby="next-trip">
              <h2 id="next-trip" className="sr-only">
                {lead.status.phase === 'ongoing' ? 'Current trip' : 'Next trip'}
              </h2>
              <FeaturedTrip view={lead} />
              <div className="mt-3 grid grid-cols-2 gap-2 sm:flex">
                <Button icon={Plus} onClick={() => openExpense({ tripId: lead.trip.id })} className="sm:flex-none">
                  Add expense
                </Button>
                <Button variant="secondary" icon={ScanLine} onClick={() => openExpense({ tripId: lead.trip.id, scan: true })}>
                  Scan receipt
                </Button>
                <Link
                  to="/expenses"
                  className="col-span-2 hidden h-11 items-center gap-2 rounded-md px-3 text-body font-medium text-ink-2 hover:bg-sunken/70 hover:text-ink sm:ml-auto sm:inline-flex"
                >
                  <ReceiptText size={18} aria-hidden /> All expenses
                </Link>
              </div>
            </section>
          ) : (
            <section className="rounded-lg bg-surface px-5 py-8 text-center hairline">
              <Milestone tone="amber" cap="Next" value="?" size="md" label="No trip planned" />
              <h2 className="mt-4 text-heading">Nothing planned yet</h2>
              <p className="mx-auto mt-1 max-w-[36ch] text-body text-ink-2">Start a trip now and the expenses, bookings and people all land in one place.</p>
              <Button className="mt-5" icon={Plus} onClick={() => openTrip()}>
                Plan a trip
              </Button>
            </section>
          )}

          {restActive.length ? (
            <section className="mt-10" aria-labelledby="coming-up">
              <h2 id="coming-up" className="text-heading">
                Also coming up
              </h2>
              <ul className="mt-1 divide-y divide-line">
                {restActive.map((v) => (
                  <li key={v.trip.id}>
                    <TripRow view={v} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="min-w-0">
          <OutstandingSummary views={views} />
          <section aria-labelledby="past-trips" className="mt-8 first:mt-0">
            <div className="flex items-baseline justify-between">
              <h2 id="past-trips" className="text-heading">
                Past trips
              </h2>
              <span className="text-meta text-ink-3">{past.length}</span>
            </div>
            {past.length ? (
              <ul className="mt-1 divide-y divide-line">
                {past.map((v) => (
                  <li key={v.trip.id}>
                    <TripRow view={v} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-body text-ink-2">Finished trips become journal pages here, with what they cost and how they settled.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}

/** One calm sentence instead of a stat-card row. */
function YearLine({ views }: { views: TripView[] }) {
  const { me } = useStore()
  const year = new Date().getFullYear()
  const thisYear = views.filter((v) => parseDate(v.trip.startDate).getFullYear() === year && v.trip.currency === 'INR')
  const myShare = thisYear.reduce((a, v) => a + (v.ledger.share[me.id] ?? 0), 0)
  const days = thisYear.filter((v) => v.status.phase !== 'upcoming').reduce((a, v) => a + tripLength(v.trip.startDate, v.trip.endDate), 0)
  if (thisYear.length === 0) return <p className="mt-2 text-body text-ink-2">Every trip, every expense, every memory, in one place.</p>
  return (
    <p className="mt-2 max-w-[52ch] text-body text-ink-2">
      In {year} your share comes to <span className="num font-medium text-ink">{formatMoney(myShare, { round: true })}</span> across{' '}
      <span className="num font-medium text-ink">{thisYear.length}</span> {thisYear.length === 1 ? 'trip' : 'trips'}
      {days ? (
        <>
          {' '}
          and <span className="num font-medium text-ink">{days}</span> days away.
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
    <section aria-labelledby="to-settle" className="mb-8">
      <h2 id="to-settle" className="text-heading">
        To settle
      </h2>
      <ul className="mt-1 divide-y divide-line">
        {rows.map((r, i) => (
          <li key={i}>
            <Link to={`/trips/${r.trip.id}/settle`} className="flex items-center justify-between gap-3 py-3 hover:text-forest">
              <span className="min-w-0">
                <span className="block truncate font-medium">{r.amount > 0 ? `${firstName(r.other!.name)} owes you` : `You owe ${firstName(r.other!.name)}`}</span>
                <span className="block truncate text-meta text-ink-3">{r.trip.name}</span>
              </span>
              <span className={`num shrink-0 font-medium ${r.amount > 0 ? 'text-forest' : 'text-brick'}`}>{formatMoney(Math.abs(r.amount), { currency: r.trip.currency })}</span>
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
    <div className="mx-auto flex min-h-[80dvh] w-full max-w-[520px] flex-col justify-center px-6 py-12">
      <Milestone tone="amber" cap="Km" value="0" size="lg" label="Zero kilometres travelled" />
      <h1 className="mt-8 text-display">Welcome, {firstName(me.name)}</h1>
      <p className="mt-3 text-body text-ink-2">
        Make a trip, invite the people going, and add expenses as they happen. TripMate works out who owes whom and keeps the trip as a journal when you are back.
      </p>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <Button size="lg" icon={Plus} onClick={() => openTrip()}>
          Create your first trip
        </Button>
        <Button size="lg" variant="ghost" onClick={resetDemo}>
          Explore sample trips
        </Button>
      </div>
    </div>
  )
}
