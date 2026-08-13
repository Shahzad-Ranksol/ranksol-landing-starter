---
name: belgrade-arbor-patterns
description: Use when building or reviewing a real-estate landing page against the belgradearbor.rs reference class, to check what that reference actually does technically (verified via live network inspection) rather than assumed — asset strategy, font licensing, map implementation, and the marketing/tracking stack it ships. Companion reference skill to interactive-landing-page.
version: 1.0
---

# Belgrade Arbor — Verified Reference Patterns

## Overview

`interactive-landing-page` names belgradearbor.rs as the reference site class. This skill
records what that site **actually does**, verified by inspecting its live network requests and
rendered DOM directly — not assumed from the general genre. One finding here changes a default
assumption the rest of the playbook makes, so read the "3D" section first.

## ⚠️ Correction: the homepage has no 3D model, but a separate `/3d` route does

An earlier version of this skill claimed belgradearbor.rs has no 3D at all — that was based on
inspecting only the **homepage's** network requests (80 requests, zero `.glb`/`.gltf`/Three.js
chunks confirmed there). It's true for the homepage. It's **wrong** for the site as a whole:
`belgradearbor.rs/en/3d` is a separate, genuinely sophisticated real-time 3D viewer (confirmed by
directly loading and interacting with it, not just inspecting requests). Lesson generalized: a
"does this reference use 3D" check has to cover every route a brief might mean, not just `/`.

The homepage's "explore the building" feeling, specifically, is built without 3D:

- High-resolution `.webp` renders per section (`introduction/image1-4.webp`,
  `residences-options/1-4.webp`, `residences/residences-hero.webp`, etc.) — some served through
  `/_next/image?...&w=3840&q=75` (Next.js Image Optimization at very high source width), others
  fetched as raw `.webp` directly (inconsistent — the raw ones bypass Next's
  format-negotiation/resizing pipeline, likely CSS `background-image` usage).
- Scroll choreography and parallax across those static images (GSAP/Framer-class animation —
  see `scroll-animation`), not camera movement through a 3D scene.
- A **static branded map image** (`home/mapc.webp`) with pin overlays, not a live Mapbox/Google
  Maps embed — confirms the "static, client-curated" option in `interactive-map` is not a
  fallback compromise, it's what the homepage itself ships.

The `/3d` route, by contrast, is a real interactive scene with features worth building toward —
see the new day/night lighting and minimap-navigation recipes added to `r3f-3d-viewer` from this
page directly: a time-of-day slider that relights the whole scene (glowing interior windows,
dimmed sky, ambient shift) from a stylized daytime render to a night render, a minimap with
per-angle view presets, live-animated cars/pedestrians even while otherwise static, and an
integrated Properties/Filters panel overlaid on the canvas.

**Implication:** if a brief says "build something like belgradearbor.rs," check *both* whether
the homepage-style photography-driven approach or the `/3d`-style real-time viewer is what's
actually being asked for — they're different pages on the same site, aimed at different moments
in the user's journey (homepage sells the mood, `/3d` is the configurator). Don't assume 3D is
out of scope just because the homepage skips it, and don't assume the reference's 3D bar is low
just because the homepage's isn't — `/3d` is a high bar.

## Fonts: paid, self-hosted, not Google Fonts

Ships `PP Editorial Old` (Regular, Ultralight, Ultralight Italic) as local `.otf` files via
`next/font/local`-style self-hosting — a licensed editorial serif from a type foundry, not a
free Google Font. This is a concrete, checkable signal of the "distinctive, non-templated"
requirement in `interactive-landing-page` §6 and the `frontend-design` skill: budget for a
licensed display typeface rather than defaulting to whatever's free in `next/font/google`.

## Marketing/tracking stack is heavier than "add a GTM ID"

The reference loads, on first paint, all of:

- Google Tag Manager (`GTM-...`)
- Google Ads conversion tracking (`gtag` with an `AW-...` id) — not just GA4
- Google Analytics 4 (`gtag` with a `G-...` id)
- Meta/Facebook Pixel **and** Conversions API client bundle (server-side-assisted tracking, not
  just the browser pixel)
- HubSpot forms/tracking (`hs-scripts`, `hs-analytics`, `hs-banner`, plus a tracking beacon) —
  their lead-capture form posts to **HubSpot as the CRM**, not a custom backend

Update the asset checklist's "form → CRM/email destination" and "GTM ID" line items to ask
specifically: Google Ads conversion ID (separate from GA4's), Meta Pixel ID + whether
Conversions API/server-side tracking is in scope, and which CRM (HubSpot, or another) the lead
form should integrate with — each is a separate account/credential to collect up front.

## The reference's own intro is slow too

Loading the real site (repeated, direct measurement) took over a minute to reach even 25% on
its progress counter, under normal network conditions. This doesn't excuse a slow gated loader
elsewhere (see the review of arbor-heights-landing.vercel.app in project history — a ~15s loader
was flagged as the top conversion risk) — it means this genre commonly *accepts* a slow
"cinematic" intro as a deliberate trade for the premium feel. Treat it as a known, discussable
trade-off with the client, not a defect to silently copy or a rule to silently break — confirm
whether they want the cinematic-but-slow version or a fast, decoupled counter
(see `scroll-animation`'s intro-counter recipe, which defaults to fast/decoupled).

## Quick reference

| Reference does | Skill that covers it |
|---|---|
| High-res WebP imagery, some through `/_next/image` | `perf-web` |
| Scroll-driven reveals over static imagery (no 3D) | `scroll-animation` |
| Static branded map image + pin overlay | `interactive-map` (static option) |
| Self-hosted licensed display font | `nextjs-app-scaffold`, `frontend-design` |
| GTM + Ads conversion + GA4 + Meta Pixel/CAPI + HubSpot | *(not yet a skill — ask before assuming a stack this size is in scope)* |
| True 3D building viewer | Not on the homepage, but real and sophisticated on `/3d` — `r3f-3d-viewer` (day/night + minimap recipes) |
