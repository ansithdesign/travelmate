---
name: TripMate
description: A shared travel companion seen through a cabin window, under a living sky.
colors:
  accent: "#2563eb"
  accent-golden: "#3b5bdb"
  accent-night: "#86acff"
  accent-ink: "#1749c4"
  accent-ink-night: "#b0c8ff"
  accent-soft: "rgb(37 99 235 / 0.1)"
  navy-ink: "#0c1736"
  ink-2: "#45507a"
  ink-3: "#5f6a90"
  moon-ink: "#eef2ff"
  moon-ink-2: "#bcc5e8"
  moon-ink-3: "#98a2cb"
  gain: "#0b8a6a"
  gain-night: "#4fd8ad"
  loss: "#d6364a"
  loss-night: "#ff8996"
  sun: "#b86e00"
  sun-night: "#ffc861"
  cloud: "#ffffff"
  panel: "rgb(255 255 255 / 0.62)"
  panel-strong: "rgb(255 255 255 / 0.88)"
  panel-night: "rgb(255 255 255 / 0.06)"
  panel-strong-night: "rgb(30 38 78 / 0.86)"
  well: "rgb(12 23 54 / 0.05)"
  line: "rgb(12 23 54 / 0.08)"
  line-strong: "rgb(12 23 54 / 0.14)"
  sheet-day: "rgb(244 248 255 / 0.8)"
  sheet-dawn: "rgb(250 247 255 / 0.82)"
  sheet-golden: "rgb(255 248 246 / 0.82)"
  sheet-night: "rgb(13 19 46 / 0.76)"
  sky-day-zenith: "#1452c6"
  sky-day-horizon: "#b9dafc"
  sky-dawn-zenith: "#4560b8"
  sky-dawn-horizon: "#f0b39c"
  sky-golden-zenith: "#2c3fa3"
  sky-golden-horizon: "#eda07f"
  sky-night-zenith: "#040820"
  sky-night-horizon: "#2b2f6e"
typography:
  hero:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.375rem"
    fontWeight: 600
    lineHeight: "2.625rem"
    letterSpacing: "-0.035em"
  display:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: "2.25rem"
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.3125rem"
    fontWeight: 600
    lineHeight: "1.75rem"
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: "1.5rem"
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: "1.375rem"
    fontFeature: "'ss01', 'cv11'"
  meta:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: "1.125rem"
  caption:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1rem"
  figure:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "46px"
    fontWeight: 300
    lineHeight: "50px"
    letterSpacing: "-0.045em"
    fontFeature: "'tnum', 'ss01'"
  countdown:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(84px, 24vw, 128px)"
    fontWeight: 200
    lineHeight: 0.95
    letterSpacing: "-0.06em"
    fontFeature: "'tnum', 'ss01'"
  code:
    fontFamily: "Geist Mono Variable, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: "36px"
    letterSpacing: "-0.02em"
rounded:
  field: "16px"
  menu: "22px"
  panel: "24px"
  card: "28px"
  dialog: "30px"
  sheet: "34px"
  pill: "9999px"
spacing:
  gutter-mobile: "20px"
  gutter-tablet: "24px"
  gutter-desktop: "40px"
  sheet-top: "24px"
  control-sm: "36px"
  control-md: "44px"
  control-lg: "52px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.cloud}"
    rounded: "{rounded.pill}"
    typography: "{typography.body}"
    padding: "0 20px"
    height: "44px"
  button-white:
    backgroundColor: "{colors.cloud}"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  button-sky:
    backgroundColor: "rgb(8 22 76 / 0.44)"
    textColor: "{colors.cloud}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.panel-strong}"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  button-danger:
    backgroundColor: "{colors.loss}"
    textColor: "{colors.cloud}"
    rounded: "{rounded.pill}"
    height: "44px"
  chip:
    backgroundColor: "{colors.panel-strong}"
    textColor: "{colors.ink-2}"
    typography: "{typography.meta}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  chip-active:
    backgroundColor: "{colors.navy-ink}"
    textColor: "{colors.cloud}"
    rounded: "{rounded.pill}"
    height: "40px"
  input:
    backgroundColor: "{colors.panel-strong}"
    textColor: "{colors.navy-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "0 16px"
    height: "52px"
  panel:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.panel}"
  content-sheet:
    backgroundColor: "{colors.sheet-day}"
    rounded: "{rounded.sheet}"
    padding: "24px 20px 40px"
  tab-bar-item:
    textColor: "{colors.ink-3}"
    rounded: "{rounded.pill}"
    height: "52px"
    width: "76px"
  tab-bar-item-active:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    rounded: "{rounded.pill}"
---

# Design System: TripMate

## Overview

**Creative North Star: "The Window Seat Under a Living Sky"**

The whole app sits under a full-bleed sky whose gradient, sun or moon, clouds and stars follow local time through four phases: dawn, day, golden and night. The phase is set on the root element (`html[data-sky]`) and every ink, glass and accent token re-resolves from it. The sky is the ground; working content rises over it on frosted glass sheets, and the things worth looking at (trips) are framed as aircraft cabin windows.

Density is calm and phone-first: one primary figure per view, set large and light, with money always tabular and always worded ("You owe", "You get back"). Depth is glass over sky, never flat white. Colour comes from the sky itself; the only saturated UI colour is the luminous blue of primary actions plus gain, loss and sun tones for meaning.

**Key Characteristics:**
- Living sky backdrop in four phases, crossfading on change.
- Frosted content sheet (34px top radius) that rises on every navigation.
- Cabin Window frame with a drawn shade and a sky-and-cloud fallback in place of any missing photo.
- Ultralight headline numerals that count up; Geist Mono reserved for codes and printed artefacts.
- Authored, dimensional icons for categories and navigation; Phosphor (bold, duotone, fill) for UI actions.

## Colors

A sky-derived palette: navy ink on the light phases, moonlit ink at night, one luminous blue for action, and green/coral/amber reserved for money meaning.

### Primary
- **Luminous Sky Blue** (accent): primary buttons, active tab, focus ring, caret, selection tint, the flight-path trail. It deepens to a periwinkle (accent-golden) at golden hour and lifts to a pale moonlit blue (accent-night) at night. Primary pills render it through one shared `.luminous` material: a lit gradient (`#4f8dff` to `#2563eb`, brighter at night) with a bright top edge. Never re-type the gradient inline.
- **Deep Sky Blue** (accent-ink): accent used as text on light glass where contrast needs it.

### Secondary
- **Contrail Green** (gain): "You get back", money left in budget, the PAID stamp.
- **Sunset Coral** (loss): "You owe", over budget, field errors, destructive actions.
- **Brass Sun** (sun): warm highlight tone; soft variant for tinted wells.

### Neutral
- **Navy Ink / Moon Ink** (navy-ink, moon-ink and their -2, -3 steps): three text levels per phase; primary, secondary, tertiary.
- **Glass Panel / Panel Strong**: translucent white panels on light phases; near-transparent white and deep indigo at night.
- **Well, Line, Line Strong**: navy (or white at night) at 5%, 8% and 14% for inset wells, hairline rings and dividers.
- **Phase Sheets** (sheet-day, sheet-dawn, sheet-golden, sheet-night): the frosted sheet tint, faintly cool, lilac, peach or deep indigo per phase.
- **Sky gradients** (sky-*-zenith to sky-*-horizon): the full multi-stop gradients live in the sidecar; these pairs are the endpoints.

### Named Rules
**The Phase Token Rule.** UI colour is read from phase tokens on `html[data-sky]`, never hard-coded per screen. A colour that does not change between day and night is either cloud white, the navy used on white pills, or a mistake.

**The Sky Supplies the Colour Rule.** Gradients belong to the sky, to sky fallbacks inside windows, and to lit pills. No decorative gradient blobs elsewhere.

**The Worded Money Rule.** Gain and loss colours support a sentence ("You owe", "Owed", "All square"); they never carry meaning alone.

## Typography

**Display Font:** Geist Variable (with ui-sans-serif, system-ui)
**Body Font:** Geist Variable, stylistic sets ss01 and cv11 on
**Label/Mono Font:** Geist Mono Variable, only for codes and printed artefacts (boarding-pass initials, ticket counters, receipts, invite links, the PAID stamp)

**Character:** One contemporary sans carrying semibold, tightly tracked headings against very light, oversized numerals, the way a flight display or a weather app sets its figures.

### Hierarchy
- **Hero** (600, 2.375rem, 2.625rem): greeting on the sky.
- **Display** (600, 1.875rem, 2.25rem): page titles in the sky header.
- **Title** (600, 1.3125rem, 1.75rem): sheet and dialog titles, trip names.
- **Heading** (600, 1.0625rem, 1.5rem): section headers inside the sheet, ticket amounts.
- **Body** (400, 0.9375rem, 1.375rem): default text; button labels at 600.
- **Meta** (400 to 600, 0.8125rem): secondary lines, field labels, chips, tab labels.
- **Caption** (0.75rem): dates under windows, route-map stops, axis labels.
- **Figure** (300, 34 / 46 / 64px, tracking -0.045em, tabular): money totals; currency symbol at half size and raised, paise dimmed.
- **Countdown** (200, clamp 84 to 128px, tracking -0.06em, tabular): the single huge numeral on the sky; also the journal year and the amount entry (60px).

### Named Rules
**The Light Numeral Rule.** Headline numbers are set extralight or light and large; labels around them stay semibold and small. Never bold a hero figure.

**The Tabular Money Rule.** Every amount uses tabular figures (`tnum`).

**The Mono Is Print Rule.** Geist Mono appears only where a real artefact would be printed: codes, tickets, receipts, links.

## Layout

Mobile-first two-layer page: a sky hero (on-sky content, gutters 20px, 24px from 640px, 40px from 1024px, max width 1080px) above a frosted content sheet that fills to the bottom and reserves room for the floating tab bar. From 1024px the sheet becomes a fully rounded card and a 264px floating dark-glass side rail replaces the tab bar. Modal sheets rise from the bottom on phones and become a 460px (or 540px) floating right panel from 768px. Controls are 36, 44 or 52px tall; touch targets never fall below 44px except dense in-sheet segmented options (36px). Section headers sit in a 44px row with an optional trailing action.

## Elevation & Depth

Depth is glass over sky. Surfaces stack in a fixed order: sky, then on-sky glass controls, then the frosted sheet, then panels inside the sheet, then floating bars, menus and modal sheets. Each layer is a backdrop blur plus a lit inner top edge plus a soft, long, low-opacity shadow tinted from the phase (`--t-shadow`: navy by day, black at night). No hard offset shadows.

### Shadow Vocabulary
- **Sheet** (`inset 0 1px 0 sheet-edge, 0 -12px 40px -20px shadow/0.35`, blur 28px saturate 1.6): the content sheet and modal sheets.
- **Panel** (`inset 0 0 0 1px line, 0 1px 2px shadow/0.04, 0 10px 28px -18px shadow/0.22`): lists and cards inside the sheet.
- **Sky glass** (`inset 0 1px 0 white/0.45, inset 0 0 0 1px white/0.22, 0 8px 24px -12px`, blur 18px saturate 1.8): floating glass on the sky.
- **Glass control** (deeper fill `rgb(8 22 76 / 0.44)`, blur 18px saturate 1.6): pills and strips on the sky that carry white labels.
- **Glass bar** (panel-strong mixed with sheet, blur 24px saturate 1.8, `0 18px 40px -18px shadow/0.5`): tab bar and menus floating over content.
- **Lit pill** (`inset 0 1px 0 white/0.35, 0 10px 24px -10px accent/0.7`): primary and danger buttons, the add button, route badges.

### Named Rules
**The Lit Edge Rule.** Every glass surface carries a one-pixel bright inner top edge; it is what makes glass read as glass on a moving sky.

**The Four Glasses Rule.** Pick the material by where it sits: sheet on the sky as ground, panel inside the sheet, glass-control for pills on the sky, glass-bar for anything floating over content.

## Shapes

Pills for every control (buttons, chips, segmented tracks, tab bar, toasts, trip tabs). Soft, generous corners for containers stepping up with size: fields 16px, menus and rows 22px, panels 24px, feature cards and route map 28px, dialogs and the side rail 30px, the content sheet 34px (modal sheets 32px on phones). The one non-rectangular silhouette is the cabin window: an elliptical rounded rectangle (42% / 32%) with an inner pane at 40% / 30%. Boarding-pass tickets are cut with two semicircular notches at the perforation and a dashed stub divider.

## Components

### Buttons
Luminous, tactile pills that compress on press.
- **Shape:** full pill; heights 36 / 44 / 52px, padding 14 / 20 / 24px.
- **Primary:** lit blue gradient, white semibold label, glow beneath. Used once per view for the main action inside the sheet.
- **White:** solid white pill with navy label; the primary action when placed directly on the sky.
- **Sky:** glass-control pill with white label; secondary action on the sky (Scan receipt, New trip, Back).
- **Secondary / Ghost / Quiet:** panel-strong with line ring; transparent with well on hover; accent text with accent-soft on hover.
- **Danger:** coral lit gradient for destructive confirmation.
- **States:** hover brightens (1.06) or tints; press scales to 0.965 in 120ms and springs back on the glide curve; disabled at 45% opacity, shadow removed; loading swaps the leading icon for a spinner.
- **Icon button:** 44px circle in plain, panel or sky tone.

### Chips and Segmented
- **Chip:** 40px pill, panel-strong with hairline ring and ink-2 label; active inverts to solid ink with inverse label. Optional count in tabular figures.
- **Segmented:** well track with a panel-strong thumb that slides between options (500ms glide); arrow keys move selection.

### Cards / Containers
- **Content sheet:** frosted phase sheet, 34px top radius (all corners from 1024px), body padding 24px top, 20 / 28 / 40px sides.
- **Panel:** translucent panel, 24px radius, hairline ring, divided lists inside.
- **Trip cards:** a Window plus text; hover lifts the window 4px (and tilts the featured one 1deg) on the expo curve.

### Inputs / Fields
- **Style:** 52px soft-filled panel-strong field, 16px radius, inset line-strong ring; label above in meta medium ink-2, optional marker in ink-3.
- **Focus:** ring becomes 1.5px accent plus a 4px accent-soft halo.
- **Error:** same treatment in loss and loss-soft, with a filled warning icon and message below.

### Navigation
- **Phone tab bar:** floating glass-bar capsule of three 76 x 52px items with authored glyphs over 11px semibold labels; an accent-soft indicator slides to the active item (500ms glide). A separate 64px luminous round add button sits beside it.
- **Desktop rail:** 264px floating dark glass panel over the sky with white type; active item is a white pill with navy label; lists upcoming and past trips with miniature windows.
- **Trip tabs:** glass-control pill strip on the sky; active tab is a white pill, others text-sky-2; scrolls horizontally with edge fades on phones.
- **Menus:** glass-bar popover, 22px radius, pops in at 260ms.
- **Toast:** dark navy pill at the bottom above the tab bar, filled status icon, optional action pill.

### Cabin Window (signature)
A moulded white bezel with inner reveal shadow, an acrylic glint and a half-drawn shade (default 16%) that slides down on mount (1100ms, expo). Inside is the trip photo; if the photo is missing or fails, a seeded sky gradient with two bobbing clouds shows instead, so a window is never broken. Used at every size, from the 32px rail thumbnail (no shade) to the featured trip.

### Flight Path budget (signature)
Budget drawn as a dashed arc from origin to a destination pin. A plane flies along it to the share spent (1600ms exponential), trailing a solid blue gradient and carrying a tag with the spent amount. Over budget, the plane lands past the pin and the trail turns coral. A worded line above states percent used and amount left or over.

### Boarding-pass Ticket (signature)
Each settlement payment is a boarding pass: payer and payee initials as mono airport codes joined by a dotted route and plane, a perforated stub with the amount and "n of N", and a Paid button. Marking paid slams a green mono PAID stamp onto the ticket (scale 2.4 to 1, rotate -11deg, 520ms).

### Route Map (signature)
A finished trip's places drawn as a winding flight route that snakes left to right and back, with take-off and landing badges (lit blue circles) at the ends, panel-strong stop dots and a blue-to-peach contrail.

### Icons
- **Category icons:** hand-drawn dimensional objects (house, bowl, vehicle and so on), lit from the top left with a soft contact shadow, at 40 to 44px.
- **Nav glyphs:** authored for TripMate: a cabin window with a cloud (Trips), a torn receipt (Expenses), a passport with a globe (Profile). Outlined in currentColor when idle; filled with the blue gradient and white detail when active.
- **UI icons:** Phosphor in bold for actions, duotone for illustrative spots, fill for status.

### Motion grammar
- **Sky crossfade:** phase gradients crossfade over 1800ms; stars fade in over 2000ms; the luminary moves and recolours over 1800ms.
- **Clouds:** volumetric cumulus drift across in 130 to 280s linear loops and lift at 0.18 of scroll (parallax, capped at 1200px).
- **Sheet rise:** the content sheet rises 18px and fades in over 640ms (expo) on every navigation; this is the only page transition.
- **Modal sheet:** slides up (phones) or in from the right (768px+) in 520ms on the glide curve; drags down to dismiss.
- **Count-up:** reserved for the two headline moments, the trip's group spend on the overview and the home countdown (1100ms / 1400ms, exponential ease). Figures in sheets, tables and summaries are static, so no one ever reads an amount mid-count.
- **Plane flight, shade drop, PAID stamp, route draw-in** as described above.
- All motion collapses under `prefers-reduced-motion`; count-ups and the plane jump straight to their values.

Easing: **expo** `cubic-bezier(0.16, 1, 0.3, 1)` for arrivals; **glide** `cubic-bezier(0.22, 1, 0.36, 1)` for sliding indicators, sheets and presses.

## Do's and Don'ts

### Do:
- **Do** set type placed directly on the sky with the sky text styles (white with an atmospheric shadow; 92% white for secondary), so it holds when a cloud drifts behind it.
- **Do** put pill controls and strips on the sky in the glass-control material, so white labels keep 4.5:1 in every phase; use the white pill for the one primary action on the sky.
- **Do** keep the luminary clear of controls and titles: on phones the sun or moon sits above the top edge so only its glow spills into the sky; from 1024px it is shown whole in the open sky right of centre (x 70%).
- **Do** let windows show the sky you are under: the cabin-window fallback follows the phase (sunset tones at golden hour, a starry night sky at night), varied per trip.
- **Do** match words to the sky: the home greeting follows the phase, not the raw clock.
- **Do** read every UI colour from the phase tokens and check new surfaces in all four phases, night included.
- **Do** frame trip imagery in the cabin Window and rely on its sky fallback rather than a placeholder or broken image.
- **Do** word every balance ("You owe", "You get back", "All square") and set amounts in tabular figures.
- **Do** honour reduced motion for every new animation.

### Don't:
- **Don't** use em dashes in copy.
- **Don't** use emoji as icons, and don't substitute a thin line-icon set for categories or navigation; those use the authored dimensional set.
- **Don't** place navy ink or unshadowed white text directly on the sky.
- **Don't** add decorative gradient blobs; colour comes from the sky.
- **Don't** lay content on a flat opaque white page; working content sits on the frosted sheet.
- **Don't** add uppercase eyebrow labels above headings; the only tracked uppercase in the world belongs to printed artefacts (the PAID stamp, receipt headers).
- **Don't** use Geist Mono for interface labels or headings.
