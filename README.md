# TripMate

A shared travel companion: organise trips, split group expenses, settle up, keep bookings in one place, and turn finished trips into a journal.

TripMate lives under a living sky. The background follows your local time (dawn, clear day, golden hour, night with stars), trip covers are framed as aircraft cabin windows, the budget is drawn as a flight path and settlements are boarding-pass tickets. Pin a sky in Profile, or preview one with `?sky=dawn|day|golden|night` on any URL.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:5173. Sample trips (Kashmir, Goa, Bengaluru) load on first run.

```bash
npm test
```

```bash
npm run build
```

## What works

- Trips: create, edit, delete, mark completed, reopen. Cover from a photo library or your own upload.
- Expenses: add, edit, delete with undo. Split equally, by exact amounts, by percentage or by shares, across any subset of the group. A live ledger shows what is left to assign, and save is blocked until the split adds up.
- Expense list: search, category chips, paid-by and date-range filters, four sort orders, grouped by day.
- Settlement: paid, share and net per person, the fewest payments that clear every balance, mark as paid, payment history with undo.
- People: invite link (copy or share), invites by name, add people who will not use the app, remove with a guard when they are part of expenses.
- Trip details: stays, travel, addresses and links with booking references you can copy, trip notes, a day-by-day plan.
- Journal: completed trips get photos, a written note, places along the way, what it cost and how it settled.
- Profile: pick or pin the sky, edit your details, export all data as JSON, restore sample trips, delete everything.
- Data persists in localStorage behind a repository interface (`src/services/storage.ts`) so a backend can replace it.

## What is simulated

- **Receipt scanning.** No camera access or OCR. "Scan with camera" frames one of three sample receipts and fills editable fields from it. Uploaded receipt photos are attached for real, with fields entered by hand. The UI says this on the scanner.
- **Invitations.** Links resolve locally (`/join/CODE`) but nothing is sent. "Mark joined" stands in for the invitee accepting.
- **Currencies.** Each trip has one currency for display. There is no conversion between currencies.

## Photos

Cover and journal photos are Unsplash photos (Unsplash License), hotlinked by ID. If one fails to load, the cabin window shows open sky and clouds instead of a broken image.

Icons: Phosphor (duotone) for interface controls; the seven category objects are hand-drawn SVG in `src/components/icons/CategoryIcon.tsx`.

## Structure

```
src/
  components/  ui, navigation, sky, icons, trips, expenses, receipts, shared
  pages/       Home, TripOverview, TripExpenses, Settle, People, Details, Journal, Expenses, Profile
  store/       app data (reducer + persistence), UI state for sheets, sky phase
  hooks/       trip view model: status, ledger, suggested transfers
  utils/       money (integer paise), split, settle, dates
  data/        seed trips, categories, destinations, sample receipts, photos
```

Money is stored as integer paise. Shares are summed unrounded across a trip and rounded once, so they always add up to the total exactly (`src/utils/settle.test.ts`).

## Design

- Research: `docs/design-research.md`
- Product context: `PRODUCT.md`
- Design system: `DESIGN.md`
