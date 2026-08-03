import { describe, expect, it } from 'vitest'
import { feedEntrySchema } from '../lib/contentSchema'
import publishings from './publishings.yaml'

const entries = publishings as unknown[]

describe('publishings.yaml', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(entries)).toBe(true)
    expect(entries.length).toBeGreaterThan(0)
  })

  it('every entry matches the feed entry schema', () => {
    for (const entry of entries) {
      const result = feedEntrySchema.safeParse(entry)
      expect(
        result.success,
        `${JSON.stringify(entry)}: ${result.error?.message}`,
      ).toBe(true)
    }
  })
})
