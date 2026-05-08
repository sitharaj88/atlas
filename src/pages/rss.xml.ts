import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const docs = await getCollection('docs');
  // Lessons are anything under paths/<slug>/<module>/<lesson>.mdx
  const lessons = docs
    .filter((d) => d.id.startsWith('paths/') && d.id.split('/').length >= 4)
    .sort((a, b) => a.id.localeCompare(b.id));

  return rss({
    title: 'Atlas — your map to modern web development',
    description: 'New lessons, cheatsheets, and projects from Atlas.',
    site: context.site ?? 'https://example.github.io/atlas',
    items: lessons.map((d) => ({
      title: d.data.title,
      description: d.data.description ?? '',
      link: `/${d.id}/`,
      categories: d.data.tags ?? [],
    })),
    customData: '<language>en</language>',
  });
}
