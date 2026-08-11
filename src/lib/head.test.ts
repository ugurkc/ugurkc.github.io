import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

// Both pages own their <head> (no shared layout), so the tags that make
// links previewable and visits measurable have to be kept in sync by hand.
// These assertions catch one page drifting from the other.
const pages = [
  resolve(repoRoot, 'src/pages/index.astro'),
  resolve(repoRoot, 'src/pages/blog/[slug].astro'),
]

describe('page heads', () => {
  for (const path of pages) {
    const label = path.slice(repoRoot.length)
    const source = readFileSync(path, 'utf8')

    it(`${label} loads GoatCounter analytics`, () => {
      expect(source).toContain('data-goatcounter="https://ugurkc.goatcounter.com/count"')
      expect(source).toContain('src="https://gc.zgo.at/count.js"')
    })

    it(`${label} sets an absolute og:image and large-card preview`, () => {
      expect(source).toContain('property="og:image"')
      expect(source).toContain('https://ugurkc.github.io/og.png')
      expect(source).toContain('name="twitter:card" content="summary_large_image"')
    })
  }

  it('the og:image file exists', () => {
    expect(existsSync(resolve(repoRoot, 'public/og.png'))).toBe(true)
  })
})
