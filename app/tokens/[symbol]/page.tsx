"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Header } from '@/components/Header'
import { VolatilityBadge } from '@/components/VolatilityBadge'
import { ImpactScore } from '@/components/ImpactScore'
import { SentimentBar } from '@/components/SentimentBar'
import { motion } from 'framer-motion'

export default function TokenDetailPage() {
  const { symbol } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!symbol) return
    fetch(`/api/tokens/${symbol}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [symbol])

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.error) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center font-mono text-[#444]">
          Token not found
        </div>
      </div>
    )
  }

  const highCount = data.tokenImpacts?.filter((i: any) => i.news.volatility === 'HIGH').length || 0
  const totalNews = data.tokenImpacts?.length || 0

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Link href="/tokens" className="font-mono text-[10px] text-[#444] hover:text-[#00fff0] transition-colors">
          ← BACK TO TOKENS
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Token header */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] 
              flex items-center justify-center font-mono font-bold text-lg text-[#00fff0]">
              {data.symbol?.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{data.name}</h1>
                <span className="font-mono text-sm text-[#444]">#{data.rank}</span>
              </div>
              <div className="font-mono text-lg text-[#00fff0]">${data.symbol}</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass rounded-lg p-4 text-center">
              <div className="font-mono text-2xl font-bold text-white">{totalNews}</div>
              <div className="font-mono text-[9px] text-[#444] tracking-widest">TOTAL NEWS</div>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <div className="font-mono text-2xl font-bold text-[#ff3b3b]">{highCount}</div>
              <div className="font-mono text-[9px] text-[#444] tracking-widest">HIGH IMPACT</div>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <div className="font-mono text-2xl font-bold text-[#00fff0]">
                {Math.round(data.avgImpact || 0)}
              </div>
              <div className="font-mono text-[9px] text-[#444] tracking-widest">AVG IMPACT</div>
            </div>
          </div>

          {/* Related news */}
          <div className="space-y-3">
            <div className="font-mono text-xs text-[#444] tracking-widest uppercase">
              Related News
            </div>
            {data.tokenImpacts?.length === 0 ? (
              <div className="font-mono text-sm text-[#333] py-8 text-center">
                No news articles found for this token yet.
              </div>
            ) : (
              data.tokenImpacts?.map((impact: any, i: number) => (
                <motion.div
                  key={impact.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={`/news/${impact.news.id}`}
                    className="news-card glass rounded-lg p-4 flex items-center gap-4 block"
                  >
                    <ImpactScore score={impact.news.impactScore} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#ccc] line-clamp-1">{impact.news.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[9px] text-[#444]">{impact.news.source}</span>
                        <span className="font-mono text-[9px] text-[#333]">
                          {formatDistanceToNow(new Date(impact.news.publishedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <VolatilityBadge volatility={impact.news.volatility} size="sm" />
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
