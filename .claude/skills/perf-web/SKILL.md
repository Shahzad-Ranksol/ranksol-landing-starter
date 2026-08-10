---
name: perf-web
description: Use during polish, or any time an image- or 3D-heavy section is being built, on a Next.js marketing/landing site — next/image sizing and priority loading, keeping the 3D bundle off the critical path, font loading without layout shift, bundle discipline, and a Lighthouse/Core Web Vitals budget. Companion recipe skill to interactive-landing-page.
version: 1.0
---

# Web Performance Recipes — Images, 3D-off-critical-path, Fonts, Bundle, CWV Budget

## Overview

What separates "looks nice" from "feels professional" on a heavy scroll/3D marketing site is
almost entirely three Core Web Vitals: **LCP** (hero image/text paints late), **CLS** (unsized
media/fonts shift layout), and **INP** (too much client JS, often the 3D bundle blocking the
main thread). Fix those three before any other polish — they're what a visitor actually feels.

## When to use

- Adding any hero/above-the-fold image
- Adding or reviewing the 3D viewer route (`r3f-3d-viewer`) or any other heavy client module
- Pre-launch polish pass, or investigating a slow/janky page

## Recipe: hero image (the LCP asset) — eager, sized, no shift

```tsx
import Image from 'next/image'

<div className="relative h-screen w-full">
  <Image
    src="/images/hero.jpg"
    alt="Descriptive alt text"
    fill
    priority          // eager-load + preload hint — reserve for the ONE LCP image
    sizes="100vw"
    className="object-cover"
  />
</div>
```

Everything below the fold — default lazy loading, just supply `sizes` so the browser doesn't
fetch an oversized file for a small slot:

```tsx
<Image
  src="/images/amenity.jpg"
  alt="Descriptive alt text"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

`next.config.ts` — serve modern formats with a browser-appropriate fallback chain:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 31536000,
    // remotePatterns: [{ protocol: 'https', hostname: 'cdn.example.com', pathname: '/**' }],
  },
}
export default nextConfig
```

Rules that prevent the classic mistakes:

- `sizes` is not optional on a responsive image — without it the browser may guess a viewport
  width and pull a 1920px file into a 400px slot.
- Reserve eager/priority loading for the single LCP image; marking several images priority just
  eager-loads the whole page and defeats the point.
- Always give real dimensions (`width`/`height`, or `fill` on a sized parent) — an unsized image
  is the most common source of layout shift on a content-heavy page.
- Drop source images in `public/images/`; `next/image` handles format conversion and resizing —
  don't hand-generate WebP/AVIF variants yourself.

## Recipe: keep the 3D bundle off the critical path

Same pattern documented in `r3f-3d-viewer` — repeated here because it's a *performance*
requirement, not just an SSR-compatibility one:

```tsx
import dynamic from 'next/dynamic'

const BuildingViewer = dynamic(() => import('@/components/three/BuildingViewer'), {
  ssr: false,
  loading: () => <div className="grid h-screen place-items-center">Loading 3D…</div>,
})
```

Apply the same dynamic-import treatment to any other heavy client-only module: interactive maps,
video players, chart libraries. The marketing pages paint instantly; the heavy module streams in
only when its route/section is actually reached.

## Recipe: fonts without layout shift

```tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' })
// <body className={inter.className}>
```

`next/font` self-hosts and preloads the font at build time — it eliminates the extra
render-blocking request and the font-swap layout jump that a hand-written `<link>` to a Google
Fonts CSS URL causes. Never add that `<link>` tag manually alongside it.

## Bundle discipline

- Server Components by default; add `'use client'` only on the specific leaf that needs
  state/effects/events/animation/3D — every unnecessary `'use client'` boundary pulls more JS
  into the browser bundle and hurts INP.
- Install `@next/bundle-analyzer` and run an analyzed build (`ANALYZE=true npm run build`)
  before shipping a new heavy dependency, to see what it actually costs.
- Common bloat sources: a full date library where a slim one covers the need, importing an
  entire icon set instead of individual icons, importing a whole utility library instead of the
  specific functions used.

## Lighthouse / Core Web Vitals budget

Gate before shipping — test **mobile**, not desktop (desktop numbers are always rosier than
real-world usage):

| Metric | Target |
|---|---|
| Performance score | ≥ 90 |
| LCP | < 2.5s |
| CLS | < 0.1 |
| INP | < 200ms |

Run DevTools → Lighthouse → Performance, mobile throttling, and spot-check on an actual
mid-range phone if possible. Once deployed, watch **Vercel Analytics** (or equivalent
real-user-monitoring) for real Core Web Vitals over time — a clean dev-machine Lighthouse run
does not guarantee real-user numbers.

## Quick reference

| Symptom | Likely fix |
|---|---|
| Slow LCP | Hero image missing `priority`/`sizes`, or LCP element is client-rendered text waiting on JS |
| Layout jump on load | Image without `width`/`height`/`fill`+sized parent, or font without `next/font` |
| Slow/high INP, janky scroll | Too much `'use client'`, 3D bundle not dynamic-imported, animating `top`/`left` instead of `transform` (see `scroll-animation`) |
| Big JS bundle | Run bundle analyzer; check for a heavy dependency with a lighter alternative |
| Build succeeds, page crashes at runtime | 3D/map/other browser-only module imported without `ssr: false` |

## Common mistakes

- **Green Lighthouse in dev, slow in production** — dev-server timings don't reflect production
  bundling/caching; always measure against a production build (`next build && next start`) or
  the deployed preview.
- **Marking every image `priority`** — eager-loads the entire page's images at once, which is
  just a slower version of not lazy-loading anything.
- **3D/map component statically imported or left server-rendered** — tanks LCP at best, crashes
  the build at worst (see `r3f-3d-viewer` for the SSR-off pattern).
- **Hand-rolling minification or Tailwind purging** — `next build` and Tailwind's build already
  do this; don't add redundant tooling.
- **Shipping unresized source images** — a multi-megabyte render/photo straight from the client
  bloats every derived size `next/image` generates; downsize the source before it enters the repo.
