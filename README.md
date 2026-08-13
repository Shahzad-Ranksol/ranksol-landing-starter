# landing-starter

A **GitHub Template repo** for building premium, scroll-driven, 3D-capable interactive
landing pages (real estate, product launch, agency) with Claude Code.

This repo is **skills + docs only** — no app code. You bring the Next.js app; this repo
gives your Claude Code sessions the playbook and the asset checklist so every landing-page
project starts the same way.

---

## How to start a new project (for the team)

1. Click **“Use this template” → Create a new repository** (top of this repo on GitHub).
   Do **not** clone this repo into a client folder — “Use this template” gives you a clean repo with fresh git history.
2. Clone your new repo and `cd` into it.
3. Scaffold the actual app inside it:
   ```bash
   npx create-next-app@latest .
   ```
   (or clone a starter like `darkroomengineering/satus` — see the skill for options)
4. Open Claude Code in the project. Run `/skills` — you should see **interactive-landing-page**.
5. Tell Claude what you're building (e.g. *"scroll-heavy real estate landing page with a 3D
   building viewer, SRB + ENG"*) — the skill loads automatically and drives the build.

That's it. The skill carries the stack, the phase roadmap, the MCP list, and the
client-asset checklist.

---

## What's in here

```
.claude/
  skills/
    interactive-landing-page/   ← the playbook (stack, roadmap, MCPs, asset checklist)
    landing-page-discovery/     ← run FIRST, every project — ask before defaulting to the same look
    nextjs-app-scaffold/        ← App Router folder conventions, TS/Tailwind config, Vercel env
    scroll-animation/           ← Lenis + GSAP ScrollTrigger + Framer Motion recipes
    r3f-3d-viewer/               ← R3F/GLTF viewer: gltfjsx, clickable meshes, camera, perf
    i18n-nextintl/               ← locale routing, message files, language switcher
    interactive-map/             ← Mapbox GL JS, custom POI markers, distance/time panel
    cms-content-model/           ← Sanity/Payload schema for unit/floor/availability/POI/amenity
    perf-web/                    ← next/image, dynamic-import off critical path, CWV budget
    cursor-interactions/         ← custom cursor, magnetic hover, mouse-driven parallax/camera drift
    belgrade-arbor-patterns/     ← verified (not assumed) patterns from the belgradearbor.rs reference
    cinematic-video-sections/    ← HLS background video, scroll text reveal, pinned card cycling
    scroll-image-sequence/       ← canvas scroll-scrubbed frame playback, an alternative to real 3D
demo/                         ← full working showcase app built from every skill above (see its README)
docs/
  CLIENT-ASSET-CHECKLIST.md   ← send to the client before build starts
README.md
```

All 10 companion skills listed inside `interactive-landing-page` (§3) are built — including
`landing-page-discovery`, which runs first on every project so builds stop defaulting to the
same look — plus two reference-pattern skills (verified against live sites, not assumed) that
extend them as new briefs come in. The main skill is the index; invoke the others by name when
working on that specific part of the build.

## Keeping it current

Skills for churny libraries (R3F, GSAP, Lenis, next-intl) go stale fast. Whoever owns this
repo should re-verify the stack versions in the skill every quarter, and re-check the
Claude Code skills spec at the official Anthropic docs. Update here → team gets it on the
next project (fresh `Use this template`).

## Adding more skills later

Each new skill is its own folder with a `SKILL.md`:
`.claude/skills/<skill-name>/SKILL.md`. The roadmap skills are all built (see tree above);
add new ones here as new recurring needs come up across projects (e.g. a payments/checkout
flow, a different CMS, a booking calendar) rather than one-off project-specific detail.
