import { z } from 'astro/zod'

export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be quoted "YYYY-MM-DD"')
  .refine((d) => {
    const parsed = new Date(`${d}T00:00:00Z`)
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === d
  }, 'date must be a real calendar date')

export const feedEntrySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: dateString,
  url: z.string().regex(/^(\/|https?:\/\/)/),
})
