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

  it('breaks date ties by title, publishings before posts on full ties', () => {
    const items = mergeFeed(
      [pub('same', '2026-05-01', '/pub-same/')],
      [post('zeta', '2026-05-01'), post('same', '2026-05-01'), post('alpha', '2026-05-01')],
    )
    expect(items.map((i) => i.title)).toEqual(['alpha', 'same', 'same', 'zeta'])
    expect(items.map((i) => i.url)).toEqual([
      '/blog/alpha/',
      '/pub-same/',
      '/blog/same/',
      '/blog/zeta/',
    ])
  })

  it('does not mutate its input arrays', () => {
    const publishings = [pub('B', '2026-06-01', '/b/'), pub('A', '2026-07-01', '/a/')]
    const posts = [post('older', '2026-01-01'), post('newer', '2026-09-01', true)]
    const publishingsCopy = structuredClone(publishings)
    const postsCopy = structuredClone(posts)
    mergeFeed(publishings, posts)
    expect(publishings).toEqual(publishingsCopy)
    expect(posts).toEqual(postsCopy)
  })
})
