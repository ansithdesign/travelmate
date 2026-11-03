# Product

<!-- impeccable:product-schema 1 -->

> Inferred from the owner's written brief (2026-11-03). The owner asked not to be stopped for approvals, so no interview round ran. Facts below are taken from that brief; nothing here was invented beyond it.

## Platform

web

## Stack

Delegated: React, TypeScript, Vite, Tailwind CSS, Lucide icons, localStorage persistence behind a repository layer so a backend can replace it later. Chosen because the repo was empty and the brief named this stack as the default.

## Users

Primary: friends, couples and families travelling together in small groups (2 to 6 people), mostly Indian domestic and short international trips. They are on a phone, often mid-trip, entering an expense at a dinner table or in a cab, and later reconciling who owes whom.

Secondary: solo travellers tracking their own trip spend and history.

## Product Purpose

TripMate is a shared travel companion: organise a trip, record and split group expenses, settle balances, keep bookings and notes in one place, and keep a permanent record of past trips.

Promise: Every trip. Every expense. Every memory. All in one place.

Success: a traveller can add a split expense in under 15 seconds, understand a trip's financial state within a few seconds of opening it, and settle a group in the minimum number of payments.

## Positioning

Splitwise is organised around people and debts; Wanderlog around plans. TripMate is organised around the trip as the unit: money, logistics and memory live on one trip and the trip becomes a journal when it ends.

## Operating Context

Replaces a mix of WhatsApp threads, Splitwise, spreadsheets, Maps and photo galleries. Usage is bursty: many quick entries during the trip, one reconciliation at the end, occasional revisits months later.

## Capabilities and Constraints

- Trips: create, edit, mark completed, cover image, currency, optional budget.
- Expenses: add, edit, delete; categories Accommodation, Food and drinks, Transportation, Activities, Shopping, Flights, Other; split equally, by exact amounts, by percentage, by shares (unequal), across selected participants.
- Receipts: camera and OCR are not available in this build. Receipt scanning is a labelled simulation using sample receipts with editable extracted fields. Real image upload attaches locally.
- Members: invite by shareable link (link generation is local, no real delivery), pending invitations, remove with confirmation.
- Settlements: computed from data, minimum practical payments, mark as paid, history.
- Default currency INR. Persistence is local to the browser.

## Brand Commitments

- Name: TripMate.
- Light theme. Warm off-white ground, white surfaces, deep charcoal text, forest or deep emerald accent, subtle warm amber support.
- One contemporary sans-serif used throughout. Lucide icons only, no emoji as UI.
- No gradients as decoration, no glassmorphism, no neon, no purple-blue AI look, no decorative blobs, no heavy shadows.
- Copy never uses em dashes.

## Evidence on Hand

No real users, testimonials or metrics. Sample data (Kashmir, Goa, Bangalore trips, Indian names, INR amounts) is demonstration content and must read as such in documentation.

## Product Principles

1. The trip is the unit. Every expense, booking and memory belongs to one.
2. Money must be legible in seconds: who paid, who owes, what is left.
3. The frequent action (add expense) is the fastest action.
4. Never fake capability. Simulations are labelled.
5. Finished trips become keepsakes, not archives.

## Accessibility & Inclusion

WCAG 2.1 AA contrast, 44px touch targets, full keyboard reachability, financial meaning never carried by colour alone (always signed text: "owes", "gets back").
