import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CaretDown, Check, CheckCircle, HandCoins, SealCheck } from '@phosphor-icons/react'
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
import { countGrossDebts, type Transfer } from '../utils/settle'
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
  const gross = countGrossDebts(expenses)
  const name = (id: string) => (id === me.id ? 'You' : firstName(person(id)?.name ?? 'Someone'))

  if (expenses.length === 0) {
    return <EmptyState art={<SkyArt size={130} />} title="Nothing to settle" body="Once expenses are added, this page works out the fewest payments that square everyone up." />
  }

  // Keep a ticket on screen while its stamp lands, even though the ledger already moved on.
  const paidTotal = payments.reduce((a, p) => a + p.amount, 0)
  const dueTotal = transfers.reduce((a, t) => a + t.amount, 0)
  const pct = paidTotal + dueTotal === 0 ? 100 : Math.round((paidTotal / (paidTotal + dueTotal)) * 100)
  const byNet = [...members].sort((a, b) => (ledger.net[b.id] ?? 0) - (ledger.net[a.id] ?? 0))
  const maxNet = Math.max(1, ...members.map((m) => Math.abs(ledger.net[m.id] ?? 0)))
  const tickets = stamping && !transfers.some((t) => key(t) === key(stamping)) ? [...transfers, stamping] : transfers

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-14 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0">
        <h2 className="px-0.5 pt-2 text-display">{settled && !stamping ? 'All square' : `${tickets.length} ${tickets.length === 1 ? 'payment' : 'payments'} left`}</h2>
        <p className="mt-2 px-0.5 text-body text-ink-3">
          {settled && !stamping ? 'Every balance on this trip is zero.' : gross > transfers.length && payments.length === 0 ? `Netted down from ${gross} debts.` : 'The fewest payments that settle everyone.'}
        </p>

        {/* The picture first: how far along settling is, and who is ahead or behind */}
        <section aria-label="Settlement overview" className="panel mt-8 rounded-[28px] p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-meta font-medium text-ink-3">Settled so far</p>
              <p className="num mt-0.5 text-[26px] leading-8 font-[650] tracking-[-0.03em]">
                {formatMoney(paidTotal, { currency: cur })}
                <span className="text-meta font-medium text-ink-3"> of {formatMoney(paidTotal + dueTotal, { currency: cur })}</span>
              </p>
            </div>
            <span className={cx('level num', settled ? 'ok' : 'aware')}>{pct}%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-accent-soft" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Share of the trip settled">
            <div className="h-full rounded-full bg-[var(--ok)] transition-[width] duration-700 ease-[var(--ease-out-expo)]" style={{ width: `${pct}%` }} />
          </div>
          <ul className="mt-7 flex flex-col gap-4">
            {byNet.map((m) => {
              const net = ledger.net[m.id] ?? 0
              const w = (Math.abs(net) / maxNet) * 50
              return (
                <li key={m.id} className="grid grid-cols-[28px_52px_minmax(0,1fr)_auto] items-center gap-2.5">
                  <Avatar person={m} size={28} />
                  <span className="truncate text-[14px] font-semibold">{m.isYou ? 'You' : firstName(m.name)}</span>
                  <span aria-hidden className="relative h-2.5">
                    <span className="absolute inset-y-[-3px] left-1/2 w-px bg-line-strong" />
                    {net !== 0 ? <span className={cx('absolute inset-y-0 rounded-full', net > 0 ? 'left-1/2 bg-[var(--ok)]' : 'right-1/2 bg-[var(--act)]')} style={{ width: `${Math.max(w, 2)}%` }} /> : null}
                  </span>
                  <span className={cx('num w-[84px] text-right text-[13px] font-semibold', net > 0 ? 'text-gain' : net < 0 ? 'text-loss' : 'text-ink-3')}>
                    {net === 0 ? 'settled' : formatMoney(Math.abs(net), { currency: cur })}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        {settled && !stamping ? (
          <div className="panel mt-8 flex items-center gap-4 rounded-[28px] p-6">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gain-soft text-gain">
              <SealCheck size={28} weight="duotone" aria-hidden />
            </span>
            <div>
              <p className="text-heading">Nothing left to pay</p>
              <p className="text-meta text-ink-3">New expenses will reopen balances here.</p>
            </div>
          </div>
        ) : (
          <section aria-labelledby="to-pay" className="mt-12">
            <h3 id="to-pay" className="flex min-h-11 items-center px-0.5 pb-1 text-title">
              To pay
            </h3>
            <ol className="panel-strong rows mt-3 overflow-hidden rounded-[28px]">
              {tickets.map((t) => (
                <li key={key(t)}>
                  <PayRow
                    from={person(t.from)!}
                    to={person(t.to)!}
                    sentence={t.from === me.id ? `You pay ${firstName(person(t.to)!.name)}` : t.to === me.id ? `${firstName(person(t.from)!.name)} pays you` : `${firstName(person(t.from)!.name)} pays ${firstName(person(t.to)!.name)}`}
                    amount={formatMoney(t.amount, { currency: cur })}
                    stamped={!!stamping && key(stamping) === key(t)}
                    onPaid={() => setPending(t)}
                  />
                </li>
              ))}
            </ol>
          </section>
        )}

        {payments.length ? (
          <section aria-labelledby="paid" className="mt-14">
            <h3 id="paid" className="flex min-h-11 items-center gap-2 px-0.5 text-title">
              Paid
              <span className="num text-meta font-medium text-ink-3">{payments.length}</span>
            </h3>
            <ul className="panel-strong rows mt-2 overflow-hidden rounded-[28px]">
              {payments.map((p) => (
                <li key={p.id} className="flex min-h-[68px] items-center gap-4 py-3 pr-4 pl-5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gain-soft text-gain">
                    <CheckCircle size={20} weight="fill" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {name(p.from)} paid {name(p.to) === 'You' ? 'you' : name(p.to)}
                    </span>
                    <span className="block text-caption text-ink-3">Paid {fmt.dayMonth(p.date)}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="num block font-semibold">{formatMoney(p.amount, { currency: cur })}</span>
                    <button
                      type="button"
                      aria-label={`Undo payment from ${name(p.from)} to ${name(p.to)}`}
                      onClick={() => {
                        deletePayment(p.id)
                        toast.success('Payment removed, balance reopened')
                      }}
                      className="press -mr-1 inline-flex h-7 items-center rounded-full px-1.5 text-caption font-semibold text-accent-ink hover:bg-accent-soft"
                    >
                      Undo
                    </button>
                  </span>
                </li>
              ))}
            </ul>
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
        title="Mark as paid?"
        body={
          pending ? (
            <>
              {pending.from === me.id ? 'You paid' : `${name(pending.from)} paid`} {pending.to === me.id ? 'you' : name(pending.to)} <span className="num font-semibold text-ink">{formatMoney(pending.amount, { currency: cur })}</span>. Balances update for everyone.
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

/**
 * One payment still to make, as a compact row: who pays whom, the amount, and
 * one small action. The label never changes, so the button never changes meaning.
 */
function PayRow({ from, sentence, amount, stamped, onPaid }: { from: Person; to?: Person; sentence: string; amount: string; stamped: boolean; onPaid: () => void }) {
  return (
    <div className={cx('relative flex min-h-[88px] items-center gap-4 overflow-hidden px-5 py-4 transition-opacity duration-500', stamped && 'pointer-events-none')}>
      <Avatar person={from} size={38} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold">{sentence}</p>
        <p className="num mt-0.5 text-[20px] leading-6 font-[650] tracking-[-0.02em]">{amount}</p>
      </div>
      <Button size="sm" icon={Check} onClick={onPaid} className="shrink-0 px-3.5">
        Mark paid
      </Button>
      {stamped ? (
        <span aria-hidden className="absolute inset-0 flex items-center justify-center gap-2 bg-[color-mix(in_srgb,var(--haze)_86%,transparent)] text-heading text-gain backdrop-blur-sm [animation:fade-in_260ms_ease-out_both]">
          <CheckCircle size={26} weight="fill" className="[animation:pop_420ms_var(--ease-out-expo)_both]" />
          Marked as paid
        </span>
      ) : null}
    </div>
  )
}
