import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Copy, LinkSimple, ShareNetwork, UserMinus, UserPlus } from '@phosphor-icons/react'
import { TripSkyHeader } from '../components/trips/TripHeader'
import { ContentSheet, SheetBody } from '../components/shared/Page'
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
      <TripSkyHeader view={view} title="People" tabs={false} />
      <ContentSheet>
        <SheetBody className="lg:max-w-[820px]">
          <PeopleBody view={view} />
        </SheetBody>
      </ContentSheet>
    </>
  )
}

function PeopleBody({ view }: { view: TripView }) {
  const { person, addInvite, revokeInvite, acceptInvite, addMember, removeMember } = useStore()
  const toast = useToast()
  const { trip, ledger } = view
  const cur = trip.currency
  const members = trip.members.map(person).filter(Boolean) as Person[]
  const [sheet, setSheet] = useState(false)
  const [direct, setDirect] = useState(false)
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
    if (!direct) {
      addInvite(trip.id, n, contact)
      toast.success(`Invite for ${n} is pending`)
    } else {
      addMember(trip.id, n, contact)
      toast.success(`${n} added to the trip`)
    }
    setSheet(false)
  }

  function openSheet() {
    setName('')
    setContact('')
    setErr(undefined)
    setDirect(false)
    setSheet(true)
  }

  return (
    <>
      <h2 className="px-0.5 pt-2 text-display">People</h2>
      <p className="mt-1.5 px-0.5 text-body text-ink-3">Everyone on the trip can add expenses and is in every split by default.</p>

      <section aria-labelledby="invite-link" className="panel mt-5 rounded-[24px] p-6">
        <h2 id="invite-link" className="flex items-center gap-2.5 text-heading">
          <span className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-accent">
            <LinkSimple size={19} weight="duotone" aria-hidden />
          </span>
          Invite to {trip.name}
        </h2>
        <div className="mt-4 flex h-[54px] items-center gap-2 rounded-[16px] bg-well py-1 pr-1 pl-4">
          <span className="min-w-0 flex-1 truncate text-meta font-medium text-ink-2">{link.replace(/^https?:\/\//, '')}</span>
          <IconButton icon={Copy} label="Copy invite link" onClick={copy} weight="regular" className="size-11" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button onClick={share} icon={ShareNetwork}>
            Share link
          </Button>
          <Button variant="secondary" icon={UserPlus} onClick={openSheet}>
            Invite by name
          </Button>
        </div>
      </section>

      <section aria-labelledby="members" className="mt-14">
        <h2 id="members" className="flex min-h-11 items-center px-0.5 text-title">
          On this trip <span className="num ml-1.5 font-medium text-ink-3">{members.length}</span>
        </h2>
        <ul className="panel-strong rows mt-3 overflow-hidden rounded-[24px]">
          {members.map((m) => {
            const paid = ledger.paid[m.id] ?? 0
            const share = ledger.share[m.id] ?? 0
            const pct = ledger.total ? Math.round((share / ledger.total) * 100) : 0
            return (
              <li key={m.id} className="flex min-h-[68px] items-center gap-4 py-3 pr-3 pl-5">
                <Avatar person={m} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {m.name}
                    {m.isYou ? <span className="ml-1.5 text-meta font-normal text-ink-3">You</span> : null}
                  </p>
                  <p className="num truncate text-caption text-ink-3">
                    Paid {formatMoney(paid, { currency: cur })} · share {formatMoney(share, { currency: cur })}
                    {ledger.total ? ` (${pct}%)` : ''}
                  </p>
                </div>
                {!m.isYou ? <IconButton icon={UserMinus} label={`Remove ${m.name}`} onClick={() => setRemoving(m)} className="text-ink-3 hover:text-loss" /> : null}
              </li>
            )
          })}
        </ul>
      </section>

      {trip.invites.length ? (
      <section aria-labelledby="pending" className="mt-14">
        <h2 id="pending" className="flex min-h-11 items-center px-0.5 text-title">
          Waiting to join <span className="num ml-1.5 font-medium text-ink-3">{trip.invites.length}</span>
        </h2>
        {(
          <ul className="panel-strong rows mt-3 overflow-hidden rounded-[24px]">
            {trip.invites.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center gap-x-3.5 gap-y-2 px-4 py-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-aware-tint text-aware-ink">
                  <UserPlus size={18} weight="duotone" aria-hidden />
                </span>
                <div className="min-w-[150px] flex-1">
                  <p className="truncate font-semibold">{inv.name}</p>
                  <p className="truncate text-caption text-ink-3">
                    {inv.contact ? `${inv.contact} · ` : ''}Invited {fmt.dayMonth(inv.createdAt)}
                  </p>
                </div>
                <div className="ml-auto flex gap-1">
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
        <p className="mt-2.5 px-1 text-caption text-ink-3">Invites are not delivered in this version. Share the link yourself and use Mark joined when they are in.</p>
      </section>
      ) : null}

      <Sheet
        open={sheet}
        onClose={() => setSheet(false)}
        title="Invite someone"
        description={direct ? 'They join splits straight away.' : 'They show as waiting until they join.'}
        footer={
          <Button block size="lg" onClick={submit}>
            {direct ? 'Add to trip' : 'Send invite'}
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
          <label className="panel-strong flex min-h-[68px] cursor-pointer items-center gap-4 rounded-[20px] px-5 py-3.5">
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Add without inviting</span>
              <span className="block text-caption text-ink-3">For someone who will not use the app</span>
            </span>
            <input type="checkbox" role="switch" checked={direct} onChange={(e) => setDirect(e.target.checked)} className="peer sr-only" />
            <span
              aria-hidden
              className="relative h-[31px] w-[51px] shrink-0 rounded-full bg-line-strong transition-colors duration-200 peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent after:absolute after:top-[2px] after:left-[2px] after:size-[27px] after:rounded-full after:bg-white after:shadow-[0_3px_8px_rgba(0,0,0,0.18)] after:transition-transform after:duration-200 peer-checked:after:translate-x-5"
            />
          </label>
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
