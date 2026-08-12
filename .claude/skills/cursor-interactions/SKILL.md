---
name: cursor-interactions
description: Use when a landing page needs to feel spatial/immersive rather than flat — a custom cursor that replaces the OS pointer with a contextual label, magnetic hover on buttons, or mouse-driven parallax/tilt (the "you're moving inside it" feel, distinct from scroll-driven choreography). Companion recipe skill to interactive-landing-page.
version: 1.0
---

# Cursor Interaction Recipes — Custom Cursor, Magnetic Hover, Mouse Parallax

## Overview

Scroll choreography (`scroll-animation`) and a 3D viewer (`r3f-3d-viewer`) are *discrete*
moments. The "feels like you're present inside it" quality on reference sites like
contentarchitecture.dev comes from something continuous instead: the cursor itself stops being
the OS arrow and becomes a piece of the interface that tracks the mouse in real time, and
elements respond to proximity (not just hover/click). None of this is 3D — it's a hidden native
cursor, a DOM element that follows `mousemove` with a slight smoothed lag, and transforms keyed
to pointer position instead of scroll position.

## When to use

- Brief says "premium," "editorial," "feels alive," "like an Awwwards site," or references a
  site with a custom cursor / spatial-canvas layout
- A dev-tool, agency, or portfolio-style marketing page where personality matters more than
  conversion-funnel conventions (use more sparingly on a straightforward lead-gen real estate
  page — a magnetic CTA button is fine there, hiding the OS cursor site-wide is a bigger swing)

Not for: touch devices — every recipe here is pointer-only and must no-op on touch (see Common
mistakes). Not a replacement for `scroll-animation`'s scroll-scrubbed choreography — this is the
mouse-position axis, scroll is a separate axis; a site can use both.

## Core pattern: custom cursor that replaces the OS pointer

Three parts: hide the real cursor (pointer-fine devices only), track the mouse with a smoothed
follower element, and let hoverable targets declare a contextual label via a data attribute.

```tsx
// components/providers/cursor-provider.tsx
'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const CursorContext = createContext<{ setLabel: (label: string | null) => void } | null>(null)

export function useCursor() {
  const ctx = useContext(CursorContext)
  if (!ctx) throw new Error('useCursor must be used within CursorProvider')
  return ctx
}

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const dotRef = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setEnabled(fine && !reduced)
    if (!fine || reduced) return

    const moveX = gsap.quickTo(dotRef.current, 'x', { duration: 0.35, ease: 'power3' })
    const moveY = gsap.quickTo(dotRef.current, 'y', { duration: 0.35, ease: 'power3' })
    const onMove = (e: MouseEvent) => { moveX(e.clientX); moveY(e.clientY) }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <CursorContext.Provider value={{ setLabel }}>
      {children}
      {enabled && (
        <div
          ref={dotRef}
          className="pointer-events-none fixed left-0 top-0 z-[999] -translate-x-1/2 -translate-y-1/2"
        >
          {label && (
            <span className="rounded bg-white/90 px-2 py-1 text-xs font-mono text-black">
              {label}
            </span>
          )}
        </div>
      )}
    </CursorContext.Provider>
  )
}
```

```css
/* globals.css — only hide the real cursor when the custom one is active */
@media (pointer: fine) {
  html.custom-cursor-active, html.custom-cursor-active * { cursor: none; }
}
```

Toggle the `custom-cursor-active` class on `<html>` from the same effect that sets `enabled`,
so touch/reduced-motion users keep the normal OS cursor entirely — don't ship `cursor: none`
unconditionally in CSS.

## Recipe: contextual label on hover

```tsx
'use client'
import { useCursor } from '@/components/providers/cursor-provider'

export function ExploreZone({ children }: { children: React.ReactNode }) {
  const { setLabel } = useCursor()
  return (
    <div onMouseEnter={() => setLabel('CLICK')} onMouseLeave={() => setLabel(null)}>
      {children}
    </div>
  )
}
```

Reserve the label for empty/ambient canvas areas that *are* clickable but don't look like a
button — that's what makes it feel like discovery rather than a UI tooltip. Over actual `<a>`/
`<button>` elements, clear the label (`setLabel(null)`) and let the normal hover state (color
change, underline) carry the affordance instead — a text label over a button that already looks
clickable is redundant.

## Recipe: magnetic hover (button pulls toward the cursor)

```tsx
'use client'
import { useRef } from 'react'
import gsap from 'gsap'

export function MagneticButton({ children, strength = 0.4 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLButtonElement>(null)

  return (
    <button
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current!
        const rect = el.getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width / 2) * strength
        const y = (e.clientY - rect.top - rect.height / 2) * strength
        gsap.to(el, { x, y, duration: 0.3, ease: 'power2.out' })
      }}
      onMouseLeave={() => gsap.to(ref.current, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' })}
    >
      {children}
    </button>
  )
}
```

The `elastic.out` ease on release (spring back past center, settle) is what sells it — a linear
ease back to `(0,0)` feels mechanical instead of magnetic.

## Recipe: mouse-driven parallax (cursor axis, not scroll axis)

```tsx
useGSAP(() => {
  const layers = gsap.utils.toArray<HTMLElement>('[data-mouse-depth]')
  const moveLayers = (x: number, y: number) => {
    layers.forEach((el) => {
      const depth = parseFloat(el.dataset.mouseDepth || '0.1')
      gsap.to(el, { x: x * depth, y: y * depth, duration: 0.6, ease: 'power3.out' })
    })
  }
  const onMove = (e: MouseEvent) => {
    moveLayers(e.clientX - window.innerWidth / 2, e.clientY - window.innerHeight / 2)
  }
  window.addEventListener('mousemove', onMove)
  return () => window.removeEventListener('mousemove', onMove)
}, { scope: containerRef })
```

Keep this and `scroll-animation`'s scroll-scrubbed parallax on separate transform properties
where possible (or combine deliberately in one tween) — two independent effects both driving
plain `x`/`y` on the same element will fight and jitter.

## Recipe: mouse-driven camera drift in the 3D viewer

Ties into `r3f-3d-viewer` — R3F already normalizes pointer position to `[-1, 1]` via
`state.pointer`, so a subtle "look toward the cursor" drift is a few lines inside the scene's
`useFrame`, not a new input system:

```tsx
useFrame((state) => {
  const targetX = state.pointer.x * 0.3
  const targetY = state.pointer.y * 0.2
  state.camera.position.x += (targetX - state.camera.position.x) * 0.05
  state.camera.position.y += (targetY - state.camera.position.y) * 0.05
  state.camera.lookAt(0, 0, 0)
})
```

Keep the multiplier small (`0.3`/`0.2` above) — this is meant to read as the scene subtly
"noticing" the cursor, not as camera control; anything stronger fights `OrbitControls`.

## Quick reference

| Need | Approach |
|---|---|
| Replace OS cursor with a custom one | `cursor: none` (pointer-fine only) + a fixed div driven by `gsap.quickTo` |
| Cursor shows context (“CLICK”, “DRAG”) | `data`/context-driven label, cleared over native buttons/links |
| Button feels pulled toward the mouse | Track `mousemove` within bounding box, `elastic.out` release |
| Background drifts opposite/with the mouse | Separate `mousemove` listener, per-layer `depth` multiplier |
| 3D scene "notices" the cursor | `state.pointer` in `useFrame`, small lerp toward camera position |
| Respect touch / accessibility | `matchMedia('(pointer: fine)')` and `(prefers-reduced-motion: reduce)` gate everything above |

## Common mistakes

- **Hiding the cursor unconditionally** — touch devices have no mouse cursor to hide and no
  `mousemove` events to replace it with; gate every recipe here behind
  `matchMedia('(pointer: fine)')` or touch users get no visible pointer feedback at all.
- **Ignoring `prefers-reduced-motion`** — magnetic pull and parallax are exactly the class of
  motion that setting exists to suppress; check it alongside the pointer check, not instead of it.
- **Forgetting `pointer-events: none`** on the custom cursor element — without it, the follower
  div itself intercepts clicks meant for whatever's underneath it.
- **Setting inline styles directly in the `mousemove` handler** instead of through
  `gsap.quickTo`/a rAF loop — fires a style write on every single event at native mouse
  sampling rate, which is a measurable jank source; `quickTo` batches into GSAP's ticker.
- **Applying `cursor: none` globally in CSS** rather than toggling a class after the JS
  pointer/reduced-motion check — causes a flash of no-cursor on load, and permanently breaks
  the cursor for anyone the JS check should have excluded if the script fails to run.
- **Leaving the label cursor active over text inputs** — replace it with the normal `text`
  cursor (or just don't suppress the OS cursor) over any `<input>`/`<textarea>`, or users lose
  the caret-position affordance while typing.
- **Making the magnetic radius the whole viewport** — magnetic pull should trigger only within
  (or just outside) the element's own bounding box; a page-wide magnetic radius makes every
  button drift constantly and feels chaotic rather than tactile.
