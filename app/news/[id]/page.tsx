"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { Header } from '@/components/Header'
import { VolatilityBadge } from '@/components/VolatilityBadge'
import { ImpactScore, ImpactBar } from '@/components/ImpactScore'
import { SentimentBar } from '@/components/SentimentBar'
import { motion } from 'framer-motion'

export default function NewsDetailPage() {
  const { id } = useParams()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/news/${id}`)
      .then(r => r.json())
      .then(data => { setArticle(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-16 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-4 w-full" style={{ width: `${70 + Math.random() * 30}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (!article || article.error) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center font-mono text-[#444]">
          Article not found
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Breadcrumb */}
        <Link href="/" className="font-mono text-[10px] text-[#444] hover:text-[#00fff0] transition-colors">
          ← BACK TO DASHBOARD
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Meta */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs text-[#00fff0] uppercase tracking-widest">
              {article.source}
            </span>
            <span className="text-[#333]">·</span>
            <span className="font-mono text-xs text-[#444]">
              {format(new Date(article.publishedAt), 'MMM d, yyyy · HH:mm UTC')}
            </span>
            <span className="text-[#333]">·</span>
            <span className="font-mono text-xs text-[#444]">
              {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
            {article.title}
          </h1>

          {/* Scores panel */}
          <div className="glass rounded-xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-2">
              <ImpactScore score={article.impactScore} size="lg" />
              <span className="font-mono text-[9px] text-[#444] tracking-widest">IMPACT SCORE</span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="font-mono text-[9px] text-[#444] tracking-widest mb-2">VOLATILITY</div>
                <VolatilityBadge volatility={article.volatility} size="lg" />
              </div>
              <SentimentBar score={article.sentimentScore} />
            </div>
            <div className="space-y-3">
              <div className="font-mono text-[9px] text-[#444] tracking-widest">SCORE BREAKDOWN</div>
              <ScoreRow label="Sentiment" value={`${(Math.abs(article.sentimentScore) * 30).toFixed(1)}/30`} />
              <ScoreRow label="Keywords"  value="—/30" />
              <ScoreRow label="Source"    value="—/20" />
              <ScoreRow label="Mkt Cap"   value="—/20" />
            </div>
          </div>

          {/* Content */}
          {article.content && (
            <div className="prose prose-invert prose-sm max-w-none text-[#888] leading-relaxed">
              {article.content}
            </div>
          )}

          {/* Affected tokens */}
          {article.tokenImpacts?.length > 0 && (
            <div className="space-y-4">
              <div className="font-mono text-xs text-[#444] tracking-widest uppercase">
                Affected Tokens ({article.tokenImpacts.length})
              </div>
              <div className="space-y-2">
                {article.tokenImpacts.map((impact: any) => (
                  <Link
                    key={impact.id}
                    href={`/tokens/${impact.token.symbol}`}
                    className="flex items-center justify-between glass rounded-lg p-3 hover:border-[#333] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-[#00fff0]">
                        ${impact.token.symbol}
                      </span>
                      <span className="text-sm text-[#666]">{impact.token.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[#555]">
                        {Math.round(impact.confidenceScore * 100)}% confidence
                      </span>
                      <VolatilityBadge volatility={impact.expectedVolatility} size="sm" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* External link */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-xs px-4 py-2 
              border border-[#222] rounded text-[#555] hover:text-[#00fff0] 
              hover:border-[#00fff0]/30 transition-all"
          >
            READ ORIGINAL ARTICLE ↗
          </a>
        </motion.div>
      </main>
    </div>
  )
}

function ScoreRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="font-mono text-[10px] text-[#555]">{label}</span>
      <span className="font-mono text-[10px] text-[#888]">{value}</span>
    </div>
  )
}
