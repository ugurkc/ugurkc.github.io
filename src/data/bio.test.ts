import { describe, expect, it } from 'vitest'
import bioRaw from './bio.md?raw'

describe('bio.md', () => {
  it('has non-empty prose after stripping any frontmatter', () => {
    const body = bioRaw.replace(/^---[\s\S]*?---/, '').trim()
    expect(body.length).toBeGreaterThan(10)
  })
})
