import { useState } from 'react'
import { PencilSimple, Trash } from '@phosphor-icons/react'
import { categoryById } from '../../data/categories'
import { SAMPLE_RECEIPTS } from '../../data/sampleReceipts'
import { useStore } from '../../store/store'
import { useUI } from '../../store/ui'
import type { Expense, Person } from '../../types'
import { fmt } from '../../utils/dates'
import { formatMoney } from '../../utils/money'
import { computeSplit } from '../../utils/split'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { DetailRow } from '../ui/Controls'
import { Figure } from '../ui/Money'
import { ConfirmDialog, Sheet } from '../ui/Sheet'
import { useToast } from '../ui/Toast'
import { ReceiptPaper } from '../receipts/ReceiptPaper'
import { CategoryIcon } from '../icons/CategoryIcon'

const METHOD_LABEL = { equal: 'Split equally', exact: 'Split by amounts', percent: 'Split by percentage', shares: 'Split by shares' }

export function ExpenseDetailSheet({ expense, onClose }: { expense: Expense | null; onClose: () => void }) {
  const { data, person, deleteExpense, restoreExpense } = useStore()
  const { openExpense } = useUI()
  const toast = useToast()
  const [confirm, setConfirm] = useState(false)
  // Keep the last expense around so the sheet can animate out after deletion.
  const [last, setLast] = useState<Expense | null>(expense)
  if (expense && expense !== last) setLast(expense)
  const e = expense ?? last
  if (!e) return null

  const trip = data.trips.find((t) => t.id === e.tripId)
  const currency = trip?.currency ?? 'INR'
  const cat = categoryById[e.category]
  const { shares } = computeSplit(e.amount, e.split)
  const payer = person(e.paidBy)
  const sample = e.receipt?.sampleId ? SAMPLE_RECEIPTS.find((s) => s.id === e.receipt?.sampleId) : undefined

  return (
    <>
      <Sheet
        open={!!expense}
        onClose={onClose}
        title={e.title}
        description={trip?.name}
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" icon={Trash} className="text-loss hover:bg-loss-soft" onClick={() => setConfirm(true)}>
              Delete
            </Button>
            <Button
              className="flex-1"
              icon={PencilSimple}
              onClick={() => {
                onClose()
                openExpense({ expenseId: e.id, tripId: e.tripId })
              }}
            >
              Edit expense
            </Button>
          </div>
        }
      >
        <div className="flex items-end justify-between gap-4 pb-4">
          <Figure value={e.amount} currency={currency} />
          <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-well px-3 py-1 text-meta font-medium text-ink-2">
            <CategoryIcon id={e.category} size={22} />
            {cat.label}
          </span>
        </div>
        <dl className="divide-y divide-line border-y border-line">
          <DetailRow label="Paid by">{payer?.isYou ? 'You' : payer?.name}</DetailRow>
          <DetailRow label="When">
            {fmt.weekday(e.date)}, {fmt.time(e.date)}
          </DetailRow>
          <DetailRow label="Split">{METHOD_LABEL[e.split.method]}</DetailRow>
        </dl>

        <h3 className="mt-6 mb-1 text-meta font-medium text-ink-2">Who owes what</h3>
        <ul className="divide-y divide-line">
          {e.split.participants.map((id) => {
            const p = person(id) as Person
            if (!p) return null
            const s = shares[id] ?? 0
            const extra =
              e.split.method === 'percent' ? `${e.split.values[id]}%` : e.split.method === 'shares' ? `${e.split.values[id]} ${e.split.values[id] === 1 ? 'share' : 'shares'}` : null
            return (
              <li key={id} className="flex items-center gap-3 py-2.5">
                <Avatar person={p} size={32} />
                <span className="min-w-0 flex-1 truncate">
                  {p.isYou ? 'You' : p.name}
                  {extra ? <span className="ml-2 text-meta text-ink-3">{extra}</span> : null}
                </span>
                <span className="num font-medium">{formatMoney(s, { currency })}</span>
              </li>
            )
          })}
        </ul>

        {e.notes ? (
          <>
            <h3 className="mt-6 mb-1.5 text-meta font-medium text-ink-2">Note</h3>
            <p className="max-w-[60ch] text-body text-ink">{e.notes}</p>
          </>
        ) : null}

        {e.receipt ? (
          <>
            <h3 className="mt-6 mb-2 text-meta font-medium text-ink-2">Receipt</h3>
            <div className="flex flex-col gap-4 rounded-[24px] bg-well p-4 sm:flex-row sm:items-start">
              <div className="mx-auto w-[180px] shrink-0">
                {e.receipt.image ? (
                  <img src={e.receipt.image} alt={`Receipt from ${e.receipt.merchant || 'merchant'}`} className="w-full rounded-[6px] shadow-[0_8px_20px_-10px_rgb(var(--t-shadow)/0.4)]" />
                ) : sample ? (
                  <ReceiptPaper receipt={sample} compact />
                ) : null}
              </div>
              <dl className="min-w-0 flex-1 text-meta">
                <DetailRow label="Merchant" className="py-1.5">{e.receipt.merchant || 'Not set'}</DetailRow>
                <DetailRow label="Date" className="py-1.5">{e.receipt.date ? fmt.full(e.receipt.date) : 'Not set'}</DetailRow>
                {e.receipt.tax ? <DetailRow label="Tax" className="py-1.5"><span className="num">{formatMoney(e.receipt.tax, { currency })}</span></DetailRow> : null}
                <DetailRow label="Total" className="py-1.5"><span className="num font-medium">{formatMoney(e.receipt.total, { currency })}</span></DetailRow>
                {e.receipt.items.length ? <DetailRow label="Items" className="py-1.5">{e.receipt.items.length}</DetailRow> : null}
              </dl>
            </div>
          </>
        ) : null}
      </Sheet>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Delete this expense?"
        body={<>{e.title} ({formatMoney(e.amount, { currency })}) will be removed and everyone’s balances recalculated.</>}
        confirmLabel="Delete"
        onConfirm={() => {
          const removed = deleteExpense(e.id)
          onClose()
          toast.success('Expense deleted', removed ? { label: 'Undo', onClick: () => restoreExpense(removed) } : undefined)
        }}
      />
    </>
  )
}
