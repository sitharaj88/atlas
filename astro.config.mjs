// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import AstroPWA from '@vite-pwa/astro';

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
        Hero: './src/components/starlight/AtlasHero.astro',
        Head: './src/components/starlight/AtlasHead.astro',
        Footer: './src/components/starlight/AtlasFooter.astro',
        ThemeSelect: './src/components/starlight/AtlasThemeSelect.astro',
      },
      head: [
        { tag: 'meta', attrs: { name: 'theme-color', content: '#0B1B2B' } },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: `${SITE}${BASE}/og-default.png`,
          },
        },
        {
          tag: 'link',
          attrs: { rel: 'alternate', type: 'application/rss+xml', title: 'Atlas RSS', href: `${BASE}/rss.xml` },
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
            { label: '1 · Foundations of the Web', collapsed: true, autogenerate: { directory: 'paths/foundations' } },
            { label: '2 · Modern CSS & Design Systems', collapsed: true, autogenerate: { directory: 'paths/modern-css' } },
            { label: '3 · TypeScript Mastery', collapsed: true, autogenerate: { directory: 'paths/typescript' } },
            { label: '4 · Frontend Frameworks', collapsed: true, autogenerate: { directory: 'paths/frontend-frameworks' } },
            { label: '5 · Full-Stack Web Development', collapsed: true, autogenerate: { directory: 'paths/full-stack' } },
            { label: '6 · Performance, A11y & SEO', collapsed: true, autogenerate: { directory: 'paths/performance-a11y-seo' } },
            { label: '7 · Testing & Quality', collapsed: true, autogenerate: { directory: 'paths/testing' } },
            { label: '8 · DevOps for Web', collapsed: true, autogenerate: { directory: 'paths/devops' } },
            { label: '9 · The Modern Frontier', collapsed: true, autogenerate: { directory: 'paths/frontier' } },
          ],
        },
        { label: 'Reference', collapsed: true, autogenerate: { directory: 'reference' } },
        { label: 'Cheatsheets', collapsed: true, autogenerate: { directory: 'cheatsheets' } },
        { label: 'Roadmaps', collapsed: true, autogenerate: { directory: 'roadmaps' } },
        { label: 'Projects', collapsed: true, autogenerate: { directory: 'projects' } },
        { label: 'Glossary', link: '/glossary/' },
        { label: 'Playground', link: '/playground/' },
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
    AstroPWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Atlas — your map to modern web development',
        short_name: 'Atlas',
        description: 'A free, open-source learning platform for modern web development.',
        theme_color: '#0B1B2B',
        background_color: '#0B1B2B',
        display: 'standalone',
        scope: BASE + '/',
        start_url: BASE + '/',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2,png}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: { cacheName: 'atlas-pages', expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
          {
            urlPattern: ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'atlas-assets' },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: { cacheName: 'atlas-images', expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
        ],
      },
    }),
  ],
});
