---
name: floor-plan-viewer
description: Use when a real-estate/architecture landing page needs an interactive 2D floor plan — clickable rooms showing dimensions/labels, or a unit-selector overlay on a building floor plate. Distinct from r3f-3d-viewer (a 3D building model) and scroll-image-sequence (a rendered camera path) — this is a flat plan image or SVG with clickable hotspot regions. Companion recipe skill to interactive-landing-page.
version: 1.0
---

# Floor Plan Viewer Recipes — Clickable Rooms, Unit Overlays, Dimension Callouts

## Overview

The 3D building viewer (`r3f-3d-viewer`) answers "what does the building look like." A floor
plan answers "what does *this specific unit* look like from above, and what are the room
dimensions" — buyers expect both, and they're different UI problems. A floor plan is a flat
image (architect's export, usually SVG or a high-res raster) with clickable regions overlaid —
not a 3D scene, no WebGL needed.

## When to use

- A unit/residence detail view needs a plan showing room layout, not just a photo gallery
- "Click a room to see its dimensions/name" interaction
- A floor selector where clicking a unit's footprint on a shared floor plate opens that unit's
  detail (the plan-view equivalent of `r3f-3d-viewer`'s hotspot markers)

Not for: the whole-building exterior view (`r3f-3d-viewer` or `scroll-image-sequence`) or a
photographic walkthrough of a finished space (`virtual-tour-360`) — this is specifically the
flat, technical, dimensioned-drawing view.

## Core pattern: SVG plan with clickable room regions

Prefer SVG over a raster image with absolutely-positioned hotspot divs when the architect can
provide one — room boundaries scale losslessly and hit-testing is exact (click the actual room
shape, not a rectangle approximating it). If only a raster plan exists, fall back to the
percentage-positioned hotspot pattern from `interactive-map`.

```tsx
'use client'
import { useState } from 'react'

type Room = { id: string; name: string; sqm: number; path: string } // path = SVG <path> d attribute

const rooms: Room[] = [
  { id: 'living', name: 'Living Room', sqm: 32, path: 'M10 10 L200 10 L200 150 L10 150 Z' },
  { id: 'kitchen', name: 'Kitchen', sqm: 14, path: 'M200 10 L320 10 L320 150 L200 150 Z' },
  // ...one entry per room, path traced from the architect's plan
]

export function FloorPlan({ planWidth, planHeight }: { planWidth: number; planHeight: number }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = rooms.find((r) => r.id === activeId)

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${planWidth} ${planHeight}`} className="w-full">
        {/* architect's plan as a background image inside the same viewBox */}
        <image href="/plans/unit-2br-a.svg" width={planWidth} height={planHeight} />
        {rooms.map((room) => (
          <path
            key={room.id}
            d={room.path}
            fill={activeId === room.id ? 'rgba(193,112,74,0.35)' : 'transparent'}
            stroke={activeId === room.id ? '#c1704a' : 'transparent'}
            strokeWidth={2}
            className="cursor-pointer transition-colors hover:fill-[rgba(193,112,74,0.2)]"
            onClick={() => setActiveId(room.id)}
          />
        ))}
      </svg>
      {active && (
        <div className="absolute bottom-4 left-4 border border-ink-line bg-ink/90 p-4 backdrop-blur-sm">
          <p className="font-display text-lg text-cream">{active.name}</p>
          <p className="font-mono text-xs text-cream-dim">{active.sqm} m²</p>
        </div>
      )}
    </div>
  )
}
```

Tracing each room's `path` by hand from a plan is the realistic cost here — budget time for it,
or ask whoever exports the plan from CAD/Revit/Illustrator to export room boundaries as named
paths directly (most architecture software can export per-layer SVG, which turns this from
manual tracing into a data-extraction task).

## Recipe: raster fallback (percentage hotspots)

When only a flattened image (PNG/JPG) exists, no separable room paths:

```tsx
const rooms = [
  { id: 'living', name: 'Living Room', sqm: 32, x: 15, y: 20, w: 35, h: 40 }, // percentages
]

<div className="relative">
  <Image src="/plans/unit-2br-a.png" fill className="object-contain" alt="Floor plan" />
  {rooms.map((r) => (
    <button
      key={r.id}
      style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%` }}
      className="absolute border-2 border-transparent hover:border-clay/60"
      onClick={() => setActiveId(r.id)}
    />
  ))}
</div>
```

Rectangular hit-areas only — accept the imprecision (an L-shaped room's hotspot rectangle will
overlap its neighbor slightly) unless the architect can provide the SVG version instead.

## Recipe: unit selector on a shared floor plate

Same click-a-region pattern, but each region is a whole unit (not a room) and clicking navigates
to that unit's detail page/section instead of showing an inline dimension callout — reuses
`cms-content-model`'s `unit` schema (`floorPlan` field) as the data source for which plan image
and which unit IDs to render.

```tsx
<Link key={unit.id} href={`/residences/${unit.id}`}>
  <path d={unit.footprintPath} className="cursor-pointer hover:fill-clay/20" />
</Link>
```

## Quick reference

| Need | Approach |
|---|---|
| Architect can export per-room SVG | SVG `<path>` regions, exact hit-testing |
| Only a flattened raster plan exists | Percentage-positioned rectangular hotspots (`interactive-map` pattern) |
| Click a unit on a shared floor plate | Same hotspot pattern, region links to the unit's own page instead of a callout |
| Room dimension data | Store alongside `cms-content-model`'s unit/floor schema, not hardcoded in the component |

## Common mistakes

- **Tracing room paths against a raster image at the wrong scale** — the SVG `viewBox` must
  match the plan image's actual proportions, or hotspots drift from the rooms they're meant to
  cover as the plan is displayed at different sizes.
- **Rectangular hotspots for non-rectangular rooms** — acceptable as a fallback, but don't
  present it as equivalent to real per-room paths; an L-shaped kitchen's rectangle hotspot will
  visibly overlap the hallway next to it.
- **Hardcoding room data in the component** — dimensions/names belong in the content model
  (`cms-content-model`) alongside the rest of the unit data, not as a literal array in the
  component file; a floor plan without room-name changes going through the CMS defeats the
  point of having one.
- **No fallback for missing plan assets** — a unit without a floor plan yet (pre-launch,
  architect still finalizing) should degrade to "Floor plan coming soon," not a broken image.
