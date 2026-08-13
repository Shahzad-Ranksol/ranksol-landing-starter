---
name: landing-page-discovery
description: Use before writing any code on a new interactive landing page build — a required discovery pass that asks the client/user structured questions about visual direction, motion intensity, the hero's 3D-vs-image-sequence-vs-photography approach, and asset availability, so each build is driven by their answers instead of defaulting to whatever look was used last time. Required first step of interactive-landing-page's build roadmap.
version: 1.0
---

# Landing Page Discovery — Ask Before You Build

## Overview

Without a forcing function, every build in this playbook converges on the same look: dark
palette, warm accent, editorial serif, heavy scroll choreography — because that's a reasonable
default in the absence of any stated preference, and defaults repeat. **This skill is that
forcing function.** Run it — actually call `AskUserQuestion`, don't just silently assume — before
touching `nextjs-app-scaffold` or any other build-phase skill, every time, even if a previous
project in this repo used a particular look. Confirmed as a real, repeated problem: without this
step, this exact playbook has produced visually near-identical builds across unrelated projects.

## When to use

- The very first thing, before Phase 1 (Scaffold) in `interactive-landing-page`'s roadmap —
  this is Phase 0, not optional pre-work
- Whenever a request is vague ("build me an interactive landing page like X") rather than
  already answering these questions in detail

Not for: minor edits or fixes to an existing build already past discovery — re-running this on
every small change would be noise, not signal. Re-run it if the ask is a genuinely new project.

## The four things to actually ask

Use `AskUserQuestion` (real questions, real answers — don't infer these from vibes). Split
across as many calls as needed (max 4 questions per call); don't compress them into one giant
wall of options.

### 1. Visual mood

Concrete presets beat "what's your brand vibe" as an open question — most people can react to
options faster than generate a direction from nothing:

- Dark editorial (near-black, one warm or cool accent, serif display + mono labels) — what
  every build defaults to without this question, name it as an option but not the only one
- Bright/airy minimal (light background, generous whitespace, restrained color)
- Bold/saturated (color-forward, high contrast, energetic)
- Raw/brutalist (exposed grid lines, monospace-heavy, deliberately unpolished)

### 2. Motion intensity

This is a real, load-time-vs-wow tradeoff — confirmed directly in this repo's own testing
(reviewing a build made from this playbook, its ~15s gated intro loader was the single biggest
flagged issue; the actual belgradearbor.rs reference site both types the "cinematic and slow" and
still uses it as a deliberate choice). Make the tradeoff explicit instead of picking silently:

- Cinematic/heavy — pinned sections, long scroll choreography, a slower gated intro accepted as
  the cost of the premium feel (see `cinematic-video-sections`, `scroll-animation`)
- Fast/minimal — motion is present but brief; intro is decoupled from real asset load and
  capped near 2s (`scroll-animation`'s intro-counter recipe default); prioritizes Core Web
  Vitals over spectacle (`perf-web`)

### 3. Hero "wow" mechanism

Three genuinely different techniques exist in this repo now, with different cost/asset
requirements — don't default to 3D just because `r3f-3d-viewer` exists:

- Real 3D model, user-orbitable — needs an actual `.glb` (client-provided, commissioned, or a
  licensed/CC-BY stock model with attribution — see `r3f-3d-viewer`). Most expensive to build
  and to get right; only choose this if free orbit control genuinely matters to the brief.
- Scroll-scrubbed image sequence — needs a rendered frame sequence (a fixed camera path, not
  user-controlled) from Blender/an architect's render pipeline — see `scroll-image-sequence`.
  Cheaper to render than a full interactive model, no WebGL/context-loss risk.
- Photography + parallax only, no 3D at all — matches what the actual belgradearbor.rs
  reference does. Legitimate default when there's no 3D asset and no budget to create one —
  don't treat 3D as mandatory for this genre.

### 4. What assets actually exist right now

This determines whether the build can start immediately or needs placeholder/stock sourcing
(and the licensing conversation that comes with it — see `cms-content-model`'s and this repo's
own experience sourcing CC-BY/AI-generated stand-ins when nothing else was available):

- Real photography/renders: have them / need to source stock / need to generate placeholder art
- 3D model or render sequence (if Q3 picked one of those): have it / need to commission or source
- Logo, brand colors, fonts: have brand guidelines / need `frontend-design` to establish a direction
- Copy, and in which languages: have final copy / need placeholder / confirms whether
  `i18n-nextintl` is even in scope
- Content that repeats (units, floors, POIs, amenities): confirms `cms-content-model`'s
  CMS-vs-static decision and `interactive-map`'s asset checklist items

## Quick reference

| Answer to Q3 | Skill to use for the hero |
|---|---|
| Real 3D model, orbitable | `r3f-3d-viewer` |
| Rendered camera-path sequence | `scroll-image-sequence` |
| Photography only | `scroll-animation` (parallax/reveal recipes), no 3D skill needed |

| Answer to Q2 | What that changes |
|---|---|
| Cinematic/heavy | Longer pinned sections OK, intro loader can be slower if it's a deliberate choice — confirm the client actually wants that tradeoff, don't default into it |
| Fast/minimal | Cap the intro near ~2s, favor `perf-web`'s dynamic-import/lazy-load guidance over spectacle |

## Common mistakes

- **Skipping straight to `nextjs-app-scaffold` because the brief "sounds like" a real estate
  site** — genre alone (real estate, agency, product launch) doesn't determine mood, motion
  intensity, or hero mechanism; two real-estate briefs can and should look nothing alike.
- **Defaulting to 3D because it's the most impressive skill available** — confirmed directly:
  the actual reference site this whole playbook is modeled on (belgradearbor.rs) has no 3D at
  all. Ask first; don't assume the client wants or can afford the most expensive option.
- **Treating this as a one-time repo setup step instead of a per-project step** — run it for
  every new build, even the tenth one using this same repo/template, precisely because repeating
  the same defaults without asking is the problem this skill exists to prevent.
- **Asking the questions but not actually letting the answers change the plan** — if "bright/
  airy minimal" gets chosen and the build still ships dark-editorial anyway, the discovery step
  was theater. The point is the output actually varies per project.
