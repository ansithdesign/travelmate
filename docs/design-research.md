# TripMate design research

Research ran on Mobbin (iOS) through its MCP connector on 2026-11-03. Screens were examined as images, not metadata.

## Limitations

- TravelSpend has no indexed screens on Mobbin. Budget and category patterns were studied in Neo Financial, Copilot and Lloyds instead.
- Tripsy, Wanderlog and Revolut were studied from a handful of screens each, not full flows.
- The build container cannot reach image CDNs or unsplash.com. Cover photos are real Unsplash photos whose IDs were confirmed through web search, but they could not be rendered or checked in this environment. Every image has a designed fallback, so a failed load never shows a broken icon.

## Products and screens examined

| Product | Screens | What it does well | What to avoid |
|---|---|---|---|
| Splitwise | Group page, Group settings, Split options (exact, shares), Settle up, Activity feed, Group spending chart | Per-row "you lent / you borrowed" in signed colour. Split options bar shows `₹20 of ₹20, ₹0 left` live. Settle up starts with one question. Simplify debts is a single toggle. | Five icon-only split tabs (`=`, `1.23`, `%`, shares, `+/-`) need learning. Mascot illustrations eat a third of the split screen. Category tiles are generic coloured squares. |
| Wanderlog | Trip overview, Itinerary by day, Section jump menu | Day chips (`Mon 12/1`) for itinerary. Overview, Itinerary, Explore, Budget as tabs on the trip. | Three stacked floating buttons. Dense, list-of-lists overview where money is a hidden `$` tab. |
| Tripsy | Trip hero, Flight detail sheet | Cover photo with countdown ("Starts in 14 days") is the emotional anchor. Booking details as label/value rows with right-aligned values. | Translucent buttons over photo, glassy cards. |
| Revolut | Shared group (members, owes / owed), Transaction detail, Analytics, Account filter sheet | Group page: "You are owed ₹6.74", "Alex owes ₹3.36" in plain language. Transaction detail as grouped label/value rows. Bottom sheet filters with one primary button. | Dark glass cards, analytics as a grid of mini charts. |
| Airbnb | Trip details sheet, Payments list, Reviews | Generous left margin, sentence-case headings, 1px dividers instead of cards, black text actions. | Nothing structural; it is the craft bar for spacing and type. |
| Neo, Copilot, Lloyds | Category spend lists, Budget vs spent bars | Category list with amount right-aligned and count underneath. Spent vs budget as a single bar per row. | Rainbow category colours; emoji as icons. |

## Patterns adopted

1. **The trip is the home of the money.** Splitwise hides money behind people, Wanderlog hides it behind a tab. TripMate's trip overview leads with the trip's total, the budget left and your balance.
2. **Plain-language balances.** "Meera owes ₹3,200", "You get back ₹4,150". Colour supports the words, never replaces them.
3. **Live split ledger.** A sticky footer in the split editor reads `₹6,500 of ₹6,500 assigned` or `₹400 left to assign`, and Save stays disabled until it balances.
4. **Split method as labelled segments**, not icons: Equal, Exact, Percent, Shares. Participant selection works in every method.
5. **Bottom sheets for short tasks** (add expense, filters, invite, scan) on mobile; the same content becomes a right-hand panel on desktop.
6. **Label/value rows** for booking details and expense detail (Tripsy, Revolut).
7. **Day chips** for the itinerary (Wanderlog), without maps or routing.
8. **One question to settle** (Splitwise): the settlement page lists the minimum payments, each with "Mark as paid".

## Patterns rejected

- Floating action button stacks. One primary action per screen, placed where the thumb is.
- Analytics grids of identical stat cards. The overview is one composed statement, not six tiles.
- Mascots, emoji category icons, glass surfaces, dark gradient heroes.

## Differentiation

- **Trip as unit, journal at the end.** A completed trip turns into a journal page: photos, places, notes, what it cost and how it settled.
- **Settlement you can trust.** Computed from data every time, minimum practical payments, history kept.
- **Honest scanning.** Receipt scanning is a labelled simulation with sample receipts and editable fields, not fake OCR.

## Design decisions

- **Visual world: the Indian highway milestone.** White stone, coloured cap, a place name and a distance. It gives TripMate its palette (stone white, forest green cap, amber cap, charcoal lettering) and one signature shape: the domed milestone marker that carries a trip's countdown, its day count or its year.
- **Light theme.** People use this at a dinner table, in a cab, outdoors in daylight.
- **Type:** Geist (variable), one family. Tabular figures for every amount.
- **Colour roles:** forest for brand, positive balance and progress; amber for upcoming and attention; brick red only for "owes" and destructive actions.
- **Navigation:** three tabs on mobile (Trips, Expenses, Profile). Forest side rail on desktop with the same three destinations plus the current trip's sections.
