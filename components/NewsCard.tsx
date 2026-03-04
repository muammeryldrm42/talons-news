"use client"

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { VolatilityBadge } from './VolatilityBadge'
import { ImpactScore, ImpactBar } from './ImpactScore'
import { SentimentBar } from './SentimentBar'

interface Token {
  id: string
  symbol: string
  name: string
}

interface TokenImpact {
  id: string
  token: Token
  confidenceScore: number
  expectedVolatility: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface NewsItem {
  id: string
  title: string
  source: string
  url: string
  publishedAt: string
  sentimentScore: number
  impactScore: number
  volatility: 'LOW' | 'MEDIUM' | 'HIGH'
  tokenImpacts: TokenImpact[]
}

interface NewsCardProps {
  news: NewsItem
  index?: number
}

export function NewsCard({ news, index = 0 }: NewsCardProps) {
  const timeAgo = formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true })

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: 'easeOut' }}
      className="news-card glass rounded-lg p-4 flex flex-col gap-3 cursor-pointer"
    >
      {/* Header: source + time + volatility */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[10px] text-[#00fff0] uppercase tracking-widest truncate">
            {news.source}
          </span>
          <span className="text-[#333]">·</span>
          <span className="font-mono text-[10px] text-[#444]">{timeAgo}</span>
        </div>
        <VolatilityBadge volatility={news.volatility} size="sm" />
      </div>

      {/* Title */}
      <Link
        href={news.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-[#ccc] hover:text-white transition-colors leading-snug line-clamp-2"
      >
        {news.title}
      </Link>

      {/* Impact + Sentiment row */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <ImpactScore score={news.impactScore} size="sm" />
          <div>
            <div className="font-mono text-[9px] text-[#555] tracking-widest">IMPACT</div>
            <ImpactBar score={news.impactScore} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <SentimentBar score={news.sentimentScore} />
        </div>
      </div>

      {/* Affected tokens */}
      {news.tokenImpacts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {news.tokenImpacts.slice(0, 4).map((impact) => (
            <Link
              key={impact.id}
              href={`/tokens/${impact.token.symbol}`}
              className="token-badge font-mono text-[10px] px-2 py-0.5 rounded 
                bg-[#1a1a1a] border border-[#222] text-[#888] 
                hover:bg-[#00fff0]/10 hover:text-[#00fff0] hover:border-[#00fff0]/30 
                transition-all"
            >
              ${impact.token.symbol}
            </Link>
          ))}
          {news.tokenImpacts.length > 4 && (
            <span className="font-mono text-[10px] px-2 py-0.5 text-[#444]">
              +{news.tokenImpacts.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[#111]">
        <Link
          href={`/news/${news.id}`}
          className="font-mono text-[10px] text-[#444] hover:text-[#00fff0] transition-colors"
        >
          VIEW ANALYSIS →
        </Link>
        <span className="font-mono text-[10px] text-[#333]">
          {Math.round(news.sentimentScore * 100) > 0 ? '+' : ''}
          {Math.round(news.sentimentScore * 100)} pts
        </span>
      </div>
    </motion.article>
  )
}
