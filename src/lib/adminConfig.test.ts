import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import config from '../../public/admin/config.yml'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

type Field = {
  name: string
  widget?: string
  fields?: Field[]
  root?: boolean
}

type Collection = {
  name: string
  folder?: string
  files?: { name: string; file: string; fields: Field[] }[]
  fields?: Field[]
}

const collections = config.collections as Collection[]

const findCollection = (name: string) => {
  const collection = collections.find((c) => c.name === name)
  expect(collection, `collection "${name}" missing`).toBeDefined()
  return collection as Collection
}

const allFields = (fields: Field[]): Field[] =>
  fields.flatMap((f) => [f, ...allFields(f.fields ?? [])])

describe('admin config', () => {
  it('targets this repo on main', () => {
    expect(config.backend).toEqual({
      name: 'github',
      repo: 'ugurkc/ugurkc.github.io',
      branch: 'main',
    })
  })

  it('every collection path exists', () => {
    for (const collection of collections) {
      if (collection.folder) {
        const dir = resolve(repoRoot, collection.folder)
        expect(
          existsSync(dir) && statSync(dir).isDirectory(),
          `${collection.folder} is not a directory`,
        ).toBe(true)
      }
      for (const file of collection.files ?? []) {
        const path = resolve(repoRoot, file.file)
        expect(
          existsSync(path) && statSync(path).isFile(),
          `${file.file} is not a file`,
        ).toBe(true)
      }
    }
  })

  it('blog fields match the content schema', () => {
    const blog = findCollection('blog')
    expect(blog.fields?.map((f) => f.name)).toEqual([
      'title',
      'description',
      'date',
      'draft',
      'body',
    ])
  })

  it('publishings fields match feedEntrySchema', () => {
    const site = findCollection('site')
    const publishings = site.files?.find((f) => f.name === 'publishings')
    expect(publishings, 'publishings file entry missing').toBeDefined()
    // A single root list field keeps src/data/publishings.yaml a top-level
    // YAML list, the shape index.astro imports and publishings.test.ts guards.
    expect(publishings?.fields).toHaveLength(1)
    const list = publishings?.fields[0] as Field
    expect(list.widget).toBe('list')
    expect(list.root).toBe(true)
    expect(list.fields?.map((f) => f.name)).toEqual([
      'title',
      'description',
      'date',
      'url',
    ])
  })

  it('date fields are string widgets', () => {
    const dateFields = collections.flatMap((c) => [
      ...allFields(c.fields ?? []),
      ...(c.files ?? []).flatMap((f) => allFields(f.fields)),
    ]).filter((f) => f.name === 'date')
    expect(dateFields.length).toBeGreaterThan(0)
    for (const field of dateFields) {
      // Regression guard: Sveltia's date widget writes datetimes, which the
      // quoted "YYYY-MM-DD" zod guards reject.
      expect(field.widget).toBe('string')
    }
  })
})
