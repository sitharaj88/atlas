# Atlas — your map to modern web development

A free, open-source learning platform that takes you from "what is HTTP?" to shipping a production full-stack app.

**Live site:** _(set after first deploy)_
**Tech:** Astro 5 · Starlight · React · TypeScript · Sandpack · Pagefind · Zustand

---

## What's inside

- **9 learning paths** — Foundations, Modern CSS, TypeScript, Frontend Frameworks, Full-Stack, Performance/A11y/SEO, Testing, DevOps, The Modern Frontier.
- **Live in-page playgrounds** for HTML/CSS/JS, React, Vue, Svelte (Sandpack).
- **Quizzes** with persistence to localStorage.
- **Progress tracking** — checkmarks in the sidebar; percent-complete on path pages.
- **Reference**, **cheatsheets**, **roadmaps**, **projects**, **glossary**.
- **Static-site search** with Pagefind (works on GitHub Pages — no backend).
- **Dark/light mode**, system-aware.
- **PWA-ready** scaffold for offline reading.

## Run locally

Requires Node 20+ and pnpm 10+.

```bash
pnpm install
pnpm dev          # http://localhost:4321
```

## Build

```bash
pnpm build        # outputs static site to dist/, then runs Pagefind to build the search index
pnpm preview      # serves the production build locally
```

## Deploy

Pushes to `main` deploy automatically via `.github/workflows/deploy.yml`.

**One-time GitHub setup:**

1. Push the repo to GitHub.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. (Optional) **Settings → Secrets and variables → Actions → Variables** — set `SITE_BASE` and `SITE_URL`:
   - For `<user>.github.io/atlas/`: `SITE_URL=https://<user>.github.io`, `SITE_BASE=/atlas`
   - For a custom domain `atlas.dev`: `SITE_URL=https://atlas.dev`, `SITE_BASE=` (empty)
4. (Optional) Custom domain — put the hostname in `public/CNAME`, point DNS at GitHub Pages, set the variables above to match.

## Repo layout

```
src/
├── assets/                  # SVG marks
├── components/              # Astro & React components (Hero, Quiz, Playground, Roadmap, …)
│   └── starlight/           # Starlight component overrides (Head, Footer, Hero, ThemeSelect)
├── content/
│   ├── docs/                # All content — paths, reference, cheatsheets, roadmaps, projects, glossary
│   └── content.config.ts    # Zod-validated frontmatter schemas
├── lib/
│   └── progress.ts          # Zustand store, localStorage-persisted
└── styles/
    ├── tokens.css           # Design tokens + Starlight var overrides
    └── global.css           # Layered base/components/utilities
public/
├── CNAME                    # Empty placeholder; fill with your hostname
├── favicon.svg
└── robots.txt
.github/workflows/deploy.yml # Build + deploy to GitHub Pages
astro.config.mjs             # Starlight + integrations + sidebar
biome.json                   # Lint + format
tsconfig.json
```

## Authoring a lesson

Lessons are MDX files under `src/content/docs/paths/<path>/<module>/<slug>.mdx`. See [Contribute](./src/content/docs/contribute.mdx) for the full template, voice/style guide, and the components you can use in MDX.

## License

- **Code:** MIT — see [LICENSE](./LICENSE).
- **Content:** CC BY-SA 4.0 — see [LICENSE-CONTENT](./LICENSE-CONTENT).

Atlas is built in public. Pull requests welcome.
