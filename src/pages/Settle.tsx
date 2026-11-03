import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowUUpLeft, CaretDown, Check, CheckCircle, HandCoins, SealCheck } from '@phosphor-icons/react'
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
    <div className="grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-14 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0">
        <h2 className="px-0.5 pt-2 text-display">{settled && !stamping ? 'All square' : `${transfers.length} ${transfers.length === 1 ? 'payment' : 'payments'} to settle`}</h2>
        <p className="mt-1.5 max-w-[56ch] px-0.5 text-body text-ink-3">
          {settled && !stamping
            ? 'Every balance on this trip is at zero.'
            : 'The fewest payments that square everyone up. Tap Paid once the money has changed hands.'}
        </p>

        {settled && !stamping ? (
          <div className="panel mt-5 flex items-center gap-4 rounded-[28px] p-6">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gain-soft text-gain">
              <SealCheck size={28} weight="duotone" aria-hidden />
            </span>
            <div>
              <p className="text-heading">Nothing left to pay</p>
              <p className="text-meta text-ink-3">
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

        {payments.length ? (
        <section aria-labelledby="history" className="mt-14">
          <h2 id="history" className="flex min-h-11 items-center px-0.5 text-title">
            Payment history
          </h2>
          {(
            <ul className="panel-strong rows mt-3 overflow-hidden rounded-[28px]">
              {payments.map((p) => (
                <li key={p.id} className="flex min-h-[68px] items-center gap-4 py-3 pr-3 pl-5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gain-soft text-gain">
                    <CheckCircle size={20} weight="duotone" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {name(p.from)} paid {name(p.to) === 'You' ? 'you' : name(p.to)}
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
        ) : null}
      </div>

      <aside className="min-w-0">
        <details className="panel group rounded-[28px] p-6" open={typeof window !== 'undefined' && window.innerWidth >= 1024}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
            <span>
              <span className="block text-heading">How it adds up</span>
              <span className="block text-caption text-ink-3">Who paid what, and each person's share</span>
            </span>
            <CaretDown size={16} weight="bold" className="shrink-0 text-ink-3 transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <div>
          <p className="mt-5 text-meta text-ink-3">Total spent</p>
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
            <tbody className="num [&>tr]:shadow-[inset_0_1px_0_var(--divider)]">
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
          </div>
        </details>
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
        'panel relative flex items-center gap-3.5 overflow-hidden rounded-[28px] p-4 transition-[opacity,transform] duration-500',
        mine && 'bg-panel-strong shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--accent)_35%,transparent),var(--shadow-soft)]',
        stamped && 'pointer-events-none',
      )}
    >
      <Avatar person={from} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-meta text-ink-3">{youPay ? `You pay ${firstName(to.name)}` : youGet ? `${firstName(from.name)} pays you` : `${firstName(from.name)} pays ${firstName(to.name)}`}</p>
        <p className="num text-[24px] leading-8 font-[650] tracking-[-0.03em]">{amount}</p>
      </div>
      <Button size="sm" variant={mine ? 'primary' : 'secondary'} icon={Check} onClick={onPaid} className="shrink-0">
        Paid
      </Button>
      {stamped ? (
        <span aria-hidden className="absolute inset-0 flex items-center justify-center gap-2 bg-[color-mix(in_srgb,var(--haze)_80%,transparent)] text-heading text-gain backdrop-blur-sm [animation:fade-in_260ms_ease-out_both]">
          <CheckCircle size={26} weight="fill" className="[animation:pop_420ms_var(--ease-out-expo)_both]" />
          Recorded
        </span>
      ) : null}
    </div>
  )
}
