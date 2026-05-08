// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// GitHub Pages config:
//   - For username.github.io/atlas/  → set SITE=https://<user>.github.io and BASE=/atlas
//   - For a custom domain             → set SITE=https://atlas.dev and leave BASE empty
// These can be overridden via environment variables in CI.
const SITE = process.env.SITE ?? 'https://example.github.io';
const BASE = process.env.BASE ?? '/atlas';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  integrations: [
    starlight({
      title: 'Atlas',
      description: 'Your map to modern web development.',
      logo: {
        src: './src/assets/compass.svg',
        replacesTitle: false,
      },
      favicon: '/favicon.svg',
      customCss: ['./src/styles/tokens.css', './src/styles/global.css'],
      social: {
        github: 'https://github.com/sitharaj/atlas',
      },
      editLink: {
        baseUrl: 'https://github.com/sitharaj/atlas/edit/main/',
      },
      lastUpdated: true,
      pagination: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      components: {
        // Custom hero on the home page; Starlight default elsewhere.
        Hero: './src/components/starlight/AtlasHero.astro',
        Head: './src/components/starlight/AtlasHead.astro',
        Footer: './src/components/starlight/AtlasFooter.astro',
        ThemeSelect: './src/components/starlight/AtlasThemeSelect.astro',
      },
      head: [
        {
          tag: 'meta',
          attrs: { name: 'theme-color', content: '#0B1B2B' },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: `${SITE}${BASE}/og-default.png`,
          },
        },
      ],
      sidebar: [
        {
          label: 'Get started',
          items: [
            { label: 'Welcome to Atlas', link: '/' },
            { label: 'Pick your starting point', link: '/start/' },
            { label: 'How Atlas works', link: '/start/how-atlas-works/' },
          ],
        },
        {
          label: 'Learning paths',
          items: [
            { label: 'All paths', link: '/paths/' },
            {
              label: '1 · Foundations of the Web',
              collapsed: true,
              autogenerate: { directory: 'paths/foundations' },
            },
            {
              label: '2 · Modern CSS & Design Systems',
              collapsed: true,
              autogenerate: { directory: 'paths/modern-css' },
            },
            {
              label: '3 · TypeScript Mastery',
              collapsed: true,
              autogenerate: { directory: 'paths/typescript' },
            },
            {
              label: '4 · Frontend Frameworks',
              collapsed: true,
              autogenerate: { directory: 'paths/frontend-frameworks' },
            },
            {
              label: '5 · Full-Stack Web Development',
              collapsed: true,
              autogenerate: { directory: 'paths/full-stack' },
            },
            {
              label: '6 · Performance, A11y & SEO',
              collapsed: true,
              autogenerate: { directory: 'paths/performance-a11y-seo' },
            },
            {
              label: '7 · Testing & Quality',
              collapsed: true,
              autogenerate: { directory: 'paths/testing' },
            },
            {
              label: '8 · DevOps for Web',
              collapsed: true,
              autogenerate: { directory: 'paths/devops' },
            },
            {
              label: '9 · The Modern Frontier',
              collapsed: true,
              autogenerate: { directory: 'paths/frontier' },
            },
          ],
        },
        {
          label: 'Reference',
          collapsed: true,
          autogenerate: { directory: 'reference' },
        },
        {
          label: 'Cheatsheets',
          collapsed: true,
          autogenerate: { directory: 'cheatsheets' },
        },
        {
          label: 'Roadmaps',
          collapsed: true,
          autogenerate: { directory: 'roadmaps' },
        },
        {
          label: 'Projects',
          collapsed: true,
          autogenerate: { directory: 'projects' },
        },
        {
          label: 'Glossary',
          link: '/glossary/',
        },
        {
          label: 'Playground',
          link: '/playground/',
        },
        {
          label: 'About',
          collapsed: true,
          items: [
            { label: 'About Atlas', link: '/about/' },
            { label: 'Contribute', link: '/contribute/' },
            { label: 'Changelog', link: '/blog/' },
          ],
        },
      ],
    }),
    react(),
    sitemap(),
  ],
});
