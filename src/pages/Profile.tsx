import { useState } from 'react'
import { Download, RotateCcw, Trash2 } from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { InputField } from '../components/ui/Field'
import { Milestone } from '../components/ui/Milestone'
import { ConfirmDialog } from '../components/ui/Sheet'
import { useToast } from '../components/ui/Toast'
import { useAllTripViews } from '../hooks/useTrip'
import { useStore } from '../store/store'
import { tripLength } from '../utils/dates'
import { formatMoney } from '../utils/money'

export function Profile() {
  const { me, updateMe, data, resetDemo, clearAll } = useStore()
  const views = useAllTripViews()
  const toast = useToast()
  const [name, setName] = useState(me.name)
  const [email, setEmail] = useState(me.email ?? '')
  const [confirm, setConfirm] = useState<null | 'reset' | 'clear'>(null)
  const dirty = name.trim() !== me.name || email.trim() !== (me.email ?? '')

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

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pt-6 pb-12 sm:px-6 lg:px-8 lg:pt-10">
      <h1 className="text-display">Profile</h1>

      <section className="mt-6 flex items-center gap-4">
        <Avatar person={me} size={64} />
        <div className="min-w-0">
          <p className="truncate text-title">{me.name}</p>
          <p className="truncate text-meta text-ink-3">{me.email}</p>
        </div>
      </section>

      <section aria-label="Your travel so far" className="mt-8 flex flex-wrap items-end gap-3">
        <Milestone tone="forest" cap="Trips" value={views.length} size="md" label={`${views.length} trips`} />
        <Milestone tone="forest" cap="Days" value={days} unit="away" size="md" label={`${days} days travelled`} />
        <Milestone tone="forest" cap="Places" value={places} size="md" label={`${places} places`} />
        <p className="num ml-1 pb-1 text-meta text-ink-2">
          Your share of everything:
          <br />
          <span className="text-heading text-ink">{formatMoney(shareInr, { round: true })}</span>
        </p>
      </section>

      <section aria-labelledby="account" className="mt-10">
        <h2 id="account" className="text-heading">
          Your details
        </h2>
        <form
          className="mt-3 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return
            updateMe({ name: name.trim(), email: email.trim() || undefined })
            toast.success('Profile saved')
          }}
        >
          <InputField label="Name" value={name} onChange={(e) => setName(e.target.value)} error={name.trim() ? undefined : 'Your name is shown to your group'} />
          <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div>
            <Button type="submit" disabled={!dirty || !name.trim()}>
              Save details
            </Button>
          </div>
        </form>
      </section>

      <section aria-labelledby="data" className="mt-12">
        <h2 id="data" className="text-heading">
          Your data
        </h2>
        <p className="mt-1 max-w-[56ch] text-body text-ink-2">
          Everything is stored in this browser on this device. Nothing is sent to a server in this version.
        </p>
        <ul className="mt-3 divide-y divide-line-soft border-y border-line-soft">
          <DataRow icon={Download} title="Export as JSON" body="Download trips, expenses and payments." action={<Button size="sm" variant="secondary" onClick={exportData}>Export</Button>} />
          <DataRow icon={RotateCcw} title="Restore sample trips" body="Replaces your data with Kashmir, Goa and Bengaluru." action={<Button size="sm" variant="secondary" onClick={() => setConfirm('reset')}>Restore</Button>} />
          <DataRow icon={Trash2} title="Start fresh" body="Delete every trip and expense." action={<Button size="sm" variant="ghost" className="text-brick hover:bg-brick-50" onClick={() => setConfirm('clear')}>Delete all</Button>} />
        </ul>
      </section>

      <p className="mt-10 text-caption text-ink-3">
        Cover photos from Unsplash. Receipt scanning and invitations are simulated in this version.
      </p>

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
        title="Delete everything?"
        body="All trips, expenses and payments on this device will be removed. Export first if you want a copy."
        confirmLabel="Delete all"
        onConfirm={() => {
          clearAll()
          toast.success('All data deleted')
        }}
      />
    </div>
  )
}

function DataRow({ icon: Icon, title, body, action }: { icon: typeof Download; title: string; body: string; action: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 py-3.5">
      <Icon size={18} strokeWidth={1.8} className="shrink-0 text-ink-3" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-meta text-ink-3">{body}</p>
      </div>
      {action}
    </li>
  )
}
