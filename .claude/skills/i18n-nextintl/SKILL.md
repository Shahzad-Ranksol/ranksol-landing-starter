---
name: i18n-nextintl
description: Use when a Next.js App Router marketing site needs 2+ languages (e.g. locale + English) — locale routing via a [locale] segment, next-intl config, message JSON, server vs client translation hooks, and a language switcher. Companion recipe skill to interactive-landing-page.
version: 1.0
---

# i18n with next-intl — Locale Routing, Messages, Language Switcher

## Overview

**next-intl** is the standard i18n library for Next.js App Router. It handles locale-prefixed
routing (`/en/...`, `/sr/...`), per-request message loading, and locale-aware navigation
(`Link`/`router` that keep the current locale on internal links).

⚠️ **Next.js 16 renamed `middleware.ts` → `proxy.ts`** (confirmed against the framework's own
bundled docs — `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
explicitly says the `middleware` convention is deprecated). The exported function can still be a
default export with the old `(request) => response` signature — only the filename and the
`config.matcher` placement changed, `createMiddleware(routing)` from `next-intl/middleware` still
works unchanged inside it. This whole surface still moves fast — if the installed Next.js major
version differs from 16, check that package's own bundled docs (or Context7 MCP) before trusting
the filename below rather than assuming it's stayed `proxy.ts`.

## When to use

- Site content must ship in 2+ languages with locale-prefixed URLs
- Need a language switcher that preserves the current page across locales
- Need locale-aware `<Link>`/`redirect`/`useRouter` so internal links don't drop the locale

Not for: single-language sites — don't add the `[locale]` routing layer if there's no confirmed
multi-language requirement; retrofitting it later means moving every route down a directory
(see `nextjs-app-scaffold`).

## Core pattern: routing config

```bash
npm install next-intl
```

`i18n/routing.ts`:

```ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'sr'],
  defaultLocale: 'en',
  localePrefix: 'always', // /en/... and /sr/... — no bare, unprefixed routes
})
```

`i18n/navigation.ts` — locale-aware nav APIs, use these instead of `next/link`/`next/navigation`
anywhere in the app or the current locale silently drops on internal links:

```ts
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
```

`i18n/request.ts` — loads the right message file per request:

```ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as any)) locale = routing.defaultLocale
  return { locale, messages: (await import(`../messages/${locale}.json`)).default }
})
```

`proxy.ts` at the project root (Next.js 15 and earlier: `middleware.ts`, same content) — matches
every path except static assets/API routes:

```ts
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

export default createMiddleware(routing)

export const config = { matcher: '/((?!api|_next|_vercel|.*\\..*).*)' }
```

Wire the Next.js plugin in `next.config.ts`:

```ts
import createNextIntlPlugin from 'next-intl/plugin'
const withNextIntl = createNextIntlPlugin()
export default withNextIntl({ /* ...rest of config */ })
```

## Folder structure — everything localized lives under `[locale]`

Follows the `app/` (non-`src`) convention from `nextjs-app-scaffold`:

```
app/
  [locale]/
    layout.tsx        # <html lang>, NextIntlClientProvider
    page.tsx           # home
    residences/page.tsx
    contact/page.tsx
messages/
  en.json
  sr.json
```

`app/[locale]/layout.tsx`:

```tsx
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
```

## Recipe: message files

`messages/en.json`:

```json
{
  "nav": { "home": "Home", "residences": "Residences", "contact": "Contact" },
  "hero": { "title": "Site Name", "cta": "View in 3D" }
}
```

`messages/sr.json` — identical key structure, translated values. **Keys must match across every
locale file** — a missing key throws at render time, not build time.

## Recipe: using translations

Server Component — async, no client bundle cost:

```tsx
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('hero')
  return <h1>{t('title')}</h1>
}
```

Client Component — needed only where translated text lives inside an interactive/client leaf:

```tsx
'use client'
import { useTranslations } from 'next-intl'

export function Cta() {
  const t = useTranslations('hero')
  return <button>{t('cta')}</button>
}
```

## Recipe: language switcher

```tsx
'use client'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname() // already locale-stripped
  const router = useRouter()

  return (
    <div className="flex gap-2">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          disabled={loc === locale}
          onClick={() => router.replace(pathname, { locale: loc })}
          className={loc === locale ? 'font-bold' : 'opacity-60'}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
```

## Recipe: localized metadata (SEO)

```tsx
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return { title: t('title'), description: t('description') }
}
```

## Quick reference

| Need | API |
|---|---|
| Locale-aware link | `Link` from `@/i18n/navigation`, never `next/link` |
| Locale-aware programmatic nav | `useRouter`/`redirect` from `@/i18n/navigation` |
| Translation in a Server Component | `await getTranslations(namespace)` |
| Translation in a Client Component | `useTranslations(namespace)` |
| Switch locale, same page | `router.replace(pathname, { locale })` |
| Current locale value | `useLocale()` (client) / from `params` (server) |

## Common mistakes

- **Importing `next/link`/`next/navigation` instead of the locale-aware versions** — internal
  links silently drop the current locale, sending users back to the default language.
- **Message keys out of sync across locale files** — throws at runtime, not caught by the type
  checker or build unless a CI check specifically diffs the JSON key sets.
- **Routes built outside `app/[locale]/`** — anything outside that segment isn't localized and
  won't get a language prefix; retrofit means moving files, not renaming a config value.
- **Asserting a specific middleware/proxy file name or prop rename from memory** — this is
  exactly the class of fast-churning API detail that goes stale; verify against the installed
  version's docs (Context7) rather than trusting a remembered filename.
