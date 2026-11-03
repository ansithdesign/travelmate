import { useState } from 'react'
import { ArrowCounterClockwise, DownloadSimple, Trash, type Icon } from '@phosphor-icons/react'
import { ContentSheet, Dot, SheetBody, SkyHero } from '../components/shared/Page'
import { PassportScene } from '../components/profile/PassportPickerSheet'
import { usePassportLook } from '../store/passport'
import { SkyPickerSheet, themeGradient } from '../components/profile/SkyPickerSheet'
import { skyThemeById } from '../data/skyThemes'
import { Button } from '../components/ui/Button'
import { InputField } from '../components/ui/Field'
import { ConfirmDialog } from '../components/ui/Sheet'
import { useToast } from '../components/ui/Toast'
import { useAllTripViews } from '../hooks/useTrip'
import { useSky } from '../store/sky'
import { useStore } from '../store/store'
import { cx } from '../utils/cx'
import { initials } from '../utils/id'
import { tripLength } from '../utils/dates'

export function Profile() {
  const { me, updateMe, data, resetDemo, clearAll } = useStore()
  const { phase, lightSky } = useSky()
  const lightTheme = skyThemeById(lightSky)
  const [skyOpen, setSkyOpen] = useState(false)
  const [look] = usePassportLook()
  const views = useAllTripViews()
  const toast = useToast()
  const [name, setName] = useState(me.name)
  const [email, setEmail] = useState(me.email ?? '')
  const [confirm, setConfirm] = useState<null | 'reset' | 'clear'>(null)
  const dirty = name.trim() !== me.name || email.trim() !== (me.email ?? '')
  const emailValid = !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const done = views.filter((v) => v.status.phase === 'completed')
  const days = done.reduce((a, v) => a + tripLength(v.trip.startDate, v.trip.endDate), 0)
  // One stamp per place, newest first, up to four
  const stamps = (() => {
    const seen = new Set<string>()
    return [...views]
      .sort((a, b) => b.trip.startDate.localeCompare(a.trip.startDate))
      .filter((v) => (seen.has(v.trip.destination) ? false : (seen.add(v.trip.destination), true)))
      .slice(0, 3)
      .map((v) => ({ place: v.trip.destination, when: new Date(v.trip.startDate).toLocaleString('en-IN', { month: 'short', year: 'numeric' }).toUpperCase() }))
  })()

  const info = {
    name: me.name,
    email: me.email ?? '',
    ini: initials(me.name),
    stats: `${views.length} ${views.length === 1 ? 'TRIP' : 'TRIPS'} · ${days} ${days === 1 ? 'DAY' : 'DAYS'}`,
    stamps,
  }

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

  return (
    <>
      <SkyHero className="on-sky pt-[max(28px,env(safe-area-inset-top))] pb-10 lg:pt-12">
        <h1 className="text-hero">
          Profile
          <Dot />
        </h1>
        <div className="mt-8 flex justify-center">
          <PassportScene look={look} info={info} className="gap-8" />
          {stamps.length === 0 ? <p className="mt-4 text-center text-meta text-ink-3">Your places will be stamped here after your first trip.</p> : null}
        </div>
      </SkyHero>

      <ContentSheet>
        <SheetBody className="lg:max-w-[760px]">
          <section aria-labelledby="sky">
            <h2 id="sky" className="flex min-h-11 items-center px-0.5 text-title">
              Appearance
            </h2>
            {/* The light sky: shown as a row, changed through a preview sheet */}
            <div className="panel-strong mt-5 flex items-center gap-4 rounded-[24px] p-4">
              <span className="block size-14 shrink-0 rounded-[16px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]" style={{ background: themeGradient(phase === 'night' ? { c: ['#050214', '#170a38', '#321a5e'] } : lightTheme) }} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-heading">{phase === 'night' ? 'Midnight' : lightTheme.name}</p>
                <p className="text-caption text-ink-3">{phase === 'night' ? 'Dark' : 'Light'}</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setSkyOpen(true)}>
                Change
              </Button>
            </div>
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

      <SkyPickerSheet open={skyOpen} onClose={() => setSkyOpen(false)} />

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
