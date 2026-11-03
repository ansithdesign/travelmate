import { useState } from 'react'
import { ArrowCounterClockwise, DownloadSimple, Trash, type Icon } from '@phosphor-icons/react'
import { ContentSheet, Dot, SheetBody, SkyHero } from '../components/shared/Page'
import { Segmented } from '../components/ui/Controls'
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
  // One stamp per place, newest first, up to four
  const stamps = (() => {
    const seen = new Set<string>()
    return [...views]
      .sort((a, b) => b.trip.startDate.localeCompare(a.trip.startDate))
      .filter((v) => (seen.has(v.trip.destination) ? false : (seen.add(v.trip.destination), true)))
      .slice(0, 3)
      .map((v) => ({ place: v.trip.destination, when: new Date(v.trip.startDate).toLocaleString('en-IN', { month: 'short', year: 'numeric' }).toUpperCase() }))
  })()

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
        <div className="mt-8 flex items-start gap-3 sm:gap-6">
          {/* The passport cover */}
          <div
            className="relative w-[168px] shrink-0 -rotate-3 rounded-l-[12px] rounded-r-[22px] px-4 pt-5 pb-5 text-center text-[#e8c97a] shadow-[0_18px_30px_-12px_rgba(8,20,60,0.6),inset_6px_0_10px_rgba(0,0,0,0.25)]"
            style={{ background: 'linear-gradient(160deg, #1c2f66, #0e1a40)', minHeight: 236 }}
          >
            <p className="text-[10px] font-bold tracking-[0.18em]">TRAVEL LOG</p>
            <svg viewBox="0 0 60 60" width="64" height="64" className="mx-auto mt-5" aria-hidden>
              <circle cx="30" cy="30" r="22" fill="none" stroke="#e8c97a" strokeWidth="2" />
              <path d="M8 30h44M30 8c-9 8-9 36 0 44M30 8c9 8 9 36 0 44" fill="none" stroke="#e8c97a" strokeWidth="1.6" />
            </svg>
            <p className="mt-5 text-[18px] leading-[1.1] font-bold text-white">{me.name}</p>
            <p className="mt-1 truncate text-[11px] text-[#e8c97a]/80">{me.email}</p>
            <p className="num mt-4 text-[10px] font-bold tracking-[0.14em]">
              {views.length} {views.length === 1 ? 'TRIP' : 'TRIPS'} · {days} {days === 1 ? 'DAY' : 'DAYS'}
            </p>
          </div>
          {/* Places stamped on the page beside it */}
          <ul className="relative min-h-[236px] min-w-0 flex-1" aria-label="Places you have been">
            {stamps.map((st, i) => (
              <li key={st.place} className={cx('absolute', ['left-0', 'left-4 min-[360px]:left-[34px]', 'left-0'][i])} style={{ top: [4, 84, 164][i] }}>
                <div
                  className="flex size-[76px] flex-col items-center justify-center rounded-full min-[360px]:size-[86px] border-[2.5px] border-white text-center text-[10px] leading-tight font-bold tracking-[0.06em] text-white"
                  style={{ transform: `rotate(${[10, -12, 6, -8][i % 4]}deg)`, borderStyle: i === 0 ? 'dashed' : 'solid' }}
                >
                  <span className="max-w-[64px] truncate">{st.place.toUpperCase()}</span>
                  <span className="num text-[11px]">{st.when}</span>
                </div>
              </li>
            ))}
            {stamps.length === 0 ? <li className="text-meta text-ink-3">Your places will be stamped here after your first trip.</li> : null}
          </ul>
        </div>
        <p className="num mt-6 text-meta text-ink-3">
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
