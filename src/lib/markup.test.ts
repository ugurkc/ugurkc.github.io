import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))
const blogDir = resolve(repoRoot, 'src/content/blog')

// Astro renders raw HTML in markdown verbatim, so a <script> or an
// <img onerror> pasted into a post body executes on the live site — same
// origin as /admin/, where the CMS keeps the access token. Markdown-only
// `javascript:` links are the same hazard without any HTML. Commonmark
// autolinks (<https://…>, <me@example.com>) are legitimate and exempted.
const RAW_HTML = /<(?![a-z][a-z0-9+.-]*:\/\/|[^\s@<>]+@)[a-zA-Z!/][^>]*>/
const JS_URL = /\]\(\s*javascript:/i

const markdownFiles = [
  ...(existsSync(blogDir)
    ? readdirSync(blogDir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => resolve(blogDir, f))
    : []),
  resolve(repoRoot, 'src/data/bio.md'),
]

const body = (path: string) => readFileSync(path, 'utf8').replace(/^---[\s\S]*?\n---\n?/, '')

describe('editable markdown carries no executable markup', () => {
  for (const path of markdownFiles) {
    const label = path.slice(repoRoot.length)

    it(`${label} has no raw HTML tags`, () => {
      expect(body(path).match(RAW_HTML)?.[0], `raw HTML executes on the live site`).toBeUndefined()
    })

    it(`${label} has no javascript: links`, () => {
      expect(body(path).match(JS_URL)?.[0], `javascript: URLs execute on click`).toBeUndefined()
    })
  }
})
