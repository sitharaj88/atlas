import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

const lessonSchema = z.object({
  pathSlug: z.string().optional(),
  module: z.string().optional(),
  lessonNumber: z.number().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  duration: z.string().optional(), // e.g., "12 min"
  prerequisites: z.array(z.string()).optional(),
  objectives: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  // Quiz can be authored inline in MDX via the <Quiz /> component instead.
});

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({ extend: lessonSchema }),
  }),
};
