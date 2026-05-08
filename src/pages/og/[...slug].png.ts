import { OGImageRoute } from 'astro-og-canvas';
import { getCollection } from 'astro:content';

const docs = await getCollection('docs');

const pages = Object.fromEntries(
  docs.map((entry) => [
    entry.id,
    {
      title: entry.data.title,
      description: entry.data.description ?? '',
    },
  ]),
);

export const { getStaticPaths, GET } = OGImageRoute({
  pages,
  param: 'slug',
  getImageOptions: (_id, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [
      [11, 27, 43],
      [20, 43, 76],
    ],
    border: { color: [245, 177, 74], width: 6, side: 'inline-start' },
    padding: 60,
    font: {
      title: { color: [255, 255, 255], size: 64, weight: 'Bold' },
      description: { color: [201, 213, 235], size: 28, lineHeight: 1.4 },
    },
    logo: {
      path: './src/assets/compass.svg',
      size: [80],
    },
  }),
});
