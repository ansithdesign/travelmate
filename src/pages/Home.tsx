import { Link } from 'react-router-dom'
import { CaretRight, CheckCircle, Plus } from '@phosphor-icons/react'
import { FeaturedTrip, PastTripCard, TripRow, TripWindowCard } from '../components/trips/TripCards'
import { Button } from '../components/ui/Button'
import { SkyArt } from '../components/shared/SkyArt'
import { Avatar } from '../components/ui/Avatar'
import { BrandMark } from '../components/shared/BrandMark'
import { ContentSheet, Dot, SheetBody, SkyHero } from '../components/shared/Page'
import { useAllTripViews, type TripView } from '../hooks/useTrip'
import { useStore } from '../store/store'
import { useUI } from '../store/ui'
import { useToast } from '../components/ui/Toast'
import { parseDate, tripLength } from '../utils/dates'
import { firstName } from '../utils/id'
import { formatMoney } from '../utils/money'
import { cx } from '../utils/cx'

export function Home() {
  const views = useAllTripViews()
  const { me, saveTrip } = useStore()
  const { openTrip } = useUI()
  const toast = useToast()
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

  if (views.length === 0) return <FirstRun />

  const active = views
    .filter((v) => v.status.phase === 'upcoming' || v.status.phase === 'ongoing')
    .sort((a, b) => (a.status.phase === 'ongoing' ? -1 : b.status.phase === 'ongoing' ? 1 : a.trip.startDate.localeCompare(b.trip.startDate)))
  const ended = views.filter((v) => v.status.phase === 'ended')
  const past = views.filter((v) => v.status.phase === 'completed').sort((a, b) => b.trip.endDate.localeCompare(a.trip.endDate))
  const lead = active[0]

  return (
    <>
      <SkyHero className="pt-[max(28px,env(safe-area-inset-top))] pb-12 lg:pt-12">
        <header className="flex items-end justify-between gap-3">
          <div>
            <p className="text-body text-ink-3">{greeting},</p>
            <h1 className="mt-0.5 text-[46px] leading-[1.02] font-semibold tracking-[-0.045em]">
              {firstName(me.name)}
              <Dot />
            </h1>
          </div>
          <Button size="sm" variant="secondary" icon={Plus} onClick={() => openTrip()} className="mb-0.5 lg:hidden">
            New trip
          </Button>
        </header>
        <YearLine views={views} />

        <div className="mt-10 lg:grid lg:grid-cols-[minmax(0,560px)_minmax(360px,1fr)] lg:items-start lg:gap-10">
        <div>
          {lead ? (
            <FeaturedTrip view={lead} />
          ) : (
            <div className="panel flex items-center gap-5 rounded-[26px] p-5">
              <SkyArt size={96} className="shrink-0" />
              <div>
                <p className="text-title">Nothing planned yet</p>
                <p className="mt-1 text-body text-ink-3">Start a trip and the money, plans and people land in one place.</p>
                <Button className="mt-4" size="sm" icon={Plus} onClick={() => openTrip()}>
                  Plan a trip
                </Button>
              </div>
            </div>
          )}
        </div>
        <aside className="hidden lg:block">
          {views.some((v) => v.transfers.some((t) => t.from === me.id || t.to === me.id)) ? (
          <div>
            <OutstandingSummary views={views} />
            <p className="mt-3 px-1 text-caption text-ink-3">Balances update the moment anyone adds an expense or marks a payment.</p>
          </div>
          ) : null}
        </aside>
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

          <div className="grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="section-rule lg:hidden">
              <OutstandingSummary views={views} />
            </div>

            {active.length > 1 ? (
              <section aria-labelledby="coming-up" className="section-rule">
                <h2 id="coming-up" className="flex min-h-11 items-center px-0.5 text-title">
                  Also coming up
                </h2>
                <div className="panel-strong rows mt-3 flex flex-col overflow-hidden rounded-[28px]">
                  {active.slice(1).map((v, i) => (
                    <TripRow key={v.trip.id} view={v} seed={i + 2} />
                  ))}
                </div>
              </section>
            ) : null}

            <section aria-labelledby="past-trips" className="section-rule lg:col-span-2">
              <div className="flex min-h-11 items-center justify-between px-0.5">
                <h2 id="past-trips" className="text-title">
                  Past trips
                </h2>
                <span className="num text-meta text-ink-3">{past.length}</span>
              </div>
              {past.length ? (
                <>
                  <div className="no-scrollbar -mx-6 mt-2 flex snap-x scroll-px-6 gap-5 overflow-x-auto px-6 py-4 sm:-mx-6 sm:px-6 lg:hidden">
                    {past.map((v, i) => (
                      <TripWindowCard key={v.trip.id} view={v} seed={i + 1} />
                    ))}
                  </div>
                  <div className="mt-2 hidden gap-4 lg:grid lg:grid-cols-2">
                    {past.map((v, i) => (
                      <PastTripCard key={v.trip.id} view={v} seed={i + 1} />
                    ))}
                  </div>
                </>
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
  if (thisYear.length === 0) return <p className="mt-2 text-body text-ink-3">Every trip, every expense, every memory, in one place.</p>
  return (
    <p className="mt-2 max-w-[44ch] text-body text-ink-3">
      {year} so far: <span className="num font-semibold text-ink">{formatMoney(myShare, { round: true })}</span> your share across{' '}
      <span className="num font-semibold text-ink">{thisYear.length}</span> {thisYear.length === 1 ? 'trip' : 'trips'}
      {days ? (
        <>
          , <span className="num font-semibold text-ink">{days}</span> days away.
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
      <h2 id="to-settle" className="flex min-h-11 items-center px-0.5 text-title">
        To settle
      </h2>
      <ul className="panel-strong rows mt-3 overflow-hidden rounded-[28px]">
        {rows.map((r, i) => (
          <li key={i}>
            <Link to={`/trips/${r.trip.id}/settle`} className="group flex min-h-[68px] items-center gap-4 px-5 py-3.5 hover:bg-well active:bg-well">
              <Avatar person={r.other!} size={36} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{r.amount > 0 ? `${firstName(r.other!.name)} owes you` : `You owe ${firstName(r.other!.name)}`}</span>
                <span className="block truncate text-caption text-ink-3">{r.trip.name}</span>
              </span>
              <span className={cx('num shrink-0 font-semibold', r.amount > 0 ? 'text-gain' : 'text-loss')}>{formatMoney(Math.abs(r.amount), { currency: r.trip.currency })}</span>
              <CaretRight size={14} weight="bold" className="shrink-0 text-faint" aria-hidden />
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
