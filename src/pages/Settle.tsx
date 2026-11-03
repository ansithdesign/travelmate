import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowRight, ArrowUUpLeft, Check, CheckCircle, HandCoins, SealCheck } from '@phosphor-icons/react'
import { TripSkyHeader } from '../components/trips/TripHeader'
import { ContentSheet, SheetBody } from '../components/shared/Page'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/Controls'
import { SkyArt } from '../components/shared/SkyArt'
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
      <TripSkyHeader view={view} title="Settle up" />
      <ContentSheet>
        <SheetBody>
          <SettleBody view={view} />
        </SheetBody>
      </ContentSheet>
    </>
  )
}

const key = (t: Transfer) => `${t.from}>${t.to}`

function SettleBody({ view }: { view: TripView }) {
  const { person, me, recordPayment, deletePayment } = useStore()
  const toast = useToast()
  const { trip, ledger, transfers, payments, settled, expenses } = view
  const cur = trip.currency
  const [pending, setPending] = useState<Transfer | null>(null)
  const [stamping, setStamping] = useState<Transfer | null>(null)
  const members = trip.members.map(person).filter(Boolean) as Person[]
  const name = (id: string) => (id === me.id ? 'You' : firstName(person(id)?.name ?? 'Someone'))

  if (expenses.length === 0) {
    return <EmptyState art={<SkyArt size={130} />} title="Nothing to settle" body="Once expenses are added, this page works out the fewest payments that square everyone up." />
  }

  // Keep a ticket on screen while its stamp lands, even though the ledger already moved on.
  const tickets = stamping && !transfers.some((t) => key(t) === key(stamping)) ? [...transfers, stamping] : transfers

  return (
    <div className="grid gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0">
        <p className="max-w-[56ch] text-body text-ink-2">
          {settled && !stamping
            ? 'Every balance on this trip is at zero.'
            : `${transfers.length} ${transfers.length === 1 ? 'payment clears' : 'payments clear'} every balance. That is the fewest this group needs.`}
        </p>

        {settled && !stamping ? (
          <div className="panel mt-5 flex items-center gap-4 rounded-[28px] bg-[linear-gradient(135deg,rgb(52_211_164/0.16),rgb(96_165_250/0.12))] p-5">
            <SealCheck size={52} weight="duotone" className="shrink-0 text-gain" aria-hidden />
            <div>
              <p className="text-title">All square</p>
              <p className="text-meta text-ink-2">
                {payments.length} {payments.length === 1 ? 'payment' : 'payments'} recorded. New expenses reopen balances here.
              </p>
            </div>
          </div>
        ) : (
          <ol className="mt-5 flex flex-col gap-3">
            {tickets.map((t, i) => (
              <li key={key(t)}>
                <Ticket
                  index={i + 1}
                  total={tickets.length}
                  from={person(t.from)!}
                  to={person(t.to)!}
                  amount={formatMoney(t.amount, { currency: cur })}
                  mine={t.from === me.id || t.to === me.id}
                  youPay={t.from === me.id}
                  youGet={t.to === me.id}
                  stamped={!!stamping && key(stamping) === key(t)}
                  onPaid={() => setPending(t)}
                />
              </li>
            ))}
          </ol>
        )}

        <section aria-labelledby="history" className="mt-10">
          <h2 id="history" className="text-heading">
            Payment history
          </h2>
          {payments.length === 0 ? (
            <p className="mt-2 text-body text-ink-3">No payments recorded yet.</p>
          ) : (
            <ul className="panel mt-3 divide-y divide-line overflow-hidden rounded-[24px]">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gain-soft text-gain">
                    <CheckCircle size={22} weight="duotone" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-meta">
                      <span className="font-semibold">{name(p.from)}</span> <span className="text-ink-2">paid</span> <span className="font-semibold">{name(p.to)}</span>
                    </span>
                    <span className="block text-caption text-ink-3">
                      {fmt.full(p.date)}
                      {p.note ? ` · ${p.note}` : ''}
                    </span>
                  </span>
                  <span className="num font-semibold">{formatMoney(p.amount, { currency: cur })}</span>
                  <button
                    type="button"
                    aria-label={`Undo payment from ${name(p.from)} to ${name(p.to)}`}
                    title="Undo"
                    onClick={() => {
                      deletePayment(p.id)
                      toast.success('Payment removed, balances reopened')
                    }}
                    className="press flex size-10 items-center justify-center rounded-full text-ink-3 hover:bg-well hover:text-ink"
                  >
                    <ArrowUUpLeft size={18} weight="bold" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="min-w-0">
        <section aria-labelledby="breakdown" className="panel rounded-[28px] p-5 sm:p-6">
          <h2 id="breakdown" className="text-heading">
            How it adds up
          </h2>
          <p className="mt-4 text-meta text-ink-2">Total spent</p>
          <Figure value={ledger.total} currency={cur} size="md" />
          <p className="num mt-1 text-caption text-ink-3">
            {members.length} people · about {formatMoney(Math.round(ledger.total / Math.max(1, members.length)), { currency: cur })} each if shared evenly
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
            <tbody className="num divide-y divide-line border-t border-line">
              {members.map((m) => {
                const net = ledger.net[m.id] ?? 0
                return (
                  <tr key={m.id}>
                    <th scope="row" className="py-2.5 pr-2 text-left font-semibold">
                      <span className="flex items-center gap-2">
                        <Avatar person={m} size={24} />
                        {m.isYou ? 'You' : firstName(m.name)}
                      </span>
                    </th>
                    <td className="py-2.5 text-right">{formatMoney(ledger.paid[m.id] ?? 0, { currency: cur, symbol: false })}</td>
                    <td className="py-2.5 text-right">{formatMoney(ledger.share[m.id] ?? 0, { currency: cur, symbol: false })}</td>
                    <td className={cx('py-2.5 text-right font-semibold', net > 0 ? 'text-gain' : net < 0 ? 'text-loss' : 'text-ink-3')}>
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
        icon={<HandCoins size={44} weight="duotone" className="text-accent" />}
        title="Record this payment?"
        body={
          pending ? (
            <>
              {name(pending.from)} paid {pending.to === me.id ? 'you' : name(pending.to)} <span className="num font-semibold text-ink">{formatMoney(pending.amount, { currency: cur })}</span>. Balances update for everyone.
            </>
          ) : null
        }
        confirmLabel="Mark as paid"
        onConfirm={() => {
          if (!pending) return
          const t = pending
          setStamping(t)
          window.setTimeout(() => {
            recordPayment({ tripId: trip.id, from: t.from, to: t.to, amount: t.amount, date: new Date().toISOString(), note: 'Marked in TripMate' })
            const left = transfers.length - 1
            toast.success(left === 0 ? 'All square. Nice work.' : `Payment recorded. ${left} to go.`)
          }, 650)
          window.setTimeout(() => setStamping(null), 1300)
        }}
      />
    </div>
  )
}

/** One suggested payment: who pays whom, how much, and the action to record it. */
function Ticket({
  from,
  to,
  amount,
  youPay,
  youGet,
  stamped,
  onPaid,
}: {
  index: number
  total: number
  from: Person
  to: Person
  amount: string
  mine: boolean
  youPay: boolean
  youGet: boolean
  stamped: boolean
  onPaid: () => void
}) {
  const mine = youPay || youGet
  return (
    <div
      className={cx(
        'panel relative flex items-center gap-4 overflow-hidden rounded-[24px] p-4 transition-[opacity,transform] duration-500',
        mine && 'shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--color-accent)_40%,transparent),0_14px_30px_-20px_rgb(37_99_235/0.6)]',
        stamped && 'pointer-events-none',
      )}
    >
      <Avatar person={from} size={44} />
      <div className="min-w-0 flex-1">
        <p className="flex min-w-0 items-center gap-1.5 text-meta text-ink-2">
          <span className="truncate font-semibold text-ink">{youPay ? 'You' : firstName(from.name)}</span>
          <ArrowRight size={13} weight="bold" className="shrink-0 text-ink-3" aria-label="pays" />
          <span className="truncate font-semibold text-ink">{youGet ? 'You' : firstName(to.name)}</span>
        </p>
        <p className="num text-title">{amount}</p>
      </div>
      <Button size="sm" variant={mine ? 'primary' : 'secondary'} icon={Check} onClick={onPaid} className="shrink-0">
        Paid
      </Button>
      <span className="sr-only">
        {from.name} pays {to.name} {amount}
      </span>
      {stamped ? (
        <span aria-hidden className="absolute inset-0 flex items-center justify-center gap-2 bg-gain-soft text-heading text-gain backdrop-blur-sm [animation:fade-in_260ms_ease-out_both]">
          <CheckCircle size={26} weight="fill" className="[animation:pop_420ms_var(--ease-out-expo)_both]" />
          Recorded
        </span>
      ) : null}
    </div>
  )
}
