import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, CircleCheck, ImagePlus, Pencil, Plus, X } from 'lucide-react'
import { CATEGORIES } from '../data/categories'
import { TripSubnav } from '../components/trips/TripHeader'
import { useTripActions } from '../components/trips/useTripActions'
import { AvatarStack } from '../components/ui/Avatar'
import { Button, IconButton } from '../components/ui/Button'
import { Cover } from '../components/ui/Cover'
import { TextArea, TextInput } from '../components/ui/Field'
import { Menu } from '../components/ui/Menu'
import { Milestone } from '../components/ui/Milestone'
import { useToast } from '../components/ui/Toast'
import { useTripView, type TripView } from '../hooks/useTrip'
import { useStore } from '../store/store'
import type { Person, Photo } from '../types'
import { fmt, formatRange, parseDate, tripLength } from '../utils/dates'
import { firstName, uid } from '../utils/id'
import { readImage } from '../utils/image'
import { formatMoney } from '../utils/money'
import { NotFound } from './NotFound'

export function Journal() {
  const { tripId } = useParams()
  const view = useTripView(tripId)
  if (!view) return <NotFound />
  return <JournalBody view={view} />
}

function JournalBody({ view }: { view: TripView }) {
  const { trip, ledger, payments, settled, transfers } = view
  const { person, saveTrip, me } = useStore()
  const toast = useToast()
  const { items, dialogs } = useTripActions(view)
  const members = trip.members.map(person).filter(Boolean) as Person[]
  const cur = trip.currency
  const days = tripLength(trip.startDate, trip.endDate)
  const photos = trip.journal.photos.length ? trip.journal.photos : trip.cover ? [trip.cover] : []
  const [editingNote, setEditingNote] = useState(false)
  const [note, setNote] = useState(trip.journal.note)
  const [place, setPlace] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const start = parseDate(trip.startDate)
  const name = (id: string) => (id === me.id ? 'You' : firstName(person(id)?.name ?? 'Someone'))

  const setJournal = (patch: Partial<typeof trip.journal>) => saveTrip({ ...trip, journal: { ...trip.journal, ...patch } })

  const byCat = CATEGORIES.map((c) => ({ c, v: view.expenses.filter((e) => e.category === c.id).reduce((a, e) => a + e.amount, 0) }))
    .filter((x) => x.v > 0)
    .sort((a, b) => b.v - a.v)

  return (
    <>
      <TripSubnav view={view} title="Journal" actions={<Menu items={items} label="Trip actions" />} />
      <article className="mx-auto max-w-[1080px] px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-10">
        {/* Title */}
        <header className="grid items-end gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">
          <Milestone tone="forest" cap={start.toLocaleString('en-IN', { month: 'short' })} value={start.getFullYear()} size="lg" label={`Travelled ${fmt.monthYear(trip.startDate)}`} />
          <div className="min-w-0">
            <h1 className="text-[clamp(2rem,5vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.035em]">{trip.name}</h1>
            <p className="mt-2 text-body text-ink-2">
              {trip.destination}
              {trip.region && trip.region !== trip.destination ? `, ${trip.region}` : ''} · {formatRange(trip.startDate, trip.endDate)}
            </p>
          </div>
        </header>

        {/* Photos */}
        <section aria-label="Photos" className="mt-8">
          {photos.length ? (
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:grid-rows-[180px_180px] sm:overflow-visible sm:px-0 lg:grid-rows-[220px_220px]">
              {photos.slice(0, 5).map((p, i) => (
                <figure
                  key={p.id + i}
                  className={`group relative w-[82%] shrink-0 snap-center overflow-hidden rounded-lg sm:w-auto ${mosaicCell(i, Math.min(photos.length, 5))}`}
                >
                  <Cover photo={p} fallbackLabel={trip.destination} className="aspect-[4/3] h-full w-full sm:aspect-auto" />
                  {p.credit ? <figcaption className="absolute right-2 bottom-2 rounded-[6px] bg-black/45 px-1.5 py-0.5 text-[10px] text-white/90">{p.credit}</figcaption> : null}
                  {trip.journal.photos.some((x) => x.id === p.id) ? (
                    <IconButton
                      icon={X}
                      tone="onImage"
                      label="Remove photo"
                      className="absolute top-2 right-2 size-9 opacity-100 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
                      onClick={() => setJournal({ photos: trip.journal.photos.filter((x) => x.id !== p.id) })}
                    />
                  ) : null}
                </figure>
              ))}
            </div>
          ) : null}
          <Button variant="ghost" size="sm" icon={ImagePlus} className="mt-3 -ml-2" onClick={() => fileRef.current?.click()}>
            Add photos
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            tabIndex={-1}
            onChange={async (e) => {
              const files = Array.from(e.target.files ?? []).slice(0, 6)
              e.target.value = ''
              const added: Photo[] = []
              for (const f of files) {
                try {
                  added.push({ id: uid('ph-'), src: await readImage(f, 1400, 0.8), alt: `Photo from ${trip.name}` })
                } catch {
                  /* skip unreadable */
                }
              }
              if (added.length) {
                try {
                  setJournal({ photos: [...trip.journal.photos, ...added] })
                  toast.success(`${added.length} ${added.length === 1 ? 'photo' : 'photos'} added`)
                } catch {
                  toast.error('Could not save photos')
                }
              } else toast.error('Those files could not be read as images.')
            }}
          />
        </section>

        <div className="mt-8 grid gap-x-14 gap-y-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            {/* Note */}
            <section aria-labelledby="story">
              <div className="flex items-center justify-between">
                <h2 id="story" className="text-heading">
                  The trip
                </h2>
                {!editingNote ? (
                  <Button size="sm" variant="quiet" icon={Pencil} onClick={() => (setNote(trip.journal.note), setEditingNote(true))}>
                    {trip.journal.note ? 'Edit' : 'Write'}
                  </Button>
                ) : null}
              </div>
              {editingNote ? (
                <div className="mt-2">
                  <TextArea autoFocus rows={5} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What do you want to remember?" className="text-[17px] leading-7" />
                  <div className="mt-2 flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditingNote(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setJournal({ note: note.trim() })
                        setEditingNote(false)
                        toast.success('Journal saved')
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : trip.journal.note ? (
                <p className="mt-2 max-w-[62ch] text-[18px] leading-[1.6] tracking-[-0.005em] text-ink">{trip.journal.note}</p>
              ) : (
                <p className="mt-2 text-body text-ink-3">Nothing written yet. A few lines now are worth a lot in a year.</p>
              )}
              <p className="num mt-5 max-w-[62ch] text-body text-ink-2">
                {days} {days === 1 ? 'day' : 'days'} with{' '}
                {members
                  .filter((m) => !m.isYou)
                  .map((m) => firstName(m.name))
                  .join(', ')
                  .replace(/, ([^,]*)$/, ' and $1') || 'yourself'}
                . The group spent <span className="font-medium text-ink">{formatMoney(ledger.total, { currency: cur })}</span>, your share was{' '}
                <span className="font-medium text-ink">{formatMoney(ledger.share[me.id] ?? 0, { currency: cur, round: true })}</span>.
              </p>
              <AvatarStack people={members} size={32} className="mt-3" />
            </section>

            {/* Places as a road */}
            <section aria-labelledby="places" className="mt-12">
              <h2 id="places" className="text-heading">
                Places along the way
              </h2>
              {trip.journal.places.length ? (
                <ol className="relative mt-4 ml-[7px] border-l-2 border-dashed border-line pl-6">
                  {trip.journal.places.map((p, i) => (
                    <li key={p + i} className="group relative flex min-h-10 items-center justify-between gap-3 py-1.5">
                      <span aria-hidden className="absolute top-1/2 -left-[33px] h-[18px] w-4 -translate-y-1/2 overflow-hidden rounded-t-full rounded-b-[3px] bg-surface shadow-[0_0_0_1.5px_var(--color-ink)]">
                        <span className={`block h-[7px] ${i === 0 || i === trip.journal.places.length - 1 ? 'bg-amber' : 'bg-forest'}`} />
                      </span>
                      <span className="font-medium">{p}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${p}`}
                        onClick={() => setJournal({ places: trip.journal.places.filter((_, j) => j !== i) })}
                        className="flex size-9 items-center justify-center rounded-full text-ink-3 opacity-100 hover:bg-sunken hover:text-ink sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
                      >
                        <X size={15} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-2 text-body text-ink-3">Add the places you went, in order.</p>
              )}
              <form
                className="mt-3 flex max-w-[420px] gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  const v = place.trim()
                  if (!v) return
                  setJournal({ places: [...trip.journal.places, v] })
                  setPlace('')
                }}
              >
                <TextInput aria-label="Add a place" placeholder="Add a place" value={place} onChange={(e) => setPlace(e.target.value)} className="h-11" />
                <Button type="submit" variant="secondary" icon={Plus} aria-label="Add place" className="px-3.5" />
              </form>
            </section>
          </div>

          <aside className="flex min-w-0 flex-col gap-10">
            <section aria-labelledby="spend">
              <div className="flex items-baseline justify-between">
                <h2 id="spend" className="text-heading">
                  What it cost
                </h2>
                <Link to={`/trips/${trip.id}/expenses`} className="text-meta font-medium text-forest hover:underline">
                  {view.expenses.length} expenses
                </Link>
              </div>
              <p className="num mt-2 text-[28px] leading-9 font-semibold tracking-[-0.03em]">{formatMoney(ledger.total, { currency: cur })}</p>
              <p className="num text-meta text-ink-3">
                {formatMoney(Math.round(ledger.total / Math.max(days, 1)), { currency: cur })} a day for the group
              </p>
              <ul className="mt-5 flex flex-col gap-3">
                {byCat.map(({ c, v }) => (
                  <li key={c.id} className="grid grid-cols-[110px_minmax(0,1fr)_auto] items-center gap-3 text-meta">
                    <span className="truncate text-ink-2">{c.short}</span>
                    <span className="h-1.5 rounded-full bg-sunken">
                      <span className="block h-full rounded-full bg-forest" style={{ width: `${(v / ledger.total) * 100}%` }} />
                    </span>
                    <span className="num w-[72px] text-right font-medium">{formatMoney(v, { currency: cur })}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="settlement">
              <h2 id="settlement" className="text-heading">
                How it settled
              </h2>
              {settled ? (
                <p className="mt-2 flex items-center gap-2 text-meta font-medium text-forest">
                  <CircleCheck size={16} aria-hidden /> All square
                  {payments[0] ? <span className="font-normal text-ink-3">since {fmt.dayMonth(payments[0].date)}</span> : null}
                </p>
              ) : (
                <div className="mt-2 rounded-md bg-amber-50 p-3.5 text-meta text-amber-ink">
                  {transfers.length} {transfers.length === 1 ? 'payment' : 'payments'} still open.{' '}
                  <Link to={`/trips/${trip.id}/settle`} className="inline-flex items-center gap-1 font-semibold underline">
                    Settle up <ArrowRight size={13} aria-hidden />
                  </Link>
                </div>
              )}
              {payments.length ? (
                <ul className="mt-2 divide-y divide-line-soft">
                  {payments.map((p) => (
                    <li key={p.id} className="flex items-baseline justify-between gap-3 py-2.5 text-meta">
                      <span className="min-w-0 truncate">
                        <span className="font-medium">{name(p.from)}</span> <span className="text-ink-3">to</span> <span className="font-medium">{name(p.to)}</span>
                        <span className="text-ink-3"> · {fmt.dayMonth(p.date)}</span>
                      </span>
                      <span className="num shrink-0 font-medium">{formatMoney(p.amount, { currency: cur })}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </aside>
        </div>
      </article>
      {dialogs}
    </>
  )
}

/** Hero photo takes the left half; the rest fill the right half without leaving holes. */
function mosaicCell(i: number, n: number): string {
  if (i === 0) return n === 1 ? 'sm:col-span-4 sm:row-span-2' : 'sm:col-span-2 sm:row-span-2'
  const small = n - 1
  if (small === 1) return 'sm:col-span-2 sm:row-span-2'
  if (small === 2) return 'sm:col-span-2'
  if (small === 3 && i === 3) return 'sm:col-span-2'
  return ''
}
