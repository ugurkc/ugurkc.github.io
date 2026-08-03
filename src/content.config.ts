import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'
import { dateString } from './lib/contentSchema'

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    date: dateString,
    draft: z.boolean().default(false),
    // The glob loader consumes a frontmatter `slug` pre-schema as a raw id
    // override; this guard turns that path into an explicit build error
    // instead of a silently unvalidated url.
    slug: z.never().optional(),
  }),
})

export const collections = { blog }
