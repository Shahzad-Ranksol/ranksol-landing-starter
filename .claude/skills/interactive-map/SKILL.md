---
name: interactive-map
description: Use when a landing page needs a location section with custom POI markers and a walk/drive-time panel — Mapbox GL JS (or Google Maps) setup in Next.js App Router, custom marker/popup styling, and static vs live distance data. Companion recipe skill to interactive-landing-page.
version: 1.0
---

# Interactive Map Recipes — Mapbox GL JS, Custom POI Markers, Distance/Time Panel

## Overview

The location section on a premium marketing site is rarely a stock embedded map — it's a
branded map style with custom-designed POI markers (schools, transit, shopping) and a
distance/time panel that sells the location. Default to **Mapbox GL JS** via `react-map-gl`
(matches the studio-stack starters referenced in `interactive-landing-page`); Google Maps is
the fallback when the client has an existing Google-only account/billing relationship.

## When to use

- Location/neighborhood section with the site pin plus nearby points of interest
- Any panel showing walk/drive time to schools, transit, shopping, etc.

Not for: the 3D building viewer (`r3f-3d-viewer`) — a 2D map and a 3D scene are unrelated
libraries even though both are "interactive."

## Core pattern: map mounted client-only, styled container

Mapbox GL touches `window`/WebGL, same constraint as R3F — never let it run server-side.

```bash
npm install react-map-gl mapbox-gl
npm install -D @types/mapbox-gl
```

```tsx
// components/sections/LocationMap.tsx
'use client'
import Map, { NavigationControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { PoiMarker } from './PoiMarker'
import { pois } from '@/lib/data/pois'

export function LocationMap() {
  return (
    <div className="h-[600px] w-full overflow-hidden rounded-2xl">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{ longitude: 20.4573, latitude: 44.7866, zoom: 14 }}
        mapStyle="mapbox://styles/mapbox/light-v11" // swap for a client-branded custom style
      >
        <NavigationControl position="top-right" />
        {pois.map((poi) => (
          <PoiMarker key={poi.id} poi={poi} />
        ))}
      </Map>
    </div>
  )
}
```

If the section is below the fold, wrap it in `next/dynamic({ ssr: false })` the same way as the
3D viewer (see `perf-web`) — a map SDK is heavy enough to keep off the initial bundle.

## Recipe: custom marker + popup

```tsx
// components/sections/PoiMarker.tsx
'use client'
import { useState } from 'react'
import { Marker, Popup } from 'react-map-gl/mapbox'
import type { Poi } from '@/lib/data/pois'

const CATEGORY_ICON: Record<Poi['category'], string> = {
  school: '/icons/school.svg',
  transit: '/icons/transit.svg',
  shopping: '/icons/shopping.svg',
}

export function PoiMarker({ poi }: { poi: Poi }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Marker longitude={poi.lng} latitude={poi.lat} onClick={(e) => { e.originalEvent.stopPropagation(); setOpen(true) }}>
        <img src={CATEGORY_ICON[poi.category]} alt={poi.category} className="h-8 w-8 cursor-pointer drop-shadow" />
      </Marker>
      {open && (
        <Popup longitude={poi.lng} latitude={poi.lat} onClose={() => setOpen(false)} closeOnClick={false} offset={16}>
          <p className="font-semibold">{poi.name}</p>
          <p className="text-sm text-muted-foreground">{poi.walkMinutes} min walk · {poi.driveMinutes} min drive</p>
        </Popup>
      )}
    </>
  )
}
```

## Recipe: static vs live distance data

Prefer **static, client-curated walk/drive times** over a live Directions API call for a
marketing page: it's zero-latency, zero ongoing API cost, and the client typically already
knows (or wants to control) the exact framing ("8 min to the international school").

```ts
// lib/data/pois.ts
export type Poi = {
  id: string
  name: string
  category: 'school' | 'transit' | 'shopping'
  lat: number
  lng: number
  walkMinutes: number
  driveMinutes: number
}

export const pois: Poi[] = [
  { id: 'poi-1', name: 'International School', category: 'school', lat: 44.79, lng: 20.46, walkMinutes: 8, driveMinutes: 3 },
  // ...client-supplied list
]
```

Only reach for the **Mapbox Directions API** (or Google Distance Matrix) if times must stay
accurate as the site/roads change — call it at build time (a script that regenerates
`pois.ts`/CMS entries) or via an ISR-revalidated server function, never client-side per-render
(rate limits, cost, and a visible delay before times appear).

## Recipe: distance/time panel (list view alongside the map)

```tsx
export function PoiList({ pois, activeId, onSelect }: { pois: Poi[]; activeId?: string; onSelect: (id: string) => void }) {
  return (
    <ul className="space-y-2">
      {pois.map((poi) => (
        <li key={poi.id}>
          <button
            onClick={() => onSelect(poi.id)}
            className={poi.id === activeId ? 'font-semibold text-brand' : ''}
          >
            {poi.name} — {poi.walkMinutes} min walk
          </button>
        </li>
      ))}
    </ul>
  )
}
```

Sync `activeId` with the map (fly the map to the POI's coordinates on selection, highlight the
matching marker) so the list and map feel like one component, not two.

## Quick reference

| Need | Approach |
|---|---|
| Keep map SDK off initial bundle | `dynamic(..., { ssr: false })` on the section, same as 3D |
| Branded map look | Custom Mapbox Studio style URL instead of a stock `mapbox://styles/mapbox/*` |
| Walk/drive time | Static, client-curated data by default — see `lib/data/pois.ts` |
| Marker click → detail | `Marker onClick` + `Popup`, or sync with an external list panel |
| Token exposure | `NEXT_PUBLIC_MAPBOX_TOKEN` — Mapbox tokens are meant to be public, but URL-restrict them in the Mapbox account dashboard |

## Common mistakes

- **Rendering the map during SSR** — crashes on `window` not existing. `'use client'` plus a
  dynamic import with `ssr: false` for anything below the fold.
- **Missing container height** — a Mapbox/Google map with no explicit height on its container
  renders blank (0px tall). Always give the wrapper a fixed or viewport-relative height.
- **Calling a live Directions/Distance Matrix API per page load** — unnecessary cost, latency,
  and rate-limit risk for numbers that change rarely. Precompute and store instead.
- **Re-creating the map instance on every render** — if not using `react-map-gl` (which handles
  this), a raw `mapbox-gl` integration must create the `Map` instance once in a ref/effect and
  `.remove()` it on unmount, or navigating away/back leaks map instances.
- **Treating the Mapbox token like a secret** — it's meant to be public (`NEXT_PUBLIC_`
  prefix is correct); the actual control is URL/referrer restriction in the Mapbox dashboard,
  not hiding the token.
