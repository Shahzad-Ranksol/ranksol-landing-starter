---
name: interactive-landing-page
description: Playbook for building premium, scroll-driven, 3D-capable marketing/landing sites (real estate, product launch, agency) with Claude Code. Reference this whenever a request looks like belgradearbor.rs — Next.js + heavy scroll animation + interactive 3D + i18n + CMS.
version: 1.0
---

# Interactive Landing Page — Build Playbook

Use this when the target is a **premium content-driven marketing site**: heavy scroll
choreography, parallax, a 3D building/product viewer, interactive maps, bilingual, CMS-driven,
deployed on Vercel. (Reference site class: belgradearbor.rs — real-estate complex.)

The build method is **legitimate scaffolding, not cloning**: start from an open-source
starter in the same stack, then swap in the client's own assets, copy, colors, and 3D model.
Do NOT scrape or copy a live competitor's compiled code — study the *pattern*, rebuild it.

---

## 1. Reference starters (clone one, strip, rebuild)

| Starter | Repo | Use when |
|---|---|---|
| **Satus** (darkroom.engineering, ex-Studio Freight) | `github.com/darkroomengineering/satus` | Primary pick. Next.js App Router + Lenis + GSAP + Tempus + R3F (opt-in) + Sanity CMS + Shopify. This is the exact studio stack behind sites like the reference. |
| react-three-next | `github.com/imanrousta/react-three-next` (or `pmndrs/react-three-next`) | When 3D is the centerpiece and you want R3F wired into Next from line 1. |
| r3f-next-starter | `github.com/whoisryosuke/r3f-next-starter` | Lean R3F + DOM + Leva toggles + shader setup. |

Fallback if starters feel too heavy: `npx create-next-app@latest` + add the animation/3D
stack manually (section 2).

---

## 2. Target stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15/16 App Router + TypeScript | SSR/SSG + Vercel |
| Styling | Tailwind CSS (+ CSS Modules for scoped bits) | external-only CSS |
| Smooth scroll | **Lenis** — `npm i lenis`, import from `lenis/react` | ⚠️ the old `@studio-freight/*` packages are retired — do NOT use |
| Animation | **GSAP + ScrollTrigger** + `@gsap/react` (`useGSAP`) | pin, parallax, horizontal scroll, intro counter |
| Micro-interactions | Framer Motion | reveal-on-scroll, page transitions |
| 3D | React Three Fiber + `@react-three/drei` + Three.js | building/product viewer |
| 3D helpers | `gltfjsx` (CLI) to turn `.glb` → typed `.tsx` | ask client/architect for the model |
| Map | Mapbox GL JS (or Google Maps) | POI markers + walk/drive times |
| i18n | **next-intl** | locale routing `/en` `/sr`, message files |
| Forms | React Hook Form + Zod | lead capture, validation |
| CMS / data | Sanity (matches Satus) OR Payload OR static JSON | units, floors, availability, POIs |
| Analytics | GTM + Vercel Analytics | reference site uses GTM |
| Deploy | Vercel | Image optimization, edge |

---

## 3. Claude Code — skills to keep in the repo

Add these as `.md` skill files under `.claude/skills/` (or your skills dir). Keep this file
as the index; the others are the deep-dives you invoke per phase.

1. `nextjs-app-scaffold` — App Router layout, TS/Tailwind config, folder conventions, Vercel env
2. `scroll-animation` — Lenis + GSAP ScrollTrigger + Framer Motion recipes (intro 0→100 counter, parallax layers, pinned/horizontal-scroll sections, reveal-on-scroll)
3. `r3f-3d-viewer` — R3F scene, GLTF loading via gltfjsx, clickable floors/units, OrbitControls, camera transitions, LOD/perf
4. `i18n-nextintl` — locale routing, message JSON, language switcher
5. `interactive-map` — Mapbox/Google Maps, custom POI markers, distance/time panel
6. `cms-content-model` — Sanity/Payload schema: unit, floor, availability, POI, amenity
7. `perf-web` — next/image + WebP, lazy loading, dynamic import of 3D, Lighthouse budget
8. `cursor-interactions` — custom cursor with contextual labels, magnetic hover, mouse-driven parallax/camera drift — the "feels alive/present" layer, distinct from scroll choreography
9. Built-in `frontend-design` (public skill) — visual direction, typography, non-templated look

---

## 4. MCP servers to enable

| MCP | Why |
|---|---|
| **Filesystem** | read/write project files |
| **GitHub** | repo, branches, PRs, issues |
| **Playwright / Puppeteer** | screenshot the running site, visual QA, test scroll & 3D interactions |
| **Context7** | pulls *current* docs for R3F / GSAP / Lenis / next-intl so Claude Code doesn't hallucinate deprecated APIs (critical — these libs churn) |
| **Sanity** (or Payload) | if CMS-driven: query/edit content model |
| **Postgres / Supabase** | if availability lives in a DB instead of CMS |
| **Vercel** | deploys, env vars, preview URLs |

---

## 5. Build roadmap (phase order)

1. **Scaffold** — clone Satus (or create-next-app + stack). Set up i18n routing, root layout, nav, footer, Lenis provider.
2. **Content model** — decide CMS vs static JSON. Define: unit, floor, availability, POI, amenity, installment step. Seed dummy data.
3. **Design system** — colors, type scale, spacing, motion tokens (via `frontend-design`). Distinct identity, not a template look.
4. **Hero + scroll engine** — intro loader (0→100% counter), parallax leaf/cloud layers, section reveals. This is where the "premium" feel is won or lost.
5. **Core sections** — location map, residences / business / retail listing pages, amenities, installment plan, "roots"/lifestyle, aerial gallery.
6. **3D viewer** (`/3d`) — load building `.glb`, clickable floors → unit detail, camera moves. Hardest part; budget the most time. Dynamic-import so it never blocks first paint.
7. **Interactivity** — unit filtering + availability state, lead form (RHF + Zod), PDF downloads, language switcher.
8. **Polish** — responsive, WebP, motion tuning, SEO/OG tags, GTM, cookie/privacy.
9. **QA + deploy** — Playwright interaction checks, Lighthouse pass, Vercel deploy + preview.

---

## 6. The two things that actually separate this from a normal landing page

- **3D building viewer** — the `.glb` model must come from a designer/architect (Blender export).
  Claude Code wires up the *viewer*, not the asset. Get the model early; everything in phase 6 waits on it.
- **Scroll choreography** — the animation timing is the product. Prototype the intro counter and
  one parallax section first to lock the "feel" before building all sections.

---

## 7. Asset checklist to request from client up front

- [ ] Building/product 3D model as `.glb` / `.gltf` (or the floor plans to model from)
- [ ] Floor & unit data: numbering, sizes, availability, prices
- [ ] Photography / renders in high-res (will convert to WebP)
- [ ] Logo, brand colors, fonts, brand guidelines
- [ ] Copy in every language (e.g. SRB + ENG), or who translates
- [ ] PDFs to link (permits, brochures), analytics/GTM ID, form → CRM/email destination

**For the location map** (`interactive-map`):
- [ ] Exact site address + coordinates (lat/lng)
- [ ] Map provider preference — Mapbox (default) or Google Maps — and account/billing access,
      or have the client create the account and invite the dev/agency
- [ ] POI list: name, category (school/transit/shopping/etc.), coordinates, walk time, drive
      time for each — this is authored data, not something Claude Code can source on its own
- [ ] Brand-matched map style, if a stock Mapbox style isn't acceptable (Mapbox Studio access
      or a style spec: colors, label density, POI icon set)

**For the content model** (`cms-content-model`):
- [ ] Who edits this data day-to-day — determines CMS (Sanity/Payload) vs static JSON; see the
      decision table in `cms-content-model`
- [ ] Full field list per content type actually needed: unit (number, floor, size, bedrooms,
      price, availability, floor plan image), floor (label, level, plan image), amenity (name,
      icon/photo, description) — confirm against what the client's sales team actually tracks,
      don't assume the default schema covers it
- [ ] If Sanity: who owns the Sanity project/org (client or agency), and whether editors need
      accounts provisioned
- [ ] If Payload: hosting/database target (the client's own Postgres, or one stood up for them)
