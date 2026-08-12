---
name: cms-content-model
description: Use when deciding and building the content model for a landing/marketing site's structured data — unit, floor, availability, POI, amenity — as Sanity or Payload schemas, or as static JSON when no CMS is warranted. Companion recipe skill to interactive-landing-page.
version: 1.0
---

# CMS Content Model Recipes — Sanity/Payload Schemas, Static JSON Fallback

## Overview

A premium landing site's *marketing copy* can live in JSX/message files, but its *structured,
repeating* data — units, floors, availability, amenities, POIs — needs a real content model so
non-developers can update it without a code deploy. Default to **Sanity** (matches the Satus
starter referenced in `interactive-landing-page`); **Payload** is the alternative when the
client wants a self-hosted CMS with its own Postgres database instead of a hosted SaaS.

## When to use

- Any data that repeats (units, floors, POIs, amenities) and needs an editor UI for non-devs
- Deciding whether this project even needs a CMS, vs. static JSON

Not for: one-off marketing copy (hero headline, about text) — that's fine hardcoded in
components or in `next-intl` message files (`i18n-nextintl`) even on a CMS-backed project.

## Decision: CMS vs static JSON

| Signal | Choice |
|---|---|
| Non-technical staff will update availability/prices regularly | CMS (Sanity/Payload) |
| Content changes rarely, only via a dev/agency deploy | Static JSON in `lib/data/` |
| Client wants hosted editor UI with no infra to manage | Sanity |
| Client wants self-hosted, owns the database | Payload |

Model static JSON with the **same shape** as the CMS documents below even if a CMS isn't used
initially — migrating later becomes a data-mapping exercise, not a rewrite.

## Core pattern: Sanity schema

```bash
npm create sanity@latest -- --template clean --typescript
npm install next-sanity
```

```ts
// sanity/schemaTypes/floor.ts
import { defineField, defineType } from 'sanity'

export const floor = defineType({
  name: 'floor',
  title: 'Floor',
  type: 'document',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'level', title: 'Level (numeric, for sorting)', type: 'number', validation: (r) => r.required() }),
    defineField({ name: 'planImage', title: 'Floor Plan Image', type: 'image' }),
  ],
})
```

```ts
// sanity/schemaTypes/unit.ts
import { defineField, defineType } from 'sanity'

export const unit = defineType({
  name: 'unit',
  title: 'Unit',
  type: 'document',
  fields: [
    defineField({ name: 'number', title: 'Unit Number', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'floor', title: 'Floor', type: 'reference', to: [{ type: 'floor' }] }),
    defineField({ name: 'sizeSqm', title: 'Size (m²)', type: 'number' }),
    defineField({ name: 'bedrooms', title: 'Bedrooms', type: 'number' }),
    defineField({ name: 'price', title: 'Price', type: 'number' }),
    defineField({
      name: 'availability',
      title: 'Availability',
      type: 'string',
      options: { list: ['available', 'reserved', 'sold'], layout: 'radio' },
      initialValue: 'available',
    }),
    defineField({ name: 'floorPlan', title: 'Unit Floor Plan', type: 'image' }),
  ],
})
```

```ts
// sanity/schemaTypes/poi.ts + amenity.ts follow the same shape as lib/data/pois.ts
// in `interactive-map` / a simple name+description+icon shape — keep both in sync if
// migrating a static POI list into Sanity later.
```

Register every type in `sanity/schemaTypes/index.ts` and point `sanity.config.ts` at it — the
scaffolding CLI wires this by default, just add new files to the array.

## Recipe: querying from Next.js (GROQ + typegen)

```ts
// lib/sanity/client.ts
import { createClient } from 'next-sanity'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2025-01-01',
  useCdn: true, // fast, cached reads — set false only for draft/preview mode
})
```

```ts
// lib/sanity/queries.ts
import { sanityClient } from './client'
import { groq } from 'next-sanity'

export async function getAvailableUnits() {
  return sanityClient.fetch(groq`
    *[_type == "unit" && availability == "available"] | order(floor->level asc, number asc) {
      _id, number, sizeSqm, bedrooms, price, availability,
      "floorLabel": floor->label,
      "floorPlanUrl": floorPlan.asset->url
    }
  `)
}
```

Call `getAvailableUnits()` from a Server Component — no client bundle cost, and it composes with
Next's caching (`fetch`-based revalidation, or explicit `revalidate` export on the route).

## Recipe: revalidate on publish (webhook → ISR)

```ts
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret')
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }
  const { _type } = await req.json()
  revalidateTag(_type) // tag your fetches with the document _type to scope invalidation
  return NextResponse.json({ revalidated: true })
}
```

Configure a Sanity webhook (Manage → API → Webhooks) to POST here on document publish, so
editors see changes live within seconds instead of waiting for the next full deploy/ISR window.

## Static JSON fallback (no CMS)

```ts
// lib/data/units.ts — same field shape as the Sanity `unit` document
export type Unit = {
  id: string
  number: string
  floorLabel: string
  sizeSqm: number
  bedrooms: number
  price: number
  availability: 'available' | 'reserved' | 'sold'
}

export const units: Unit[] = [
  { id: 'u-101', number: '101', floorLabel: '1st Floor', sizeSqm: 62, bedrooms: 2, price: 145000, availability: 'available' },
  // ...
]
```

Import directly into Server Components — no fetch/client needed. When the project later needs
a CMS, the migration is: stand up the schema with matching field names, bulk-import this array
as documents, swap the `import { units }` call sites for `await getAvailableUnits()`.

## Quick reference

| Need | Approach |
|---|---|
| Non-dev editable data model | Sanity (hosted) or Payload (self-hosted) |
| Infrequently-changing data, dev-only updates | Static JSON in `lib/data/`, same shape as the CMS doc |
| Query in a Server Component | `sanityClient.fetch(groq\`...\`)`, no client bundle cost |
| Editor publishes → site updates without a redeploy | Webhook → `/api/revalidate` → `revalidateTag` |
| Reference between types (unit → floor) | Sanity `reference` field, dereferenced in GROQ with `->` |

## Common mistakes

- **Modeling content ad hoc per-component** instead of as documents with a defined schema —
  makes it impossible for a non-dev to find and edit "the thing that changes," which defeats
  the point of a CMS.
- **`useCdn: true` while expecting instant updates without a revalidation webhook** — the CDN
  cache means edits can take minutes to appear; either wire the webhook above or set
  `useCdn: false` for draft/preview contexts specifically (not for all production reads, which
  would lose the CDN's speed/cost benefit).
- **Skipping the webhook secret check** — an unauthenticated revalidate endpoint lets anyone
  trigger cache invalidation (a minor DoS/cost vector); always verify a shared secret header.
- **Static JSON with a different field shape than the eventual CMS schema** — turns a later CMS
  migration into a rewrite of every call site instead of a swap of the data-fetching function.
- **Fetching Sanity data from a Client Component** — pulls the query client and credentials into
  the browser bundle unnecessarily; fetch in a Server Component and pass the result down as
  props.
