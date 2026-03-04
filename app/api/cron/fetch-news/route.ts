// ============================================================
// TALONS NEWS - Cron Job: Fetch & Score News
// Route: /api/cron/fetch-news
// Schedule: every 5 minutes via vercel.json
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { fetchAllNews } from '@/lib/news/fetcher'
import { scoreArticle } from '@/lib/scoring'
import { matchTokensInText } from '@/lib/matching'
import { TOP_TOKENS } from '@/lib/tokens'

export const maxDuration = 60 // Vercel max for hobby plan

export async function GET(req: NextRequest) {
  // Authenticate cron requests
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  let inserted = 0
  let skipped = 0
  let errors = 0

  try {
    // 1. Ensure all tokens are seeded in DB
    await seedTokensIfNeeded()

    // 2. Fetch raw news from all sources
    const rawArticles = await fetchAllNews()
    console.log(`[Cron] Fetched ${rawArticles.length} raw articles`)

    // 3. Get existing url hashes to skip duplicates
    const existingHashes = new Set(
      (await prisma.news.findMany({ select: { urlHash: true } }))
        .map(n => n.urlHash)
    )

    // 4. Get all tokens from DB for impact linking
    const dbTokens = await prisma.token.findMany()
    const tokenMap = new Map(dbTokens.map(t => [t.symbol, t]))

    // 5. Process each article
    for (const article of rawArticles) {
      if (existingHashes.has(article.urlHash)) {
        skipped++
        continue
      }

      try {
        // Score the article
        const score = scoreArticle({
          title: article.title,
          content: article.content,
          source: article.source,
        })

        // Match tokens
        const tokenMatches = matchTokensInText(article.title, article.content)

        // Determine best marketCapTier for source weight
        const primaryMatch = tokenMatches[0]
        const refinedScore = scoreArticle({
          title: article.title,
          content: article.content,
          source: article.source,
          marketCapTier: primaryMatch?.token.marketCapTier,
        })

        // Save news + impacts in one transaction
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

          // Create token impact records
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
        console.error(`[Cron] Error processing article "${article.title}":`, err)
        errors++
      }
    }

    const duration = Date.now() - startTime
    console.log(`[Cron] Done in ${duration}ms: +${inserted} new, ${skipped} skipped, ${errors} errors`)

    return NextResponse.json({
      success: true,
      stats: { inserted, skipped, errors, durationMs: duration },
    })
  } catch (err) {
    console.error('[Cron] Fatal error:', err)
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
  console.log(`[Cron] Seeded ${TOP_TOKENS.length} tokens`)
}
