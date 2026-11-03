import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Copy, Link2, Share2, UserMinus, UserPlus } from 'lucide-react'
import { TripPage, TripSubnav } from '../components/trips/TripHeader'
import { Avatar } from '../components/ui/Avatar'
import { Button, IconButton } from '../components/ui/Button'
import { InputField } from '../components/ui/Field'
import { ConfirmDialog, Sheet } from '../components/ui/Sheet'
import { useToast } from '../components/ui/Toast'
import { useTripView, type TripView } from '../hooks/useTrip'
import { useStore } from '../store/store'
import type { Person } from '../types'
import { fmt } from '../utils/dates'
import { formatMoney } from '../utils/money'
import { NotFound } from './NotFound'

export function People() {
  const { tripId } = useParams()
  const view = useTripView(tripId)
  if (!view) return <NotFound />
  return (
    <>
      <TripSubnav view={view} />
      <TripPage>
        <PeopleBody view={view} />
      </TripPage>
    </>
  )
}

function PeopleBody({ view }: { view: TripView }) {
  const { person, addInvite, revokeInvite, acceptInvite, addMember, removeMember } = useStore()
  const toast = useToast()
  const { trip, ledger } = view
  const cur = trip.currency
  const members = trip.members.map(person).filter(Boolean) as Person[]
  const [sheet, setSheet] = useState<null | 'invite' | 'add'>(null)
  const [removing, setRemoving] = useState<Person | null>(null)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [err, setErr] = useState<string>()

  const link = `${window.location.origin}/join/${trip.inviteCode}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
      toast.success('Invite link copied')
    } catch {
      toast.error('Could not copy. Select the link and copy it manually.')
    }
  }
  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Join ${trip.name} on TripMate`, text: `Join our trip to ${trip.destination} on TripMate`, url: link })
      } catch {
        /* dismissed */
      }
    } else copy()
  }

  function submit() {
    const n = name.trim()
    if (!n) return setErr('Enter a name')
    if (members.some((m) => m.name.toLowerCase() === n.toLowerCase())) return setErr(`${n} is already on this trip`)
    if (sheet === 'invite') {
      addInvite(trip.id, n, contact)
      toast.success(`Invite for ${n} is pending`)
    } else {
      addMember(trip.id, n, contact)
      toast.success(`${n} added to the trip`)
    }
    setSheet(null)
  }

  function openSheet(kind: 'invite' | 'add') {
    setName('')
    setContact('')
    setErr(undefined)
    setSheet(kind)
  }

  return (
    <>
      <h1 className="text-title">People</h1>
      <p className="mt-1 text-body text-ink-2">Everyone here can add expenses and is included in splits by default.</p>

      <section aria-labelledby="invite-link" className="mt-6 rounded-lg bg-forest-900 p-5 text-white">
        <h2 id="invite-link" className="flex items-center gap-2 text-heading text-white">
          <Link2 size={18} aria-hidden /> Invite link
        </h2>
        <p className="mt-1 text-meta text-[#b9c8be]">Anyone with this link can ask to join {trip.name}.</p>
        <div className="mt-4 flex items-center gap-2 rounded-md bg-white/[0.08] py-1 pr-1 pl-3.5">
          <code className="num min-w-0 flex-1 truncate font-sans text-meta text-white/90">{link.replace(/^https?:\/\//, '')}</code>
          <IconButton icon={Copy} label="Copy invite link" onClick={copy} className="size-10 text-white hover:bg-white/10" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="accent" onClick={share} icon={Share2}>
            Share link
          </Button>
          <Button size="sm" variant="onDark" icon={UserPlus} onClick={() => openSheet('invite')}>
            Invite by name
          </Button>
        </div>
      </section>

      <section aria-labelledby="members" className="mt-8">
        <div className="flex items-center justify-between">
          <h2 id="members" className="text-heading">
            On this trip <span className="num font-normal text-ink-3">{members.length}</span>
          </h2>
          <Button size="sm" variant="quiet" onClick={() => openSheet('add')}>
            Add someone
          </Button>
        </div>
        <ul className="mt-1 divide-y divide-line-soft">
          {members.map((m) => {
            const paid = ledger.paid[m.id] ?? 0
            const share = ledger.share[m.id] ?? 0
            const pct = ledger.total ? Math.round((share / ledger.total) * 100) : 0
            return (
              <li key={m.id} className="flex items-center gap-3 py-3.5">
                <Avatar person={m} size={42} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {m.name}
                    {m.isYou ? <span className="ml-1.5 text-meta font-normal text-ink-3">You</span> : null}
                  </p>
                  <p className="num truncate text-meta text-ink-3">
                    Paid {formatMoney(paid, { currency: cur })} · share {formatMoney(share, { currency: cur })}
                    {ledger.total ? ` (${pct}%)` : ''}
                  </p>
                </div>
                {!m.isYou ? <IconButton icon={UserMinus} label={`Remove ${m.name}`} onClick={() => setRemoving(m)} className="text-ink-3 hover:text-brick" /> : null}
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="pending" className="mt-8">
        <h2 id="pending" className="text-heading">
          Invited <span className="num font-normal text-ink-3">{trip.invites.length}</span>
        </h2>
        {trip.invites.length === 0 ? (
          <p className="mt-2 text-body text-ink-3">No pending invites.</p>
        ) : (
          <ul className="mt-1 divide-y divide-line-soft">
            {trip.invites.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3.5">
                <span className="flex size-[42px] shrink-0 items-center justify-center rounded-full border border-dashed border-amber text-amber-ink">
                  <UserPlus size={18} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{inv.name}</p>
                  <p className="truncate text-meta text-ink-3">
                    {inv.contact ? `${inv.contact} · ` : ''}Invited {fmt.dayMonth(inv.createdAt)}, waiting to join
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      revokeInvite(trip.id, inv.id)
                      toast.success('Invite withdrawn')
                    }}
                  >
                    Withdraw
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    title="Simulates the invitee accepting the link"
                    onClick={() => {
                      acceptInvite(trip.id, inv.id)
                      toast.success(`${inv.name} joined the trip`)
                    }}
                  >
                    Mark joined
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-caption text-ink-3">Invites are not delivered in this version. Share the link yourself and use Mark joined when they are in.</p>
      </section>

      <Sheet
        open={!!sheet}
        onClose={() => setSheet(null)}
        title={sheet === 'invite' ? 'Invite someone' : 'Add someone'}
        description={sheet === 'invite' ? 'They show as invited until they join.' : 'For people who will not use the app. They join splits straight away.'}
        footer={
          <Button block size="lg" onClick={submit}>
            {sheet === 'invite' ? 'Send invite' : 'Add to trip'}
          </Button>
        }
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <InputField label="Name" data-autofocus value={name} error={err} onChange={(e) => (setName(e.target.value), setErr(undefined))} placeholder="Karthik Menon" autoComplete="off" />
          <InputField label="Email or phone" optional value={contact} onChange={(e) => setContact(e.target.value)} placeholder="karthik@example.in" autoComplete="off" />
          <button type="submit" hidden />
        </form>
      </Sheet>

      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        title={`Remove ${removing?.name ?? ''}?`}
        body="They will no longer see this trip or be included in new splits."
        confirmLabel="Remove"
        onConfirm={() => {
          if (!removing) return
          const r = removeMember(trip.id, removing.id)
          if (r.ok) toast.success(`${removing.name} removed`)
          else toast.error(r.reason ?? 'Could not remove')
        }}
      />
    </>
  )
}
