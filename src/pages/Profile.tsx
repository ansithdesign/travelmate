import { useState } from 'react'
import { ArrowCounterClockwise, DownloadSimple, Trash, type Icon } from '@phosphor-icons/react'
import { ContentSheet, Dot, SheetBody, SkyHero } from '../components/shared/Page'
import { Segmented } from '../components/ui/Controls'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { InputField } from '../components/ui/Field'
import { ConfirmDialog } from '../components/ui/Sheet'
import { useToast } from '../components/ui/Toast'
import { useAllTripViews } from '../hooks/useTrip'
import { SKY_LABEL, useSky, type SkyChoice, type SkyPhase } from '../store/sky'
import { useStore } from '../store/store'
import { cx } from '../utils/cx'
import { tripLength } from '../utils/dates'
import { formatMoney } from '../utils/money'

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

  const skyOptions: { value: SkyChoice; label: string }[] = [
    { value: 'auto', label: 'Auto' },
    { value: 'day', label: 'Light' },
    { value: 'night', label: 'Dark' },
  ]

  return (
    <>
      <SkyHero className="on-sky pt-[max(28px,env(safe-area-inset-top))] pb-10 lg:pt-12">
        <h1 className="text-hero">
          Profile
          <Dot />
        </h1>
        <div className="mt-8 flex items-center gap-4">
          <Avatar person={me} size={60} />
          <div className="min-w-0">
            <p className="truncate text-title">{me.name}</p>
            <p className="truncate text-meta text-ink-3">{me.email}</p>
          </div>
        </div>
        {/* Stats are open: a hairline and a figure, no box */}
        <div className="mt-8 grid max-w-[520px] grid-cols-3 gap-6">
          <Stat value={String(views.length)} label={views.length === 1 ? 'Trip' : 'Trips'} />
          <Stat value={String(days)} label="Days away" />
          <Stat value={String(places)} label={places === 1 ? 'Place' : 'Places'} />
        </div>
        <p className="num mt-4 text-meta text-ink-3">
          Your share of everything: <span className="font-semibold text-ink">{formatMoney(shareInr, { round: true })}</span>
        </p>
      </SkyHero>

      <ContentSheet>
        <SheetBody className="lg:max-w-[760px]">
          <section aria-labelledby="sky">
            <h2 id="sky" className="flex min-h-11 items-center px-0.5 text-title">
              Appearance
            </h2>
            <p className="mb-3 px-0.5 text-meta text-ink-3">
              {choice === 'auto' ? 'Follows your device.' : `Always ${SKY_LABEL[choice as SkyPhase].toLowerCase()}.`}
            </p>
            <Segmented label="Appearance" value={choice} onChange={setChoice} options={skyOptions} />
          </section>

          <section aria-labelledby="account" className="mt-14">
            <h2 id="account" className="flex min-h-11 items-center px-0.5 text-title">
              Your details
            </h2>
            <form
              className="mt-2 flex flex-col gap-4"
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

          <section aria-labelledby="data" className="mt-14">
            <h2 id="data" className="flex min-h-11 items-center px-0.5 text-title">
              Your data
            </h2>
            <p className="max-w-[56ch] px-0.5 text-meta text-ink-3">Everything is stored in this browser on this device. Nothing is sent to a server in this version.</p>
            <ul className="panel-strong rows mt-3 overflow-hidden rounded-[28px]">
              <DataRow icon={DownloadSimple} title="Export as JSON" body="Trips, expenses and payments." action={<Button size="sm" variant="secondary" onClick={exportData}>Export</Button>} />
              <DataRow icon={ArrowCounterClockwise} title="Restore sample trips" body="Replaces your data with Kashmir, Goa and Bengaluru." action={<Button size="sm" variant="secondary" onClick={() => setConfirm('reset')}>Restore</Button>} />
              <DataRow icon={Trash} title="Start fresh" body="Delete every trip and expense." danger action={<Button size="sm" variant="danger" onClick={() => setConfirm('clear')}>Delete all</Button>} />
            </ul>
          </section>

          <p className="mt-10 px-0.5 text-caption text-ink-3">Cover photos from Unsplash. Receipt scanning and invitations are simulated in this version.</p>
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="hairline pt-3">
      <p className="text-meta font-medium text-ink-3">{label}</p>
      <p className="num mt-1 text-[26px] leading-8 font-[650] tracking-[-0.03em]">{value}</p>
    </div>
  )
}

function DataRow({ icon: I, title, body, action, danger }: { icon: Icon; title: string; body: string; action: React.ReactNode; danger?: boolean }) {
  return (
    <li className="flex min-h-[68px] items-center gap-4 px-5 py-3.5">
      <span className={cx('flex size-9 shrink-0 items-center justify-center rounded-full', danger ? 'bg-loss-soft text-loss' : 'bg-accent-soft text-accent')}>
        <I size={19} weight="duotone" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-caption text-ink-3">{body}</p>
      </div>
      {action}
    </li>
  )
}
