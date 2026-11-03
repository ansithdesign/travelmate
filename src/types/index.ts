/** All money is stored as integer paise (1 rupee = 100 paise) to keep arithmetic exact. */
export type Paise = number

export type ID = string

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'THB' | 'SGD' | 'IDR' | 'LKR'

export interface Person {
  id: ID
  name: string
  email?: string
  /** True for the signed-in user. Exactly one person has this. */
  isYou?: boolean
}

export type CategoryId =
  | 'stay'
  | 'food'
  | 'drinks'
  | 'groceries'
  | 'cabs'
  | 'fuel'
  | 'rentals'
  | 'flights'
  | 'sightseeing'
  | 'activities'
  | 'shopping'
  | 'gifts'
  | 'health'
  | 'admin'
  | 'other'

export type SplitMethod = 'equal' | 'exact' | 'percent' | 'shares'

export interface Split {
  method: SplitMethod
  /** People who share this expense. */
  participants: ID[]
  /**
   * Per-person input for the method:
   * exact -> paise, percent -> percentage (0-100, up to 2 decimals), shares -> weight.
   * Ignored for equal.
   */
  values: Record<ID, number>
}

export interface ReceiptLineItem {
  id: ID
  name: string
  amount: Paise
}

export interface Receipt {
  id: ID
  source: 'sample' | 'upload'
  /** Data URL for uploaded images, or a sample receipt id for the simulation. */
  image?: string
  sampleId?: string
  merchant: string
  date: string
  total: Paise
  tax?: Paise
  items: ReceiptLineItem[]
}

export interface Expense {
  id: ID
  tripId: ID
  title: string
  amount: Paise
  category: CategoryId
  paidBy: ID
  /** ISO date-time */
  date: string
  split: Split
  notes?: string
  receipt?: Receipt
  createdAt: string
}

export interface Payment {
  id: ID
  tripId: ID
  from: ID
  to: ID
  amount: Paise
  date: string
  note?: string
}

export interface Invite {
  id: ID
  name: string
  contact?: string
  createdAt: string
}

export interface InfoItem {
  id: ID
  kind: 'stay' | 'transport' | 'address' | 'link'
  title: string
  subtitle?: string
  reference?: string
  /** Free text: address, dates, URL depending on kind */
  detail?: string
  url?: string
}

export interface ItineraryDay {
  id: ID
  date: string
  plan: string
}

export interface Photo {
  id: ID
  src: string
  alt: string
  credit?: string
}

export interface Trip {
  id: ID
  name: string
  destination: string
  region?: string
  startDate: string
  endDate: string
  cover?: Photo
  currency: CurrencyCode
  budget?: Paise
  members: ID[]
  invites: Invite[]
  /** Manually marked complete. Trips also read as past when endDate is before today. */
  completed: boolean
  completedAt?: string
  info: InfoItem[]
  itinerary: ItineraryDay[]
  notes: string
  journal: {
    note: string
    places: string[]
    photos: Photo[]
  }
  inviteCode: string
  createdAt: string
}

export interface AppData {
  version: 1
  people: Person[]
  trips: Trip[]
  expenses: Expense[]
  payments: Payment[]
}
