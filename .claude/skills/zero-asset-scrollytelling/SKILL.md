---
name: zero-asset-scrollytelling
description: Use when a brief wants a distinctive, editorial/data-driven scroll story with an extreme performance or sustainability angle — illustrated SVG scenes and live-feeling data visualizations built with zero images, zero web fonts, and (ideally) a single HTML file, instead of photography. Companion recipe skill to scroll-animation.
version: 1.0
---

# Zero-Asset Scrollytelling — Illustrated SVG Scenes, No Images, No Web Fonts

## Overview

Verified against a live reference (consider.digital/story) via network inspection: the entire
page is **one HTTP request** — no separate CSS file, no JS file, no images, no web fonts, no
tracking. Everything (styles, script, hand-drawn-style illustrations of wind turbines, solar
panels, a data table of UK grid generation mix) is inlined in a single HTML document and drawn
with SVG/CSS. The site's own subject is web sustainability, and it deliberately practices what
it argues for — but the technique itself is valuable independent of the sustainability angle:
it's a genuinely distinctive visual direction (line-art illustration instead of photography) and
the fastest possible loading page that still feels designed, not bare.

## When to use

- Brief explicitly wants a sustainability/performance-conscious angle, or a technical/editorial
  "story" format (data journalism, a case study, an explainer) rather than a sales-page format
- No photography budget, or photography would undercut the brief (a piece *about* minimalism or
  performance shouldn't ship a multi-MB hero photo)
- Want a hero/section visual that's genuinely different from every photography-driven reference
  in this repo — line-art illustration reads as deliberate, not templated

Not for: real-estate/product marketing pages where photography of the actual property/product is
the point — this technique fits editorial and data-story content, not "look at this real place."

## Core pattern: illustrate with SVG paths, not images

Hand-drawn-style scenes (the reference's wind turbine and solar panel illustrations) are just
`<svg>` with `<path>`/`<line>`/`<circle>` elements using `stroke` only, no `fill` — the sketchy
look comes from irregular, slightly-off-straight line coordinates, not from an image filter.

```tsx
function WindTurbine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 200" className={className} fill="none" stroke="currentColor" strokeWidth={1.5}>
      <line x1="60" y1="200" x2="60" y2="40" />
      <circle cx="60" cy="40" r="3" />
      {/* three blades as slightly curved paths from the hub, not perfectly symmetric */}
      <path d="M60 40 Q45 20 30 5" />
      <path d="M60 40 Q78 22 95 32" />
      <path d="M60 40 Q68 60 55 78" />
    </svg>
  )
}
```

Reuse a small set of these across the page (turbine, panel, generic node/marker) rather than
commissioning unique art per section — the reference reuses the same line weight and style
throughout, which is what makes it read as a system rather than clip art.

## Recipe: animated data flow along an SVG path

A dot travels along a wavy line as you scroll, visualizing "the signal/current moving" —
`offset-path` (CSS Motion Path) is the lightest way to do this, no animation library needed:

```css
.flow-dot {
  offset-path: path('M0 40 Q 60 0 120 40 T 240 40');
  animation: travel 4s linear infinite;
}
@keyframes travel {
  from { offset-distance: 0%; }
  to { offset-distance: 100%; }
}
```

Tie `offset-distance` to scroll progress instead of a fixed animation for a scroll-scrubbed
version (same `gsap.to({ }, { scrollTrigger: { scrub: true } })` pattern as `scroll-animation`,
just animating `offset-distance` as the property instead of `x`/`y`).

## Recipe: data table as plain markup, not a chart image

The reference's generation-mix breakdown (`wind 30% · gas 26% · imports 14% · ...`) is a plain
`<table>`/CSS grid with monospace numerals and a CSS-drawn bar (a `<div>` with `width` set from
the data value) — not a chart library, not a screenshot of a chart.

```tsx
{data.map((row) => (
  <div key={row.label} className="grid grid-cols-[80px_1fr_40px] items-center gap-3 font-mono text-xs">
    <span>{row.label}</span>
    <span className="h-px bg-cream-dim/30">
      <span className="block h-px bg-cream" style={{ width: `${row.percent}%` }} />
    </span>
    <span className="text-right">{row.percent}%</span>
  </div>
))}
```

## Quick reference

| Need | Approach |
|---|---|
| Illustrated scene, no photography budget | Hand-drawn-style SVG `stroke`-only paths, reused across sections |
| A moving indicator along a line | CSS `offset-path`/`offset-distance`, scroll-scrubbed via the same GSAP pattern as `scroll-animation` |
| Simple data visualization | Plain markup + CSS-width bars, not a charting library or chart screenshot |
| System font stack, no web font request | `font-family: ui-monospace, "SF Mono", Menlo, monospace` (or a system sans stack) — zero font requests |
| Absolute minimum request count | Inline `<style>`/`<script>` in the HTML document itself rather than separate `.css`/`.js` files |

## Common mistakes

- **Reaching for a charting library for a handful of data points** — the reference's entire
  generation-mix visualization is ~7 rows of plain markup; a charting library (with its own JS
  weight) is overkill below maybe 20-30 data points or genuine interactivity needs (tooltips,
  zooming) that plain markup can't reasonably provide.
- **Treating "no images" as a constraint to work around rather than the actual creative
  direction** — the illustrated-line aesthetic isn't a compromise version of a photography site,
  it's a distinct, legitimate visual identity; don't apologize for it in the design or half-commit
  by mixing in a few stock photos.
- **Using a web font "just for this one heading"** — defeats the entire premise; the system font
  stack (`ui-sans-serif`, `ui-monospace`) is more than capable of a confident, distinctive look
  at large display sizes, see the reference's own bold system-font headlines.
- **Splitting into separate CSS/JS files "for organization"** — legitimate for a normal app, but
  if the actual goal is the zero/near-zero request count this technique is for, inlining
  everything in one document is the point, not a shortcut to avoid.
