// ============================================================
// TALONS NEWS - News Fetcher
// Sources: CryptoPanic API + RSS feeds
// ============================================================

import RSSParser from 'rss-parser'
import crypto from 'crypto'

const rssParser = new RSSParser({
  timeout: 10000,
  headers: {
    'User-Agent': 'TalonsNews/1.0 (crypto intelligence aggregator)',
  },
})

export interface RawNewsItem {
  title: string
  url: string
  urlHash: string
  source: string
  publishedAt: Date
  content?: string
}

// ---- RSS Sources ----
const RSS_FEEDS = [
  { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk' },
  { url: 'https://cointelegraph.com/rss', source: 'CoinTelegraph' },
  { url: 'https://www.theblock.co/rss.xml', source: 'The Block' },
  { url: 'https://decrypt.co/feed', source: 'Decrypt' },
  { url: 'https://blockworks.co/feed', source: 'Blockworks' },
]

export function hashUrl(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex').slice(0, 32)
}

async function fetchRSSFeed(feedUrl: string, source: string): Promise<RawNewsItem[]> {
  try {
    const feed = await rssParser.parseURL(feedUrl)
    return (feed.items || []).slice(0, 20).map((item) => {
      const url = item.link || item.guid || ''
      return {
        title: item.title || 'Untitled',
        url,
        urlHash: hashUrl(url),
        source,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        content: item.contentSnippet || item.summary || item.content || undefined,
      }
    }).filter(item => item.url)
  } catch (err) {
    console.error(`[RSS] Failed to fetch ${feedUrl}:`, err instanceof Error ? err.message : err)
    return []
  }
}

export async function fetchAllRSSNews(): Promise<RawNewsItem[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map(feed => fetchRSSFeed(feed.url, feed.source))
  )

  const items: RawNewsItem[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      items.push(...result.value)
    }
  }

  // Deduplicate by urlHash
  const seen = new Set<string>()
  return items.filter(item => {
    if (seen.has(item.urlHash)) return false
    seen.add(item.urlHash)
    return true
  })
}

// ---- CryptoPanic API ----
export async function fetchCryptoPanicNews(): Promise<RawNewsItem[]> {
  const apiKey = process.env.CRYPTOPANIC_API_KEY
  if (!apiKey || apiKey === 'your_cryptopanic_api_key') {
    console.log('[CryptoPanic] No API key configured, skipping.')
    return []
  }

  try {
    const res = await fetch(
      `https://cryptopanic.com/api/v1/posts/?auth_token=${apiKey}&public=true&kind=news&filter=important&limit=50`,
      { next: { revalidate: 0 } }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    return (data.results || []).map((item: any) => {
      const url = item.url || item.canonical_url || ''
      return {
        title: item.title || 'Untitled',
        url,
        urlHash: hashUrl(url),
        source: item.source?.title || 'CryptoPanic',
        publishedAt: item.published_at ? new Date(item.published_at) : new Date(),
        content: undefined,
      }
    }).filter((item: RawNewsItem) => item.url)
  } catch (err) {
    console.error('[CryptoPanic] Fetch error:', err instanceof Error ? err.message : err)
    return []
  }
}

export async function fetchAllNews(): Promise<RawNewsItem[]> {
  const [rssItems, cpItems] = await Promise.all([
    fetchAllRSSNews(),
    fetchCryptoPanicNews(),
  ])

  const all = [...rssItems, ...cpItems]

  // Final dedup
  const seen = new Set<string>()
  return all.filter(item => {
    if (seen.has(item.urlHash)) return false
    seen.add(item.urlHash)
    return true
  })
}
