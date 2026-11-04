# TripMate: design and build history

A running record of what was built and why, in order. Dates are 2026-11-03 onward. Nothing here is user data; the sample trips (Kashmir, Goa, Bengaluru) are demonstration content.

## 1. Foundation
- Brief: a premium, mobile-first travel companion. Trips, shared expenses (equal, exact, percent and shares splits), members and invites, settlements with the fewest payments, trip details and itinerary, travel journal, profile. INR, realistic Indian sample data, local persistence.
- Stack: React 18, TypeScript, Vite, Tailwind v4, react-router, Phosphor icons. Money is stored as integer paise; the ledger sums unrounded shares and apportions once so totals never drift by a paisa.
- Docs written: `PRODUCT.md`, `DESIGN.md`, `docs/design-research.md`.

## 2. Finding the look
1. First pass used glass surfaces over a painted sky. Feedback: it looked like a generic AI app.
2. Sky concept refined. Feedback: airport metaphors everywhere (boarding passes, flights taking off for payments) were confusing. Rule adopted: the sky is visual atmosphere, working elements stay plain.
3. Icons: no heavy 3D line icons at first; flat duotone Phosphor icons. Font changed to Figtree on request.
4. Finbook "Under the Sky" design system adopted: a band of sky fading into haze, borderless frosted glass, midnight pill buttons, accent only for selection and data.
5. Airbnb-style hierarchy layered on top: few weights, photo-first cards, space instead of boxes.
6. Softer edges (no hairline outlines, wide faint shadows), then roomier spacing everywhere.

## 3. Themes
- Time-of-day skies (dawn, day, golden, night) replaced by exactly two themes: one light, one dark.
- Light: a painted blue sky, drifting snow, soft blurred ridges and mist. Twelve selectable light skies (Ocean steel is the default), chosen in Profile with a live preview before confirming.
- Dark: a very deep purple night with dim aurora ribbons, twinkling stars and occasional shooting stars. No snow at night.
- Contrast: light skies carry a computed dimming scrim so white text keeps at least 4.6:1; dark surfaces are near-opaque.

## 4. Assets supplied by the owner
- 15 category icons (3D, no shadows). Two sets: the original set in light, the newer set in dark. Categories: Stay, Food, Cafes and drinks, Groceries, Cabs and rides, Fuel and tolls, Rentals, Flights, Sightseeing and entry, Activities, Shopping, Gifts and souvenirs, Health and pharmacy, Visa/SIM/insurance, Other. Tours and Transit were deliberately left out. Saved data migrates (accommodation to stay, transport to cabs).
- 20 illustrated cover photos, bundled with the app. Trip covers are shown as fanned prints.

## 5. Decision sheets (owner picked from ten options each)
- Frames for photos: Fanned prints.
- Home: Story rail. Trip overview: Photo cover. Expenses hero: Icon bubbles. Profile hero: Passport.
- Navigation (researched from 36 Mobbin screens): raised centre Add in a four-tab bar. The category arc was built, then removed so Add opens the form directly.
- Fonts (ten sans-serif Google Fonts) and skies (twenty light skies) were also offered as sheets; twelve skies were chosen.

## 6. Behaviour fixes and features
- Settle: every payment is a compact row with one consistent "Mark paid" button; a chart panel shows how much is settled and who is ahead or behind; mutual debts net out and the screen says how many debts were netted. Tests cover mutual debts, chains and full circles.
- Add expense: short by default (amount, what for, category guessed from the name, who paid); split folded into one line; Add person lets you pick someone from other trips or type a new name without leaving the form.
- Home: the selected trip's ring turns gold; tapping it, or the arrow beside the trip name, opens the trip. Lower half: Add in one tap (category icons open the form with that category), Up next, Just in, Other trips.
- Horizontal rows fade their right edge while more is off-screen. Scrollbars are hidden everywhere; the sky is part of the page and scrolls with it.
- Destination field searches any city worldwide (Open-Meteo / GeoNames), falling back to the built-in list when offline, and always accepts typed text.

## 7. Quality checks
- End-to-end flow script (add expense, splits, validation, persistence, receipt prefill, settle, delete and undo, search, trip create, invite and join, theme persistence).
- Unit tests (13): splitting, apportioning, settlement netting.
- Overflow sweep at 320, 360, 390 and 430px across nine screens.
- Pixel-sampled contrast audit across nine screens, both themes and all twelve skies: failing text items fell from 733 to under 90, the remainder being measurement noise or non-default skies still being tuned.

## 8. Known limits
- Live city search needs internet access and could not be exercised from the build sandbox; it was tested against a simulated response.
- Receipt scanning and invitations are simulated and labelled as such.
- Motion (snow, aurora, shooting stars) was tuned in a headless browser, not on a physical device.

## Modernisation pass

- Trip sections are one glass track with a sliding white thumb, so all four (or five) fit without scrolling. On the page background it uses a light track.
- The tab bar drops the accent line above the active tab. The active icon is filled and sits in a soft accent pill.
- Card shadows are layered: a faint edge, a tight contact shadow and a soft long shadow.
- Profile shows "Save details" only after something changes.
- Other trips on Home carry a small cover photo.
- The balance bars on Settle up sit on a faint track, so small amounts still read as a bar.
- Plans has tickets and files with naming, rename, in-app preview, open and download.

## New Add expense form

- Amount and "what was it for" lead. The amount is 44 px with the currency symbol beside it, on a pale wash that follows the theme.
- The category is guessed from the description and shown as a 3D icon at the left of the card. Typing something that matches nothing files it under Other. A manual choice sticks while you edit the text, and "Use suggestion" hands control back.
- One row above the button says who paid and how it is split, with the amount each. It turns red when the split does not add up.
- The form is a full screen on every device. Category, date, note and receipt, split and paid by each open as a bottom sheet over it. The split sheet shows names only, with a single Select all / Select none button, a live total and a reset to equal.
- Built for large groups. Nothing on the form shows avatars, and Paid by is one flat list.

## Phone-only layout

- The app is one phone-wide column (430 px) in every browser, centred on a dark backdrop when the window is wider. The tablet and desktop layouts, including the side rail, are removed, and the tablet and desktop breakpoints never switch on.
- Sheets, the full-screen form, the tab bar and toasts are held to the same column.
- Sheet footers keep at least 22 px of space below the primary button.
- The category filter on Expenses moved from a row of chips into the Filters sheet.
