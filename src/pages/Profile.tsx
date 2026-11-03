import { useState } from 'react'
import { ArrowCounterClockwise, Check, Clock, DownloadSimple, Trash, type Icon } from '@phosphor-icons/react'
import { ContentSheet, SheetBody, SkyHero } from '../components/shared/Page'
import { CloudShape } from '../components/sky/Sky'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { InputField } from '../components/ui/Field'
import { ConfirmDialog } from '../components/ui/Sheet'
import { useToast } from '../components/ui/Toast'
import { useAllTripViews } from '../hooks/useTrip'
import { phaseForHour, SKY_LABEL, useSky, type SkyChoice, type SkyPhase } from '../store/sky'
import { useStore } from '../store/store'
import { cx } from '../utils/cx'
import { tripLength } from '../utils/dates'
import { formatMoney } from '../utils/money'

const PREVIEW: Record<SkyPhase, string> = {
  dawn: 'linear-gradient(180deg,#4b66bd,#c79ad0 60%,#ffd9b8)',
  day: 'linear-gradient(180deg,#1756cc,#66a8f3 60%,#dcedff)',
  golden: 'linear-gradient(180deg,#2f43a8,#b57fc6 55%,#ffc187)',
  night: 'linear-gradient(180deg,#040820,#17215a 70%,#2b2f6e)',
}

export function Profile() {
  const { me, updateMe, data, resetDemo, clearAll } = useStore()
  const { choice, setChoice } = useSky()
  const views = useAllTripViews()
  const toast = useToast()
  const [name, setName] = useState(me.name)
  const [email, setEmail] = useState(me.email ?? '')
  const [confirm, setConfirm] = useState<null | 'reset' | 'clear'>(null)
  const dirty = name.trim() !== me.name || email.trim() !== (me.email ?? '')
  const emailValid = !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const done = views.filter((v) => v.status.phase === 'completed')
  const days = done.reduce((a, v) => a + tripLength(v.trip.startDate, v.trip.endDate), 0)
  const shareInr = views.filter((v) => v.trip.currency === 'INR').reduce((a, v) => a + (v.ledger.share[me.id] ?? 0), 0)
  const places = new Set(views.map((v) => v.trip.destination)).size

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tripmate-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export downloaded')
  }

  const skyOptions: { value: SkyChoice; label: string; sub: string }[] = [
    { value: 'auto', label: 'Follow the clock', sub: `Now ${SKY_LABEL[phaseForHour(new Date().getHours())].toLowerCase()}` },
    ...(['dawn', 'day', 'golden', 'night'] as SkyPhase[]).map((p) => ({ value: p as SkyChoice, label: SKY_LABEL[p], sub: 'Always' })),
  ]

  return (
    <>
      <SkyHero className="pt-[max(22px,env(safe-area-inset-top))] pb-8 lg:pt-10">
        <div className="flex items-center gap-4">
          <Avatar person={me} size={72} className="ring-4 ring-white/40" />
          <div className="min-w-0">
            <h1 className="text-sky truncate text-display">{me.name}</h1>
            <p className="text-sky-2 truncate text-meta">{me.email}</p>
          </div>
        </div>
        <p className="text-sky num mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Figure value={views.length} label={views.length === 1 ? 'trip' : 'trips'} />
          <Figure value={days} label="days away" />
          <Figure value={places} label={places === 1 ? 'place' : 'places'} />
        </p>
        <p className="text-sky-2 num mt-3 text-meta">
          Your share of everything: <span className="font-semibold text-white">{formatMoney(shareInr, { round: true })}</span>
        </p>
      </SkyHero>

      <ContentSheet>
        <SheetBody className="lg:max-w-[760px]">
          <section aria-labelledby="sky">
            <h2 id="sky" className="text-heading">
              Sky
            </h2>
            <p className="mt-1 text-meta text-ink-2">The sky behind TripMate follows the time of day. Pin one if you prefer.</p>
            <div role="radiogroup" aria-labelledby="sky" className="no-scrollbar -mx-5 mt-4 flex gap-3 overflow-x-auto px-5 pb-2 sm:-mx-7 sm:px-7 lg:mx-0 lg:grid lg:grid-cols-5 lg:px-0">
              {skyOptions.map((o) => {
                const on = choice === o.value
                const preview = o.value === 'auto' ? phaseForHour(new Date().getHours()) : (o.value as SkyPhase)
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setChoice(o.value)}
                    className={cx('press w-[118px] shrink-0 rounded-[24px] p-1.5 text-left lg:w-auto', on ? 'bg-panel-strong shadow-[inset_0_0_0_2px_var(--color-accent),0_12px_26px_-14px_rgb(37_99_235/0.6)]' : 'hover:bg-well')}
                  >
                    <span className="relative block aspect-[0.86] overflow-hidden rounded-[18px]" style={{ background: PREVIEW[preview] }}>
                      <span className="absolute top-[24%] -left-4 opacity-90">
                        <CloudShape width={92} variant={1} top={preview === 'night' ? '#5a6497' : '#fff'} belly={preview === 'night' ? '#262f63' : '#d6e4f7'} />
                      </span>
                      <span
                        className="absolute top-[12%] right-[16%] size-4 rounded-full"
                        style={{ background: preview === 'night' ? '#eef1ff' : '#fff6d8', boxShadow: `0 0 18px 6px ${preview === 'night' ? 'rgb(170 190 255 / 0.5)' : 'rgb(255 220 150 / 0.7)'}` }}
                      />
                      {o.value === 'auto' ? (
                        <span className="absolute bottom-2 left-2 flex size-7 items-center justify-center rounded-full bg-white/85 text-[#0c1736]">
                          <Clock size={16} weight="bold" aria-hidden />
                        </span>
                      ) : null}
                      {on ? (
                        <span className="absolute right-2 bottom-2 flex size-7 items-center justify-center rounded-full bg-white text-accent [animation:pop_320ms_var(--ease-glide)]">
                          <Check size={15} weight="bold" aria-hidden />
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-2 block px-1 text-meta font-semibold">{o.label}</span>
                    <span className="block px-1 pb-1 text-caption text-ink-3">{o.sub}</span>
                  </button>
                )
              })}
            </div>
          </section>

          <section aria-labelledby="account" className="mt-10">
            <h2 id="account" className="text-heading">
              Your details
            </h2>
            <form
              className="mt-4 flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (!name.trim() || !emailValid) return
                updateMe({ name: name.trim(), email: email.trim() || undefined })
                toast.success('Profile saved')
              }}
            >
              <InputField label="Name" value={name} onChange={(e) => setName(e.target.value)} error={name.trim() ? undefined : 'Your name is shown to your group'} autoComplete="name" />
              <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={emailValid ? undefined : 'That email does not look right'} autoComplete="email" />
              <div>
                <Button type="submit" disabled={!dirty || !name.trim() || !emailValid}>
                  Save details
                </Button>
              </div>
            </form>
          </section>

          <section aria-labelledby="data" className="mt-10">
            <h2 id="data" className="text-heading">
              Your data
            </h2>
            <p className="mt-1 max-w-[56ch] text-meta text-ink-2">Everything is stored in this browser on this device. Nothing is sent to a server in this version.</p>
            <ul className="panel mt-4 divide-y divide-line overflow-hidden rounded-[24px]">
              <DataRow icon={DownloadSimple} title="Export as JSON" body="Trips, expenses and payments." action={<Button size="sm" variant="secondary" onClick={exportData}>Export</Button>} />
              <DataRow icon={ArrowCounterClockwise} title="Restore sample trips" body="Replaces your data with Kashmir, Goa and Bengaluru." action={<Button size="sm" variant="secondary" onClick={() => setConfirm('reset')}>Restore</Button>} />
              <DataRow icon={Trash} title="Start fresh" body="Delete every trip and expense." danger action={<Button size="sm" variant="ghost" className="text-loss hover:bg-loss-soft" onClick={() => setConfirm('clear')}>Delete all</Button>} />
            </ul>
          </section>

          <p className="mt-10 text-caption text-ink-3">Cover photos from Unsplash. Receipt scanning and invitations are simulated in this version.</p>
        </SheetBody>
      </ContentSheet>

      <ConfirmDialog
        open={confirm === 'reset'}
        onClose={() => setConfirm(null)}
        tone="primary"
        title="Restore sample trips?"
        body="Your current trips and expenses will be replaced."
        confirmLabel="Restore"
        onConfirm={() => {
          resetDemo()
          toast.success('Sample trips restored')
        }}
      />
      <ConfirmDialog
        open={confirm === 'clear'}
        onClose={() => setConfirm(null)}
        icon={<Trash size={44} weight="duotone" className="text-loss" />}
        title="Delete everything?"
        body="All trips, expenses and payments on this device will be removed. Export first if you want a copy."
        confirmLabel="Delete all"
        onConfirm={() => {
          clearAll()
          toast.success('All data deleted')
        }}
      />
    </>
  )
}

function Figure({ value, label }: { value: number; label: string }) {
  return (
    <span className="whitespace-nowrap">
      <span className="text-[44px] leading-[48px] font-extralight tracking-[-0.05em]">{value}</span>
      <span className="text-sky-2 ml-1.5 text-body font-medium">{label}</span>
    </span>
  )
}

function DataRow({ icon: I, title, body, action, danger }: { icon: Icon; title: string; body: string; action: React.ReactNode; danger?: boolean }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3.5">
      <span className={cx('flex size-10 shrink-0 items-center justify-center rounded-full', danger ? 'bg-loss-soft text-loss' : 'bg-accent-soft text-accent')}>
        <I size={20} weight="duotone" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-meta text-ink-3">{body}</p>
      </div>
      {action}
    </li>
  )
}
