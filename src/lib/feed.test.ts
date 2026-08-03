import { describe, expect, it } from 'vitest'
import { mergeFeed } from './feed'

const pub = (title: string, date: string, url: string) => ({
  title, description: 'd', date, url,
})
const post = (id: string, date: string, draft = false) => ({
  id, data: { title: id, description: 'd', date, draft },
})

describe('mergeFeed', () => {
  it('merges publishings and posts sorted by date descending', () => {
    const items = mergeFeed(
      [pub('Watershed', '2026-08-03', '/watershed/')],
      [post('newer', '2026-09-01'), post('older', '2026-01-01')],
    )
    expect(items.map((i) => i.title)).toEqual(['newer', 'Watershed', 'older'])
  })

  it('maps post urls to /blog/<id>/', () => {
    const items = mergeFeed([], [post('my-post', '2026-05-01')])
    expect(items[0].url).toBe('/blog/my-post/')
  })

  it('excludes draft posts', () => {
    const items = mergeFeed([], [post('draft', '2026-05-01', true)])
    expect(items).toEqual([])
  })

  it('keeps publishings intact', () => {
    const items = mergeFeed([pub('W', '2026-08-03', '/watershed/')], [])
    expect(items[0]).toMatchObject({ title: 'W', url: '/watershed/' })
  })
})
