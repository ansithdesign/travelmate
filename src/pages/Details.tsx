import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { AirplaneTilt, ArrowSquareOut, Bed, Copy, type Icon, LinkSimple, MapPin, PencilSimple, Trash } from '@phosphor-icons/react'
import { TripSkyHeader } from '../components/trips/TripHeader'
import { ContentSheet, SheetBody } from '../components/shared/Page'
import { Button } from '../components/ui/Button'
import { Menu } from '../components/ui/Menu'
import { Segmented } from '../components/ui/Controls'
import { Field, InputField, TextArea } from '../components/ui/Field'
import { ConfirmDialog, Sheet } from '../components/ui/Sheet'
import { useToast } from '../components/ui/Toast'
import { useTripView, type TripView } from '../hooks/useTrip'
import { useStore } from '../store/store'
import type { InfoItem } from '../types'
import { addDays, fmt, isoDate, parseDate, today, tripLength } from '../utils/dates'
import { cx } from '../utils/cx'
import { uid } from '../utils/id'
import { NotFound } from './NotFound'

const KINDS: { kind: InfoItem['kind']; label: string; icon: Icon; add: string }[] = [
  { kind: 'stay', label: 'Stays', icon: Bed, add: 'Add a stay' },
  { kind: 'transport', label: 'Getting around', icon: AirplaneTilt, add: 'Add travel' },
  { kind: 'address', label: 'Addresses', icon: MapPin, add: 'Add an address' },
  { kind: 'link', label: 'Links', icon: LinkSimple, add: 'Add a link' },
]

export function Details() {
  const { tripId } = useParams()
  const view = useTripView(tripId)
  if (!view) return <NotFound />
  return (
    <>
      <TripSkyHeader view={view} title="Plans" />
      <ContentSheet>
        <SheetBody>
        <DetailsBody view={view} />
        </SheetBody>
      </ContentSheet>
    </>
  )
}

function DetailsBody({ view }: { view: TripView }) {
  const { trip } = view
  const { saveTrip } = useStore()
  const toast = useToast()
  const [editing, setEditing] = useState<InfoItem | null>(null)
  const [deleting, setDeleting] = useState<InfoItem | null>(null)
  const [notes, setNotes] = useState(trip.notes)
  const [notesDirty, setNotesDirty] = useState(false)

  function saveItem(item: InfoItem) {
    const exists = trip.info.some((i) => i.id === item.id)
    saveTrip({ ...trip, info: exists ? trip.info.map((i) => (i.id === item.id ? item : i)) : [...trip.info, item] })
    toast.success(exists ? 'Saved' : 'Added to trip details')
    setEditing(null)
  }

  return (
    <div className="grid gap-x-12 gap-y-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <h2 className="px-0.5 pt-2 text-display">Plans</h2>
        <p className="mt-1.5 px-0.5 text-body text-ink-3">Bookings, addresses and links, so nobody scrolls back through the group chat.</p>

        {KINDS.filter(({ kind }) => trip.info.some((i) => i.kind === kind)).map(({ kind, label }) => {
          const items = trip.info.filter((i) => i.kind === kind)
          return (
            <section key={kind} aria-labelledby={`k-${kind}`} className="mt-7">
              <h2 id={`k-${kind}`} className="flex min-h-11 items-center px-0.5 text-title">
                {label}
              </h2>
              <ul className="panel-strong rows flat mt-3 overflow-hidden rounded-[24px]">
                {items.map((it) => (
                  <InfoRow key={it.id} item={it} onEdit={() => setEditing(it)} onDelete={() => setDeleting(it)} />
                ))}
              </ul>
            </section>
          )
        })}

        {/* One place to add anything, instead of an empty section per kind */}
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Add to plans">
          {KINDS.map(({ kind, icon: Icon, add }) => (
            <button
              key={kind}
              type="button"
              onClick={() => setEditing({ id: uid('i-'), kind, title: '' })}
              className="glass-control press inline-flex h-[42px] items-center gap-2 rounded-full pr-4 pl-3 text-[14px] font-medium hover:bg-solid"
            >
              <Icon size={18} weight="duotone" className="text-accent" aria-hidden />
              {add}
            </button>
          ))}
        </div>

        <section aria-labelledby="notes" className="mt-14">
          <h2 id="notes" className="flex min-h-11 items-center px-0.5 text-title">
            Notes
          </h2>
          <TextArea
            aria-labelledby="notes"
            className="mt-2 min-h-32"
            placeholder="Packing reminders, visa notes, who is bringing what"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value)
              setNotesDirty(true)
            }}
          />
          {notesDirty ? (
            <div className="mt-2 flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => (setNotes(trip.notes), setNotesDirty(false))}>
                Discard
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  saveTrip({ ...trip, notes })
                  setNotesDirty(false)
                  toast.success('Notes saved')
                }}
              >
                Save notes
              </Button>
            </div>
          ) : null}
        </section>
      </div>

      <Itinerary view={view} />

      <InfoSheet item={editing} onClose={() => setEditing(null)} onSave={saveItem} />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={`Remove ${deleting?.title || 'this item'}?`}
        body="It will be removed from the trip details for everyone."
        confirmLabel="Remove"
        onConfirm={() => {
          if (!deleting) return
          saveTrip({ ...trip, info: trip.info.filter((i) => i.id !== deleting.id) })
          toast.success('Removed')
        }}
      />
    </div>
  )
}

function InfoRow({ item, onEdit, onDelete }: { item: InfoItem; onEdit: () => void; onDelete: () => void }) {
  const toast = useToast()
  return (
    <li className="flex items-start gap-2 py-3 pr-2 pl-4">
      <div className="min-w-0 flex-1">
        {item.kind === 'link' && item.url ? (
          <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-accent-ink hover:underline">
            {item.title} <ArrowSquareOut size={15} weight="bold" aria-hidden />
          </a>
        ) : (
          <p className="font-semibold">{item.title}</p>
        )}
        {item.subtitle ? <p className="text-caption text-ink-2">{item.subtitle}</p> : null}
        {item.detail ? <p className="mt-0.5 text-caption text-ink-3">{item.detail}</p> : null}
        {item.reference ? (
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(item.reference!)
                toast.success(`${item.reference} copied`)
              } catch {
                toast.error('Could not copy')
              }
            }}
            className="press mt-2 inline-flex h-7 items-center gap-1.5 rounded-full bg-well px-3 text-[12px] font-semibold text-ink-2 hover:bg-accent-soft hover:text-accent-ink"
            aria-label={`Copy reference ${item.reference}`}
          >
            {item.reference}
            <Copy size={13} weight="bold" aria-hidden />
          </button>
        ) : null}
      </div>
      <Menu
        label={`Actions for ${item.title}`}
        items={[
          { label: 'Edit', icon: PencilSimple, onSelect: onEdit },
          { label: 'Remove', icon: Trash, onSelect: onDelete, danger: true },
        ]}
      />
    </li>
  )
}

function InfoSheet({ item, onClose, onSave }: { item: InfoItem | null; onClose: () => void; onSave: (i: InfoItem) => void }) {
  const [draft, setDraft] = useState<InfoItem | null>(item)
  const [err, setErr] = useState<string>()
  if (item && draft?.id !== item.id) {
    setDraft(item)
    setErr(undefined)
  }
  const d = draft ?? item
  const kindMeta = KINDS.find((k) => k.kind === d?.kind)
  const set = (patch: Partial<InfoItem>) => setDraft((x) => (x ? { ...x, ...patch } : x))

  function submit() {
    if (!d) return
    if (!d.title.trim()) return setErr('Give it a name')
    if (d.kind === 'link' && d.url && !/^https?:\/\//.test(d.url)) return setErr('Links start with https://')
    onSave({ ...d, title: d.title.trim() })
  }

  return (
    <Sheet open={!!item} onClose={onClose} title={item && item.title ? `Edit ${kindMeta?.label.toLowerCase().replace(/s$/, '')}` : (kindMeta?.add ?? 'Add')} footer={<Button block size="lg" onClick={submit}>Save</Button>}>
      {d ? (
        <form className="flex flex-col gap-4" onSubmit={(e) => (e.preventDefault(), submit())}>
          <div>
            <p className="mb-1.5 text-meta font-medium text-ink-2">Type</p>
            <Segmented label="Type" value={d.kind} onChange={(kind) => set({ kind })} options={KINDS.map((k) => ({ value: k.kind, label: k.label.split(' ')[0] }))} />
          </div>
          <InputField label={d.kind === 'link' ? 'Label' : 'Name'} data-autofocus value={d.title} error={err} onChange={(e) => (set({ title: e.target.value }), setErr(undefined))} placeholder={d.kind === 'stay' ? 'Houseboat Gulistan' : d.kind === 'transport' ? 'BLR to SXR, IndiGo 6E 2147' : d.kind === 'link' ? 'Shared photo album' : 'Gondola base station'} />
          {d.kind === 'link' ? (
            <InputField label="URL" type="url" value={d.url ?? ''} onChange={(e) => set({ url: e.target.value })} placeholder="https://" />
          ) : (
            <>
              {d.kind !== 'address' ? <InputField label="When" optional value={d.subtitle ?? ''} onChange={(e) => set({ subtitle: e.target.value })} placeholder={d.kind === 'stay' ? '3 nights from 12 Dec' : '12 Dec · 06:10 to 10:05'} /> : null}
              {d.kind !== 'address' ? <InputField label="Booking reference" optional value={d.reference ?? ''} onChange={(e) => set({ reference: e.target.value })} placeholder="PNR K7QW2M" /> : null}
              <Field label={d.kind === 'address' ? 'Address' : 'Address or notes'} optional={d.kind !== 'address'} htmlFor="info-detail">
                <TextArea id="info-detail" rows={2} value={d.detail ?? ''} onChange={(e) => set({ detail: e.target.value })} />
              </Field>
            </>
          )}
          <button type="submit" hidden />
        </form>
      ) : null}
    </Sheet>
  )
}

function Itinerary({ view }: { view: TripView }) {
  const { trip } = view
  const { saveTrip } = useStore()
  const toast = useToast()
  const days = Array.from({ length: Math.min(tripLength(trip.startDate, trip.endDate), 60) }, (_, i) => isoDate(addDays(parseDate(trip.startDate), i)))
  const todayIso = isoDate(today())
  const [active, setActive] = useState(() => (days.includes(todayIso) ? todayIso : days[0]))
  const entry = trip.itinerary.find((d) => d.date === active)
  const [text, setText] = useState(entry?.plan ?? '')
  const [shownFor, setShownFor] = useState(active)
  if (shownFor !== active) {
    setShownFor(active)
    setText(trip.itinerary.find((d) => d.date === active)?.plan ?? '')
  }
  const dirty = text !== (entry?.plan ?? '')

  function save() {
    const plan = text.trim()
    const rest = trip.itinerary.filter((d) => d.date !== active)
    saveTrip({ ...trip, itinerary: plan ? [...rest, { id: entry?.id ?? uid('d-'), date: active, plan }].sort((a, b) => a.date.localeCompare(b.date)) : rest })
    toast.success(`Plan for ${fmt.weekday(active)} saved`)
  }

  return (
    <section aria-labelledby="itinerary" className="min-w-0 lg:pt-2">
      <h2 id="itinerary" className="flex min-h-11 items-center px-0.5 text-title">
        Day by day
      </h2>
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="tablist" aria-label="Trip days">
        {days.map((d, i) => {
          const on = d === active
          const has = trip.itinerary.some((x) => x.date === d)
          return (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(d)}
              className={cx(
                'press flex h-[60px] w-[52px] shrink-0 flex-col items-center justify-center rounded-[16px] leading-none transition-colors',
                on ? 'luminous' : 'bg-panel-strong text-ink hover:bg-solid',
              )}
            >
              <span className="num text-[20px] font-bold tracking-[-0.03em]">{parseDate(d).getDate()}</span>
              <span className={cx('mt-1 text-[10.5px] font-semibold', on ? 'opacity-75' : 'text-accent-ink')}>Day {i + 1}</span>
              <span aria-hidden className={cx('mt-1 size-1 rounded-full', has ? (on ? 'bg-accent-bright' : 'bg-accent') : 'bg-transparent')} />
            </button>
          )
        })}
      </div>
      <div className="panel mt-3 rounded-[24px] p-6" role="tabpanel">
        <p className="text-heading">{fmt.long(active)}</p>
        <TextArea
          aria-label={`Plan for ${fmt.long(active)}`}
          className="mt-3 min-h-32"
          placeholder="What is the plan? Keep it short: places, times, who is booking what."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-caption text-ink-3">{trip.itinerary.length} of {days.length} days planned</p>
          <Button size="sm" disabled={!dirty} onClick={save}>
            Save day
          </Button>
        </div>
      </div>
    </section>
  )
}
