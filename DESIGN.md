---
name: TripMate
description: A shared travel companion, Under the Sky. A band of sky over calm haze, frosted glass modules, Airbnb-calm type.
source: Ported from the owner's Finbook "Under the Sky" system (2026-11-03), with an Airbnb-style type hierarchy and listing-style photo cards.
colors:
  ink: "#0d1b2a"
  ink-2: "#2a3c52"
  muted: "#4f6278"
  faint: "#8d9cae"
  midnight: "#0f2238"
  accent: "#1769d6"
  accent-ink: "#0f56b5"
  accent-soft: "rgba(23, 105, 214, 0.12)"
  accent-bright: "#8fc6fb"
  haze-day: "#eef5fb"
  haze-morning: "#f5f4f2"
  haze-evening: "#f3f0f7"
  haze-night: "#0a1430"
  sky-day: ["#6fb6ef", "#a6d3f6", "#d6ebfa"]
  sky-morning: ["#8ec0f0", "#cfe1f4", "#fbe2cf"]
  sky-evening: ["#7c84d6", "#c3a6dc", "#f4bfb0"]
  sky-night: ["#070f26", "#0e1d42", "#15295a"]
  glass: "rgba(255, 255, 255, 0.56)"
  glass-strong: "rgba(255, 255, 255, 0.8)"
  glass-edge: "rgba(255, 255, 255, 0.9)"
  line: "rgba(13, 27, 42, 0.1)"
  fill: "rgba(13, 27, 42, 0.06)"
  border-strong: "rgba(13, 27, 42, 0.18)"
  ok: "#23915c"
  ok-ink: "#15693f"
  aware: "#c99a00"
  aware-ink: "#6b5200"
  prepare: "#ea8a26"
  prepare-ink: "#8a4806"
  act: "#d23f33"
  act-ink: "#a0261c"
  night-ink: "#eef4fb"
  night-accent: "#6cb4ff"
  night-ok-ink: "#8fe2b8"
  night-act-ink: "#f8aaa3"
  series: ["#1f6fd6", "#e46aa6", "#c9922a", "#6a5bd8", "#2aa5a0", "#8fc6fb", "#9aa8b8"]
typography:
  family: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
  hero: { fontSize: "32px", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.025em" }
  display: { fontSize: "26px", fontWeight: 600, lineHeight: 1.15, letterSpacing: "-0.02em" }
  title: { fontSize: "22px", fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.018em" }
  heading: { fontSize: "17px", fontWeight: 600, lineHeight: 1.35, letterSpacing: "-0.01em" }
  body: { fontSize: "15px", fontWeight: 400, lineHeight: 1.5 }
  meta: { fontSize: "14px", fontWeight: 400, lineHeight: 1.4 }
  caption: { fontSize: "13px", fontWeight: 400, lineHeight: 1.35 }
  figure-xl: { fontSize: "60px", fontWeight: 650, letterSpacing: "-0.045em" }
  figure-lg: { fontSize: "40px", fontWeight: 650, letterSpacing: "-0.035em" }
  figure-md: { fontSize: "28px", fontWeight: 650, letterSpacing: "-0.03em" }
  nav-title: { fontSize: "17px", fontWeight: 600 }
  tab: { fontSize: "10.5px", fontWeight: 500 }
radii:
  input: 16
  segment-track: 12
  segment: 9
  photo-small: 16
  photo-featured: 20
  list: 24
  card: 24
  dialog: 30
  sheet: 34
  pill: 999
motion:
  ease: "cubic-bezier(0.16, 1, 0.3, 1)"
  press: "scale(0.97), 200ms"
---

# TripMate design system

## Overview

TripMate uses the owner's **Under the Sky** system from Finbook, with an Airbnb-calm layer on top for hierarchy and photography.

- **The sky is a band, not a backdrop.** Every screen opens with a band of sky (620px on top-level screens and the trip overview, a 360px cloudless soft band on sub-screens) that fades into **haze**. Content lives on the haze.
- **Hero figures sit straight on the sky.** The big number on a screen (what the group has spent) has no container.
- **Modules are borderless frosted glass.** 20px blur, a barely-there 1px inner light and a wide, faint shadow. No borders, no hard edge lines. Edges come from light, not lines.
- **Airbnb calm.** Few weights, one clear step from title to body to a muted secondary line. Photos lead, words sit underneath. Sections are separated by space, not by rules or more boxes.

The sky follows the time of day: morning, day, evening, night (auto by clock, or pinned in Profile). Internally the phases are `dawn`, `day`, `golden`, `night` on `html[data-sky]`.

## Colors

- **Ink** for text everywhere, including on the sky. Muted (`#4f6278`) for secondary lines, faint for placeholders and chevrons.
- **Midnight** fills primary buttons and selected chips. At night it inverts to white with ink text.
- **Accent** marks selection and data: the active tab, focus rings, list icons, the budget bar, links. **It never fills a primary button.**
- **Bulletin colours are for state only.** `ok` for "gets back", "settled"; `act` for "owes", over budget, destructive; `aware` for waiting invites; `prepare` for gentle notices. Always paired with words.
- **Series colours** are for charts only (where the money went). Lists use the accent, so they stay calm.

## Typography

Figtree throughout. No uppercase labels, no monospace in the interface (Geist Mono is kept only for printed receipts).

| Role | Size / weight | Use |
| --- | --- | --- |
| Hero | 32 / 700 | Large left title on the sky: greeting, trip name, Expenses, Profile |
| Display | 26 / 600 | Page headline on sub-screens (Settle, People, Plans) |
| Title | 22 / 600 | Section titles (Balances, Recent activity, Past trips) |
| Heading | 17 / 600 | Card titles, row titles, sheet section names |
| Body | 15 / 400 | Paragraphs, row text |
| Meta | 14 / 400 muted | The secondary line under a title |
| Caption | 13 / 400 muted | Third lines, footnotes |
| Figures | 60, 40, 28 / 650 tabular, tight | Money. Currency symbol smaller and raised, paise muted |

Rule: one title, one secondary line. If a row needs a third line, it is a caption.

## Layout

- 24px side gutter on phones, 40px on desktop. Content max width 1080px.
- Generous whitespace is part of the system: list rows at least 68px with 20px side padding, cards padded 24px, about 56px between sections, 32px between fields in forms.
- One title line and one secondary line per row. Truncate rather than wrap.
- Top-level screens: large left title on the sky, actions on the right.
- Sub-screens: back chevron left, centred 17px title, actions right. Transparent on the sky, haze material once content scrolls beneath.
- Section heads are 44px tall with the title left and one link right ("See all 4", "Settle up").
- Sections are separated by about 56px of space. No rules between them.

## Elevation

| Surface | Material |
| --- | --- |
| Card (`.panel`) | glass 0.6, blur 20, soft inner light, shadow-soft |
| List (`.panel-strong`) | glass 0.82, same light and shadow |
| Secondary control (`.glass-control`) | glass 0.82, a faint lift shadow, no outline |

`shadow-soft` is `0 1px 2px` at 3% plus `0 10px 30px -14px` at 14%: wide and faint. Dividers are 1px at 6% ink.
| Sheet, dialog | haze, float shadow |
| Tab bar | haze 70%, blur 24, hairline top |
| Popover menu | solid 88%, float shadow |

## Components

### Buttons
Pill, 56px large, 48px default, 40px small. Primary midnight; secondary strong glass; ghost and quiet use accent ink; danger is act tint with act ink. Press scales to 0.97.

### Lists
Strong glass, radius 24, rows at least 68px with 20px side padding, a 36px accent-soft circle with a duotone icon or a 36px avatar on the left, value right-aligned and tabular. Dividers are 1px at 6% and start after the leading icon at 72px (`.rows`), or at 20px for text-only rows (`.rows.flat`), and stop 20px short of the right edge.

### Photo cards (Airbnb listing style)
The featured trip: photo at 4:3 (16:10 on wider screens), radius 20, one white pill badge top-left ("In 39 days"). Under the photo: trip name (heading), place and dates (meta), spend (meta with the amount in ink), and your balance on the right. Past trips: square photo, radius 16, three short lines underneath. Nothing overlays the photo except the badge.

### Status chip (`.level`)
11.5px / 650 pill with a 7px dot. `ok`, `act`, `aware`, `quiet`. Used for "You owe ₹4,300" under the hero figure and "Settled".

### Trip sections
A scrolling chip row: Overview, Expenses, Settle up, Plans (and Journal once a trip is complete). Selected chip is midnight. People is reached from the traveller avatars on the overview, not from a tab.

### Inputs
Strong glass, 54px, radius 16, no outline at rest. Focus: a softened 1.5px accent ring and a 4px accent-soft halo. Invalid: act tint background and act ring, with a caption-size message underneath.

### Segmented control
Fill track radius 12, 3px padding, solid thumb radius 9 that slides. Used for split method and the sky picker.

### Chips
Strong glass, 42px, medium 14px label. Selected is midnight.

### Sheets and dialogs
Haze, radius 34 (sheet) or 30 (dialog), grabber 38 x 5, 21px bold title, a plain close icon. Backdrop `rgba(8,20,40,0.32)` with a 3px blur.

### Tab bar
Full width, haze material. Three tabs (Trips, Expenses, Profile), 25px icons, regular when idle and fill when active, active label in accent. Add expense is a 54px midnight button floating bottom right, hidden on Profile.

### Key moments
First run uses the full twilight sky (`.tone-ink`) with white type, a white primary button and a translucent secondary.

## Interaction rules

- **Add expense is short by default.** Amount, what it was for, category (guessed from the name), and who paid. The split is one summary line ("Split equally · Everyone · ₹600 each") with Change. Date and note sit behind "Date and note". Scan lives in the sheet header.
- **One way to do each thing.** Adding an expense is the floating button (or the rail button on desktop). Inviting is the People page. There are no duplicate action rows on Home or the overview.
- **Hide empty sections** (no payment history yet, no pending invites, plan kinds with nothing added). Offer one add row instead.
- **Plain sentences for money.** "You pay Rohan", "Meera pays you", "gets back", "owes". Colour supports the words, never replaces them.

## Do

- Put the one number that matters on the sky with no box.
- Use the accent for selection and data only.
- Let photos lead and keep text under them.
- Use space between sections.

## Don't

- Fill a primary button with the accent, or use gradients on controls.
- Add borders or hairline outlines to cards, inputs or controls.
- Use uppercase labels, monospace in the UI, or more than one bold weight per block.
- Show colour without words for any balance.
- Overlay text on photos beyond one small badge.
