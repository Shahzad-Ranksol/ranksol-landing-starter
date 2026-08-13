# Meridian — Skill Showcase Demo

A fictional premium real-estate property ("Meridian," Solmar Bay) built to demonstrate every
skill in `.claude/skills/` end to end, not just describe them. Not a real client project — no
data submitted through the contact form is sent or stored (see `CREDITS.md`).

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3411](http://localhost:3411) — the dev script is set up for that port,
adjust with `npm run dev -- -p <port>` if it's taken.

## What's demonstrated where

| Skill | Where in this app |
|---|---|
| `nextjs-app-scaffold` | `app/[locale]/`, `components/`, `lib/` folder structure |
| `scroll-animation` | `components/ui/preloader.tsx`, `components/sections/hero.tsx` (parallax) |
| `r3f-3d-viewer` | `components/three/` — real CC-BY `.glb`, Draco-compressed, hotspot markers |
| `i18n-nextintl` | `app/[locale]/`, `i18n/`, `messages/en.json` + `messages/sr.json` |
| `interactive-map` | `components/sections/location.tsx` — stylized POI diagram |
| `cms-content-model` | `lib/data/` — static JSON shaped like a real CMS schema |
| `perf-web` | `next/image` usage throughout, dynamic-imported 3D viewer |
| `cursor-interactions` | `components/providers/cursor-provider.tsx`, `magnetic-button.tsx` |

## Known deployment note

Production builds must use `next build --webpack` (already set in `package.json`) —
`next build`'s Turbopack default currently ships a broken production deployment on Vercel
(builds succeed, every route 404s). See the `i18n-nextintl` skill for details if this needs
re-checking against a newer Next.js version.

## Credits

Real photography and the 3D model are third-party — see `CREDITS.md` for sources and licenses.
