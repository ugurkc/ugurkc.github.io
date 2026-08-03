import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be quoted "YYYY-MM-DD"')
      .refine(
        (d) => new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d,
        'date must be a real calendar date',
      ),
    draft: z.boolean().default(false),
  }),
})

export const collections = { blog }
