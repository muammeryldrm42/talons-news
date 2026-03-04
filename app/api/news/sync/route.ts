import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { fetchAllNews } from '@/lib/news/fetcher'
import { scoreArticle } from '@/lib/scoring'
import { matchTokensInText } from '@/lib/matching'
import { TOP_TOKENS } from '@/lib/tokens'

export const maxDuration = 60

export async function POST() {
  const startTime = Date.now()
  let inserted = 0
  let skipped = 0
  let errors = 0

  try {
    await seedTokensIfNeeded()

    const rawArticles = await fetchAllNews()
    console.log(`[Sync] Fetched ${rawArticles.length} raw articles`)

    const existingHashes = new Set(
      (await prisma.news.findMany({ select: { urlHash: true } })).map(n => n.urlHash)
    )

    const dbTokens = await prisma.token.findMany()
    const tokenMap = new Map(dbTokens.map(t => [t.symbol, t]))

    for (const article of rawArticles) {
      if (existingHashes.has(article.urlHash)) {
        skipped++
        continue
      }

      try {
        const tokenMatches = matchTokensInText(article.title, article.content)

        const primaryMatch = tokenMatches[0]
        const refinedScore = scoreArticle({
          title: article.title,
          content: article.content,
          source: article.source,
          marketCapTier: primaryMatch?.token.marketCapTier,
        })

        await prisma.$transaction(async (tx) => {
          const savedNews = await tx.news.create({
            data: {
              title: article.title,
              content: article.content,
              source: article.source,
              url: article.url,
              urlHash: article.urlHash,
              publishedAt: article.publishedAt,
              sentimentScore: refinedScore.sentimentScore,
              impactScore: refinedScore.impactScore,
              volatility: refinedScore.volatility,
            },
          })

          for (const match of tokenMatches) {
            const dbToken = tokenMap.get(match.token.symbol)
            if (!dbToken) continue

            await tx.newsTokenImpact.create({
              data: {
                newsId: savedNews.id,
                tokenId: dbToken.id,
                confidenceScore: match.confidenceScore,
                expectedVolatility: refinedScore.volatility,
              },
            })
          }
        })

        inserted++
        existingHashes.add(article.urlHash)
      } catch (err) {
        console.error(`[Sync] Error processing article "${article.title}":`, err)
        errors++
      }
    }

    const duration = Date.now() - startTime
    console.log(`[Sync] Done in ${duration}ms: +${inserted} new, ${skipped} skipped, ${errors} errors`)

    return NextResponse.json({
      success: true,
      stats: { inserted, skipped, errors, durationMs: duration },
    })
  } catch (err) {
    console.error('[Sync] Fatal error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function seedTokensIfNeeded() {
  const count = await prisma.token.count()
  if (count >= TOP_TOKENS.length) return

  for (const token of TOP_TOKENS) {
    await prisma.token.upsert({
      where: { symbol: token.symbol },
      update: {},
      create: {
        name: token.name,
        symbol: token.symbol,
        keywords: token.keywords,
        rank: token.rank,
      },
    })
  }
  console.log(`[Sync] Seeded ${TOP_TOKENS.length} tokens`)
}
