export interface FeedItem {
  title: string
  description: string
  date: string
  url: string
}

interface PostLike {
  id: string
  data: { title: string; description: string; date: string; draft: boolean }
}

export function mergeFeed(publishings: FeedItem[], posts: PostLike[]): FeedItem[] {
  const postItems = posts
    .filter((p) => !p.data.draft)
    .map((p) => ({
      title: p.data.title,
      description: p.data.description,
      date: p.data.date,
      url: `/blog/${p.id}/`,
    }))
  return [...publishings, ...postItems].sort((a, b) => b.date.localeCompare(a.date))
}
