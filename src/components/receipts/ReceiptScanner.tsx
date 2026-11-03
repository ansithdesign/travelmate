import { useEffect, useRef, useState } from 'react'
import { Camera, ImageUp, Info, Plus, Trash2 } from 'lucide-react'
import { SAMPLE_RECEIPTS, type SampleReceipt } from '../../data/sampleReceipts'
import type { CurrencyCode, Receipt, ReceiptLineItem } from '../../types'
import { cx } from '../../utils/cx'
import { isoDate, today } from '../../utils/dates'
import { uid } from '../../utils/id'
import { readImage } from '../../utils/image'
import { currencySymbol, formatMoney, parseMoney, toInput } from '../../utils/money'
import { Button, IconButton } from '../ui/Button'
import { Field, TextInput } from '../ui/Field'
import { Sheet } from '../ui/Sheet'
import { useToast } from '../ui/Toast'
import { ReceiptPaper } from './ReceiptPaper'

type Stage = 'choose' | 'camera' | 'reading' | 'review'

interface EditItem {
  id: string
  name: string
  amount: string
}

/**
 * Receipt capture. There is no camera access or OCR in this build:
 * "Camera" frames a sample receipt and "reading" fills fields from that sample.
 * Uploaded photos attach for real, with fields entered by hand.
 */
export function ReceiptScanner({
  open,
  onClose,
  onUse,
  initial,
  currency,
}: {
  open: boolean
  onClose: () => void
  onUse: (r: Receipt) => void
  initial?: Receipt
  currency: CurrencyCode
}) {
  const toast = useToast()
  const [stage, setStage] = useState<Stage>('choose')
  const [sample, setSample] = useState<SampleReceipt>(SAMPLE_RECEIPTS[0])
  const [image, setImage] = useState<string | undefined>()
  const [source, setSource] = useState<Receipt['source']>('sample')
  const [merchant, setMerchant] = useState('')
  const [date, setDate] = useState('')
  const [total, setTotal] = useState('')
  const [tax, setTax] = useState('')
  const [items, setItems] = useState<EditItem[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setSource(initial.source)
      setImage(initial.image)
      const s = SAMPLE_RECEIPTS.find((x) => x.id === initial.sampleId)
      if (s) setSample(s)
      setMerchant(initial.merchant)
      setDate(initial.date)
      setTotal(initial.total ? toInput(initial.total) : '')
      setTax(initial.tax ? toInput(initial.tax) : '')
      setItems(initial.items.map((i) => ({ id: i.id, name: i.name, amount: toInput(i.amount) })))
      setStage('review')
    } else {
      setStage('choose')
      setImage(undefined)
    }
  }, [open, initial])

  function loadSample(s: SampleReceipt) {
    setSource('sample')
    setSample(s)
    setImage(undefined)
    setStage('reading')
    window.setTimeout(() => {
      setMerchant(s.merchant)
      setDate(isoDate(today()))
      setTotal(toInput(s.total))
      setTax(s.tax ? toInput(s.tax) : '')
      setItems(s.items.map((i) => ({ id: uid('li-'), name: i.qty && i.qty > 1 ? `${i.name} × ${i.qty}` : i.name, amount: toInput(i.amount) })))
      setStage('review')
    }, 1400)
  }

  async function onFile(f: File) {
    try {
      const src = await readImage(f, 1100, 0.78)
      setSource('upload')
      setImage(src)
      setMerchant('')
      setDate(isoDate(today()))
      setTotal('')
      setTax('')
      setItems([])
      setStage('review')
    } catch {
      toast.error('That file could not be read as an image.')
    }
  }

  const itemsTotal = items.reduce((a, i) => a + (parseMoney(i.amount) ?? 0), 0)
  const totalP = parseMoney(total) ?? 0
  const taxP = parseMoney(tax) ?? 0
  const mismatch = items.length > 0 && totalP > 0 && itemsTotal + taxP !== totalP

  function use() {
    const r: Receipt = {
      id: initial?.id ?? uid('r-'),
      source,
      image,
      sampleId: source === 'sample' ? sample.id : undefined,
      merchant: merchant.trim(),
      date,
      total: totalP,
      tax: taxP || undefined,
      items: items
        .filter((i) => i.name.trim())
        .map<ReceiptLineItem>((i) => ({ id: i.id, name: i.name.trim(), amount: parseMoney(i.amount) ?? 0 })),
    }
    onUse(r)
    toast.success('Receipt attached')
  }

  const title = stage === 'review' ? 'Check the receipt' : stage === 'camera' ? 'Scan a receipt' : stage === 'reading' ? 'Reading receipt' : 'Add a receipt'

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        stage === 'review' ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setStage('choose')}>
              Retake
            </Button>
            <Button className="flex-1" size="lg" onClick={use} disabled={!merchant.trim() && !totalP}>
              Use this receipt
            </Button>
          </div>
        ) : stage === 'camera' ? (
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => loadSample(sample)}
              aria-label="Capture"
              className="flex size-16 items-center justify-center rounded-full bg-surface shadow-[0_0_0_3px_var(--color-ink)] transition-transform active:scale-95"
            >
              <span className="size-[52px] rounded-full bg-ink" />
            </button>
          </div>
        ) : undefined
      }
    >
      <SimulationNote />

      {stage === 'choose' ? (
        <div className="mt-5 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              data-autofocus
              onClick={() => setStage('camera')}
              className="flex h-28 flex-col items-start justify-between rounded-md bg-ink p-4 text-left text-white transition-colors hover:bg-[#2a302c]"
            >
              <Camera size={22} strokeWidth={1.8} aria-hidden />
              <span>
                <span className="block font-medium">Scan with camera</span>
                <span className="block text-caption text-white/70">Simulated</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-28 flex-col items-start justify-between rounded-md bg-surface p-4 text-left hairline transition-colors hover:bg-ground"
            >
              <ImageUp size={22} strokeWidth={1.8} aria-hidden />
              <span>
                <span className="block font-medium">Upload a photo</span>
                <span className="block text-caption text-ink-3">Fields entered by you</span>
              </span>
            </button>
          </div>
          <div>
            <h3 className="text-meta font-medium text-ink-2">Or try a sample receipt</h3>
            <ul className="mt-2 divide-y divide-line-soft">
              {SAMPLE_RECEIPTS.map((s) => (
                <li key={s.id}>
                  <button type="button" onClick={() => loadSample(s)} className="flex w-full items-center justify-between gap-3 py-3 text-left hover:text-forest">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{s.merchant}</span>
                      <span className="block truncate text-meta text-ink-3">{s.address}</span>
                    </span>
                    <span className="num shrink-0 font-medium">{formatMoney(s.total)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              if (f) onFile(f)
            }}
          />
        </div>
      ) : null}

      {stage === 'camera' || stage === 'reading' ? (
        <div className="mt-5">
          <div className="relative flex aspect-[3/4] max-h-[56dvh] w-full items-center justify-center overflow-hidden rounded-lg bg-[#2a2f2b]">
            <div className={cx('w-[64%] max-w-[260px] transition-transform duration-500', stage === 'reading' ? 'scale-[1.04]' : 'rotate-[-2deg]')}>
              <ReceiptPaper receipt={sample} compact />
            </div>
            {/* Frame corners */}
            <div aria-hidden className="pointer-events-none absolute inset-[9%]">
              {[
                ['top-0 left-0', 0],
                ['top-0 right-0', 90],
                ['bottom-0 right-0', 180],
                ['bottom-0 left-0', 270],
              ].map(([pos, rot]) => (
                <svg key={pos} viewBox="0 0 32 32" className={cx('absolute size-8 text-white/90', pos as string)} style={{ transform: `rotate(${rot}deg)` }}>
                  <path d="M2 30V14A12 12 0 0 1 14 2h16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              ))}
            </div>
            {stage === 'reading' ? (
              <div aria-hidden className="pointer-events-none absolute inset-x-[9%] top-[9%] bottom-[9%] overflow-hidden">
                <div className="h-full w-full [animation:scanline_1.3s_var(--ease-out-expo)_infinite]">
                  <div className="h-[2px] w-full bg-amber shadow-[0_0_14px_2px_rgb(201_138_30/0.55)]" />
                </div>
              </div>
            ) : null}
            <p className="absolute inset-x-0 bottom-4 text-center text-meta text-white/80">
              {stage === 'reading' ? 'Reading merchant, date and totals' : 'Hold steady. Capture when the receipt fills the frame.'}
            </p>
          </div>
          {stage === 'camera' ? (
            <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
              {SAMPLE_RECEIPTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSample(s)}
                  aria-pressed={s.id === sample.id}
                  className={cx('h-9 shrink-0 rounded-full px-3.5 text-meta font-medium', s.id === sample.id ? 'bg-ink text-white' : 'bg-surface text-ink-2 hairline')}
                >
                  {s.merchant}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {stage === 'review' ? (
        <div className="mt-5 grid gap-6 md:grid-cols-1">
          <div className="flex justify-center rounded-lg bg-sunken p-4">
            {source === 'upload' && image ? (
              <img src={image} alt="Uploaded receipt" className="max-h-[300px] rounded-[6px] object-contain shadow-lift" />
            ) : (
              <div className="w-full max-w-[280px]">
                <ReceiptPaper receipt={sample} />
              </div>
            )}
          </div>

          {source === 'upload' ? (
            <p className="text-meta text-ink-2">Text is not read from photos in this version. Fill in what you need; the photo is saved with the expense.</p>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Merchant" className="col-span-2" htmlFor="rc-merchant">
              <TextInput id="rc-merchant" value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="Where you paid" />
            </Field>
            <Field label="Date" htmlFor="rc-date">
              <TextInput id="rc-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Total" htmlFor="rc-total">
              <MoneyBox id="rc-total" value={total} onChange={setTotal} currency={currency} />
            </Field>
            <Field label="Tax" optional htmlFor="rc-tax" className="col-span-2 sm:col-span-1">
              <MoneyBox id="rc-tax" value={tax} onChange={setTax} currency={currency} />
            </Field>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-meta font-medium text-ink-2">Line items</h3>
              <span className="num text-meta text-ink-3">{formatMoney(itemsTotal, { currency })}</span>
            </div>
            <ul className="mt-2 flex flex-col gap-2">
              {items.map((it, i) => (
                <li key={it.id} className="flex items-center gap-2">
                  <TextInput
                    aria-label={`Item ${i + 1} name`}
                    value={it.name}
                    onChange={(e) => setItems((xs) => xs.map((x) => (x.id === it.id ? { ...x, name: e.target.value } : x)))}
                    className="h-11 flex-1"
                  />
                  <div className="w-[112px] shrink-0">
                    <MoneyBox
                      ariaLabel={`Item ${i + 1} amount`}
                      value={it.amount}
                      onChange={(v) => setItems((xs) => xs.map((x) => (x.id === it.id ? { ...x, amount: v } : x)))}
                      currency={currency}
                      small
                    />
                  </div>
                  <IconButton icon={Trash2} label={`Remove ${it.name || 'item'}`} onClick={() => setItems((xs) => xs.filter((x) => x.id !== it.id))} className="size-10 text-ink-3" />
                </li>
              ))}
            </ul>
            <Button variant="quiet" size="sm" icon={Plus} className="mt-2 -ml-1" onClick={() => setItems((xs) => [...xs, { id: uid('li-'), name: '', amount: '' }])}>
              Add item
            </Button>
            {mismatch ? (
              <p className="mt-2 text-meta text-amber-ink">
                Items and tax come to {formatMoney(itemsTotal + taxP, { currency })}, the total says {formatMoney(totalP, { currency })}.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </Sheet>
  )
}

function SimulationNote() {
  return (
    <p className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2.5 text-meta text-amber-ink">
      <Info size={16} className="mt-px shrink-0" aria-hidden />
      Scanning is a simulation in this version. Sample receipts fill the fields; you can correct anything.
    </p>
  )
}

function MoneyBox({ id, value, onChange, currency, small, ariaLabel }: { id?: string; value: string; onChange: (v: string) => void; currency: CurrencyCode; small?: boolean; ariaLabel?: string }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-meta text-ink-3">{currencySymbol(currency).trim()}</span>
      <TextInput
        id={id}
        aria-label={ariaLabel}
        inputMode="decimal"
        value={value}
        onChange={(e) => /^[\d,]*\.?\d{0,2}$/.test(e.target.value) && onChange(e.target.value)}
        className={cx('num pl-8 text-right', small && 'h-11')}
      />
    </div>
  )
}
