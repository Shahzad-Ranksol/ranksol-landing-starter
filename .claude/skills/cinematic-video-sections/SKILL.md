---
name: cinematic-video-sections
description: Use when a brief references an agency/portfolio-style site with a full-bleed background video, scroll-revealed headline text over that video, or a pinned section that cycles through several cards/panels as you scroll — the "cinematic" layer distinct from photo-driven scroll choreography. Companion recipe skill to scroll-animation.
version: 1.0
---

# Cinematic Video Section Recipes — HLS Background Video, Scroll Text Reveal, Pinned Card Cycling

## Overview

Verified against a live reference (lxlcreative.co.uk, a production agency site) via network
inspection, not just visual inspection. That site is Webflow-built — its actual DOM/JS isn't
directly portable — but three techniques it uses are worth rebuilding in our stack because
they're doing something specifically right that's easy to get wrong:

1. Its full-bleed background video is **adaptive HLS streaming** (Bunny Stream CDN + `hls.js`),
   not a single giant MP4 — confirmed via `.m3u8` playlist requests and a bitrate-tiered
   (`720p/...`) stream in the network log.
2. A headline built from individually-tinted words/phrases brightens progressively as you
   scroll through a **pinned** section, overlaid on that video.
3. A "Services" section pins for a long scroll distance while a stack of cards swaps out
   one-by-one — more than the simple two-panel crossfade in `scroll-animation`'s pin recipe.

## When to use

- Brief wants a "cinematic," video-forward hero or mid-page moment, not just photography
- A pinned section needs to cycle through **more than two** panels/cards, not just A→B
- Any full-bleed background video — even without the other two techniques, the HLS recipe
  below is the correct default over a raw `<video src="huge.mp4">`

Not for: simple autoplay video in a normal (non-background, non-pinned) position — a standard
`<video>` tag is fine there; these recipes are specifically for the *choreographed* cases.

## Recipe: full-bleed background video via adaptive HLS

A single raw MP4 sent to every visitor at one fixed quality is the most common way a "cinematic"
hero becomes a multi-second LCP/bandwidth problem. Use an HLS-capable video host (Mux,
Cloudflare Stream, Bunny Stream) and `hls.js` so the browser adapts bitrate to the connection —
Safari plays HLS natively and skips the library entirely.

```bash
npm install hls.js
```

```tsx
'use client'
import { useEffect, useRef } from 'react'

export function BackgroundVideo({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src // Safari/iOS: native HLS, no library needed
      return
    }
    let hls: import('hls.js').default | undefined
    import('hls.js').then(({ default: Hls }) => {
      if (!Hls.isSupported()) return
      hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(video)
    })
    return () => hls?.destroy()
  }, [src])

  return (
    <video
      ref={videoRef}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      className="absolute inset-0 h-full w-full object-cover"
    />
  )
}
```

`muted` + `playsInline` are not optional — without `muted`, autoplay is blocked on essentially
every browser; without `playsInline`, iOS Safari forces the video into fullscreen instead of
playing inline as a background layer.

## Recipe: scroll-revealed word/phrase highlight over a pinned video

The headline sits fully visible but dim; words brighten in sequence as scroll progress advances
through the pin — reads as the video "speaking" the line as you scroll, not a simple fade-in.

```tsx
// markup: wrap each word/phrase to reveal independently
<h2 ref={headlineRef} className="text-cream-dim">
  {phrases.map((p, i) => (
    <span key={i} className="reveal-word">{p} </span>
  ))}
</h2>
```

```tsx
useGSAP(() => {
  const words = gsap.utils.toArray<HTMLElement>('.reveal-word', headlineRef.current)
  gsap.to(words, {
    color: '#f4eee4', // full brightness
    stagger: 0.15,
    ease: 'none',
    scrollTrigger: {
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=2000', // long pin — this is a reading pace, not a quick reveal
      scrub: true,
      pin: true,
    },
  })
}, { scope: sectionRef })
```

Animate `color` (or `opacity` on a light-on-dark design) rather than a transform — the point is
legibility building word-by-word on top of moving video, not motion.

## Recipe: pinned section cycling through N cards (not just two panels)

`scroll-animation`'s pin recipe covers a two-panel crossfade. This extends it to a card stack of
arbitrary length — the section pins for `cards.length` scroll-steps, swapping the visible card
each step.

```tsx
useGSAP(() => {
  const cards = gsap.utils.toArray<HTMLElement>('.service-card')
  const stepPx = 800 // scroll distance per card — tune per how long each should stay readable

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.current,
      start: 'top top',
      end: () => `+=${cards.length * stepPx}`,
      scrub: true,
      pin: true,
      invalidateOnRefresh: true,
    },
  })

  cards.forEach((card, i) => {
    if (i === 0) return
    tl.fromTo(card, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1 })
      .to(cards[i - 1], { opacity: 0, duration: 0.3 }, '<')
  })
}, { scope: sectionRef })
```

The pinned scroll distance must scale with card count (`cards.length * stepPx`) — a fixed `end`
value that doesn't account for how many cards exist means adding a card either cuts the last one
off or leaves dead scroll space after the pin releases.

## Recipe: shrinking hero logo → compact nav logo

A large wordmark inside the hero crossfades into a small logo that appears in the fixed nav bar
once the hero scrolls past — gives continuity without a persistent oversized logo eating nav space.

```tsx
useGSAP(() => {
  gsap.timeline({
    scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
  })
    .to(heroLogoRef.current, { opacity: 0, scale: 0.8, ease: 'none' })
    .to(navLogoRef.current, { opacity: 1, ease: 'none' }, '<')
}, { scope: heroRef })
```

## Quick reference

| Need | Approach |
|---|---|
| Full-bleed background video | HLS (Mux/Cloudflare Stream/Bunny Stream) + `hls.js`, never a raw single-quality MP4 |
| Background video autoplays cross-browser | `muted` + `playsInline` + `autoPlay`, no exceptions |
| Headline "lights up" over video as you scroll | Per-word `<span>`, `gsap.to(color, { stagger, scrollTrigger: { pin, scrub } })` |
| Pin cycles through 3+ cards, not just 2 | Scroll distance = `cards.length * stepPx`, timeline steps through fromTo pairs |
| Hero logo becomes nav logo on scroll | Crossfade tied to the hero's own `ScrollTrigger`, `end: 'bottom top'` |

## Common mistakes

- **Shipping a single raw MP4 as a full-bleed background** — no adaptive bitrate means slow
  connections either stall or download far more than they can play smoothly. Use HLS/DASH via a
  video host, not a static file host, for anything full-bleed and autoplaying.
- **Missing `playsInline`** — the single most common reason a background video works in Chrome
  desktop testing and then unexpectedly goes fullscreen on an iPhone in review.
- **Fixed pin scroll distance regardless of content length** — hardcoding `end: '+=3000'` when
  the number of cards/words can change means the pin duration silently drifts wrong as content
  changes; derive it from the actual item count.
- **Animating transform for the word-reveal effect** — the legibility signal is color/contrast
  brightening, not position; adding movement on top makes many small pieces of text feel jittery
  rather than building anticipation.
- **Forgetting this is a pattern to rebuild, not code to copy** — a Webflow (or any page-builder)
  reference has no inspectable source matching a Next.js/GSAP implementation; treat it exactly
  like `belgrade-arbor-patterns` treats belgradearbor.rs — verify what it actually does via the
  network tab, then rebuild the pattern in this stack.
