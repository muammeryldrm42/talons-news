import axios from 'axios'
import Parser from 'rss-parser'
import crypto from 'crypto'

const rssParser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'TalonsNews/1.0 RSS Reader' },
})

export interface RawArticle {
  title:       string
  content?:    string
  source:      string
  url:         string
  urlHash:     string
  publishedAt: Date
}

// Free RSS Feeds
const RSS_FEEDS = [
  { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',     source: 'CoinDesk' },
  { url: 'https://cointelegraph.com/rss',                       source: 'CoinTelegraph' },
  { url: 'https://www.theblock.co/rss.xml',                     source: 'TheBlock' },
  { url: 'https://decrypt.co/feed',                             source: 'Decrypt' },
  { url: 'https://bitcoinmagazine.com/.rss/full/',              source: 'BitcoinMagazine' },
]

/**
 * Creates a SHA-256 hash of a URL for deduplication.
 */
export function hashUrl(url: string): string {
  return crypto.createHash('sha256').update(url.trim().toLowerCase()).digest('hex')
}

/**
 * Fetches articles from a single RSS feed.
 */
async function fetchRSSFeed(feedUrl: string, source: string): Promise<RawArticle[]> {
  try {
    const feed = await rssParser.parseURL(feedUrl)
    return (feed.items ?? []).map((item) => ({
      title:       item.title?.trim() ?? 'Untitled',
      content:     item.contentSnippet ?? item.summary ?? item.content ?? '',
      source,
      url:         item.link ?? item.guid ?? '',
      urlHash:     hashUrl(item.link ?? item.guid ?? Math.random().toString()),
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
    })).filter(a => a.url !== '')
  } catch (err) {
    console.error(`[RSS] Failed to fetch ${source}:`, err)
    return []
  }
}

/**
 * Fetches articles from CryptoPanic free API.
 */
async function fetchCryptoPanic(): Promise<RawArticle[]> {
  const apiKey = process.env.CRYPTOPANIC_API_KEY
  if (!apiKey) return []

  try {
    const res = await axios.get('https://cryptopanic.com/api/free/v1/posts/', {
      params: { auth_token: apiKey, kind: 'news', public: true },
      timeout: 10000,
    })

    return (res.data?.results ?? []).map((item: any) => ({
      title:       item.title?.trim() ?? 'Untitled',
      content:     item.body ?? '',
      source:      item.source?.title ?? 'CryptoPanic',
      url:         item.url ?? item.source?.url ?? '',
      urlHash:     hashUrl(item.url ?? Math.random().toString()),
      publishedAt: item.published_at ? new Date(item.published_at) : new Date(),
    })).filter((a: RawArticle) => a.url !== '')
  } catch (err) {
    console.error('[CryptoPanic] Fetch error:', err)
    return []
  }
}

/**
 * Aggregates news from all free sources.
 * Deduplicates by urlHash.
 */
export async function aggregateNews(): Promise<RawArticle[]> {
  const [cryptoPanicArticles, ...rssResults] = await Promise.allSettled([
    fetchCryptoPanic(),
    ...RSS_FEEDS.map(f => fetchRSSFeed(f.url, f.source)),
  ])

  const all: RawArticle[] = []

  if (cryptoPanicArticles.status === 'fulfilled') {
    all.push(...cryptoPanicArticles.value)
  }

  for (const result of rssResults) {
    if (result.status === 'fulfilled') {
      all.push(...result.value)
    }
  }

  // Deduplicate by urlHash
  const seen = new Set<string>()
  return all.filter(article => {
    if (seen.has(article.urlHash)) return false
    seen.add(article.urlHash)
    return true
  })
}
