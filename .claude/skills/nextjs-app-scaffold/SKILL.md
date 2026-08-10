---
name: nextjs-app-scaffold
description: Use when scaffolding a new Next.js App Router project, or auditing folder/config conventions on an existing one, for a premium marketing/landing site — TypeScript + Tailwind setup, App Router folder structure, root layout with providers, locale-ready route groups, and Vercel env-var conventions. Companion recipe skill to interactive-landing-page.
version: 1.0
---

# Next.js App Scaffold Recipes — App Router, TS/Tailwind Config, Folder Conventions, Vercel Env

## Overview

The scaffold decisions made in the first hour (folder layout, route grouping, provider nesting,
env-var naming) are the ones that are expensive to change later once sections/animations/3D are
built on top. This skill covers that first hour: `create-next-app` flags, App Router folder
conventions (including locale-ready route groups), the root layout pattern, TS/Tailwind config,
and Vercel env-var rules.

## When to use

- Starting a fresh Next.js project for a landing/marketing site
- Deciding where a new route, component, or provider belongs in an existing App Router project
- Wiring the root layout (fonts, providers, metadata) before building sections
- Setting up `.env` files correctly for local dev + Vercel

Not for: the scroll/animation providers themselves (see `scroll-animation`) or the 3D viewer
route's internals (see `r3f-3d-viewer`) — this skill is where those get *mounted*, not built.

## Core pattern: scaffold command

```bash
npx create-next-app@latest my-site \
  --typescript --tailwind --app --eslint \
  --src-dir=false --import-alias "@/*"
```

- `--app` — App Router, not Pages Router. Never mix the two in a new project.
- `--src-dir=false` — keep `app/`, `components/`, `lib/` at repo root; simpler for a
  content-driven site with no monorepo concerns. Use `--src-dir` only if the repo will also
  hold non-web tooling at the root.
- `--import-alias "@/*"` — `@/components/Hero` instead of `../../../components/Hero`.
- create-next-app installs **Tailwind v4** by default on current versions — CSS-first config
  (`@import "tailwindcss"` + `@theme` block in `globals.css`), no `tailwind.config.js` required
  for basic theme tokens. If the project pins Tailwind v3, use the classic `tailwind.config.ts`
  instead — check `package.json` before assuming which one applies.

## Folder conventions

```
app/
  [locale]/                 # if i18n (next-intl) — omit this layer if single-language
    layout.tsx               # locale-scoped layout (html lang=, messages provider)
    page.tsx                 # home
    (marketing)/              # route group: shared layout, not in the URL
      residences/page.tsx
      amenities/page.tsx
    3d/page.tsx               # dynamic-imported R3F viewer route
  layout.tsx                 # root layout: fonts, Lenis/GSAP provider, <html>/<body>
  globals.css                 # Tailwind entry + @theme tokens
components/
  ui/                         # generic, content-agnostic (Button, Card)
  sections/                   # page-specific composed sections (Hero, ParallaxGallery)
  providers/                  # LenisProvider, ThemeProvider, etc.
lib/
  data/                       # static JSON or CMS query functions
  utils.ts
public/
  models/                     # .glb files
  images/
```

- **Route groups** `(name)` — use to share a layout across routes without adding a URL segment
  (e.g. marketing pages sharing a nav/footer distinct from a bare `/3d` fullscreen route).
- **`[locale]` dynamic segment** — only add this layer if i18n is confirmed in scope; retrofitting
  it later means moving every route down one directory level.
- Keep `components/sections/*` named after what they render (`Hero`, `IntroCounter`,
  `ParallaxGallery`), not generic (`Section1`).

## Recipe: root layout with providers

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { LenisProvider } from '@/components/providers/lenis-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: { default: 'Site Name', template: '%s | Site Name' },
  description: '...',
  openGraph: { images: ['/og.png'] },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  )
}
```

`next/font` self-hosts and inlines font-loading — never link Google Fonts via `<link>` tag,
it costs an extra render-blocking request and layout shift that `next/font` avoids.
`LenisProvider` is the smooth-scroll/GSAP-ticker wrapper — see `scroll-animation` for its
implementation; this is just where it gets mounted.

## TypeScript config

`create-next-app` ships `strict: true` — keep it. The one addition worth making explicitly:

```json
// tsconfig.json (relevant excerpt)
{
  "compilerOptions": {
    "paths": { "@/*": ["./*"] },
    "target": "ES2022"
  }
}
```

Don't loosen `strict` to silence errors from a third-party lib's types — wrap the specific call
with a narrow local type instead (e.g. `as unknown as ExpectedType` at one call site), so the
rest of the codebase keeps real type safety.

## Tailwind v4 setup (CSS-first)

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --font-sans: var(--font-inter);
  --color-brand: #1a2e22;
  --color-brand-accent: #c9a35d;
}
```

No `tailwind.config.js` needed for token additions — `@theme` generates the corresponding
utility classes (`bg-brand`, `text-brand-accent`) directly. Only add a config file if you need
JS-side logic (custom plugins, `content` globs for non-standard file locations).

## Env vars / Vercel

| File | Committed? | Purpose |
|---|---|---|
| `.env.local` | No (gitignored) | Local secrets, dev overrides |
| `.env.example` | Yes | Documents every var a new dev/deploy needs, no real values |
| Vercel Project Settings → Environment Variables | N/A | Production/Preview/Development secrets |

- Only prefix with `NEXT_PUBLIC_` the vars that are genuinely safe to ship to the browser
  (e.g. `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_MAPBOX_TOKEN` restricted by domain). Anything with
  write access or a non-domain-restricted key (CMS write tokens, form-submission secrets)
  stays server-only and gets read only in Server Components/Route Handlers.
- Set Preview and Production env vars separately in Vercel when a value differs (e.g. a staging
  CMS dataset vs production) — don't rely on one value serving both.

## Quick reference

| Need | Where/how |
|---|---|
| New page shell (no shared nav) | `app/[locale]/(group)/route/page.tsx` in its own group |
| Add a global provider | `components/providers/`, mount in `app/layout.tsx` |
| Add a design token | `@theme` block in `globals.css` (Tailwind v4) |
| Client-only component | `'use client'` at top of file — only on leaf components that need it |
| Secret only server reads | `.env.local`, no `NEXT_PUBLIC_` prefix |
| Value the browser needs | `NEXT_PUBLIC_` prefix, treat as public |

## Common mistakes

- **Mixing `app/` and `pages/`** in a new project "just to reuse an old API route" — pick App
  Router fully; use Route Handlers (`app/api/.../route.ts`) instead of `pages/api`.
- **Marking the whole tree `'use client'`** by putting it in a high-level layout — pushes every
  child into client bundles and kills server rendering/streaming. Mark only the specific
  interactive leaf component.
- **Retrofitting `[locale]` routing after building routes flat** — every existing route file
  has to move down a directory; decide i18n scope before scaffolding routes if there's any
  chance it's needed (see `i18n-nextintl`).
- **Hand-writing Google Fonts `<link>` tags** instead of `next/font` — reintroduces the
  layout-shift/render-blocking problem `next/font` exists to solve.
- **Committing `.env.local`** or putting a real secret in `.env.example` — leaks credentials to
  git history. `.env.local` must be in `.gitignore` (it is, by default, in create-next-app).
- **Assuming Tailwind v3 config syntax on a v4 project** (or vice versa) — check
  `package.json`'s `tailwindcss` version before adding a `tailwind.config.js` full of v3-only
  options to a v4 project; they're silently ignored.
