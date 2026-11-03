import type { SampleReceipt } from '../../data/sampleReceipts'
import { cx } from '../../utils/cx'
import { formatMoney } from '../../utils/money'

/**
 * A drawn thermal-paper receipt for the sample data. Monospace here is the
 * receipt's own printing, not decoration.
 */
export function ReceiptPaper({ receipt, compact }: { receipt: SampleReceipt; compact?: boolean }) {
  const subtotal = receipt.items.reduce((a, i) => a + i.amount, 0)
  return (
    <div
      className={cx(
        'relative bg-[#fdfcf8] px-4 pt-5 pb-6 font-mono text-[#2b2b28] shadow-[0_8px_24px_-12px_rgb(0_0_0/0.45)]',
        compact ? 'text-[9px] leading-[13px]' : 'text-[11px] leading-[16px]',
      )}
      style={{
        mask: 'conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 12px 100%',
        WebkitMask: 'conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 12px 100%',
      }}
      aria-hidden
    >
      <p className="text-center font-bold tracking-wide uppercase">{receipt.merchant}</p>
      <p className="text-center opacity-70">{receipt.address}</p>
      <p className="mt-1 text-center opacity-70">Time {receipt.time}</p>
      <div className="my-2 border-t border-dashed border-[#2b2b28]/40" />
      {receipt.items.map((i) => (
        <div key={i.name} className="flex justify-between gap-2">
          <span className="truncate">
            {i.name}
            {i.qty && i.qty > 1 ? ` x${i.qty}` : ''}
          </span>
          <span>{formatMoney(i.amount, { symbol: false })}</span>
        </div>
      ))}
      <div className="my-2 border-t border-dashed border-[#2b2b28]/40" />
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatMoney(subtotal, { symbol: false })}</span>
      </div>
      <div className="flex justify-between">
        <span>{receipt.taxLabel}</span>
        <span>{formatMoney(receipt.tax, { symbol: false })}</span>
      </div>
      <div className={cx('mt-1 flex justify-between font-bold', compact ? 'text-[11px]' : 'text-[13px]')}>
        <span>TOTAL</span>
        <span>{formatMoney(receipt.total)}</span>
      </div>
      <p className="mt-2 text-center opacity-70">Paid by {receipt.payment}</p>
      <p className="mt-1 text-center opacity-70">Thank you, visit again</p>
    </div>
  )
}
