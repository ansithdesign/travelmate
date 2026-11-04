import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretDown, Check, MapPin, UploadSimple } from '@phosphor-icons/react'
import { COVER_LIBRARY } from '../../data/photos'
import { DESTINATIONS, coordsFor } from '../../data/destinations'
import { searchPlaces, type Place } from '../../services/places'
import { useStore } from '../../store/store'
import { useUI } from '../../store/ui'
import type { CurrencyCode, Photo, Trip } from '../../types'
import { cx } from '../../utils/cx'
import { addDays, isoDate, today, tripLength } from '../../utils/dates'
import { inviteCode, uid } from '../../utils/id'
import { CURRENCIES, currencySymbol, parseMoney, toInput } from '../../utils/money'
import { readImage } from '../../utils/image'
import { Button } from '../ui/Button'
import { Field, InputField, TextInput, inputClass } from '../ui/Field'
import { Sheet } from '../ui/Sheet'
import { useToast } from '../ui/Toast'
import { Cover } from '../ui/Cover'

interface Draft {
  name: string
  destination: string
  region: string
  lat?: number
  lon?: number
  startDate: string
  endDate: string
  cover?: Photo
  currency: CurrencyCode
  budget: string
}

function emptyDraft(): Draft {
  const s = addDays(today(), 14)
  return { name: '', destination: '', region: '', startDate: isoDate(s), endDate: isoDate(addDays(s, 3)), cover: undefined, currency: 'INR', budget: '' }
}

export function TripFormSheet() {
  const { trip: state, closeTrip } = useUI()
  const { data, saveTrip, me } = useStore()
  const toast = useToast()
  const navigate = useNavigate()
  const editing = state.tripId ? data.trips.find((t) => t.id === state.tripId) : undefined

  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (!state.open) return
    setTouched(false)
    setDraft(
      editing
        ? {
            name: editing.name,
            destination: editing.destination,
            region: editing.region ?? '',
            lat: editing.lat,
            lon: editing.lon,
            startDate: editing.startDate,
            endDate: editing.endDate,
            cover: editing.cover,
            currency: editing.currency,
            budget: editing.budget ? toInput(editing.budget) : '',
          }
        : emptyDraft(),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.open, state.tripId])

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }))

  const errors = useMemo(() => {
    const e: Partial<Record<keyof Draft, string>> = {}
    if (!draft.destination.trim()) e.destination = 'Where are you going?'
    if (!draft.startDate) e.startDate = 'Pick a start date'
    if (!draft.endDate) e.endDate = 'Pick an end date'
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) e.endDate = 'Ends before it starts'
    if (draft.budget && parseMoney(draft.budget) === null) e.budget = 'Enter an amount, like 45000'
    return e
  }, [draft])
  const valid = Object.keys(errors).length === 0

  function submit() {
    setTouched(true)
    if (!valid) return
    const name = draft.name.trim() || `${draft.destination.trim()} trip`
    const base: Trip = editing ?? {
      id: uid('t-'),
      name,
      destination: '',
      startDate: '',
      endDate: '',
      currency: 'INR',
      members: [me.id],
      invites: [],
      completed: false,
      info: [],
      itinerary: [],
      notes: '',
      journal: { note: '', places: [], photos: [] },
      inviteCode: inviteCode(),
      createdAt: new Date().toISOString(),
    }
    const next: Trip = {
      ...base,
      name,
      destination: draft.destination.trim(),
      region: draft.region.trim() || undefined,
      lat: draft.lat ?? coordsFor(draft.destination)?.lat,
      lon: draft.lon ?? coordsFor(draft.destination)?.lon,
      startDate: draft.startDate,
      endDate: draft.endDate,
      cover: draft.cover,
      currency: draft.currency,
      budget: draft.budget ? (parseMoney(draft.budget) ?? undefined) : undefined,
    }
    saveTrip(next)
    closeTrip()
    if (editing) {
      toast.success('Trip updated')
    } else {
      toast.success(`${name} created. Invite your group next.`)
      navigate(`/trips/${next.id}/people`)
    }
  }

  const nights = draft.startDate && draft.endDate && draft.endDate >= draft.startDate ? tripLength(draft.startDate, draft.endDate) - 1 : null
  const show = (k: keyof Draft) => (touched ? errors[k] : undefined)

  return (
    <Sheet
      open={state.open}
      onClose={closeTrip}
      title={editing ? 'Edit trip' : 'New trip'}
      description={editing ? undefined : 'You can invite people and add details once it exists.'}
      size="lg"
      footer={
        <Button block size="lg" onClick={submit}>
          {editing ? 'Save changes' : 'Create trip'}
        </Button>
      }
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <DestinationPicker
          value={draft.destination}
          error={show('destination')}
          onChange={(name, region, lat, lon) => setDraft((d) => ({ ...d, destination: name, region: region ?? d.region, lat, lon }))}
        />
        <InputField label="Trip name" optional placeholder={draft.destination ? `${draft.destination} trip` : 'Kashmir in winter'} value={draft.name} onChange={(e) => set('name', e.target.value)} maxLength={60} />

        <div className="grid grid-cols-2 gap-3">
          <InputField label="Starts" type="date" value={draft.startDate} error={show('startDate')} onChange={(e) => {
            const v = e.target.value
            setDraft((d) => ({ ...d, startDate: v, endDate: d.endDate && d.endDate < v ? v : d.endDate }))
          }} />
          <InputField label="Ends" type="date" min={draft.startDate} value={draft.endDate} error={show('endDate')} onChange={(e) => set('endDate', e.target.value)} />
        </div>
        {nights !== null ? (
          <p className="-mt-3 text-meta text-ink-3">
            {nights === 0 ? 'A day trip' : `${nights} ${nights === 1 ? 'night' : 'nights'}, ${nights + 1} days`}
          </p>
        ) : null}

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-3">
          <Field label="Currency" htmlFor="trip-currency">
            <div className="relative">
              <select id="trip-currency" className={cx(inputClass, 'appearance-none pr-10 font-semibold')} value={draft.currency} onChange={(e) => set('currency', e.target.value as CurrencyCode)}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol.trim()})
                  </option>
                ))}
              </select>
              <CaretDown size={16} weight="bold" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink-3" aria-hidden />
            </div>
          </Field>
          <Field label="Budget" optional htmlFor="trip-budget" error={show('budget')}>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3">{currencySymbol(draft.currency).trim()}</span>
              <TextInput id="trip-budget" inputMode="decimal" placeholder="1,20,000" className="pl-9 num" value={draft.budget} invalid={!!show('budget')} onChange={(e) => /^[\d,]*\.?\d{0,2}$/.test(e.target.value) && set('budget', e.target.value)} />
            </div>
          </Field>
        </div>

        <CoverPicker value={draft.cover} destination={draft.destination} onChange={(p) => set('cover', p)} />
        <button type="submit" hidden />
      </form>
    </Sheet>
  )
}

function DestinationPicker({ value, onChange, error }: { value: string; onChange: (name: string, region?: string, lat?: number, lon?: number) => void; error?: string }) {
  const id = useId()
  const listId = `${id}-list`
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [remote, setRemote] = useState<Place[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'offline'>('idle')
  const blurTimer = useRef<number | undefined>(undefined)
  const q = value.trim().toLowerCase()

  // Cities from anywhere: ask the worldwide search shortly after typing stops.
  useEffect(() => {
    if (q.length < 2) {
      setRemote([])
      setStatus('idle')
      return
    }
    const ctl = new AbortController()
    setStatus('loading')
    const t = window.setTimeout(() => {
      searchPlaces(q, ctl.signal)
        .then((r) => {
          setRemote(r)
          setStatus('idle')
        })
        .catch((e) => {
          if ((e as Error).name === 'AbortError') return
          setRemote([])
          setStatus('offline')
        })
    }, 250)
    return () => {
      window.clearTimeout(t)
      ctl.abort()
    }
  }, [q])

  const matches = useMemo<Place[]>(() => {
    const local = (q ? DESTINATIONS.filter((d) => d.name.toLowerCase().includes(q) || d.region.toLowerCase().includes(q)) : DESTINATIONS).slice(0, q ? 4 : 6)
    const seen = new Set(local.map((d) => d.name.toLowerCase()))
    const extra = remote.filter((r) => !seen.has(r.name.toLowerCase()) || !local.some((l) => l.region === r.region && l.name.toLowerCase() === r.name.toLowerCase()))
    const merged = [...local]
    for (const r of extra) if (!merged.some((m) => m.name === r.name && m.region === r.region)) merged.push(r)
    return merged.slice(0, 8)
  }, [q, remote])
  const exact = matches.some((d) => d.name.toLowerCase() === q) && !remote.length

  function pick(i: number) {
    const d = matches[i]
    if (d) onChange(d.name, d.region, (d as Place).lat ?? coordsFor(d.name)?.lat, (d as Place).lon ?? coordsFor(d.name)?.lon)
    setOpen(false)
  }

  return (
    <Field label="Destination" htmlFor={id} error={error}>
      <div className="relative">
        <MapPin size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3" aria-hidden />
        <TextInput
          id={id}
          data-autofocus
          role="combobox"
          aria-expanded={open && matches.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && matches[active] ? `${listId}-${active}` : undefined}
          autoComplete="off"
          placeholder="Search any city in the world"
          className="pl-10"
          invalid={!!error}
          value={value}
          onFocus={() => {
            window.clearTimeout(blurTimer.current)
            setOpen(true)
          }}
          onBlur={() => {
            blurTimer.current = window.setTimeout(() => setOpen(false), 120)
          }}
          onChange={(e) => {
            onChange(e.target.value, '')
            setActive(0)
            setOpen(true)
          }}
          onKeyDown={(e) => {
            if (!open) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => Math.min(a + 1, matches.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(a - 1, 0))
            } else if (e.key === 'Enter' && matches.length && !exact) {
              e.preventDefault()
              pick(active)
            }
          }}
        />
        {open && (matches.length > 0 || status !== 'idle') && !exact ? (
          <ul id={listId} role="listbox" className="glass-bar absolute inset-x-0 top-[calc(100%+8px)] z-10 max-h-[320px] overflow-y-auto rounded-[20px] p-1.5 [animation:pop_240ms_var(--ease-glide)]">
            {matches.map((d, i) => (
              <li
                key={`${d.name}-${d.region}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault()
                  pick(i)
                }}
                onMouseEnter={() => setActive(i)}
                className={cx('flex cursor-pointer items-baseline justify-between gap-3 rounded-[14px] px-3.5 py-3', i === active && 'bg-accent-soft')}
              >
                <span className="min-w-0 truncate font-medium">{d.name}</span>
                <span className="max-w-[55%] shrink-0 truncate text-meta text-ink-3">{d.region}</span>
              </li>
            ))}
            {status !== 'idle' ? (
              <li role="presentation" className="px-3.5 py-2.5 text-caption text-ink-3">
                {status === 'loading' ? 'Searching cities worldwide...' : 'Offline: showing popular places. You can still type any place.'}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </Field>
  )
}

function CoverPicker({ value, onChange, destination }: { value?: Photo; onChange: (p?: Photo) => void; destination: string }) {
  const file = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const custom = value && !COVER_LIBRARY.some((p) => p.id === value.id) ? value : undefined

  return (
    <fieldset>
      <legend className="mb-1.5 flex w-full items-baseline justify-between pl-0.5 text-meta font-semibold text-ink-2">
        Cover photo
        <span className="font-normal text-ink-3">optional</span>
      </legend>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        <button
          type="button"
          onClick={() => file.current?.click()}
          className={cx(
            'relative flex aspect-square flex-col items-center justify-center gap-1 overflow-hidden rounded-[16px] text-caption font-medium text-ink-2 ring-line hover:bg-well',
            custom && 'ring-2 ring-accent ring-offset-2 ring-offset-[var(--haze)]',
          )}
        >
          {custom ? (
            <Cover photo={custom} className="absolute inset-0" />
          ) : (
            <>
              <UploadSimple size={20} weight="bold" aria-hidden />
              {busy ? 'Loading' : 'Upload'}
            </>
          )}
        </button>
        {COVER_LIBRARY.map((p) => {
          const on = value?.id === p.id
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={on}
              aria-label={p.alt}
              onClick={() => onChange(on ? undefined : p)}
              className={cx('relative aspect-square overflow-hidden rounded-[16px] transition-shadow', on && 'ring-2 ring-accent ring-offset-2 ring-offset-[var(--haze)]')}
            >
              <Cover photo={p} seed={COVER_LIBRARY.indexOf(p)} className="absolute inset-0" />
              {on ? (
                <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-accent text-[var(--on-accent)]">
                  <Check size={13} weight="bold" aria-hidden />
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
      <input
        ref={file}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={async (e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (!f) return
          setBusy(true)
          try {
            const src = await readImage(f, 1400)
            onChange({ id: uid('cover-'), src, alt: destination ? `Cover photo for ${destination}` : 'Trip cover photo' })
          } catch {
            toast.error('That file could not be read as an image.')
          } finally {
            setBusy(false)
          }
        }}
      />
    </fieldset>
  )
}
