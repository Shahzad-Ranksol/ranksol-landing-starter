# Client Asset Checklist — Interactive Landing Page

Send this to the client (or account manager) **before** the build starts. The two starred
items block the hardest phases, so chase them first.

## Blocking (get these early)
- [ ] ⭐ **Building / product 3D model** as `.glb` or `.gltf` (Blender export). If none exists,
      provide floor plans + elevations so it can be modeled. *Blocks the 3D viewer phase.*
- [ ] ⭐ **Copy in every language** (e.g. Serbian + English), or confirm who translates.
      *Blocks all content sections.*

## Content & data
- [ ] Floor & unit data: numbering, sizes (m²), layout type, availability, prices
- [ ] Amenities list (name, icon/photo, short description), installment/payment plan steps
- [ ] PDFs to link (permits, brochures, floor plans)
- [ ] Who will edit this data day-to-day after launch? (sales team via a CMS, or dev/agency
      via code updates — determines whether we set up Sanity/Payload or keep it static)

## Location map
- [ ] Exact site address + coordinates
- [ ] Points of interest: name, category (school/transit/shopping/etc.), and walk + drive time
      for each — please provide this list, we can't source it for you
- [ ] Map provider preference (Mapbox by default, or Google Maps) — grant account access or
      create the account and invite us
- [ ] Any required brand styling for the map itself (colors, custom pin icons)

## Brand & media
- [ ] Logo (SVG preferred) + brand colors + fonts / brand guidelines
- [ ] High-res photography and/or renders (we convert to WebP)
- [ ] Aerial / gallery imagery

## Technical
- [ ] Analytics / GTM container ID
- [ ] Where the lead form submits (CRM, email, webhook?)
- [ ] Domain, hosting preference (default: Vercel)
- [ ] Privacy policy + cookie-consent text
