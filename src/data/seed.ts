import type { AppData, Expense, Payment, Person, Split, Trip } from '../types'
import { addDays, fmt, isoDate, today } from '../utils/dates'
import { buildLedger, suggestTransfers } from '../utils/settle'
import { PHOTOS } from './photos'

/**
 * Demonstration data. Dates are relative to the day the app first opens so that
 * Kashmir is always upcoming and Goa and Bengaluru are always in the past.
 */
export function createSeed(): AppData {
  const t0 = today()
  const d = (offset: number) => isoDate(addDays(t0, offset))
  const dm = (offset: number) => fmt.weekday(d(offset))
  const at = (offset: number, hh: number, mm = 0) => {
    const x = addDays(t0, offset)
    x.setHours(hh, mm, 0, 0)
    return x.toISOString()
  }

  const people: Person[] = [
    { id: 'me', name: 'Ansith Mohd', email: 'ansith.design@gmail.com', isYou: true },
    { id: 'meera', name: 'Meera Iyer', email: 'meera.iyer@example.in' },
    { id: 'rohan', name: 'Rohan Kapoor', email: 'rohan.k@example.in' },
    { id: 'aditi', name: 'Aditi Rao', email: 'aditi.rao@example.in' },
    { id: 'karthik', name: 'Karthik Menon', email: 'karthik.m@example.in' },
    { id: 'nisha', name: 'Nisha Varghese', email: 'nisha.v@example.in' },
  ]

  const equal = (participants: string[]): Split => ({ method: 'equal', participants, values: {} })

  // ── Kashmir: upcoming, four travellers ──────────────────────────────
  const kStart = 39
  const kashmir: Trip = {
    id: 'kashmir',
    name: 'Kashmir in winter',
    destination: 'Srinagar',
    region: 'Jammu and Kashmir',
    startDate: d(kStart),
    endDate: d(kStart + 6),
    cover: PHOTOS.kashmirLake,
    currency: 'INR',
    budget: 14000000,
    members: ['me', 'meera', 'rohan', 'aditi'],
    invites: [{ id: 'inv-karthik', name: 'Karthik Menon', contact: 'karthik.m@example.in', createdAt: at(-3, 21) }],
    completed: false,
    info: [
      { id: 'i1', kind: 'transport', title: 'BLR to SXR, IndiGo 6E 2147', subtitle: `${dm(kStart)} · 06:10 to 10:05`, reference: 'PNR K7QW2M', detail: '4 passengers, 15 kg checked each' },
      { id: 'i2', kind: 'transport', title: 'SXR to BLR, IndiGo 6E 6316', subtitle: `${dm(kStart + 6)} · 13:40 to 17:55`, reference: 'PNR K7QW2M' },
      { id: 'i3', kind: 'stay', title: 'Houseboat Gulistan', subtitle: `3 nights from ${dm(kStart)}`, reference: 'Booking HB-20931', detail: 'Ghat 9, Boulevard Road, Dal Lake, Srinagar 190001' },
      { id: 'i4', kind: 'stay', title: 'Pine Crest Cottages, Gulmarg', subtitle: `2 nights from ${dm(kStart + 3)}`, reference: 'Booking PC-5518', detail: 'Near Gondola Base, Gulmarg 193403' },
      { id: 'i5', kind: 'address', title: 'Gulmarg Gondola, Phase 1', detail: 'Gondola Base Station, Gulmarg 193403' },
      { id: 'i6', kind: 'link', title: 'Gondola tickets (booked)', url: 'https://www.jktdc.co.in' },
      { id: 'i7', kind: 'link', title: 'Shared photo album', url: 'https://photos.google.com' },
    ],
    itinerary: [
      { id: 'k1', date: d(kStart), plan: 'Land 10:05. Shikara to the houseboat, slow afternoon, Mughal Gardens if light holds.' },
      { id: 'k2', date: d(kStart + 1), plan: 'Floating vegetable market at dawn. Old city, Jamia Masjid, wazwan dinner.' },
      { id: 'k3', date: d(kStart + 2), plan: 'Day trip to Pahalgam via saffron fields at Pampore.' },
      { id: 'k4', date: d(kStart + 3), plan: 'Drive to Gulmarg, 2 hours. Check in at Pine Crest.' },
      { id: 'k5', date: d(kStart + 4), plan: 'Gondola Phase 1 and 2. Skiing lesson for Meera and Aditi.' },
      { id: 'k6', date: d(kStart + 5), plan: 'Back to Srinagar. Shopping on Polo View for shawls.' },
      { id: 'k7', date: d(kStart + 6), plan: 'Fly out 13:40.' },
    ],
    notes: 'Pack thermals and waterproof boots. Prepaid SIMs do not work in J&K, carry a postpaid number. Cash for shikaras.',
    journal: { note: '', places: [], photos: [] },
    inviteCode: 'KSH7QW',
    createdAt: at(-20, 22),
  }

  const kExpenses: Expense[] = [
    { id: 'k-e1', tripId: 'kashmir', title: 'Return flights, 4 people', amount: 6240000, category: 'flights', paidBy: 'rohan', date: at(-18, 23, 12), split: equal(kashmir.members), createdAt: at(-18, 23, 12) },
    { id: 'k-e2', tripId: 'kashmir', title: 'Houseboat advance, 3 nights', amount: 1800000, category: 'stay', paidBy: 'me', date: at(-12, 19, 40), split: equal(kashmir.members), notes: 'Balance ₹9,000 payable at check-in.', createdAt: at(-12, 19, 40) },
    { id: 'k-e3', tripId: 'kashmir', title: 'Gulmarg Gondola tickets', amount: 760000, category: 'activities', paidBy: 'meera', date: at(-6, 13, 5), split: equal(kashmir.members), createdAt: at(-6, 13, 5) },
    { id: 'k-e4', tripId: 'kashmir', title: 'Airport pickup, prepaid', amount: 120000, category: 'cabs', paidBy: 'aditi', date: at(-2, 18, 30), split: equal(kashmir.members), createdAt: at(-2, 18, 30) },
  ]

  // ── Goa: completed, three travellers ───────────────────────────────
  const gEnd = -42
  const gStart = gEnd - 4
  const goa: Trip = {
    id: 'goa',
    name: 'Goa, north to south',
    destination: 'Goa',
    region: 'Goa',
    startDate: d(gStart),
    endDate: d(gEnd),
    cover: PHOTOS.goaBeach,
    currency: 'INR',
    budget: 4500000,
    members: ['me', 'meera', 'karthik'],
    invites: [],
    completed: true,
    completedAt: at(gEnd + 1, 11),
    info: [
      { id: 'g1', kind: 'stay', title: 'Villa Saudade, Assagao', subtitle: '2 nights', reference: 'Booking VS-1182', detail: 'House 214, Saudades Vaddo, Assagao 403507' },
      { id: 'g2', kind: 'stay', title: 'Cove Cottages, Palolem', subtitle: '2 nights', detail: 'Ourem Road, Palolem 403702' },
      { id: 'g3', kind: 'transport', title: 'Scooter rental, 2 Activas', subtitle: '3 days', reference: 'GA-07-S-4412' },
    ],
    itinerary: [
      { id: 'g-1', date: d(gStart), plan: 'Land at Mopa. Assagao, lunch, sunset at Vagator.' },
      { id: 'g-2', date: d(gStart + 1), plan: 'Chapora fort, Anjuna flea market, parasailing at Calangute.' },
      { id: 'g-3', date: d(gStart + 2), plan: 'Fontainhas walk in Panjim. Drive south.' },
      { id: 'g-4', date: d(gStart + 3), plan: 'Kakolem hike, Palolem by evening.' },
      { id: 'g-5', date: d(gEnd), plan: 'Butterfly beach by boat, fly back at night.' },
    ],
    notes: '',
    journal: {
      note: 'Rain every afternoon, sun every evening. The Kakolem hike was the best two hours of the trip, and Karthik finally learned to ride a scooter on the Assagao back roads.',
      places: ['Vagator', 'Chapora Fort', 'Anjuna', 'Calangute', 'Fontainhas', 'Kakolem', 'Palolem', 'Butterfly Beach'],
      photos: [PHOTOS.goaBeach, PHOTOS.andamanLagoon, PHOTOS.keralaBackwaters, PHOTOS.coastRoad],
    },
    inviteCode: 'GOA3MK',
    createdAt: at(gStart - 30, 20),
  }
  const gm = goa.members
  const gExpenses: Expense[] = [
    { id: 'g-e1', tripId: 'goa', title: 'Villa Saudade, 2 nights', amount: 1300000, category: 'stay', paidBy: 'me', date: at(gStart, 14, 10), split: equal(gm), createdAt: at(gStart, 14, 10) },
    { id: 'g-e2', tripId: 'goa', title: 'Airport transfer from Mopa', amount: 85000, category: 'cabs', paidBy: 'karthik', date: at(gStart, 11, 45), split: equal(gm), createdAt: at(gStart, 11, 45) },
    { id: 'g-e3', tripId: 'goa', title: 'Groceries', amount: 64000, category: 'groceries', paidBy: 'me', date: at(gStart, 18, 3), split: equal(gm), createdAt: at(gStart, 18, 3),
      receipt: { id: 'r-g3', source: 'sample', sampleId: 'rcpt-mart', merchant: 'Daily Fresh Mart', date: d(gStart), total: 64000, items: [
        { id: 'l1', name: 'Bananas 1 dozen', amount: 7000 }, { id: 'l2', name: 'Bread loaf', amount: 5500 }, { id: 'l3', name: 'Amul butter 100 g', amount: 6200 },
        { id: 'l4', name: 'Mineral water 2 L x 4', amount: 16000 }, { id: 'l5', name: 'Chips and snacks', amount: 18500 }, { id: 'l6', name: 'Instant coffee', amount: 10800 } ] } },
    { id: 'g-e4', tripId: 'goa', title: 'Scooter rental, 3 days', amount: 240000, category: 'rentals', paidBy: 'meera', date: at(gStart + 1, 9, 20), split: equal(gm), createdAt: at(gStart + 1, 9, 20) },
    { id: 'g-e5', tripId: 'goa', title: 'Parasailing at Calangute', amount: 180000, category: 'activities', paidBy: 'karthik', date: at(gStart + 1, 16, 0), split: equal(['me', 'karthik']), notes: 'Meera sat this one out.', createdAt: at(gStart + 1, 16, 0) },
    { id: 'g-e6', tripId: 'goa', title: 'Fish thali dinner', amount: 125000, category: 'food', paidBy: 'meera', date: at(gStart + 1, 21, 15), split: equal(gm), createdAt: at(gStart + 1, 21, 15) },
    { id: 'g-e7', tripId: 'goa', title: 'Fuel', amount: 200000, category: 'fuel', paidBy: 'karthik', date: at(gStart + 2, 10, 30), split: equal(gm), createdAt: at(gStart + 2, 10, 30) },
    { id: 'g-e8', tripId: 'goa', title: 'Cove Cottages, 2 nights', amount: 650000, category: 'stay', paidBy: 'meera', date: at(gStart + 3, 15, 0), split: { method: 'shares', participants: gm, values: { me: 1, meera: 1, karthik: 2 } }, notes: 'Karthik took the single room, so two shares.', createdAt: at(gStart + 3, 15, 0) },
    { id: 'g-e9', tripId: 'goa', title: 'Beach shack lunch, Palolem', amount: 198000, category: 'food', paidBy: 'me', date: at(gStart + 3, 13, 30), split: { method: 'exact', participants: gm, values: { me: 52000, meera: 61000, karthik: 85000 } }, createdAt: at(gStart + 3, 13, 30) },
    { id: 'g-e10', tripId: 'goa', title: 'Cashew feni and spices', amount: 115000, category: 'gifts', paidBy: 'meera', date: at(gEnd, 12, 10), split: { method: 'percent', participants: ['meera', 'karthik'], values: { meera: 60, karthik: 40 } }, createdAt: at(gEnd, 12, 10) },
    { id: 'g-e11', tripId: 'goa', title: 'Boat to Butterfly Beach', amount: 150000, category: 'activities', paidBy: 'me', date: at(gEnd, 9, 0), split: equal(gm), createdAt: at(gEnd, 9, 0) },
  ]
  const gLedger = buildLedger(gm, gExpenses)
  const gPayments: Payment[] = suggestTransfers(gLedger.net).map((t, i) => ({ id: `g-p${i}`, tripId: 'goa', date: at(gEnd + 2 + i, 20), note: 'UPI', ...t }))

  // ── Bengaluru: completed weekend, two travellers, not yet settled ──
  const bStart = -121
  const blr: Trip = {
    id: 'bengaluru',
    name: 'Bengaluru weekend',
    destination: 'Bengaluru',
    region: 'Karnataka',
    startDate: d(bStart),
    endDate: d(bStart + 1),
    cover: PHOTOS.pineForest,
    currency: 'INR',
    members: ['me', 'nisha'],
    invites: [],
    completed: true,
    completedAt: at(bStart + 2, 9),
    info: [{ id: 'b1', kind: 'stay', title: 'Jasmine Homestay, Indiranagar', subtitle: '1 night', detail: '12th Main, HAL 2nd Stage, Indiranagar 560038' }],
    itinerary: [
      { id: 'b-1', date: d(bStart), plan: 'Vidyarthi Bhavan breakfast, Lalbagh, Church Street bookshops, dinner in Indiranagar.' },
      { id: 'b-2', date: d(bStart + 1), plan: 'Cubbon Park morning walk, Vidhana Soudha, fly home.' },
    ],
    notes: '',
    journal: {
      note: 'A slow weekend of dosas, bookshops and long walks under the rain trees. We said we would come back for the Lalbagh flower show.',
      places: ['Vidyarthi Bhavan', 'Lalbagh', 'Church Street', 'Indiranagar', 'Cubbon Park', 'Vidhana Soudha'],
      photos: [PHOTOS.pineForest, PHOTOS.munnarTea, PHOTOS.westernGhatsFalls],
    },
    inviteCode: 'BLR2NV',
    createdAt: at(bStart - 14, 21),
  }
  const bm = blr.members
  const bExpenses: Expense[] = [
    { id: 'b-e1', tripId: 'bengaluru', title: 'Airport cab to Indiranagar', amount: 110000, category: 'cabs', paidBy: 'nisha', date: at(bStart, 7, 40), split: equal(bm), createdAt: at(bStart, 7, 40) },
    { id: 'b-e2', tripId: 'bengaluru', title: 'Breakfast, Vidyarthi Bhavan', amount: 42000, category: 'food', paidBy: 'me', date: at(bStart, 9, 15), split: equal(bm), createdAt: at(bStart, 9, 15) },
    { id: 'b-e3', tripId: 'bengaluru', title: 'Books on Church Street', amount: 134000, category: 'shopping', paidBy: 'nisha', date: at(bStart, 15, 30), split: { method: 'exact', participants: bm, values: { me: 89000, nisha: 45000 } }, notes: 'Mostly mine, two of Nisha’s.', createdAt: at(bStart, 15, 30) },
    { id: 'b-e4', tripId: 'bengaluru', title: 'Dinner in Indiranagar', amount: 286000, category: 'food', paidBy: 'nisha', date: at(bStart, 21, 0), split: equal(bm), createdAt: at(bStart, 21, 0) },
    { id: 'b-e5', tripId: 'bengaluru', title: 'Jasmine Homestay', amount: 420000, category: 'stay', paidBy: 'me', date: at(bStart, 12, 0), split: equal(bm), createdAt: at(bStart, 12, 0) },
    { id: 'b-e6', tripId: 'bengaluru', title: 'Lalbagh entry and coffee', amount: 64000, category: 'sightseeing', paidBy: 'me', date: at(bStart, 11, 10), split: equal(bm), createdAt: at(bStart, 11, 10) },
  ]

  return {
    version: 1,
    people,
    trips: [kashmir, goa, blr],
    expenses: [...kExpenses, ...gExpenses, ...bExpenses],
    payments: gPayments,
  }
}
