import { describe, expect, it } from 'vitest'
import publishings from './publishings.yaml'

interface Publishing {
  title: string
  description: string
  date: string
  url: string
}

const entries = publishings as Publishing[]

describe('publishings.yaml', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(entries)).toBe(true)
    expect(entries.length).toBeGreaterThan(0)
  })

  it('every entry has title, description, date, url', () => {
    for (const entry of entries) {
      const label = JSON.stringify(entry)
      expect(typeof entry.title, label).toBe('string')
      expect(typeof entry.description, label).toBe('string')
      expect(typeof entry.url, label).toBe('string')
      expect(entry.title, label).toBeTruthy()
      expect(entry.description, label).toBeTruthy()
      expect(entry.url, label).toBeTruthy()
      expect(typeof entry.date, `date must be a quoted string: ${label}`).toBe('string')
      expect(entry.date, label).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(entry.date)), label).toBe(false)
      expect(entry.url, label).toMatch(/^(\/|https?:\/\/)/)
    }
  })
})
