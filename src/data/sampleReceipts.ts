import type { Paise } from '../types'

/**
 * Sample receipts for the scanning simulation. There is no camera or OCR in this
 * build; "scanning" loads one of these and pre-fills editable fields.
 */
export interface SampleReceipt {
  id: string
  merchant: string
  address: string
  date: string
  time: string
  items: { name: string; qty?: number; amount: Paise }[]
  tax: Paise
  taxLabel: string
  total: Paise
  payment: string
}

export const SAMPLE_RECEIPTS: SampleReceipt[] = [
  {
    id: 'rcpt-ahdoos',
    merchant: 'Lakeview Wazwan House',
    address: 'Residency Road, Srinagar',
    date: '',
    time: '20:42',
    items: [
      { name: 'Rogan josh', qty: 2, amount: 98000 },
      { name: 'Gushtaba', qty: 1, amount: 56000 },
      { name: 'Tabak maaz', qty: 1, amount: 42000 },
      { name: 'Steamed rice', qty: 3, amount: 27000 },
      { name: 'Kahwa', qty: 4, amount: 24000 },
    ],
    tax: 12350,
    taxLabel: 'GST 5%',
    total: 259350,
    payment: 'UPI',
  },
  {
    id: 'rcpt-fuel',
    merchant: 'Highway Fuels, NH 44',
    address: 'Qazigund, Anantnag',
    date: '',
    time: '07:15',
    items: [{ name: 'Petrol 19.1 L @ ₹104.71', amount: 200000 }],
    tax: 0,
    taxLabel: 'Tax incl.',
    total: 200000,
    payment: 'Card ending 4417',
  },
  {
    id: 'rcpt-mart',
    merchant: 'Daily Fresh Mart',
    address: 'Anjuna Mapusa Road, Goa',
    date: '',
    time: '18:03',
    items: [
      { name: 'Bananas 1 dozen', amount: 7000 },
      { name: 'Bread loaf', amount: 5500 },
      { name: 'Amul butter 100 g', amount: 6200 },
      { name: 'Mineral water 2 L x 4', amount: 16000 },
      { name: 'Chips and snacks', amount: 18500 },
      { name: 'Instant coffee', amount: 10800 },
    ],
    tax: 0,
    taxLabel: 'Tax incl.',
    total: 64000,
    payment: 'Cash',
  },
]
