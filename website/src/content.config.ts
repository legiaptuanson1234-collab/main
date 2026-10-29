import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string().optional(),
    author: z.string().optional(),
    keywords: z.array(z.string()).default([]),
    topic: z.string().default('ai-mien-phi'),
    status: z.enum(['draft', 'published']).default('published'),
    aiLabel: z.enum(['human', 'ai-assisted', 'ai-generated']).default('human'),
    sources: z.array(z.object({ title: z.string(), url: z.string() })).default([]),
    lastVerified: z.string().default(''),
    verificationNote: z.string().optional(),
    createdAt: z.string(),
  }),
});

export const collections = { guides };
