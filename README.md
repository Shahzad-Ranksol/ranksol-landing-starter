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
    interactive-landing-page/
      SKILL.md          ← the playbook (stack, roadmap, MCPs, asset checklist)
docs/
  CLIENT-ASSET-CHECKLIST.md   ← send to the client before build starts
README.md
```

## Keeping it current

Skills for churny libraries (R3F, GSAP, Lenis, next-intl) go stale fast. Whoever owns this
repo should re-verify the stack versions in the skill every quarter, and re-check the
Claude Code skills spec at the official Anthropic docs. Update here → team gets it on the
next project (fresh `Use this template`).

## Adding more skills later

Each new skill is its own folder with a `SKILL.md`:
`.claude/skills/<skill-name>/SKILL.md`. The natural next ones are `scroll-animation` and
`r3f-3d-viewer` (code recipes), listed as "to build" inside the main skill.
