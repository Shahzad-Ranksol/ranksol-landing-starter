---
name: scroll-image-sequence
description: Use when a brief wants a cinematic "camera moves around the building/product" hero effect without real WebGL 3D — a canvas-based scroll-scrubbed image sequence (the Apple product-page technique: pre-rendered frames swapped on scroll, not a video or live 3D scene). Companion recipe skill to scroll-animation and an alternative to r3f-3d-viewer.
version: 1.0
---

# Scroll-Scrubbed Image Sequence — Canvas Frame Playback Tied to Scroll Position

## Overview

Verified against a live reference (deom-estate.vercel.app) via network inspection: its hero
isn't a video or a 3D scene — it's ~150 individually-rendered `.webp` frames
(`frame_0001.webp` … `frame_0150.webp`) drawn one at a time to a `<canvas>`, with the visible
frame chosen by scroll position. This is the same technique Apple's product pages made famous.
It's a legitimate, often-better alternative to `r3f-3d-viewer` when the "3D" look can come from
a pre-rendered camera path (architectural walkthrough render, product turntable) instead of a
scene that needs real-time user-controlled rotation — no WebGL, no GPU/context-loss risk, and
every frame is a plain compressed image.

## When to use

- Brief wants a cinematic "walk into/around the building" or product-turntable hero effect
- The camera path is fixed/pre-determined (a rendered flythrough or turntable), not something
  the user needs to freely orbit — if free orbit control is required, that's `r3f-3d-viewer`
  territory instead
- Client can provide (or you can render) a numbered sequence of frames from Blender/a render
  pipeline, rather than a single interactive `.glb`

Not for: cases needing genuine user-driven rotation/zoom of an object (use `r3f-3d-viewer`), or
where only a handful of frames exist (fewer than ~60-80 frames reads as choppy, not cinematic —
see Common mistakes).

## Core pattern: canvas frame playback driven by scroll progress

```tsx
'use client'
import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const FRAME_COUNT = 150 // must match the actual number of rendered frames exactly
const frameUrl = (i: number) => `/images/hero-sequence/frame_${String(i + 1).padStart(4, '0')}.webp`

export function ScrollSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const images = useRef<HTMLImageElement[]>([])
  const frame = useRef({ index: 0 })

  useEffect(() => {
    images.current = Array.from({ length: FRAME_COUNT }, (_, i) => {
      const img = new Image()
      img.src = frameUrl(i)
      return img
    })
  }, [])

  const draw = (index: number) => {
    const canvas = canvasRef.current
    const img = images.current[index]
    if (!canvas || !img?.complete) return
    const ctx = canvas.getContext('2d')
    ctx?.clearRect(0, 0, canvas.width, canvas.height)
    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
  }

  useGSAP(() => {
    gsap.to(frame.current, {
      index: FRAME_COUNT - 1,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=3000', // total scroll distance the sequence plays across
        scrub: true,
        pin: true,
      },
      onUpdate: () => draw(Math.round(frame.current.index)),
    })
  }, { scope: sectionRef })

  return (
    <div ref={sectionRef} className="relative h-screen">
      <canvas ref={canvasRef} width={1920} height={1080} className="h-full w-full object-cover" />
    </div>
  )
}
```

## Recipe: don't block the pin on every frame loading first

Loading 150 images before the section becomes interactive would delay the whole page. Draw
whatever's loaded so far and let `draw()`'s `img.complete` check naturally skip ahead once each
frame arrives — but *do* eagerly kick off all `Image()` requests immediately (as above) so
they're in flight well before the user scrolls that far, and show the first frame as a static
`poster` image (a normal `next/image`) underneath the canvas until frame 1 finishes loading, so
there's never a blank flash.

## Quick reference

| Need | Approach |
|---|---|
| Cinematic pre-rendered camera path, no free rotation | Canvas image sequence (this skill) |
| User-controlled free orbit/zoom of a model | `r3f-3d-viewer` instead |
| Smooth playback without stutter | `drawImage` on `<canvas>`, not swapping an `<img src>` (avoids layout/repaint per frame) |
| Frame count | Derive `FRAME_COUNT` from the actual delivered asset count — never hardcode a round number |
| Scroll distance to "play" the full sequence | `end: '+=N'` scaled to frame count — more frames needs more scroll distance to stay smooth |

## Common mistakes

- **Hardcoding a frame count higher than what actually exists** — confirmed directly on the
  reference: its code requests `frame_0151.webp` through `frame_0200.webp` every single page
  load, all 404 (50 wasted requests, real count is 150). Get the frame count from the actual
  render output (`ls | wc -l` on the export folder) and use that exact number, or fetch a small
  manifest JSON — never assume a round number like 150 or 200.
- **Swapping an `<img>` element's `src` per frame instead of drawing to canvas** — causes a
  layout/paint per frame at scroll-driven frequency; `drawImage` on a persistent canvas is the
  standard approach because painting a canvas region doesn't trigger layout.
- **Too few frames for the scroll distance** — under ~60-80 frames across a multi-thousand-pixel
  pinned scroll reads as a choppy slideshow, not a smooth camera move; either render more frames
  or shorten the pinned scroll distance to match what the frame count can support smoothly.
- **Not eagerly starting all image loads** — waiting to request frame N until scroll reaches
  frame N means the sequence visibly stalls waiting on network; kick off every frame's request
  as soon as the section mounts (as in the recipe above), the browser's own connection limits
  and caching handle the rest.
- **Shipping frames as PNG instead of a compressed format** — 150 full PNG frames is enormous;
  WebP (as the reference uses) or AVIF keeps per-frame size reasonable — this is the same
  format-choice principle as `perf-web`, just applied to a sequence instead of a single hero image.
