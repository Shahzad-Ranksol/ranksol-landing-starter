---
name: scroll-animation
description: Use when building a Next.js/React marketing page that needs smooth-scroll (Lenis), scroll-linked choreography (GSAP ScrollTrigger — pinned sections, horizontal scroll, parallax, intro counters), or reveal-on-scroll micro-interactions (Framer Motion). Companion recipe skill to interactive-landing-page.
version: 1.0
---

# Scroll Animation Recipes — Lenis + GSAP ScrollTrigger + Framer Motion

## Overview

Three libraries, three jobs — don't blur them:

- **Lenis** — smooth-scroll only. Intercepts the wheel/touch and interpolates scroll position.
- **GSAP + ScrollTrigger** (`@gsap/react`'s `useGSAP` hook) — scroll-linked *choreography*: pin a
  section, scrub a timeline against scroll position, horizontal scroll, parallax layers.
- **Framer Motion** — simple *reveal* micro-interactions (fade/slide in when a section enters
  the viewport). Don't use it for scroll-scrubbed animation — that's ScrollTrigger's job.

⚠️ The old `@studio-freight/lenis` and `@studio-freight/react-lenis` packages are retired.
Use `lenis` (import from `lenis/react`) — same team, new home.

## When to use

- Intro loader with a 0→100% counter before reveal
- Parallax background/foreground layers on scroll
- A section that pins in place while inner content animates (pinned/scrubbed)
- Horizontal-scrolling section driven by vertical scroll
- Generic "fade/slide up when scrolled into view" reveals

Not for: 3D scene interaction (see `r3f-3d-viewer`), route transitions (Framer Motion
`AnimatePresence` at the layout level instead).

## Core Pattern: wire Lenis into GSAP's ticker

GSAP's ScrollTrigger reads the *native* scroll position. Since Lenis intercepts scroll, you must
sync Lenis's `scroll` event to `ScrollTrigger.update()`, and drive Lenis's raf loop from GSAP's
ticker (one rAF loop, not two fighting each other).

```tsx
// app/providers/lenis-provider.tsx
'use client'
import { ReactLenis, useLenis } from 'lenis/react'
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenis = useLenis(ScrollTrigger.update) // fires on every Lenis scroll tick

  useEffect(() => {
    function raf(time: number) {
      lenis?.raf(time * 1000) // Lenis wants ms; gsap ticker gives seconds
    }
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0) // let Lenis own smoothing, avoid double-smoothing jank
    return () => gsap.ticker.remove(raf)
  }, [lenis])

  return <ReactLenis root options={{ autoRaf: false }}>{children}</ReactLenis>
}
```

Mount once in `app/layout.tsx`, wrapping `{children}`. `autoRaf: false` is required — otherwise
Lenis runs its own rAF loop *and* GSAP drives it, doubling updates.

## Recipe: intro 0→100 counter

```tsx
'use client'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'

export function IntroCounter({ onDone }: { onDone: () => void }) {
  const counterRef = useRef<HTMLSpanElement>(null)
  const obj = useRef({ val: 0 })

  useGSAP(() => {
    gsap.to(obj.current, {
      val: 100,
      duration: 2.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (counterRef.current) counterRef.current.textContent = String(Math.floor(obj.current.val))
      },
      onComplete: onDone,
    })
  }, [])

  return <span ref={counterRef}>0</span>
}
```

`useGSAP` (from `@gsap/react`) auto-reverts and cleans up tweens/ScrollTriggers on unmount —
use it instead of raw `useEffect` for any GSAP work in React, or you'll leak ScrollTriggers on
every navigation/HMR reload.

## Recipe: parallax layers

```tsx
useGSAP(() => {
  gsap.utils.toArray<HTMLElement>('[data-parallax-speed]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallaxSpeed || '0.5')
    gsap.to(el, {
      yPercent: -30 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: el.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true, // ties progress directly to scroll position, not time
      },
    })
  })
}, { scope: containerRef })
```

`scrub: true` (or a number, e.g. `1` for a slight catch-up delay) is what makes it
scroll-*driven* rather than a one-shot animation.

## Recipe: pinned section

```tsx
useGSAP(() => {
  ScrollTrigger.create({
    trigger: sectionRef.current,
    start: 'top top',
    end: '+=1500', // pin for 1500px of scroll
    pin: true,
    scrub: 1,
    animation: gsap.timeline().to('.panel-1', { opacity: 0 }).to('.panel-2', { opacity: 1 }),
  })
}, { scope: sectionRef })
```

## Recipe: horizontal scroll section

```tsx
useGSAP(() => {
  const track = trackRef.current!
  const distance = track.scrollWidth - window.innerWidth

  gsap.to(track, {
    x: -distance,
    ease: 'none',
    scrollTrigger: {
      trigger: sectionRef.current,
      start: 'top top',
      end: () => `+=${distance}`,
      pin: true,
      scrub: true,
      invalidateOnRefresh: true, // recompute distance on resize
    },
  })
}, { scope: sectionRef })
```

## Recipe: reveal-on-scroll (Framer Motion)

```tsx
import { motion } from 'framer-motion'

export function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15% 0px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

`viewport={{ once: true }}` avoids re-triggering on scroll-up; `margin` fires the reveal
slightly before the element is fully in view so it doesn't feel late.

## Quick reference

| Need | Tool |
|---|---|
| Smooth wheel/touch scroll | Lenis |
| Scroll position drives a tween's progress | GSAP ScrollTrigger `scrub` |
| Section stays fixed while content changes | ScrollTrigger `pin: true` |
| Vertical scroll → horizontal movement | ScrollTrigger + `x` tween, `pin: true` |
| Simple fade/slide when entering viewport | Framer Motion `whileInView` |
| Cleanup on unmount/route change | `useGSAP` (not raw `useEffect`) |

## Common mistakes

- **Double rAF loops** — forgetting `autoRaf: false` on `ReactLenis` while also driving it from
  `gsap.ticker` causes stutter (two loops updating scroll).
- **`useEffect` instead of `useGSAP`** — raw `useEffect` doesn't auto-revert tweens/triggers,
  so ScrollTriggers pile up across HMR reloads and route changes, causing jumpy pins.
- **Missing `ScrollTrigger.refresh()`** after content loads asynchronously (images, CMS data) —
  pin/scrub distances get computed against the wrong document height. Call it in an
  `onLoad`/data-ready effect, or set `invalidateOnRefresh: true` on resize-sensitive triggers.
- **SSR crash** — Lenis/GSAP touch `window`/`document`. Mark provider files `'use client'` and
  never call `gsap.registerPlugin(ScrollTrigger)` at module scope in a file that's imported
  server-side.
- **Importing `@studio-freight/*`** — retired. Use `lenis` / `lenis/react`.
- **Animating `top`/`left` instead of `transform`** — kills performance on scroll-scrubbed
  tweens. Use `x`/`y`/`yPercent` (GSAP) so the browser compositor handles it.
