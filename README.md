<div align="center">

<img src="./src/assets/compass.svg" alt="Atlas compass mark" width="92" height="92" />

# Atlas

### *Your map to modern web development.*

A free, open-source learning platform that takes you from
**"what is HTTP?"** all the way to **shipping a production full-stack app.**

[**Live site →**](https://sitharaj88.github.io/atlas/)
&nbsp;·&nbsp;
[**Pick a path →**](https://sitharaj88.github.io/atlas/paths/)
&nbsp;·&nbsp;
[**Roadmaps →**](https://sitharaj88.github.io/atlas/roadmaps/)

<br />

[![Astro](https://img.shields.io/badge/Astro-5-FF5D01?style=flat-square&logo=astro&logoColor=white)](https://astro.build/)
[![Starlight](https://img.shields.io/badge/Starlight-0.30-7611A6?style=flat-square)](https://starlight.astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![pnpm](https://img.shields.io/badge/pnpm-10-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/Code-MIT-blue?style=flat-square)](./LICENSE)
[![Content: CC BY-SA 4.0](https://img.shields.io/badge/Content-CC%20BY--SA%204.0-lightgrey?style=flat-square)](./LICENSE-CONTENT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-success?style=flat-square)](#contributing)

</div>

---

## Why Atlas?

The web is the largest learning platform humanity has ever built — and the
worst-organized. MDN is great reference but not pedagogical. freeCodeCamp is
great curriculum but dated. roadmap.sh is great visualization but shallow.
Individual blogs are inconsistent.

**Atlas unifies them into one cohesive, beautifully-designed, interactive,
free, and open-source learning platform** — built by working developers, in
public, with no logins, no ads, no paywalls.

<table>
<tr>
<td width="33%" valign="top">

### 🧭 Structured paths
9 opinionated paths · 245+ lessons · ~250 hours of content. Every lesson is
~12 minutes, with explanation, code, live playground, quiz, and what's next.

</td>
<td width="33%" valign="top">

### 🛝 Live in-page playgrounds
HTML / CSS / JS, React, Vue, Svelte, vanilla TS — powered by Sandpack.
Edit in the lesson, see it run, no setup.

</td>
<td width="33%" valign="top">

### ✅ Quizzes that stick
Multiple-choice, multi-select, true/false, predict-the-output. 339 questions.
Answers persist locally — no account.

</td>
</tr>
<tr>
<td valign="top">

### 🗺️ Visual roadmaps
Click any node to jump to a lesson. Completed nodes light up. Powered by
React Flow, themed for Atlas.

</td>
<td valign="top">

### ⚡ Static-fast
Astro 5 + Starlight, near-zero JS on lesson pages. Pagefind search runs
entirely in the browser. PWA-ready, offline reading.

</td>
<td valign="top">

### 🌗 Built-in modern stack
Dark/light mode, oklch palette, container queries, view transitions, RSS,
auto-OG images, Giscus comments — all wired.

</td>
</tr>
</table>

---

## Learning paths

| # | Path | What you build |
|---|---|---|
| 1 | **Foundations of the Web** | A correct mental model: HTTP, DNS, browsers, HTML, CSS, JS, the DOM, async, modules. |
| 2 | **Modern CSS & Design Systems** | Subgrid, container queries, `:has()`, layers, view transitions, tokens, Tailwind. |
| 3 | **TypeScript Mastery** | Generics, narrowing, conditional & mapped types, type-driven API design, monorepos. |
| 4 | **Frontend Frameworks** | React (RSC), Vue, Svelte 5, Solid, Astro islands, htmx — and when to pick which. |
| 5 | **Full-Stack Web Development** | Hono, REST/tRPC, auth (sessions, OIDC, passkeys), Postgres, Drizzle, deploy. |
| 6 | **Performance, A11y & SEO** | LCP / INP / CLS, image & font optimization, WCAG 2.2, structured data, RUM. |
| 7 | **Testing & Quality** | Vitest, Testing Library, Playwright, MSW, visual regression, Storybook. |
| 8 | **DevOps for Web Devs** | Git deep-dive, GitHub Actions, Docker, deploy targets, observability, on-call. |
| 9 | **The Modern Frontier** | Edge runtimes, RSC streaming, WebGPU, CRDTs, AI/RAG/MCP, OWASP & supply chain. |

Plus **Reference** (HTML / CSS / JS / Web APIs), **Cheatsheets**, **Roadmaps**, **Projects**, and a **Glossary**.

---

## Quick start

> Requires **Node ≥ 20** and **pnpm ≥ 10**.

```bash
git clone https://github.com/sitharaj88/atlas.git
cd atlas
pnpm install
pnpm dev          # → http://localhost:4321
```

That's it. Hot reload picks up edits to MDX, components, and styles.

### Build & preview

```bash
pnpm build        # static site → dist/  +  Pagefind search index
pnpm preview      # serve the production build locally
pnpm check        # astro check (typed MDX + components)
pnpm lint         # biome lint
pnpm format       # biome format --write
```

---

## Deploy

Deploys are **manual** — pushes to `main` do *not* auto-publish, so a typo fix
doesn't ship until you're ready. Trigger from the Actions tab:

> **Actions → Deploy Atlas to GitHub Pages → Run workflow** → pick a
> branch / tag / SHA (defaults to `main`).

<details>
<summary><strong>One-time GitHub setup</strong></summary>

1. Push the repo to GitHub.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. *(Optional)* **Settings → Secrets and variables → Actions → Variables**:
   - For `<user>.github.io/atlas/`: `SITE_URL=https://<user>.github.io`, `SITE_BASE=/atlas`
   - For a custom domain: `SITE_URL=https://your-domain`, `SITE_BASE=` *(empty)*
4. *(Optional)* Custom domain — put the hostname in `public/CNAME`, point DNS
   at GitHub Pages, set the variables above to match.

</details>

---

## Repo layout

```
atlas/
├─ src/
│  ├─ assets/                # SVG marks
│  ├─ components/            # Astro + React (Hero, Quiz, Playground, Roadmap, …)
│  │  └─ starlight/          # Starlight component overrides
│  ├─ content/
│  │  ├─ docs/               # Paths · Reference · Cheatsheets · Roadmaps · Projects · Glossary
│  │  └─ content.config.ts   # Zod-validated frontmatter schemas
│  ├─ lib/                   # withBase(), Zustand progress store
│  └─ styles/
│     ├─ tokens.css          # oklch palette, fluid type scale, design tokens
│     └─ global.css          # Layered base · components · utilities
├─ public/                   # CNAME, favicon, robots.txt, OG images
├─ scripts/                  # Content audit tools (quizzes, links, vitals)
├─ .github/
│  ├─ workflows/deploy.yml   # Manual-trigger GitHub Pages deploy
│  └─ FUNDING.yml            # Sponsor button → Buy Me a Coffee
└─ astro.config.mjs          # Starlight, sidebar, integrations, base path
```

---

## Authoring a lesson

Lessons are MDX files under `src/content/docs/paths/<path>/<module>/<slug>.mdx`.
Every lesson follows the same shape so the site reads consistently:

```yaml
---
title: Your lesson title
description: One-sentence summary used everywhere.
sidebar: { order: 1 }
pathSlug: foundations
module: web-platform
lessonNumber: 1
difficulty: beginner          # beginner | intermediate | advanced
duration: 12 min
prerequisites: []
objectives:
  - What the reader can do after this lesson
tags: [http, fundamentals]
---
```

See [`src/content/docs/contribute.mdx`](./src/content/docs/contribute.mdx) for the full template, voice/style guide, and the MDX components you can use (`<Quiz>`, `<Playground>`, `<Callout>`, `<Roadmap>`, …).

---

## Contributing

Pull requests are welcome — typo fixes, new lessons, components, anything.
The fastest contribution path is the **Edit on GitHub** link in the right
sidebar of every page.

```bash
# Fork + clone, then:
pnpm install
pnpm dev
# Edit. Open a PR.
```

Run `pnpm check` and `pnpm lint` before pushing.

---

## License

| | |
|---|---|
| **Code** | [MIT](./LICENSE) — fork, modify, ship. |
| **Content** | [CC BY-SA 4.0](./LICENSE-CONTENT) — adapt and share, including commercially, with attribution and same-license. |

---

## Author

<table>
<tr>
<td valign="top">
<img src="https://avatars.githubusercontent.com/sitharaj88?size=120" alt="Sitharaj Seenivasan" width="96" height="96" style="border-radius:50%" />
</td>
<td valign="top">

**Sitharaj Seenivasan** — a working developer who got tired of jumping between
fragmented resources every time a teammate asked *"where should I learn X?"*
Atlas is the destination I wish I could've handed them.

[![GitHub](https://img.shields.io/badge/GitHub-sitharaj88-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/sitharaj88)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-sitharaj08-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/sitharaj08)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy_me_a_coffee-sitharaj88-FFDD00?style=flat-square&logo=buymeacoffee&logoColor=black)](https://www.buymeacoffee.com/sitharaj88)

</td>
</tr>
</table>

### Support Atlas

Atlas is **free, forever**. If it saved you time and you want to give back:

- ⭐ **[Star the repo](https://github.com/sitharaj88/atlas)** — costs nothing, signals a lot.
- ☕ **[Buy me a coffee](https://www.buymeacoffee.com/sitharaj88)** — keeps the late nights going.
- 📤 **Share a lesson** with someone learning the part you remember being stuck on.
- 🛠️ **Open a PR** — fix a typo, add a quiz, write a lesson.

<div align="center">
<br />

*Built in public, with care, in the open.*
<br />
**[atlas →](https://sitharaj88.github.io/atlas/)**

</div>
