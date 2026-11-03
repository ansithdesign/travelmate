import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowRight, Check, CircleCheck, Undo2 } from 'lucide-react'
import { TripPage, TripSubnav } from '../components/trips/TripHeader'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/Controls'
import { Milestone } from '../components/ui/Milestone'
import { Figure } from '../components/ui/Money'
import { ConfirmDialog } from '../components/ui/Sheet'
import { useToast } from '../components/ui/Toast'
import { useTripView, type TripView } from '../hooks/useTrip'
import { useStore } from '../store/store'
import type { Person } from '../types'
import { cx } from '../utils/cx'
import { fmt } from '../utils/dates'
import { firstName } from '../utils/id'
import { formatMoney } from '../utils/money'
import type { Transfer } from '../utils/settle'
import { NotFound } from './NotFound'

export function Settle() {
  const { tripId } = useParams()
  const view = useTripView(tripId)
  if (!view) return <NotFound />
  return (
    <>
      <TripSubnav view={view} />
      <TripPage wide>
        <SettleBody view={view} />
      </TripPage>
    </>
  )
}

function SettleBody({ view }: { view: TripView }) {
  const { person, me, recordPayment, deletePayment } = useStore()
  const toast = useToast()
  const { trip, ledger, transfers, payments, settled, expenses } = view
  const cur = trip.currency
  const [pending, setPending] = useState<Transfer | null>(null)
  const members = trip.members.map(person).filter(Boolean) as Person[]
  const share = members.length ? ledger.total / members.length : 0
  const name = (id: string) => (id === me.id ? 'You' : firstName(person(id)?.name ?? 'Someone'))

  if (expenses.length === 0) {
    return (
      <EmptyState
        title="Nothing to settle"
        body="Once expenses are added, this page works out the fewest payments that square everyone up."
        marker={<Milestone tone="forest" cap="Km" value="0" size="md" label="Nothing to settle" />}
      />
    )
  }

  return (
    <div className="grid gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0">
        <h1 className="text-title">{settled ? 'Everyone is settled' : 'Settle up'}</h1>
        <p className="mt-1 max-w-[56ch] text-body text-ink-2">
          {settled
            ? 'Every balance on this trip is at zero.'
            : `${transfers.length} ${transfers.length === 1 ? 'payment clears' : 'payments clear'} every balance. This is the fewest needed for this group.`}
        </p>

        {settled ? (
          <div className="mt-6 flex items-center gap-4 rounded-lg bg-forest-50 p-5">
            <Milestone tone="forest" cap="Done" value="0" unit="owed" size="md" label="Nothing owed" />
            <p className="text-body text-forest-900">
              {payments.length} {payments.length === 1 ? 'payment' : 'payments'} recorded. New expenses will reopen balances here.
            </p>
          </div>
        ) : (
          <ol className="mt-5 divide-y divide-line border-y border-line">
            {transfers.map((t) => {
              const from = person(t.from)!
              const to = person(t.to)!
              const mine = t.from === me.id || t.to === me.id
              return (
                <li key={`${t.from}-${t.to}`} className="flex flex-wrap items-center gap-x-3 gap-y-3 py-4">
                  <span className="flex shrink-0 items-center">
                    <Avatar person={from} size={36} />
                    <ArrowRight size={15} className="mx-1 text-ink-3" aria-hidden />
                    <Avatar person={to} size={36} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-meta">
                      <span className="font-medium text-ink">{name(t.from)}</span> <span className="text-ink-2">{t.from === me.id ? 'pay' : 'pays'}</span>{' '}
                      <span className="font-medium text-ink">{t.to === me.id ? 'you' : name(t.to)}</span>
                    </p>
                    <p className="num text-title">{formatMoney(t.amount, { currency: cur })}</p>
                  </div>
                  <Button size="sm" variant={mine ? 'primary' : 'ghost'} icon={Check} onClick={() => setPending(t)} className={mine ? '' : 'text-forest hover:bg-forest-50'}>
                    Mark as paid
                  </Button>
                  <span className="sr-only">
                    {from.name} pays {to.name} {formatMoney(t.amount, { currency: cur })}
                  </span>
                </li>
              )
            })}
          </ol>
        )}

        <section aria-labelledby="history" className="mt-10">
          <h2 id="history" className="text-heading">
            Payment history
          </h2>
          {payments.length === 0 ? (
            <p className="mt-2 text-body text-ink-3">No payments recorded yet.</p>
          ) : (
            <ul className="mt-1 divide-y divide-line-soft">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest">
                    <CircleCheck size={18} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">
                      <span className="font-medium">{name(p.from)}</span> <span className="text-ink-2">paid</span> <span className="font-medium">{name(p.to)}</span>
                    </span>
                    <span className="block text-meta text-ink-3">
                      {fmt.full(p.date)}
                      {p.note ? ` · ${p.note}` : ''}
                    </span>
                  </span>
                  <span className="num font-medium">{formatMoney(p.amount, { currency: cur })}</span>
                  <button
                    type="button"
                    aria-label={`Undo payment from ${name(p.from)} to ${name(p.to)}`}
                    title="Undo"
                    onClick={() => {
                      deletePayment(p.id)
                      toast.success('Payment removed, balances reopened')
                    }}
                    className="flex size-10 items-center justify-center rounded-full text-ink-3 hover:bg-sunken hover:text-ink"
                  >
                    <Undo2 size={17} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="min-w-0">
        <section aria-labelledby="breakdown" className="rounded-lg bg-surface p-5 hairline">
          <h2 id="breakdown" className="text-heading">
            How it adds up
          </h2>
          <p className="mt-3 text-meta text-ink-2">Total spent</p>
          <Figure value={ledger.total} currency={cur} className="block text-[32px] leading-10" />
          <p className="num mt-1 text-meta text-ink-3">
            {members.length} people, about {formatMoney(Math.round(share), { currency: cur })} each if shared evenly
          </p>
          <table className="mt-5 w-full text-meta">
            <caption className="sr-only">Paid, share and net balance per person</caption>
            <thead>
              <tr className="text-left text-caption text-ink-3">
                <th scope="col" className="pb-2 font-medium">
                  Person
                </th>
                <th scope="col" className="pb-2 text-right font-medium">
                  Paid
                </th>
                <th scope="col" className="pb-2 text-right font-medium">
                  Share
                </th>
                <th scope="col" className="pb-2 text-right font-medium">
                  Net
                </th>
              </tr>
            </thead>
            <tbody className="num divide-y divide-line-soft border-t border-line-soft">
              {members.map((m) => {
                const net = ledger.net[m.id] ?? 0
                return (
                  <tr key={m.id}>
                    <th scope="row" className="py-2.5 pr-2 text-left font-medium">
                      {m.isYou ? 'You' : firstName(m.name)}
                    </th>
                    <td className="py-2.5 text-right">{formatMoney(ledger.paid[m.id] ?? 0, { currency: cur, symbol: false })}</td>
                    <td className="py-2.5 text-right">{formatMoney(ledger.share[m.id] ?? 0, { currency: cur, symbol: false })}</td>
                    <td className={cx('py-2.5 text-right font-medium', net > 0 ? 'text-forest' : net < 0 ? 'text-brick' : 'text-ink-3')}>
                      {net === 0 ? '0' : formatMoney(net, { currency: cur, sign: true, symbol: false })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="mt-4 text-caption text-ink-3">Net is what you paid minus your share, adjusted for payments already made. Positive gets money back.</p>
        </section>
      </aside>

      <ConfirmDialog
        open={!!pending}
        onClose={() => setPending(null)}
        tone="primary"
        title="Record this payment?"
        body={
          pending ? (
            <>
              {name(pending.from)} {pending.from === me.id ? 'paid' : 'paid'} {pending.to === me.id ? 'you' : name(pending.to)}{' '}
              <span className="num font-medium text-ink">{formatMoney(pending.amount, { currency: cur })}</span>. Balances update for everyone.
            </>
          ) : null
        }
        confirmLabel="Mark as paid"
        onConfirm={() => {
          if (!pending) return
          recordPayment({ tripId: trip.id, from: pending.from, to: pending.to, amount: pending.amount, date: new Date().toISOString(), note: 'Marked in TripMate' })
          const left = transfers.length - 1
          toast.success(left === 0 ? 'All settled. Nice work.' : `Payment recorded. ${left} to go.`)
        }}
      />
    </div>
  )
}
