import { describe, expect, it } from 'vitest'
import { feedEntrySchema } from '../lib/contentSchema'
import publishings from './publishings.yaml'

const entries = publishings as unknown[]

describe('publishings.yaml', () => {
  it('is an array', () => {
    // Shape is what needs guarding. An empty list is a legitimate state
    // (nothing published yet, or one pulled down) and shouldn't fail CI
    // as if the CMS had written the wrong structure.
    expect(Array.isArray(entries)).toBe(true)
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
